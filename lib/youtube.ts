export interface YouTubeEslesmesi {
  videoId: string;
  baslik: string;
  kanal: string | null;
  thumbnail: string;
  youtubeUrl: string;
  kaynak: "arsiv" | "arama";
}

function normalize(metin: string): string {
  return metin
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9çğıöşü]+/gi, " ")
    .trim();
}

export function youtubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const adres = new URL(url);
    const host = adres.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = adres.pathname.split("/").filter(Boolean)[0] ?? null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      id = adres.searchParams.get("v");
      if (!id) {
        const parcalar = adres.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(parcalar[0] ?? "")) id = parcalar[1] ?? null;
      }
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

const ETKISIZ_KELIMELER = new Set(["turku", "turkusu", "anonim", "official", "audio", "video", "canli", "live"]);

function kelimeler(metin: string): string[] {
  return normalize(metin).split(" ").filter((kelime) => kelime.length > 2 && !ETKISIZ_KELIMELER.has(kelime));
}

function puanla(baslik: string, kanal: string, hedef: { baslik: string; ozan?: string; yore?: string }): { puan: number; kapsama: number; tam: boolean } {
  const aday = normalize(baslik);
  const kanalAdi = normalize(kanal);
  const eser = normalize(hedef.baslik);
  const ozan = normalize(hedef.ozan ?? "");
  const yore = normalize(hedef.yore ?? "");
  const hedefKelimeler = kelimeler(eser);
  const adayKelimeler = new Set(kelimeler(aday));
  const kapsama = hedefKelimeler.length ? hedefKelimeler.filter((kelime) => adayKelimeler.has(kelime)).length / hedefKelimeler.length : 0;
  const tam = Boolean(eser && (aday === eser || aday.includes(eser)));
  let puan = 0;
  if (aday === eser) puan += 90;
  else if (aday.includes(eser)) puan += 62;
  else puan += Math.round(kapsama * 58);
  if (ozan && `${aday} ${kanalAdi}`.includes(ozan)) puan += 24;
  if (yore && aday.includes(yore)) puan += 6;
  if (/official|resmi|trt|canli performans|konser/.test(aday)) puan += 4;
  if (/karaoke|reaction|tepki|cover ders|tutorial|sped up|slowed/.test(aday)) puan -= 24;
  return { puan, kapsama, tam };
}

interface YouTubeAdayi {
  videoId: string;
  baslik: string;
  kanal: string;
  thumbnail?: string;
}

function jsonMetniniBul(html: string, isaret: string): unknown | null {
  const baslangic = html.indexOf(isaret);
  if (baslangic < 0) return null;
  const ilkSuslu = html.indexOf("{", baslangic + isaret.length);
  if (ilkSuslu < 0) return null;
  let derinlik = 0;
  let metinIcinde = false;
  let kacis = false;
  for (let i = ilkSuslu; i < html.length; i++) {
    const karakter = html[i];
    if (metinIcinde) {
      if (kacis) kacis = false;
      else if (karakter === "\\") kacis = true;
      else if (karakter === '"') metinIcinde = false;
      continue;
    }
    if (karakter === '"') metinIcinde = true;
    else if (karakter === "{") derinlik++;
    else if (karakter === "}" && --derinlik === 0) {
      try { return JSON.parse(html.slice(ilkSuslu, i + 1)); } catch { return null; }
    }
  }
  return null;
}

function videoAdaylariniTopla(kok: unknown): YouTubeAdayi[] {
  const sonuc: YouTubeAdayi[] = [];
  const gorulen = new Set<string>();
  const gez = (deger: unknown) => {
    if (!deger || typeof deger !== "object") return;
    if (Array.isArray(deger)) { deger.forEach(gez); return; }
    const nesne = deger as Record<string, any>;
    const video = nesne.videoRenderer as Record<string, any> | undefined;
    if (video?.videoId && !gorulen.has(video.videoId)) {
      const baslik = video.title?.runs?.map((x: { text?: string }) => x.text ?? "").join("") || video.title?.simpleText || "";
      if (baslik) {
        gorulen.add(video.videoId);
        const gorseller = video.thumbnail?.thumbnails ?? [];
        sonuc.push({
          videoId: video.videoId,
          baslik,
          kanal: video.ownerText?.runs?.[0]?.text ?? video.longBylineText?.runs?.[0]?.text ?? "",
          thumbnail: gorseller[gorseller.length - 1]?.url,
        });
      }
    }
    Object.values(nesne).forEach(gez);
  };
  gez(kok);
  return sonuc;
}

