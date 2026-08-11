/**
 * VALIDATE — content/turkuler ve content/_staging altındaki tüm JSON
 * kayıtlarını şemaya göre doğrular. CI'da kullanılabilir; hata varsa
 * çıkış kodu 1 döner.
 *
 * Kullanım: npm run validate
 */
import fs from "node:fs";
import path from "node:path";
import { turkuSchema } from "../lib/schema";

const KOK = process.cwd();
const DIZINLER = [
  path.join(KOK, "content", "turkuler"),
  path.join(KOK, "content", "_staging"),
];

let hataSayisi = 0;
let kontrolEdilen = 0;

for (const dizin of DIZINLER) {
  if (!fs.existsSync(dizin)) continue;
  const dosyalar = fs.readdirSync(dizin).filter((f) => f.endsWith(".json"));
  for (const dosya of dosyalar) {
    kontrolEdilen++;
    const yol = path.join(dizin, dosya);
    const goreceli = path.relative(KOK, yol);
    try {
      const ham = JSON.parse(fs.readFileSync(yol, "utf-8"));
      const sonuc = turkuSchema.safeParse(ham);
      if (!sonuc.success) {
        hataSayisi++;
        console.error(`✗ ${goreceli}`);
        console.error(JSON.stringify(sonuc.error.format(), null, 2));
        continue;
      }
      if (sonuc.data.slug !== path.basename(dosya, ".json")) {
        hataSayisi++;
        console.error(
          `✗ ${goreceli}: slug "${sonuc.data.slug}" dosya adıyla eşleşmiyor`,
        );
        continue;
      }
      console.log(`✓ ${goreceli}`);
    } catch (e) {
      hataSayisi++;
      console.error(`✗ ${goreceli}: JSON okunamadı — ${(e as Error).message}`);
    }
  }
}

console.log(`\n${kontrolEdilen} dosya kontrol edildi, ${hataSayisi} hata.`);
process.exit(hataSayisi > 0 ? 1 : 0);
