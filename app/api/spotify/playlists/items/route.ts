import { sunucuSupabase } from "@/lib/supabase/server";
import { turkuBul } from "@/lib/data";
import { turkuOnizleme } from "@/lib/spotify";

export const runtime = "nodejs";

async function listedeVarMi(token: string, playlistId: string, uri: string) {
  let url: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=100&fields=items(track(uri)),next`;
  while (url) {
    const cevap = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!cevap.ok) return { hata: cevap.status, var: false };
    const veri = await cevap.json() as { items?: Array<{ track?: { uri?: string } | null }>; next?: string | null };
    if ((veri.items ?? []).some((oge) => oge.track?.uri === uri)) return { hata: 0, var: true };
    url = veri.next ?? null;
  }
  return { hata: 0, var: false };
}

export async function POST(request: Request) {
  const supabase = await sunucuSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return Response.json({ hata: "giris-gerekli" }, { status: 401 });
  const token = session.provider_token;
  if (!token) return Response.json({ hata: "spotify-baglanti-gerekli", yenidenBagla: true }, { status: 400 });

  const govde = await request.json().catch(() => ({})) as { playlistId?: string; turkuSlug?: string };
  if (!govde.playlistId || !govde.turkuSlug) return Response.json({ hata: "eksik-bilgi" }, { status: 400 });
  const turku = turkuBul(govde.turkuSlug);
  if (!turku) return Response.json({ hata: "turku-bulunamadi" }, { status: 404 });

  const eslesme = await turkuOnizleme(
    [turku.baslik, turku.ozan ?? turku.sozYazari].filter(Boolean).join(" "),
    { baslik: turku.baslik, yore: turku.yore, ozan: turku.ozan ?? turku.sozYazari },
  ).catch(() => null);
  if (!eslesme?.id || eslesme.guven < 44) return Response.json({ hata: "parca-bulunamadi" }, { status: 404 });
  const uri = `spotify:track:${eslesme.id}`;

  const kontrol = await listedeVarMi(token, govde.playlistId, uri);
  if (kontrol.hata === 401 || kontrol.hata === 403) {
    return Response.json({ hata: kontrol.hata === 401 ? "spotify-token" : "spotify-yetki", yenidenBagla: true }, { status: kontrol.hata });
  }
  if (kontrol.hata) return Response.json({ hata: "spotify-listesi-okunamadi" }, { status: 502 });
  if (kontrol.var) return Response.json({ zatenVar: true, parca: eslesme.ad, sanatci: eslesme.sanatci });

  const ekle = await fetch(`https://api.spotify.com/v1/playlists/${govde.playlistId}/items`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ uris: [uri] }),
  });
  if (ekle.status === 401 || ekle.status === 403) {
    return Response.json({ hata: ekle.status === 401 ? "spotify-token" : "spotify-yetki", yenidenBagla: true }, { status: ekle.status });
  }
  if (!ekle.ok) return Response.json({ hata: "spotify-listesine-eklenemedi" }, { status: 502 });
  return Response.json({ eklendi: true, parca: eslesme.ad, sanatci: eslesme.sanatci });
}