async function youtubeAcikArama(sorgu: string): Promise<YouTubeAdayi[]> {
  const adres = `https://www.youtube.com/results?search_query=${encodeURIComponent(sorgu)}&hl=tr&gl=TR`;
  const cevap = await fetch(adres, {
    headers: {
      "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.7",
      "User-Agent": "Mozilla/5.0 (compatible; AnadoluTurkuleri/1.0; +https://anadoluturkuleri.com)",
    },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });
  if (!cevap.ok) return [];
  const html = await cevap.text();
  const veri = jsonMetniniBul(html, "var ytInitialData =") ?? jsonMetniniBul(html, "ytInitialData =");
  return videoAdaylariniTopla(veri).slice(0, 12);
}

function enIyiAday(adaylar: YouTubeAdayi[], hedef: { baslik: string; ozan?: string; yore?: string }) {
  const sirali = adaylar
    .map((aday) => ({ aday, ...puanla(aday.baslik, aday.kanal, hedef) }))
    .sort((a, b) => b.puan - a.puan);
  const enIyi = sirali[0];
  const hedefKelimeSayisi = kelimeler(hedef.baslik).length;
  const gerekenKapsama = hedefKelimeSayisi <= 2 ? 1 : hedefKelimeSayisi === 3 ? 0.67 : 0.6;
  return enIyi && (enIyi.tam || (enIyi.kapsama >= gerekenKapsama && enIyi.puan >= 42)) ? enIyi.aday : null;
}

export async function youtubeEslesmesiBul({
  baslik,
  yore,
  ozan,
  dogrudanUrl,
}: {
  baslik: string;
  yore?: string;
  ozan?: string;
  dogrudanUrl?: string;
}): Promise<YouTubeEslesmesi | null> {
  const dogrudanId = youtubeVideoId(dogrudanUrl);
  if (dogrudanId) {
    return {
      videoId: dogrudanId,
      baslik,
      kanal: null,
      thumbnail: `https://i.ytimg.com/vi/${dogrudanId}/hqdefault.jpg`,
      youtubeUrl: `https://www.youtube.com/watch?v=${dogrudanId}`,
      kaynak: "arsiv",
    };
  }

  const sorgu = [baslik, ozan || yore, "türkü"].filter(Boolean).join(" ");
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    const secilen = enIyiAday(await youtubeAcikArama(sorgu), { baslik, ozan, yore });
    if (!secilen) return null;
    return {
      ...secilen,
      kanal: secilen.kanal || null,
      thumbnail: secilen.thumbnail ?? `https://i.ytimg.com/vi/${secilen.videoId}/hqdefault.jpg`,
      youtubeUrl: `https://www.youtube.com/watch?v=${secilen.videoId}`,
      kaynak: "arama",
    };
  }
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("safeSearch", "moderate");
  url.searchParams.set("regionCode", "TR");
  url.searchParams.set("relevanceLanguage", "tr");
  url.searchParams.set("order", "relevance");
  url.searchParams.set("maxResults", "5");
  url.searchParams.set("q", sorgu);
  url.searchParams.set("key", apiKey);

  const cevap = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!cevap.ok) {
    const secilen = enIyiAday(await youtubeAcikArama(sorgu), { baslik, ozan, yore });
    if (!secilen) return null;
    return { ...secilen, kanal: secilen.kanal || null, thumbnail: secilen.thumbnail ?? `https://i.ytimg.com/vi/${secilen.videoId}/hqdefault.jpg`, youtubeUrl: `https://www.youtube.com/watch?v=${secilen.videoId}`, kaynak: "arama" };
  }
  const veri = (await cevap.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: { title?: string; channelTitle?: string; thumbnails?: { high?: { url?: string }; medium?: { url?: string } } };
    }>;
  };
  const adaylar = (veri.items ?? [])
    .filter((x) => x.id?.videoId && x.snippet?.title)
    .map((x) => ({ oge: x, ...puanla(x.snippet?.title ?? "", x.snippet?.channelTitle ?? "", { baslik, ozan, yore }) }))
    .sort((a, b) => b.puan - a.puan);
  const enIyi = adaylar[0];
  const hedefKelimeSayisi = kelimeler(baslik).length;
  const gerekenKapsama = hedefKelimeSayisi <= 2 ? 1 : hedefKelimeSayisi === 3 ? 0.67 : 0.6;
  if (!enIyi || (!enIyi.tam && (enIyi.kapsama < gerekenKapsama || enIyi.puan < 42))) return null;
  const secilen = enIyi.oge;
  const videoId = secilen?.id?.videoId;
  if (!videoId) return null;
  return {
    videoId,
    baslik: secilen.snippet?.title ?? baslik,
    kanal: secilen.snippet?.channelTitle ?? null,
    thumbnail: secilen.snippet?.thumbnails?.high?.url ?? secilen.snippet?.thumbnails?.medium?.url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    kaynak: "arama",
  };
}
