/**
 * Spotify Web API — sunucu tarafı, Client Credentials akışı.
 * Kullanıcı girişi GEREKTİRMEZ; yalnızca arama + 30sn önizleme (preview_url) için.
 * Client secret sadece sunucuda kullanılır (API route üzerinden çağrılır).
 */

let token: string | null = null;
let sonGecerlilik = 0;

async function erisimTokeni(): Promise<string> {
  if (token && Date.now() < sonGecerlilik) return token;
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Spotify env tanımlı değil.");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("Spotify token alınamadı.");
  const j = (await res.json()) as { access_token: string; expires_in: number };
  token = j.access_token;
  sonGecerlilik = Date.now() + (j.expires_in - 60) * 1000;
  return token;
}

export interface SpotifyOnizleme {
  ad: string;
  sanatci: string;
  onizlemeUrl: string | null;
  spotifyUrl: string | null;
  gorsel: string | null;
}

/** Türküyü Spotify'da arar; ilk (önizlemeli tercih) parçayı döndürür. */
export async function turkuOnizleme(
  sorgu: string,
): Promise<SpotifyOnizleme | null> {
  const t = await erisimTokeni();
  const url =
    "https://api.spotify.com/v1/search?type=track&limit=5&market=TR&q=" +
    encodeURIComponent(sorgu);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
  if (!res.ok) return null;
  const j = (await res.json()) as {
    tracks?: { items?: any[] };
  };
  const items = j.tracks?.items ?? [];
  if (!items.length) return null;
  const parca = items.find((i) => i.preview_url) ?? items[0];
  return {
    ad: parca.name,
    sanatci: (parca.artists ?? []).map((a: any) => a.name).join(", "),
    onizlemeUrl: parca.preview_url ?? null,
    spotifyUrl: parca.external_urls?.spotify ?? null,
    gorsel:
      parca.album?.images?.[2]?.url ?? parca.album?.images?.[0]?.url ?? null,
  };
}
