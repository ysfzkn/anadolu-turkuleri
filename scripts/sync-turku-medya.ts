import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { turkuSchema, type Turku } from "../lib/schema";
import { turkuOnizleme } from "../lib/spotify";
import { youtubeEslesmesiBul } from "../lib/youtube";
import type { TurkuMedyaKaydi } from "../lib/turku-medya-cache";

const KOK = process.cwd();
loadEnvConfig(KOK);
const TURKU_DIZINI = path.join(KOK, "content", "turkuler");
const KATALOG_YOLU = path.join(KOK, "content", "turku-medya.json");
const LIMIT = Number(process.argv.find((x) => x.startsWith("--limit="))?.split("=")[1] ?? "99999");
const ESZAMANLILIK = Math.max(1, Math.min(6, Number(process.argv.find((x) => x.startsWith("--concurrency="))?.split("=")[1] ?? "3")));
const ZORLA = process.argv.includes("--force");
const EKSIKLERI_YENILE = process.argv.includes("--retry-missing");
const bekle = (ms: number) => new Promise((coz) => setTimeout(coz, ms));

interface Katalog {
  surum: number;
  guncellendi: string | null;
  kayitlar: Record<string, TurkuMedyaKaydi>;
}

function katalogOku(): Katalog {
  if (!fs.existsSync(KATALOG_YOLU)) return { surum: 1, guncellendi: null, kayitlar: {} };
  return JSON.parse(fs.readFileSync(KATALOG_YOLU, "utf8")) as Katalog;
}

function katalogYaz(katalog: Katalog) {
  katalog.guncellendi = new Date().toISOString();
  const gecici = `${KATALOG_YOLU}.tmp`;
  fs.writeFileSync(gecici, `${JSON.stringify(katalog, null, 2)}\n`, "utf8");
  fs.renameSync(gecici, KATALOG_YOLU);
}

function turkuler(): Turku[] {
  return fs.readdirSync(TURKU_DIZINI)
    .filter((ad) => ad.endsWith(".json"))
    .map((ad) => turkuSchema.parse(JSON.parse(fs.readFileSync(path.join(TURKU_DIZINI, ad), "utf8"))));
}

async function eslestir(turku: Turku): Promise<TurkuMedyaKaydi> {
  const ozan = turku.ozan ?? turku.sozYazari;
  const dogrudanYoutube = turku.baglantilar.find((b) => b.platform === "youtube" && b.dogrulandi)?.url;
  const [spotify, youtube] = await Promise.all([
    turkuOnizleme([turku.baslik, ozan || turku.yore, "türkü"].filter(Boolean).join(" "), {
      baslik: turku.baslik,
      yore: turku.yore,
      ozan,
    }).catch(() => null),
    youtubeEslesmesiBul({ baslik: turku.baslik, yore: turku.yore, ozan, dogrudanUrl: dogrudanYoutube }).catch(() => null),
  ]);
  return { spotify, youtube, guncellendi: new Date().toISOString() };
}

async function main() {
  const katalog = katalogOku();
  const adaylar = turkuler().filter((turku) => {
    const mevcut = katalog.kayitlar[turku.slug];
    return ZORLA || !mevcut || (EKSIKLERI_YENILE && (!mevcut.spotify || !mevcut.youtube));
  }).slice(0, LIMIT);
  let sira = 0;
  let tamamlanan = 0;
  let spotifyAdedi = 0;
  let youtubeAdedi = 0;

  async function isci() {
    while (sira < adaylar.length) {
      const turku = adaylar[sira++];
      const medya = await eslestir(turku);
      katalog.kayitlar[turku.slug] = medya;
      if (medya.spotify?.id) spotifyAdedi++;
      if (medya.youtube?.videoId) youtubeAdedi++;
      tamamlanan++;
      if (tamamlanan % 10 === 0) katalogYaz(katalog);
      if (tamamlanan % 25 === 0) console.log(`${tamamlanan}/${adaylar.length} · Spotify ${spotifyAdedi} · YouTube ${youtubeAdedi}`);
      await bekle(250);
    }
  }

  await Promise.all(Array.from({ length: ESZAMANLILIK }, () => isci()));
  katalogYaz(katalog);
  const tumKayitlar = Object.values(katalog.kayitlar);
  console.log(`Tamamlandı: ${tamamlanan} yeni kayıt. Katalog: ${tumKayitlar.length}; Spotify: ${tumKayitlar.filter((x) => x.spotify?.id).length}; YouTube: ${tumKayitlar.filter((x) => x.youtube?.videoId).length}.`);
}

main().catch((hata) => { console.error(hata); process.exit(1); });
