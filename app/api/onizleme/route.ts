import { turkuOnizleme } from "@/lib/spotify";

export const runtime = "nodejs";

/** GET /api/onizleme?q=<türkü + yöre> → Spotify arama + 30sn önizleme verisi. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q");
  if (!q) return Response.json({ hata: "sorgu-yok" }, { status: 400 });
  try {
    const sonuc = await turkuOnizleme(q);
    return Response.json(sonuc ?? {});
  } catch {
    // Env yok veya Spotify hatası → boş (istemci nazikçe ele alır)
    return Response.json({});
  }
}
