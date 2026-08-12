import { turkuOnizleme } from "@/lib/spotify";
import { turkuMedyaCache } from "@/lib/turku-medya-cache";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const baslik = p.get("baslik")?.trim().slice(0, 160);
  if (!baslik) return Response.json({ hata: "baslik-yok" }, { status: 400 });

  const yore = p.get("yore")?.trim().slice(0, 100) || undefined;
  const ozan = p.get("ozan")?.trim().slice(0, 100) || undefined;
  const slug = p.get("slug")?.trim().slice(0, 180) || undefined;
  const cacheSpotify = turkuMedyaCache(slug)?.spotify;
  // Anonim eserlerde yöre adını sorguya eklemek Spotify'ın doğru kaydı
  // elemesine yol açabiliyor. Yöre, aşağıdaki güven puanında kullanılmaya devam eder.
  const sorgu = [baslik, ozan].filter(Boolean).join(" ");
  const eslesme = cacheSpotify ?? await turkuOnizleme(sorgu, { baslik, yore, ozan }).catch(() => null);

  // Düşük puanlı sonuçlar aynı adlı pop/rap eserleri olabildiği için gösterilmez.
  const kapak = eslesme?.gorsel && eslesme.guven >= 44
    ? {
        gorsel: eslesme.gorsel,
        ad: eslesme.ad,
        sanatci: eslesme.sanatci,
        album: eslesme.album,
      }
    : null;

  return Response.json(
    { kapak },
    { headers: { "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=7776000" } },
  );
}
