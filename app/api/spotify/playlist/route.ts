import { createHash } from "node:crypto";
import { sunucuSupabase } from "@/lib/supabase/server";
import { turkuBul } from "@/lib/data";
import { turkuOnizleme } from "@/lib/spotify";

export const runtime = "nodejs";
export const maxDuration = 60;

type ListeSatiri = { turku_slug: string; sira: number };
type SpotifyEsleme = {
  spotify_playlist_id: string;
  spotify_url: string | null;
  yerel_imza: string;
};

function imza(slugs: string[]) {
  return createHash("sha256").update(slugs.join("\n")).digest("hex");
}

function spotifyHatasi(status: number) {
  if (status === 401) return { hata: "spotify-token", yenidenBagla: true };
  if (status === 403) return { hata: "spotify-yetki", yenidenBagla: true };
  return { hata: "spotify-api" };
}

async function spotifyUriListesi(slugs: string[]) {
  const uris: string[] = [];
  for (const slug of slugs) {
    const turku = turkuBul(slug);
    if (!turku) continue;
    const eslesme = await turkuOnizleme(
      [turku.baslik, turku.ozan ?? turku.sozYazari].filter(Boolean).join(" "),
      { baslik: turku.baslik, yore: turku.yore, ozan: turku.ozan ?? turku.sozYazari },
    ).catch(() => null);
    if (eslesme?.id && eslesme.guven >= 44) uris.push(`spotify:track:${eslesme.id}`);
  }
  return [...new Set(uris)];
}

async function spotifyListeIcerigi(token: string, playlistId: string) {
  const uris: string[] = [];
  let url: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=100&fields=items(track(uri)),next`;
  while (url) {
    const cevap = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!cevap.ok) return { durum: cevap.status, uris: [] as string[] };
    const veri = await cevap.json() as { items?: Array<{ track?: { uri?: string } | null }>; next?: string | null };
    for (const oge of veri.items ?? []) if (oge.track?.uri) uris.push(oge.track.uri);
    url = veri.next ?? null;
  }
  return { durum: 200, uris };
}

async function spotifyListeyiYaz(token: string, playlistId: string, uris: string[]) {
  const ilk = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ uris: uris.slice(0, 100) }),
  });
  if (!ilk.ok) return ilk;
  for (let i = 100; i < uris.length; i += 100) {
    const devam = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ uris: uris.slice(i, i + 100) }),
    });
    if (!devam.ok) return devam;
  }
  return ilk;
}

export async function POST(request: Request) {
  const supabase = await sunucuSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return Response.json({ hata: "giris-gerekli" }, { status: 401 });
  const token = session.provider_token;
  if (!token) return Response.json({ hata: "spotify-baglanti-gerekli", yenidenBagla: true }, { status: 400 });

  const { listeId } = await request.json().catch(() => ({ listeId: undefined })) as { listeId?: string };
  if (!listeId) return Response.json({ hata: "liste-yok" }, { status: 400 });

  const { data: liste } = await supabase
    .from("listeler")
    .select("id,baslik,liste_turkuleri(turku_slug,sira)")
    .eq("id", listeId)
    .single();
  if (!liste) return Response.json({ hata: "liste-bulunamadi" }, { status: 404 });

  const slugs = ((liste.liste_turkuleri as ListeSatiri[]) ?? [])
    .sort((a, b) => a.sira - b.sira)
    .map((satir) => satir.turku_slug);
  const yerelImza = imza(slugs);
  const uris = await spotifyUriListesi(slugs);
  if (!uris.length) return Response.json({ hata: "parca-bulunamadi" }, { status: 400 });

  const { data: esleme, error: eslemeHatasi } = await supabase
    .from("spotify_liste_baglantilari")
    .select("spotify_playlist_id,spotify_url,yerel_imza")
    .eq("liste_id", listeId)
    .maybeSingle<SpotifyEsleme>();
  if (eslemeHatasi) {
    return Response.json({ hata: "spotify-esleme-tablosu-yok" }, { status: 503 });
  }

  let playlistId = esleme?.spotify_playlist_id;
  let spotifyUrl = esleme?.spotify_url ?? null;
  let yeniOlusturuldu = false;

  if (playlistId) {
    const spotifyIcerigi = await spotifyListeIcerigi(token, playlistId);
    if (spotifyIcerigi.durum === 401 || spotifyIcerigi.durum === 403) {
      return Response.json(spotifyHatasi(spotifyIcerigi.durum), { status: spotifyIcerigi.durum });
    }
    if (spotifyIcerigi.durum === 200 && spotifyIcerigi.uris.join("\n") === uris.join("\n") && esleme?.yerel_imza === yerelImza) {
      return Response.json({ url: spotifyUrl, eklenen: uris.length, toplam: slugs.length, zatenGuncel: true });
    }
    if (spotifyIcerigi.durum === 404) playlistId = undefined;
  }

  if (!playlistId) {
    const olustur = await fetch("https://api.spotify.com/v1/me/playlists", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${liste.baslik} · Anadolu Türküleri`,
        description: "anadoluturkuleri.com listesinden oluşturuldu.",
        public: false,
      }),
    });
    if (!olustur.ok) return Response.json(spotifyHatasi(olustur.status), { status: olustur.status });
    const yeni = await olustur.json() as { id: string; external_urls?: { spotify?: string } };
    playlistId = yeni.id;
    spotifyUrl = yeni.external_urls?.spotify ?? null;
    yeniOlusturuldu = true;
  } else {
    await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${liste.baslik} · Anadolu Türküleri` }),
    });
  }

  const yaz = await spotifyListeyiYaz(token, playlistId, uris);
  if (!yaz.ok) return Response.json(spotifyHatasi(yaz.status), { status: yaz.status });

  const { error: kayitHatasi } = await supabase.from("spotify_liste_baglantilari").upsert({
    liste_id: listeId,
    kullanici_id: session.user.id,
    spotify_playlist_id: playlistId,
    spotify_url: spotifyUrl,
    yerel_imza: yerelImza,
    son_senkron: new Date().toISOString(),
  }, { onConflict: "liste_id" });
  if (kayitHatasi) return Response.json({ hata: "spotify-esleme-kaydedilemedi" }, { status: 500 });

  return Response.json({
    url: spotifyUrl,
    eklenen: uris.length,
    toplam: slugs.length,
    guncellendi: !yeniOlusturuldu,
    yeniOlusturuldu,
  });
}
