import fs from "node:fs";
import path from "node:path";
import { slugYap } from "../lib/slug";
import { turkuSchema } from "../lib/schema";

const KOK = process.cwd();
const ICERIK = path.join(KOK, "content", "turkuler");
const API = "https://tr.wikisource.org/w/api.php";
const KATEGORI = "https://tr.wikisource.org/wiki/Kategori:Sivas_t%C3%BCrk%C3%BCleri";
const RESMI_KAYNAK = "https://sivas.ktb.gov.tr/TR-278692/sivas-turkuleri.html";
const UA = "AnadoluTurkuleriBot/0.3 (Sivas archive; anadoluturkuleri.com)";

type WikiSayfasi = {
  title: string;
  revisions?: Array<{ slots?: { main?: { content?: string } } }>;
  categories?: Array<{ title: string }>;
};

function htmlCoz(s: string) {
  return s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function wikiTemizle(satir: string): string {
  return satir.replace(/<!--.*?-->/g, "").replace(/<ref\b[^>]*>[\s\S]*?<\/ref>|<ref\b[^/]*\/>/gi, "").replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1").replace(/\{\{[^{}]*\}\}/g, "").replace(/''+/g, "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function sozleriAyikla(wikitext: string) {
  const eslesme = wikitext.match(/<poem\b[^>]*>([\s\S]*?)<\/poem>/i);
  if (!eslesme) return [];
  return eslesme[1].split(/\n\s*\n+/).map((blok) => blok.split("\n").map(wikiTemizle).filter((satir) => satir && !/^\([^)]*\)$/.test(satir))).filter((satirlar) => satirlar.length >= 2).slice(0, 8).map((satirlar) => ({ tur: "kita" as const, satirlar: satirlar.slice(0, 12) }));
}

function eserSahibi(wikitext: string): string | undefined {
  const ham = wikitext.match(/esersahibi\s*=\s*([^|}\n]+)/i)?.[1];
  const ad = ham ? wikiTemizle(ham) : "";
  return ad && !/^(anonim|bilinmiyor)$/i.test(ad) ? ad : undefined;
}

function youtubeBul(wikitext: string): string | undefined {
  return wikitext.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]+/i)?.[0];
}

function parcalaraAyir<T>(dizi: T[], boyut = 25): T[][] {
  return Array.from({ length: Math.ceil(dizi.length / boyut) }, (_, i) => dizi.slice(i * boyut, (i + 1) * boyut));
}

