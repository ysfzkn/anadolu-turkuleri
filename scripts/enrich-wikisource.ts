import fs from "node:fs";
import path from "node:path";
import { turkuSchema } from "../lib/schema";

const KOK = process.cwd();
const ICERIK = path.join(KOK, "content", "turkuler");
const UA = "AnadoluTurkuleriBot/0.2 (source enrichment; anadoluturkuleri.com)";
const LIMIT = Number(process.argv.find((x) => x.startsWith("--limit="))?.split("=")[1] ?? "500");
const ESZAMANLILIK = Math.max(1, Math.min(6, Number(process.argv.find((x) => x.startsWith("--concurrency="))?.split("=")[1] ?? "4")));
const bekle = (ms: number) => new Promise((coz) => setTimeout(coz, ms));

type ParseSonucu = { parse?: { title: string; wikitext: string; categories?: Array<{ category: string }> } };

function sayfaAdi(url: string): string | undefined {
  try {
    const adres = new URL(url);
    if (adres.hostname !== "tr.wikisource.org" || !adres.pathname.startsWith("/wiki/")) return;
    return decodeURIComponent(adres.pathname.slice(6)).replace(/_/g, " ");
  } catch { return; }
}

async function sayfayiOku(baslik: string, deneme = 0): Promise<ParseSonucu | undefined> {
  const sorgu = new URLSearchParams({ action: "parse", page: baslik, redirects: "1", prop: "wikitext|categories|displaytitle", format: "json", formatversion: "2" });
  await bekle(450 + deneme * 900);
  try {
    const yanit = await fetch(`https://tr.wikisource.org/w/api.php?${sorgu}`, { headers: { "User-Agent": UA } });
    if ((yanit.status === 429 || yanit.status >= 500) && deneme < 4) return sayfayiOku(baslik, deneme + 1);
    if (!yanit.ok) return;
    return yanit.json() as Promise<ParseSonucu>;
  } catch (hata) {
    if (deneme < 4) return sayfayiOku(baslik, deneme + 1);
    console.warn(`Kaynak okunamadı: ${baslik}`, hata instanceof Error ? hata.message : hata);
    return;
  }
}

function wikiTemizle(satir: string): string {
  return satir.replace(/<!--.*?-->/g, "").replace(/<ref\b[^>]*>[\s\S]*?<\/ref>|<ref\b[^/]*\/>/gi, "").replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1").replace(/\{\{[^{}]*\}\}/g, "").replace(/''+/g, "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function sozleriAyikla(wikitext: string) {
  const siirler = [...wikitext.matchAll(/<poem\b[^>]*>([\s\S]*?)<\/poem>/gi)].map((x) => x[1]);
  const adayMetinler = siirler.length ? siirler : [
    wikitext
      .replace(/^\s*\{\{[^\n]+\}\}\s*$/gm, "")
      .replace(/^\s*\[\[Kategori:[^\n]+$/gim, "")
      .replace(/^\s*==+[^\n]+==+\s*$/gm, ""),
  ];

  return adayMetinler
    .flatMap((metin) => metin.split(/\n\s*\n+/))
    .map((blok) => blok
      .split(/\n|<br\s*\/?\s*>/i)
      .map((satir) => wikiTemizle(satir.replace(/^[:*#;]+\s*/, "")))
      .filter((satir) => satir && !/^\([^)]*\)$/.test(satir)))
    .filter((satirlar) => satirlar.length >= 2 && satirlar.length <= 20)
    .slice(0, 8)
    .map((satirlar) => ({ tur: "kita" as const, satirlar: satirlar.slice(0, 12) }));
}

function youtubeBul(wikitext: string): string | undefined {
  return wikitext.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]+/i)?.[0];
}

async function main() {
  const dosyalar = fs.readdirSync(ICERIK).filter((x) => x.endsWith(".json"));
  let zenginlesen = 0;
  let atlanan = 0;
  let siradaki = 0;

  async function dosyayiIsle(dosya: string) {
    const tamYol = path.join(ICERIK, dosya);
    const kayit = JSON.parse(fs.readFileSync(tamYol, "utf8"));
    if ((kayit.sozler?.length ?? 0) > 0) return;
    const kaynak = kayit.kaynaklar?.find((x: { url?: string }) => x.url && sayfaAdi(x.url));
    const baslik = kaynak?.url ? sayfaAdi(kaynak.url) : undefined;
    if (!baslik) return;
    const sonuc = await sayfayiOku(baslik);
    const metin = sonuc?.parse?.wikitext;
    if (!metin) { atlanan++; return; }
    const kategoriler = new Set((sonuc?.parse?.categories ?? []).map((x) => x.category));
    if (!kategoriler.has("Anonim_metinler")) { atlanan++; return; }
    const sozler = sozleriAyikla(metin);
    if (!sozler.length) { atlanan++; return; }
    const dogrudanYoutube = youtubeBul(metin);
    if (dogrudanYoutube) {
      const youtube = kayit.baglantilar?.find((x: { platform: string }) => x.platform === "youtube");
      if (youtube) Object.assign(youtube, { url: dogrudanYoutube, dogrulandi: true });
    }
    kayit.sozler = sozler;
    kaynak.baslik = `Vikikaynak — ${sonuc?.parse?.title ?? kayit.baslik}`;
    kaynak.url = `https://tr.wikisource.org/wiki/${encodeURIComponent((sonuc?.parse?.title ?? baslik).replace(/ /g, "_"))}`;
    fs.writeFileSync(tamYol, `${JSON.stringify(turkuSchema.parse(kayit), null, 2)}\n`, "utf8");
    zenginlesen++;
    if (zenginlesen % 25 === 0) console.log(`${zenginlesen} kayıt zenginleştirildi…`);
  }

  async function isci() {
    while (siradaki < dosyalar.length && zenginlesen < LIMIT) {
      const dosya = dosyalar[siradaki++];
      await dosyayiIsle(dosya);
    }
  }

  await Promise.all(Array.from({ length: ESZAMANLILIK }, () => isci()));
  console.log(`Tamamlandı: ${zenginlesen} kayıt zenginleştirildi, ${atlanan} uygun olmayan sayfa atlandı.`);
}

main().catch((hata) => { console.error(hata); process.exit(1); });
