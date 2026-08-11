import { turkuOnizleme } from "@/lib/spotify";

export const runtime = "nodejs";

/** GET /api/onizleme?q=<türkü + yöre> → Spotify arama + 30sn önizleme verisi. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q");
  if (!q) return Response.json({ hata: "sorgu-yok" }, { status: 400 });
  try {
    const sonuc = await turkuOnizleme(q, {
      baslik: params.get("baslik") ?? undefined,
      yore: params.get("yore") ?? undefined,
      ozan: params.get("ozan") ?? undefined,
    });
    return Response.json(sonuc ?? {});
  } catch {
    // Env yok veya Spotify hatası → boş (istemci nazikçe ele alır)
    return Response.json({});
  }
}
