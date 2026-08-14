import { sunucuSupabase } from "@/lib/supabase/server";
import { turkuBul } from "@/lib/data";
import { googleHatasi, slugIcinVideoId } from "@/lib/youtube-liste";

export const runtime = "nodejs";

async function listedeVarMi(token: string, playlistId: string, videoId: string) {
  let sayfaBileti: string | null = null;
  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "contentDetails");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    if (sayfaBileti) url.searchParams.set("pageToken", sayfaBileti);
    const cevap = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!cevap.ok) return { hata: cevap.status, var: false };
    const veri = await cevap.json() as {
      items?: Array<{ contentDetails?: { videoId?: string } }>;
      nextPageToken?: string | null;
    };
    if ((veri.items ?? []).some((oge) => oge.contentDetails?.videoId === videoId)) {
      return { hata: 0, var: true };
    }
    sayfaBileti = veri.nextPageToken ?? null;
  } while (sayfaBileti);
  return { hata: 0, var: false };
}

export async function POST(request: Request) {
  const supabase = await sunucuSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return Response.json({ hata: "giris-gerekli" }, { status: 401 });
  const token = session.provider_token;
  if (!token) return Response.json({ hata: "youtube-baglanti-gerekli", yenidenBagla: true }, { status: 400 });

  const govde = await request.json().catch(() => ({})) as { playlistId?: string; turkuSlug?: string };
  if (!govde.playlistId || !govde.turkuSlug) return Response.json({ hata: "eksik-bilgi" }, { status: 400 });
  const turku = turkuBul(govde.turkuSlug);
  if (!turku) return Response.json({ hata: "turku-bulunamadi" }, { status: 404 });

  const videoId = await slugIcinVideoId(govde.turkuSlug);
  if (!videoId) return Response.json({ hata: "parca-bulunamadi" }, { status: 404 });

  const kontrol = await listedeVarMi(token, govde.playlistId, videoId);
  if (kontrol.hata === 401 || kontrol.hata === 403) {
    return Response.json(googleHatasi(kontrol.hata), { status: kontrol.hata });
  }
  if (kontrol.hata) return Response.json({ hata: "youtube-listesi-okunamadi" }, { status: 502 });
  if (kontrol.var) return Response.json({ zatenVar: true, parca: turku.baslik });

  const ekle = await fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      snippet: {
        playlistId: govde.playlistId,
        resourceId: { kind: "youtube#video", videoId },
      },
    }),
  });
  if (ekle.status === 401 || ekle.status === 403) {
    return Response.json(googleHatasi(ekle.status), { status: ekle.status });
  }
  if (!ekle.ok) return Response.json({ hata: "youtube-listesine-eklenemedi" }, { status: 502 });
  return Response.json({ eklendi: true, parca: turku.baslik, videoId });
}
