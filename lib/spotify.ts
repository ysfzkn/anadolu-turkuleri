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
  album: string | null;
  yayinYili: string | null;
  guven: number;
}

function normalize(metin: string): string {
  return metin.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9çğıöşü]+/gi, " ").trim();
}

const ETKISIZ_KELIMELER = new Set(["turku", "turkusu", "anonim", "official", "audio", "video", "canli", "live"]);

function kelimeler(metin: string): string[] {
  return normalize(metin).split(" ").filter((kelime) => kelime.length > 2 && !ETKISIZ_KELIMELER.has(kelime));
}

function baslikKapsamasi(ad: string, baslik: string): number {
  const hedef = kelimeler(baslik);
  if (!hedef.length) return 0;
  const aday = new Set(kelimeler(ad));
  return hedef.filter((kelime) => aday.has(kelime)).length / hedef.length;
}

function benzerlik(parca: any, hedef: { baslik?: string; yore?: string; ozan?: string }): { puan: number; kapsama: number; tam: boolean } {
  const ad = normalize(parca.name ?? "");
  const sanatcilar = normalize((parca.artists ?? []).map((a: any) => a.name).join(" "));
  const baslik = normalize(hedef.baslik ?? "");
  const ozan = normalize(hedef.ozan ?? "");
  const yore = normalize(hedef.yore ?? "");
  const kapsama = baslikKapsamasi(ad, baslik);
  const tam = Boolean(baslik && (ad === baslik || ad.includes(baslik)));
  let puan = parca.preview_url ? 6 : 0;
  if (baslik && ad === baslik) puan += 80;
  else if (baslik && ad.includes(baslik)) puan += 68;
  else if (baslik) puan += Math.round(kapsama * 58);
  if (ozan && sanatcilar.includes(ozan)) puan += 18;
  else if (ozan) puan -= 5;
  if (yore && `${ad} ${sanatcilar}`.includes(yore)) puan += 5;
  if (/remix|karaoke|tribute|enstrumantal|instrumental/.test(ad)) puan -= 12;
  return { puan, kapsama, tam };
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
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${t}` },
    next: { revalidate: 60 * 60 * 24 * 30 },
  });
  if (!res.ok) return null;
  const j = (await res.json()) as {
    tracks?: { items?: any[] };
  };
  const items = j.tracks?.items ?? [];
  if (!items.length) return null;
  const sirali = [...items].map((parca) => ({ parca, ...benzerlik(parca, hedef) })).sort((a, b) => b.puan - a.puan);
  const { parca, puan, kapsama, tam } = sirali[0];
  const hedefKelimeSayisi = kelimeler(hedef.baslik ?? "").length;
  const gerekenKapsama = hedefKelimeSayisi <= 2 ? 1 : hedefKelimeSayisi === 3 ? 0.67 : 0.6;
  if (!tam && (kapsama < gerekenKapsama || puan < 42)) return null;
  return {
    id: parca.id ?? null,
    ad: parca.name,
    sanatci: (parca.artists ?? []).map((a: any) => a.name).join(", "),
    onizlemeUrl: parca.preview_url ?? null,
    spotifyUrl: parca.external_urls?.spotify ?? null,
    gorsel:
      parca.album?.images?.[0]?.url ?? parca.album?.images?.[1]?.url ?? null,
    album: parca.album?.name ?? null,
    yayinYili: parca.album?.release_date?.slice?.(0, 4) ?? null,
    guven: puan,
  };
}
