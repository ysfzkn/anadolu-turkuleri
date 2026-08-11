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

/** Uygulama token'ıyla parça arar; kullanıcı oturum süresinden etkilenmez. */
export async function spotifyTrackUri(sorgu: string): Promise<string | null> {
  const uygulamaTokeni = await erisimTokeni();
  const url =
    "https://api.spotify.com/v1/search?type=track&limit=1&market=TR&q=" +
    encodeURIComponent(sorgu);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${uygulamaTokeni}` } });
  if (!res.ok) return null;
  const j = (await res.json()) as { tracks?: { items?: any[] } };
  return j.tracks?.items?.[0]?.uri ?? null;
}

export interface SpotifyOnizleme {
  id: string | null;
  ad: string;
  sanatci: string;
  onizlemeUrl: string | null;
  spotifyUrl: string | null;
  gorsel: string | null;
  guven: number;
}

function normalize(metin: string): string {
  return metin.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9çğıöşü]+/gi, " ").trim();
}

function benzerlik(parca: any, hedef: { baslik?: string; yore?: string; ozan?: string }): number {
  const ad = normalize(parca.name ?? "");
  const sanatcilar = normalize((parca.artists ?? []).map((a: any) => a.name).join(" "));
  const baslik = normalize(hedef.baslik ?? "");
  const ozan = normalize(hedef.ozan ?? "");
  const yore = normalize(hedef.yore ?? "");
  let puan = parca.preview_url ? 12 : 0;
  if (baslik && ad === baslik) puan += 70;
  else if (baslik && (ad.includes(baslik) || baslik.includes(ad))) puan += 48;
  else if (baslik) puan += baslik.split(" ").filter((kelime) => kelime.length > 2 && ad.includes(kelime)).length * 8;
  if (ozan && sanatcilar.includes(ozan)) puan += 18;
  if (yore && `${ad} ${sanatcilar}`.includes(yore)) puan += 5;
  if (/remix|karaoke|tribute|enstrumantal|instrumental/.test(ad)) puan -= 12;
  return puan;
}

/** Türküyü Spotify'da arar; ilk (önizlemeli tercih) parçayı döndürür. */
export async function turkuOnizleme(
  sorgu: string,
  hedef: { baslik?: string; yore?: string; ozan?: string } = {},
): Promise<SpotifyOnizleme | null> {
  const t = await erisimTokeni();
  const url =
    "https://api.spotify.com/v1/search?type=track&limit=10&market=TR&q=" +
    encodeURIComponent(sorgu);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
  if (!res.ok) return null;
  const j = (await res.json()) as {
    tracks?: { items?: any[] };
  };
  const items = j.tracks?.items ?? [];
  if (!items.length) return null;
  const sirali = [...items].map((parca) => ({ parca, puan: benzerlik(parca, hedef) })).sort((a, b) => b.puan - a.puan);
  const { parca, puan } = sirali[0];
  return {
    id: parca.id ?? null,
    ad: parca.name,
    sanatci: (parca.artists ?? []).map((a: any) => a.name).join(", "),
    onizlemeUrl: parca.preview_url ?? null,
    spotifyUrl: parca.external_urls?.spotify ?? null,
    gorsel:
      parca.album?.images?.[2]?.url ?? parca.album?.images?.[0]?.url ?? null,
    guven: puan,
  };
}
