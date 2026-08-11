import fs from "node:fs";
import path from "node:path";
import { slugYap } from "../lib/slug";
import { turkuSchema } from "../lib/schema";

type Il = { ad: string };
type Uye = { ns: number; title: string };

const KOK = process.cwd();
const ICERIK = path.join(KOK, "content", "turkuler");
const ILLER = JSON.parse(
  fs.readFileSync(path.join(KOK, "scripts", "assets", "iller-plaka.json"), "utf8"),
) as Il[];
const HEDEF = Number(process.argv.find((x) => x.startsWith("--target="))?.split("=")[1] ?? 520);
const UA = "AnadoluTurkuleriBot/0.1 (public-domain catalog; anadoluturkuleri.com)";

const bekle = (ms: number) => new Promise((coz) => setTimeout(coz, ms));

async function kategoriUyeleri(kategori: string, devam?: string, deneme = 0): Promise<Uye[]> {
  const sorgu = new URLSearchParams({
    action: "query",
    list: "categorymembers",
    cmtitle: `Kategori:${kategori} türküleri`,
    cmnamespace: "0",
    cmlimit: "max",
    format: "json",
    formatversion: "2",
    maxlag: "5",
  });
  if (devam) sorgu.set("cmcontinue", devam);
  const yanit = await fetch(`https://tr.wikisource.org/w/api.php?${sorgu}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if ((yanit.status === 429 || yanit.status >= 500) && deneme < 4) {
    await bekle(1500 * (deneme + 1));
    return kategoriUyeleri(kategori, devam, deneme + 1);
  }
  if (!yanit.ok) return [];
  const veri = await yanit.json();
  const uyeler = (veri.query?.categorymembers ?? []) as Uye[];
  const sonraki = veri.continue?.cmcontinue as string | undefined;
  return sonraki ? [...uyeler, ...(await kategoriUyeleri(kategori, sonraki))] : uyeler;
}

function kaynakUrl(baslik: string): string {
  return `https://tr.wikisource.org/wiki/${encodeURIComponent(baslik.replace(/ /g, "_"))}`;
}

function kayitOlustur(baslik: string, il: string) {
  const slug = slugYap(baslik);
  return turkuSchema.parse({
    slug,
    baslik,
    yore: il,
    hikaye: `${baslik}, Vikikaynak'ın ${il} türküleri kategorisinde yer alan geleneksel repertuvar kayıtlarından biridir. Eserin yöre bilgisi ve arşiv künyesi, açık kaynak sayfası üzerinden kataloğa alınmıştır.\nBu temel kayıt, türkünün arşivde bulunmasını ve araştırılmasını sağlar. Hikâye, icra ve nota bilgileri güvenilir kurumsal kaynaklarla doğrulandıkça editoryal olarak genişletilecektir.`,
    ozet: `${il} yöresinden, açık arşiv kaynağıyla kataloglanan geleneksel türkü kaydı.`,
    sozler: [],
    baglantilar: [
      { platform: "youtube", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${baslik} türkü`)}`, dogrulandi: false },
      { platform: "spotify", url: `https://open.spotify.com/search/${encodeURIComponent(baslik)}`, dogrulandi: false },
    ],
    kaynaklar: [{ baslik: `Vikikaynak — ${baslik}`, url: kaynakUrl(baslik), tur: "arsiv", erisimTarihi: new Date().toISOString().slice(0, 10) }],
    dogrulama: "taslak",
    etiketler: ["geleneksel", "arşiv kaydı", il],
  });
}

async function main() {
  const mevcutDosyalar = fs.readdirSync(ICERIK).filter((x) => x.endsWith(".json"));
  const mevcutBasliklar = new Set<string>();
  const mevcutSluglar = new Set(mevcutDosyalar.map((x) => x.replace(/\.json$/, "")));
  for (const dosya of mevcutDosyalar) {
    const kayit = JSON.parse(fs.readFileSync(path.join(ICERIK, dosya), "utf8"));
    mevcutBasliklar.add(slugYap(kayit.baslik));
  }
  let toplam = mevcutDosyalar.length;
  let eklenen = 0;
  for (const il of ILLER) {
    if (toplam >= HEDEF) break;
    const kategoriAdi = il.ad === "Hakkâri" ? "Hakkari" : il.ad;
    const uyeler = await kategoriUyeleri(kategoriAdi);
    for (const uye of uyeler) {
      if (toplam >= HEDEF) break;
      const baslik = uye.title.replace(/\s*\([^)]*türküleri?\)\s*$/i, "").trim();
      const slug = slugYap(baslik);
      if (!slug || slug.length < 3 || mevcutSluglar.has(slug) || mevcutBasliklar.has(slug)) continue;
      if (/^(kategori|şablon|yörelere göre)/i.test(baslik)) continue;
      if (/\b(kültürü|incelemesi|araştırması|bibliyografyası|hakkında)\b/i.test(baslik)) continue;
      const kayit = kayitOlustur(baslik, il.ad);
      fs.writeFileSync(path.join(ICERIK, `${kayit.slug}.json`), `${JSON.stringify(kayit, null, 2)}\n`, "utf8");
      mevcutSluglar.add(kayit.slug);
      mevcutBasliklar.add(slugYap(kayit.baslik));
      eklenen++;
      toplam++;
    }
    console.log(`${il.ad}: ${uyeler.length} açık arşiv kaydı · toplam ${toplam}`);
    await bekle(450);
  }
  console.log(`Tamamlandı: ${eklenen} yeni kayıt, toplam ${toplam} türkü.`);
  if (toplam < HEDEF) process.exitCode = 2;
}

main().catch((hata) => {
  console.error(hata);
  process.exit(1);
});