async function kategoriBasliklari(): Promise<string[]> {
  const yanit = await fetch(KATEGORI, { headers: { "User-Agent": UA } });
  if (!yanit.ok) throw new Error(`Sivas kategorisi okunamadı: ${yanit.status}`);
  const html = await yanit.text();
  const bas = html.indexOf('id="mw-pages"');
  const son = html.indexOf('class="printfooter"', bas);
  const govde = html.slice(bas, son > bas ? son : undefined);
  return Array.from(govde.matchAll(/<a href="\/wiki\/[^"]+" title="([^"]+)"/g), (x) => htmlCoz(x[1]));
}

async function sayfalariOku(basliklar: string[]): Promise<WikiSayfasi[]> {
  const govde = new URLSearchParams({ action: "query", prop: "revisions|categories", titles: basliklar.join("|"), redirects: "1", rvprop: "content", rvslots: "main", cllimit: "max", format: "json", formatversion: "2" });
  const yanit = await fetch(API, { method: "POST", headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" }, body: govde });
  if (!yanit.ok) throw new Error(`Sivas sayfaları okunamadı: ${yanit.status}`);
  const veri = await yanit.json() as { query?: { pages?: WikiSayfasi[] } };
  return veri.query?.pages ?? [];
}

async function main() {
  const basliklar = await kategoriBasliklari();
  const sayfalar: WikiSayfasi[] = [];
  for (const grup of parcalaraAyir(basliklar)) {
    sayfalar.push(...await sayfalariOku(grup));
    await new Promise((coz) => setTimeout(coz, 800));
  }
  let yeni = 0;
  let guncel = 0;
  for (const sayfa of sayfalar) {
    const wikitext = sayfa.revisions?.[0]?.slots?.main?.content ?? "";
    if (!wikitext) continue;
    const slug = slugYap(sayfa.title.replace(/\s*\(Sivas\)\s*$/i, ""));
    if (!slug) continue;
    const dosya = path.join(ICERIK, `${slug}.json`);
    const mevcut = fs.existsSync(dosya) ? JSON.parse(fs.readFileSync(dosya, "utf8")) : undefined;
    const anonim = sayfa.categories?.some((x) => x.title === "Kategori:Anonim metinler") ?? false;
    const sahip = eserSahibi(wikitext);
    const sozler = sozleriAyikla(wikitext);
    const youtube = youtubeBul(wikitext);
    const kaynakUrl = `https://tr.wikisource.org/wiki/${encodeURIComponent(sayfa.title.replace(/ /g, "_"))}`;
    const baglantilar = mevcut?.baglantilar ?? [
      { platform: "youtube", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${sayfa.title} türkü`)}`, dogrulandi: false },
      { platform: "spotify", url: `https://open.spotify.com/search/${encodeURIComponent(sayfa.title)}`, dogrulandi: false },
    ];
    if (youtube) {
      const baglanti = baglantilar.find((x: { platform: string }) => x.platform === "youtube");
      if (baglanti) Object.assign(baglanti, { url: youtube, dogrulandi: true });
    }
    const kaynaklar = mevcut?.kaynaklar ?? [];
    if (!kaynaklar.some((x: { url?: string }) => x.url === kaynakUrl)) kaynaklar.push({ baslik: `Vikikaynak — ${sayfa.title}`, url: kaynakUrl, tur: "arsiv", erisimTarihi: new Date().toISOString().slice(0, 10) });
    if (!kaynaklar.some((x: { url?: string }) => x.url === RESMI_KAYNAK)) kaynaklar.push({ baslik: "Sivas İl Kültür ve Turizm Müdürlüğü — Sivas Türküleri", url: RESMI_KAYNAK, tur: "kurum", erisimTarihi: new Date().toISOString().slice(0, 10) });
    const kayit = turkuSchema.parse({
      ...(mevcut ?? {}), slug, baslik: mevcut?.baslik ?? sayfa.title.replace(/\s*\(Sivas\)\s*$/i, ""), yore: mevcut?.yore ?? "Sivas",
      sozYazari: mevcut?.sozYazari ?? sahip,
      hikaye: mevcut?.hikaye ?? `${sayfa.title.replace(/\s*\(Sivas\)\s*$/i, "")}, Sivas'ın âşıklık ve halk müziği geleneğinde korunan eserlerden biridir. Açık arşiv kaydı türkünün söz varyantını; Sivas İl Kültür ve Turizm Müdürlüğü ise eseri şehrin repertuvarı içinde belgeler.\n${anonim ? "Eser açık arşivde anonim metin olarak sınıflandırılır." : sahip ? `Eser sahibi kayıtta ${sahip} olarak belirtilir.` : "Eser sahipliği için kesin bir kişi atfı yapılmamıştır."} Belirli bir olaya dayanan hikâye doğrulanmadıkça rivayetler olgu gibi aktarılmaz.`,
      ozet: mevcut?.ozet ?? `Sivas yöresinin sözlü müzik belleğinden kaynaklı türkü kaydı.`,
      sozler: mevcut?.sozler?.length ? mevcut.sozler : sozler,
      baglantilar, kaynaklar, dogrulama: mevcut?.dogrulama ?? "taslak",
      etiketler: Array.from(new Set([...(mevcut?.etiketler ?? []), "Sivas", anonim ? "anonim" : "âşık geleneği"])),
    });
    fs.writeFileSync(dosya, `${JSON.stringify(kayit, null, 2)}\n`, "utf8");
    mevcut ? guncel++ : yeni++;
  }
  console.log(`${basliklar.length} Sivas başlığı tarandı; ${yeni} yeni kayıt, ${guncel} güncellenen kayıt.`);
}

main().catch((hata) => { console.error(hata); process.exit(1); });
