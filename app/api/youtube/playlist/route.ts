import { createHash } from "node:crypto";
import { sunucuSupabase } from "@/lib/supabase/server";
import { googleHatasi, slugListesindenVideoIdler } from "@/lib/youtube-liste";

export const runtime = "nodejs";
export const maxDuration = 60;

type ListeSatiri = { turku_slug: string; sira: number };
type YouTubeEsleme = {
  youtube_playlist_id: string;
  youtube_url: string | null;
  music_url: string | null;
  yerel_imza: string;
};

function imza(videoIdler: string[]) {
  return createHash("sha256").update(videoIdler.join("\n")).digest("hex");
}

async function playlistIcerigi(token: string, playlistId: string): Promise<{ durum: number; videoIdler: string[]; ogeIdleri: string[] }> {
  const videoIdler: string[] = [];
  const ogeIdleri: string[] = [];
  let sayfaBileti: string | null = null;
  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "id,contentDetails");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    if (sayfaBileti) url.searchParams.set("pageToken", sayfaBileti);
    const cevap = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!cevap.ok) return { durum: cevap.status, videoIdler: [], ogeIdleri: [] };
    const veri = await cevap.json() as {
      items?: Array<{ id?: string; contentDetails?: { videoId?: string } }>;
      nextPageToken?: string | null;
    };
    for (const oge of veri.items ?? []) {
      const vid = oge.contentDetails?.videoId;
      if (vid) {
        videoIdler.push(vid);
        if (oge.id) ogeIdleri.push(oge.id);
      }
    }
    sayfaBileti = veri.nextPageToken ?? null;
  } while (sayfaBileti);
  return { durum: 200, videoIdler, ogeIdleri };
}

async function playlistiTemizle(token: string, ogeIdleri: string[]) {
  for (const id of ogeIdleri) {
    await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

async function videoyuEkle(token: string, playlistId: string, videoId: string) {
  return fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      snippet: {
        playlistId,
        resourceId: { kind: "youtube#video", videoId },
      },
    }),
  });
}

export async function POST(request: Request) {
  const supabase = await sunucuSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return Response.json({ hata: "giris-gerekli" }, { status: 401 });
  const token = session.provider_token;
  if (!token) return Response.json({ hata: "youtube-baglanti-gerekli", yenidenBagla: true }, { status: 400 });

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
  const videoIdler = await slugListesindenVideoIdler(slugs);
  if (!videoIdler.length) return Response.json({ hata: "parca-bulunamadi" }, { status: 400 });
  const yerelImza = imza(videoIdler);

  const { data: esleme, error: eslemeHatasi } = await supabase
    .from("youtube_liste_baglantilari")
    .select("youtube_playlist_id,youtube_url,music_url,yerel_imza")
    .eq("liste_id", listeId)
    .maybeSingle<YouTubeEsleme>();
  if (eslemeHatasi) {
    return Response.json({ hata: "youtube-esleme-tablosu-yok" }, { status: 503 });
  }

  let playlistId = esleme?.youtube_playlist_id;
  let youtubeUrl = esleme?.youtube_url ?? null;
  let musicUrl = esleme?.music_url ?? null;
  let yeniOlusturuldu = false;

  if (playlistId) {
    const mevcut = await playlistIcerigi(token, playlistId);
    if (mevcut.durum === 401 || mevcut.durum === 403) {
      return Response.json(googleHatasi(mevcut.durum), { status: mevcut.durum });
    }
    if (mevcut.durum === 200 && mevcut.videoIdler.join("\n") === videoIdler.join("\n") && esleme?.yerel_imza === yerelImza) {
      return Response.json({ url: youtubeUrl, musicUrl, eklenen: videoIdler.length, toplam: slugs.length, zatenGuncel: true });
    }
    if (mevcut.durum === 404) playlistId = undefined;
    else if (mevcut.durum === 200) await playlistiTemizle(token, mevcut.ogeIdleri);
  }

  if (!playlistId) {
    const olustur = await fetch("https://www.googleapis.com/youtube/v3/playlists?part=snippet,status", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        snippet: {
          title: `${liste.baslik} · Anadolu Türküleri`,
          description: "anadoluturkuleri.com listesinden oluşturuldu.",
        },
        status: { privacyStatus: "private" },
      }),
    });
    if (!olustur.ok) return Response.json(googleHatasi(olustur.status), { status: olustur.status });
    const yeni = await olustur.json() as { id: string };
    playlistId = yeni.id;
    youtubeUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    musicUrl = `https://music.youtube.com/playlist?list=${playlistId}`;
    yeniOlusturuldu = true;
  } else {
    await fetch("https://www.googleapis.com/youtube/v3/playlists?part=snippet,status", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        id: playlistId,
        snippet: { title: `${liste.baslik} · Anadolu Türküleri` },
        status: { privacyStatus: "private" },
      }),
    });
  }

  let eklenen = 0;
  for (const videoId of videoIdler) {
    const cevap = await videoyuEkle(token, playlistId, videoId);
    if (cevap.status === 401 || cevap.status === 403) {
      return Response.json(googleHatasi(cevap.status), { status: cevap.status });
    }
    if (cevap.ok) eklenen++;
  }

  const { error: kayitHatasi } = await supabase.from("youtube_liste_baglantilari").upsert({
    liste_id: listeId,
    kullanici_id: session.user.id,
    youtube_playlist_id: playlistId,
    youtube_url: youtubeUrl,
    music_url: musicUrl,
    yerel_imza: yerelImza,
    son_senkron: new Date().toISOString(),
  }, { onConflict: "liste_id" });
  if (kayitHatasi) return Response.json({ hata: "youtube-esleme-kaydedilemedi" }, { status: 500 });

  return Response.json({
    url: youtubeUrl,
    musicUrl,
    eklenen,
    toplam: slugs.length,
    guncellendi: !yeniOlusturuldu,
    yeniOlusturuldu,
  });
}
