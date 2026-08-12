import { sunucuSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await sunucuSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return Response.json({ hata: "giris-gerekli" }, { status: 401 });
  if (!session.provider_token) {
    return Response.json({ hata: "spotify-baglanti-gerekli", yenidenBagla: true }, { status: 400 });
  }

  const profilCevabi = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${session.provider_token}` },
    cache: "no-store",
  });
  if (profilCevabi.status === 401) return Response.json({ hata: "spotify-token", yenidenBagla: true }, { status: 401 });
  if (!profilCevabi.ok) return Response.json({ hata: "spotify-profili-alinamadi" }, { status: 502 });
  const spotifyProfili = await profilCevabi.json() as { id: string };

  const listeler: Array<{
    id: string;
    ad: string;
    aciklama: string;
    gorsel: string | null;
    url: string | null;
    parcaSayisi: number;
    sahibi: string;
    duzenlenebilir: boolean;
  }> = [];
  let url: string | null = "https://api.spotify.com/v1/me/playlists?limit=50";

  while (url && listeler.length < 200) {
    const cevap = await fetch(url, {
      headers: { Authorization: `Bearer ${session.provider_token}` },
      cache: "no-store",
    });
    if (cevap.status === 401) return Response.json({ hata: "spotify-token", yenidenBagla: true }, { status: 401 });
    if (cevap.status === 403) return Response.json({ hata: "spotify-yetki", yenidenBagla: true }, { status: 403 });
    if (!cevap.ok) return Response.json({ hata: "spotify-listeleri-alinamadi" }, { status: 502 });
    const veri = await cevap.json() as {
      items?: Array<{
        id: string;
        name: string;
        description?: string;
        collaborative?: boolean;
        images?: Array<{ url: string }>;
        external_urls?: { spotify?: string };
        tracks?: { total?: number };
        owner?: { id?: string; display_name?: string };
      }>;
      next?: string | null;
    };
    for (const liste of veri.items ?? []) {
      listeler.push({
        id: liste.id,
        ad: liste.name,
        aciklama: liste.description ?? "",
        gorsel: liste.images?.[0]?.url ?? null,
        url: liste.external_urls?.spotify ?? null,
        parcaSayisi: liste.tracks?.total ?? 0,
        sahibi: liste.owner?.display_name ?? "Spotify",
        duzenlenebilir: Boolean(liste.collaborative || liste.owner?.id === spotifyProfili.id),
      });
    }
    url = veri.next ?? null;
  }

  return Response.json({ listeler }, { headers: { "Cache-Control": "private, no-store" } });
}
