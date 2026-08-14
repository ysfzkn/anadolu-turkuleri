import { turkuBul } from "./data";
import { turkuMedyaCache } from "./turku-medya-cache";
import { youtubeEslesmesiBul, youtubeVideoId } from "./youtube";

/**
 * Türkü slug'ları için YouTube videoId listesi türetir.
 * Önce turku-medya cache'ine bakar (crawl sonucu), yoksa
 * kaynak türkünün doğrulanmış YouTube bağlantısına, en son çare
 * olarak canlı YouTube araması yapar.
 */
export async function slugListesindenVideoIdler(
  slugs: string[],
): Promise<string[]> {
  const videoIdler: string[] = [];
  const gorulen = new Set<string>();
  for (const slug of slugs) {
    const onbellek = turkuMedyaCache(slug);
    let videoId = onbellek?.youtube?.videoId ?? null;
    if (!videoId) {
      const turku = turkuBul(slug);
      if (!turku) continue;
      const dogrudanYoutube = turku.baglantilar.find(
        (b) => (b.platform === "youtube" || b.platform === "youtube-music") && b.dogrulandi,
      )?.url;
      const dogrudanId = youtubeVideoId(dogrudanYoutube);
      if (dogrudanId) videoId = dogrudanId;
      else {
        const eslesme = await youtubeEslesmesiBul({
          baslik: turku.baslik,
          yore: turku.yore,
          ozan: turku.ozan ?? turku.sozYazari,
        }).catch(() => null);
        if (eslesme?.videoId) videoId = eslesme.videoId;
      }
    }
    if (videoId && !gorulen.has(videoId)) {
      gorulen.add(videoId);
      videoIdler.push(videoId);
    }
  }
  return videoIdler;
}

/** Tek slug için videoId; bulamazsa null. */
export async function slugIcinVideoId(slug: string): Promise<string | null> {
  const [ilk] = await slugListesindenVideoIdler([slug]);
  return ilk ?? null;
}

export function googleHatasi(status: number) {
  if (status === 401) return { hata: "youtube-token", yenidenBagla: true };
  if (status === 403) return { hata: "youtube-yetki", yenidenBagla: true };
  return { hata: "youtube-api" };
}
