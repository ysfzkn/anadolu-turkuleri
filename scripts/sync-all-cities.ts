import fs from "node:fs";
import path from "node:path";
import { slugYap } from "../lib/slug";
import { turkuSchema } from "../lib/schema";

type Il = { ad: string };
type Uye = { title: string };
type Sayfa = { title: string; revisions?: Array<{ slots?: { main?: { content?: string } } }>; categories?: Array<{ title: string }> };

const kok = process.cwd();
const icerik = path.join(kok, "content/turkuler");
const iller = JSON.parse(fs.readFileSync(path.join(kok, "scripts/assets/iller-plaka.json"), "utf8")) as Il[];
const hedef = Number(process.argv.find((x) => x.startsWith("--target="))?.split("=")[1] ?? 50);
const api = "https://tr.wikisource.org/w/api.php";
const ua = "AnadoluTurkuleriBot/0.4 (public-domain city archive; anadoluturkuleri.com)";
const erisimTarihi = new Date().toISOString().slice(0, 10);
const bekle = (ms: number) => new Promise((coz) => setTimeout(coz, ms));

function temizle(s: string) {
  return s.replace(/<!--.*?-->/g, "").replace(/<ref\b[^>]*>[\s\S]*?<\/ref>|<ref\b[^/]*\/>/gi, "").replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1").replace(/\{\{[^{}]*\}\}/g, "").replace(/''+/g, "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function sozler(wikitext: string) {
  const poem = wikitext.match(/<poem\b[^>]*>([\s\S]*?)<\/poem>/i)?.[1];
  if (!poem) return [];
  return poem.split(/\n\s*\n+/).map((blok) => blok.split("\n").map(temizle).filter(Boolean)).filter((x) => x.length >= 2).slice(0, 8).map((satirlar) => ({ tur: "kita" as const, satirlar: satirlar.slice(0, 12) }));
}

async function istek(params: URLSearchParams, deneme = 0): Promise<any> {
  const yanit = await fetch(`${api}?${params}`, { headers: { "User-Agent": ua } });
  if ((yanit.status === 429 || yanit.status >= 500) && deneme < 8) {
    const yenidenDene = Number(yanit.headers.get("retry-after") ?? "0") * 1000;
    await bekle(Math.max(yenidenDene, Math.min(60_000, 2500 * 2 ** deneme)));
    return istek(params, deneme + 1);
  }
  if (!yanit.ok) throw new Error(`Vikikaynak ${yanit.status}`);
  return yanit.json();
}

async function kategori(il: string): Promise<Uye[]> {
  const ad = il === "Hakkâri" ? "Hakkari" : il;
  const tum: Uye[] = [];
  let devam: string | undefined;
  do {
    const p = new URLSearchParams({ action: "query", list: "categorymembers", cmtitle: `Kategori:${ad} türküleri`, cmnamespace: "0", cmlimit: "max", format: "json", formatversion: "2" });
    if (devam) p.set("cmcontinue", devam);
    const j = await istek(p);
    tum.push(...(j.query?.categorymembers ?? []));
    devam = j.continue?.cmcontinue;
  } while (devam);
  return tum;
}

async function sayfalar(basliklar: string[]): Promise<Sayfa[]> {
  if (!basliklar.length) return [];
  const p = new URLSearchParams({ action: "query", prop: "revisions|categories", titles: basliklar.join("|"), redirects: "1", rvprop: "content", rvslots: "main", cllimit: "max", format: "json", formatversion: "2" });
  return (await istek(p)).query?.pages ?? [];
}

function mevcutSayisi(il: string) {
  return fs.readdirSync(icerik).filter((x) => x.endsWith(".json")).map((x) => JSON.parse(fs.readFileSync(path.join(icerik, x), "utf8"))).filter((x) => slugYap(x.yore.split(/[(/]/)[0].trim()) === slugYap(il)).length;
}

async function main() {
  let eklenen = 0;
  for (const il of iller) {
    let sayi = mevcutSayisi(il.ad);
    if (sayi >= hedef) { console.log(`• ${il.ad}: ${sayi}/${hedef}`); continue; }
    const uyeler = await kategori(il.ad);
    for (let i = 0; i < uyeler.length && sayi < hedef; i += 25) {
      for (const sayfa of await sayfalar(uyeler.slice(i, i + 25).map((x) => x.title))) {
        if (sayi >= hedef) break;
        const baslik = sayfa.title.replace(new RegExp(`\\s*\\(${il.ad.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)\\s*$`, "i"), "").trim();
        const temelSlug = slugYap(baslik);
        if (!temelSlug || /^(kategori|şablon)/i.test(baslik)) continue;
        let slug = temelSlug;
        let dosya = path.join(icerik, `${slug}.json`);
        if (fs.existsSync(dosya)) {
          const mevcut = JSON.parse(fs.readFileSync(dosya, "utf8"));
          if (slugYap(mevcut.yore.split(/[(/]/)[0].trim()) === slugYap(il.ad)) continue;
          slug = `${temelSlug}-${slugYap(il.ad)}`;
          dosya = path.join(icerik, `${slug}.json`);
          if (fs.existsSync(dosya)) continue;
        }
        const wikitext = sayfa.revisions?.[0]?.slots?.main?.content ?? "";
        const anonim = sayfa.categories?.some((x) => x.title === "Kategori:Anonim metinler") ?? false;
        const url = `https://tr.wikisource.org/wiki/${encodeURIComponent(sayfa.title.replace(/ /g, "_"))}`;
        const kayit = turkuSchema.parse({
          slug, baslik, yore: il.ad,
          hikaye: `${baslik}, Vikikaynak'ın ${il.ad} türküleri kategorisinde belgelenen geleneksel repertuvar kayıtlarından biridir. Açık arşiv sayfası eserin söz varyantını ve yöre sınıflandırmasını korur.\nBelirli bir olaya dayanan hikâye kurumsal veya akademik ikinci bir kaynakla doğrulanmadıkça bu temel kayda rivayet eklenmez. Kayıt, kaynak kişi, derleyen, makam, usul ve nota bilgileriyle editoryal olarak genişletilmek üzere taslak durumundadır.`,
          ozet: `${il.ad} yöresinden, açık arşiv kaynağıyla belgelenen geleneksel türkü kaydı.`,
          sozler: sozler(wikitext),
          baglantilar: [
            { platform: "youtube", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${baslik} türkü`)}`, dogrulandi: false },
            { platform: "spotify", url: `https://open.spotify.com/search/${encodeURIComponent(baslik)}`, dogrulandi: false },
          ],
          kaynaklar: [{ baslik: `Vikikaynak — ${sayfa.title}`, url, tur: "arsiv", erisimTarihi }],
          dogrulama: "taslak",
          etiketler: [il.ad, anonim ? "anonim" : "geleneksel", "açık arşiv"],
        });
        fs.writeFileSync(dosya, `${JSON.stringify(kayit, null, 2)}\n`);
        sayi++; eklenen++;
      }
      await bekle(900);
    }
    console.log(`${sayi >= hedef ? "✓" : "△"} ${il.ad}: ${sayi}/${hedef} · açık kategoride ${uyeler.length}`);
    await bekle(900);
  }
  console.log(`${eklenen} yeni kaynaklı taslak eklendi.`);
}

main().catch((hata) => { console.error(hata); process.exit(1); });
