/**
 * REVIEW — insan onay kapısı.
 *
 * Staging'deki taslakları listeler, gösterir ve onaylananları yayına taşır.
 * Bir kayıt yayına (content/turkuler/) ancak şu koşulları geçerse alınır:
 *   1) Şemaya uygun,
 *   2) dogrulama === "dogrulandi",
 *   3) hikâyede "yeniden yazılmalı" işareti KALMAMIŞ (özgün metin yazılmış),
 *   4) en az bir kıta söz eklenmiş (ya da bilinçli olarak --sozsuz ile onaylanmış).
 *
 * Kullanım:
 *   npm run review                      # durum listesi
 *   npm run review -- --show=<slug>     # bir taslağı yazdır
 *   npm run review -- --promote=<slug>  # yayına al (koşulları geçerse)
 *   npm run review -- --promote=<slug> --sozsuz   # sözsüz yayına izin ver
 */
import fs from "node:fs";
import path from "node:path";
import { turkuSchema } from "../lib/schema";
import { YENIDEN_YAZ_ISARETI } from "./pipeline/normalize";

const KOK = process.cwd();
const STAGING = path.join(KOK, "content", "_staging");
const YAYIN = path.join(KOK, "content", "turkuler");

function argDeger(ad: string): string | undefined {
  const p = process.argv.find((a) => a.startsWith(`--${ad}=`));
  return p ? p.slice(ad.length + 3) : undefined;
}
function bayrak(ad: string): boolean {
  return process.argv.includes(`--${ad}`);
}

function jsonOku(yol: string): unknown {
  return JSON.parse(fs.readFileSync(yol, "utf-8"));
}

function stagingDosyalari(): string[] {
  if (!fs.existsSync(STAGING)) return [];
  return fs.readdirSync(STAGING).filter((f) => f.endsWith(".json"));
}

function durumListesi() {
  const dosyalar = stagingDosyalari();
  const yayinSayisi = fs.existsSync(YAYIN)
    ? fs.readdirSync(YAYIN).filter((f) => f.endsWith(".json")).length
    : 0;

  console.log(`\n📚 Yayında: ${yayinSayisi} türkü`);
  console.log(`📝 Staging (taslak): ${dosyalar.length} türkü\n`);

  if (!dosyalar.length) {
    console.log("Staging boş. 'npm run ingest' ile veri toplayın.\n");
    return;
  }

  for (const dosya of dosyalar) {
    const ham = jsonOku(path.join(STAGING, dosya)) as Record<string, unknown>;
    const sonuc = turkuSchema.safeParse(ham);
    const gecerli = sonuc.success;
    const hikaye = String(ham.hikaye ?? "");
    const yenidenYaz = hikaye.includes(YENIDEN_YAZ_ISARETI);
    const sozVar = Array.isArray(ham.sozler) && ham.sozler.length > 0;
    const durum = String(ham.dogrulama ?? "?");

    const isaretler = [
      gecerli ? "şema✓" : "şema✗",
      yenidenYaz ? "hikâye:YENİDEN-YAZ" : "hikâye✓",
      sozVar ? "söz✓" : "söz:YOK",
      `durum:${durum}`,
    ].join("  ");

    const hazir = gecerli && !yenidenYaz && durum === "dogrulandi";
    console.log(`${hazir ? "🟢" : "🟡"} ${dosya.padEnd(28)} ${isaretler}`);
  }
  console.log(
    `\nYayına almak için: npm run review -- --promote=<slug>\n` +
      `(Önce ilgili content/_staging/<slug>.json dosyasını düzenleyip ` +
      `hikâyeyi özgünleştirin, sözleri ekleyin, dogrulama'yı "dogrulandi" yapın.)\n`,
  );
}

function goster(slug: string) {
  const yol = path.join(STAGING, `${slug}.json`);
  if (!fs.existsSync(yol)) {
    console.error(`Bulunamadı: ${yol}`);
    process.exit(1);
  }
  console.log(fs.readFileSync(yol, "utf-8"));
}

function yayinaAl(slug: string, sozsuzIzin: boolean) {
  const kaynakYol = path.join(STAGING, `${slug}.json`);
  if (!fs.existsSync(kaynakYol)) {
    console.error(`Staging'de bulunamadı: ${slug}`);
    process.exit(1);
  }
  const ham = jsonOku(kaynakYol);
  const sonuc = turkuSchema.safeParse(ham);
  if (!sonuc.success) {
    console.error("✗ Şema hatası, yayına alınamaz:");
    console.error(JSON.stringify(sonuc.error.format(), null, 2));
    process.exit(1);
  }
  const t = sonuc.data;
  const hatalar: string[] = [];
  if (t.slug !== slug) hatalar.push(`slug "${t.slug}" dosya adıyla eşleşmiyor`);
  if (t.dogrulama !== "dogrulandi")
    hatalar.push(`dogrulama "dogrulandi" olmalı (şu an "${t.dogrulama}")`);
  if (t.hikaye.includes(YENIDEN_YAZ_ISARETI))
    hatalar.push("hikâye hâlâ 'yeniden yazılmalı' işareti taşıyor — özgün metin yazın");
  if (t.sozler.length === 0 && !sozsuzIzin)
    hatalar.push("söz eklenmemiş (bilinçliyse --sozsuz ile onaylayın)");

  if (hatalar.length) {
    console.error(`✗ Yayına alınamaz (${slug}):`);
    hatalar.forEach((h) => console.error(`   - ${h}`));
    process.exit(1);
  }

  fs.mkdirSync(YAYIN, { recursive: true });
  fs.writeFileSync(
    path.join(YAYIN, `${slug}.json`),
    JSON.stringify(t, null, 2) + "\n",
    "utf-8",
  );
  fs.unlinkSync(kaynakYol);
  console.log(`🟢 Yayına alındı: ${slug} → content/turkuler/${slug}.json`);
}

const show = argDeger("show");
const promote = argDeger("promote");
if (show) goster(show);
else if (promote) yayinaAl(promote, bayrak("sozsuz"));
else durumListesi();
