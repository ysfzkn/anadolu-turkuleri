import { sunucuSupabase } from "@/lib/supabase/server";
import { googleHatasi } from "@/lib/youtube-liste";

export const runtime = "nodejs";

/**
 * Google/YouTube kullanıcısının kendi playlist'lerini listeler.
 * YouTube Music, YouTube ile aynı hesabı paylaştığı için burada dönen
 * listeler music.youtube.com üzerinde de görünür.
 */
export async function GET() {
  const supabase = await sunucuSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return Response.json({ hata: "giris-gerekli" }, { status: 401 });
  const token = session.provider_token;
  if (!token) {
    return Response.json({ hata: "youtube-baglanti-gerekli", yenidenBagla: true }, { status: 400 });
  }

  const listeler: Array<{
    id: string;
    ad: string;
    aciklama: string;
    gorsel: string | null;
    url: string | null;
    musicUrl: string | null;
    parcaSayisi: number;
    duzenlenebilir: boolean;
  }> = [];

  let sayfaBileti: string | null = null;
  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlists");
    url.searchParams.set("part", "snippet,contentDetails,status");
    url.searchParams.set("mine", "true");
    url.searchParams.set("maxResults", "50");
    if (sayfaBileti) url.searchParams.set("pageToken", sayfaBileti);

    const cevap = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!cevap.ok) return Response.json(googleHatasi(cevap.status), { status: cevap.status });
    const veri = await cevap.json() as {
      items?: Array<{
        id: string;
        snippet?: {
          title?: string;
          description?: string;
          thumbnails?: { high?: { url?: string }; medium?: { url?: string }; default?: { url?: string } };
        };
        contentDetails?: { itemCount?: number };
      }>;
      nextPageToken?: string | null;
    };
    for (const liste of veri.items ?? []) {
      const gorsel = liste.snippet?.thumbnails?.high?.url
        ?? liste.snippet?.thumbnails?.medium?.url
        ?? liste.snippet?.thumbnails?.default?.url
        ?? null;
      listeler.push({
        id: liste.id,
        ad: liste.snippet?.title ?? "",
        aciklama: liste.snippet?.description ?? "",
        gorsel,
        url: `https://www.youtube.com/playlist?list=${liste.id}`,
        musicUrl: `https://music.youtube.com/playlist?list=${liste.id}`,
        parcaSayisi: liste.contentDetails?.itemCount ?? 0,
        duzenlenebilir: true,
      });
    }
    sayfaBileti = veri.nextPageToken ?? null;
  } while (sayfaBileti && listeler.length < 200);

  return Response.json({ listeler }, { headers: { "Cache-Control": "private, no-store" } });
}
