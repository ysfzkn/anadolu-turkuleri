/**
 * INGEST — kaynaklardan ham veri toplayıp şema-geçerli TASLAK kayıtları
 * content/_staging/ altına yazar. Yayına giden content/turkuler/ dizinine
 * ASLA doğrudan yazmaz; oraya geçiş yalnızca `npm run review -- --promote`
 * ile, insan onayından sonra olur.
 *
 * Kullanım:
 *   npm run ingest -- --source=wikipedia
 *   npm run ingest -- --source=wikipedia --only-wiki   # yalnızca wikiBaslik'i olan tohumlar
 *   npm run ingest -- --source=all --terms="Gesi Bağları,Çökertme"
 *
 * Tohum kaynağı önceliği:
 *   1) --terms="a,b,c"  (satır içi adlar)
 *   2) scripts/seed-turkuler.json  (yapılandırılmış: ad, yore, wikiBaslik, tema)
 *   3) scripts/turku-listesi.txt   (her satır bir ad, # yorum)
 */
import fs from "node:fs";
import path from "node:path";
import { adaptorSec } from "./pipeline/sources/index";
import { normallestir } from "./pipeline/normalize";
import type { TohumKayit } from "./pipeline/sources/types";

const KOK = process.cwd();
const STAGING = path.join(KOK, "content", "_staging");
const YAYIN = path.join(KOK, "content", "turkuler");
const LISTE = path.join(KOK, "scripts", "turku-listesi.txt");
const SEED = path.join(KOK, "scripts", "seed-turkuler.json");

function argDeger(ad: string): string | undefined {
  const p = process.argv.find((a) => a.startsWith(`--${ad}=`));
  return p ? p.slice(ad.length + 3) : undefined;
}
function bayrak(ad: string): boolean {
  return process.argv.includes(`--${ad}`);
}

function tohumlariOku(): TohumKayit[] {
  const inline = argDeger("terms");
  if (inline) {
    return inline
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((ad) => ({ ad }));
  }
  if (fs.existsSync(SEED)) {
    const veri = JSON.parse(fs.readFileSync(SEED, "utf-8")) as TohumKayit[];
    return veri;
  }
  if (fs.existsSync(LISTE)) {
    return fs
      .readFileSync(LISTE, "utf-8")
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("#"))
      .map((ad) => ({ ad }));
  }
  throw new Error(
    `Tohum bulunamadı. --terms="..." kullanın veya ${SEED} / ${LISTE} oluşturun.`,
  );
}

async function main() {
  fs.mkdirSync(STAGING, { recursive: true });
  const kaynak = argDeger("source") ?? "all";
  const adaptorler = adaptorSec(kaynak);
  let tohumlar = tohumlariOku();

  // --only-wiki: yalnızca Vikipedi başlığı bilinen tohumları dene (404 yağmurunu önler).
  if (bayrak("only-wiki")) {
    const oncesi = tohumlar.length;
    tohumlar = tohumlar.filter((t) => t.wikiBaslik);
    console.log(
      `(--only-wiki) ${oncesi} tohumdan ${tohumlar.length}'i wikiBaslik taşıyor.`,
    );
  }

  console.log(
    `\n▶ Ingest — ${adaptorler.length} kaynak, ${tohumlar.length} tohum\n`,
  );

  let yazilan = 0;
  let atlanan = 0;

  for (const adaptor of adaptorler) {
    console.log(`Kaynak: ${adaptor.ad}`);
    const hamKayitlar = await adaptor.getir(tohumlar);
    for (const ham of hamKayitlar) {
      // Zaten yayında olan bir slug'ı staging'de ezme — uyar, atla.
      const yayinYolu = path.join(YAYIN, `${ham.slug}.json`);
      if (fs.existsSync(yayinYolu)) {
        console.warn(`  ⚠ zaten yayında, atlandı: ${ham.slug}`);
        atlanan++;
        continue;
      }
      const taslak = normallestir(ham);
      const hedef = path.join(STAGING, `${ham.slug}.json`);
      fs.writeFileSync(hedef, JSON.stringify(taslak, null, 2) + "\n", "utf-8");
      yazilan++;
    }
  }

  console.log(
    `\n✔ Tamam. ${yazilan} taslak content/_staging/ altına yazıldı, ${atlanan} atlandı.`,
  );
  console.log(
    `Sıradaki adım: her taslağı elle düzenleyin (hikâyeyi özgün yazın, sözleri ekleyin),\n` +
      `sonra 'npm run review' ile durumu görün ve '--promote=<slug>' ile yayına alın.\n`,
  );
}

main().catch((e) => {
  console.error("Ingest hatası:", e);
  process.exit(1);
});
