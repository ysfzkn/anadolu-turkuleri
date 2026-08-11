import fs from "node:fs";
import path from "node:path";
import { slugYap } from "../lib/slug";

type Il = { ad: string };
type Kayit = { yore: string; dogrulama: string; kaynaklar?: unknown[]; sozler?: unknown[] };

const kok = process.cwd();
const iller = JSON.parse(fs.readFileSync(path.join(kok, "scripts/assets/iller-plaka.json"), "utf8")) as Il[];
const dosyalar = fs.readdirSync(path.join(kok, "content/turkuler")).filter((x) => x.endsWith(".json"));
const gorseller = JSON.parse(fs.readFileSync(path.join(kok, "content/sehir-gorselleri.json"), "utf8"));

const satirlar = iller.map((il) => {
  const kayitlar = dosyalar.map((dosya) => JSON.parse(fs.readFileSync(path.join(kok, "content/turkuler", dosya), "utf8")) as Kayit)
    .filter((kayit) => slugYap(kayit.yore.split(/[(/]/)[0].trim()) === slugYap(il.ad));
  return {
    il: il.ad,
    toplam: kayitlar.length,
    dogrulandi: kayitlar.filter((x) => x.dogrulama === "dogrulandi").length,
    ikiKaynak: kayitlar.filter((x) => (x.kaynaklar?.length ?? 0) >= 2).length,
    sozlu: kayitlar.filter((x) => (x.sozler?.length ?? 0) > 0).length,
    gorsel: Boolean(gorseller[slugYap(il.ad)]),
    acik: Math.max(0, 50 - kayitlar.length),
  };
});

const rapor = {
  tarih: new Date().toISOString(),
  hedef: iller.length * 50,
  toplam: dosyalar.length,
  elliyiGecenIl: satirlar.filter((x) => x.toplam >= 50).length,
  gorselliIl: satirlar.filter((x) => x.gorsel).length,
  iller: satirlar,
};

fs.mkdirSync(path.join(kok, "reports"), { recursive: true });
fs.writeFileSync(path.join(kok, "reports/archive-coverage.json"), `${JSON.stringify(rapor, null, 2)}\n`);
console.table(satirlar.sort((a, b) => a.toplam - b.toplam));
console.log(`Toplam ${rapor.toplam}/${rapor.hedef}; 50+ kayıtlı ${rapor.elliyiGecenIl}/81 il; görselli ${rapor.gorselliIl}/81 il.`);
