import { turkuOnizleme } from "@/lib/spotify";
import { youtubeEslesmesiBul } from "@/lib/youtube";
import { turkuMedyaCache } from "@/lib/turku-medya-cache";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const baslik = p.get("baslik")?.trim();
  if (!baslik) return Response.json({ hata: "baslik-yok" }, { status: 400 });
  const yore = p.get("yore")?.trim() || undefined;
  const ozan = p.get("ozan")?.trim() || undefined;
  const youtubeUrl = p.get("youtubeUrl")?.trim() || undefined;
  const slug = p.get("slug")?.trim() || undefined;
  const onbellek = turkuMedyaCache(slug);
  if (onbellek?.spotify && onbellek.youtube) {
    return Response.json(
      { spotify: onbellek.spotify, youtube: onbellek.youtube },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  }

  const [spotify, youtube] = await Promise.all([
    onbellek?.spotify
      ? Promise.resolve(onbellek.spotify)
      : turkuOnizleme([baslik, ozan || yore, "türkü"].filter(Boolean).join(" "), { baslik, yore, ozan }).catch(() => null),
    onbellek?.youtube
      ? Promise.resolve(onbellek.youtube)
      : youtubeEslesmesiBul({ baslik, yore, ozan, dogrudanUrl: youtubeUrl }).catch(() => null),
  ]);

  return Response.json(
    { spotify, youtube },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}
