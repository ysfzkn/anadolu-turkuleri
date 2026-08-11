import { sunucuSupabase } from "@/lib/supabase/server";
import { turkuBul } from "@/lib/data";
import { spotifyTrackUri } from "@/lib/spotify";

export const runtime = "nodejs";

/**
 * POST /api/spotify/playlist  { listeId }
 * Kullanıcının listesini Spotify çalma listesine dönüştürür.
 * Spotify erişim token'ı, Supabase oturumundaki provider_token'dan gelir
 * (yani kullanıcı Spotify ile giriş yapmış olmalı).
 */
export async function POST(request: Request) {
  const supabase = sunucuSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return Response.json({ hata: "giris-gerekli" }, { status: 401 });
  const token = session.provider_token;
  if (!token)
    return Response.json({ hata: "spotify-baglanti-gerekli" }, { status: 400 });

  let listeId: string | undefined;
  try {
    ({ listeId } = await request.json());
  } catch {
    /* gövde yok */
  }
  if (!listeId) return Response.json({ hata: "liste-yok" }, { status: 400 });

  // Liste + türküleri (RLS: yalnızca sahibi)
  const { data: liste } = await supabase
    .from("listeler")
    .select("baslik, liste_turkuleri(turku_slug, sira)")
    .eq("id", listeId)
    .single();
  if (!liste) return Response.json({ hata: "liste-bulunamadi" }, { status: 404 });

  const slugs = ((liste.liste_turkuleri as any[]) ?? [])
    .sort((a, b) => a.sira - b.sira)
    .map((r) => r.turku_slug);

  // Her türkü için parça URI'si bul
  const uris: string[] = [];
  for (const slug of slugs) {
    const t = turkuBul(slug);
    if (!t) continue;
    const uri = await spotifyTrackUri(token, `${t.baslik} ${t.yore}`);
    if (uri) uris.push(uri);
  }
  if (!uris.length)
    return Response.json({ hata: "parca-bulunamadi" }, { status: 400 });

  // Çalma listesi oluştur
  const plRes = await fetch("https://api.spotify.com/v1/me/playlists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${liste.baslik} · Anadolu Türküleri`,
        description: "anadoluturkuleri.com listesinden oluşturuldu.",
        public: false,
      }),
    });
  if (plRes.status === 401 || plRes.status === 403)
    return Response.json({ hata: "spotify-token" }, { status: 400 });
  if (!plRes.ok)
    return Response.json({ hata: "playlist-olusmadi" }, { status: 400 });
  const pl = (await plRes.json()) as {
    id: string;
    external_urls?: { spotify?: string };
  };

  // Parçaları ekle (istek başına en çok 100)
  const ekleRes = await fetch(`https://api.spotify.com/v1/playlists/${pl.id}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris: uris.slice(0, 100) }),
  });
  if (!ekleRes.ok) {
    return Response.json(
      { hata: ekleRes.status === 401 || ekleRes.status === 403 ? "spotify-token" : "parcalar-eklenemedi" },
      { status: 400 },
    );
  }

  return Response.json({
    url: pl.external_urls?.spotify ?? null,
    eklenen: uris.length,
    toplam: slugs.length,
  });
}
