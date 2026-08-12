import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { slugYap } from "../lib/slug";

type Il = { ad: string };
type Gorsel = {
  src: string;
  alt: string;
  baslik: string;
  kaynakUrl: string;
  lisans: string;
  sanatci?: string;
};

const KOK = process.cwd();
const HEDEF = path.join(KOK, "public", "yoreler");
const MANIFEST = path.join(KOK, "content", "sehir-gorselleri.json");
const ILLER = JSON.parse(
  fs.readFileSync(path.join(KOK, "scripts", "assets", "iller-plaka.json"), "utf8"),
) as Il[];
const UA = "AnadoluTurkuleriBot/0.1 (city image attribution; anadoluturkuleri.com)";
const TERCIH_EDILEN_DOSYALAR: Record<string, string> = {
  Erzurum: "Erzurum Çifte Minareli Medrese 2016.jpg",
};
const ilArgumani = process.argv.indexOf("--il");
const yalnizIl = ilArgumani >= 0 ? process.argv[ilArgumani + 1] : undefined;
const zorla = process.argv.includes("--force");

function temizle(html?: string): string | undefined {
  return html?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function adAnahtari(ad: string): string {
  return ad.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function json(url: string, deneme = 0): Promise<any> {
  const yanit = await fetch(url, { headers: { "User-Agent": UA } });
  if ((yanit.status === 429 || yanit.status >= 500) && deneme < 8) {
    const yenidenDene = Number(yanit.headers.get("retry-after") ?? "0") * 1000;
    await bekle(Math.max(yenidenDene, Math.min(60_000, 3000 * 2 ** deneme)));
    return json(url, deneme + 1);
  }
  if (!yanit.ok) throw new Error(`${yanit.status} ${url}`);
  return yanit.json();
}

const bekle = (ms: number) => new Promise((coz) => setTimeout(coz, ms));

async function commonsAra(il: string): Promise<{ dosya: string; ii: any } | undefined> {
  const aramalar = [`${il} Turkey city`, `${il} Türkiye`, `${il} city view`];
  for (const arama of aramalar) {
    const sorgu = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrnamespace: "6",
      gsrlimit: "15",
      gsrsearch: arama,
      prop: "imageinfo",
      iiprop: "url|extmetadata|mime",
      iiurlwidth: "1400",
      format: "json",
      formatversion: "2",
    });
    await bekle(800);
    const sonuc = await json(`https://commons.wikimedia.org/w/api.php?${sorgu}`);
    for (const sayfa of sonuc.query?.pages ?? []) {
      const ii = sayfa.imageinfo?.[0];
      const lisans = ii?.extmetadata?.LicenseShortName?.value ?? "";
      if (ii?.mime?.startsWith("image/") && (ii.thumburl || ii.url) && /^(CC|Public domain|PD)/i.test(lisans)) {
        return { dosya: sayfa.title.replace(/^File:/, ""), ii };
      }
    }
  }
}

async function gorselIndir(url: string, deneme = 0): Promise<Buffer | undefined> {
  await bekle(1200 + deneme * 1800);
  const yanit = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/avif,image/webp,image/*" },
    signal: AbortSignal.timeout(30_000),
  }).catch(() => undefined);
  if (!yanit && deneme < 2) return gorselIndir(url, deneme + 1);
  if (!yanit) return undefined;
  if ((yanit.status === 429 || yanit.status >= 500) && deneme < 2) {
    const yenidenDene = Number(yanit.headers.get("retry-after") ?? "0") * 1000;
    await bekle(Math.max(yenidenDene, 2500 * 2 ** deneme));
    return gorselIndir(url, deneme + 1);
  }
  if (!yanit.ok) return undefined;
  return Buffer.from(await yanit.arrayBuffer());
}

function parcalaraAyir<T>(dizi: T[], boyut = 20): T[][] {
  return Array.from({ length: Math.ceil(dizi.length / boyut) }, (_, i) =>
    dizi.slice(i * boyut, (i + 1) * boyut),
  );
}

async function main() {
  fs.mkdirSync(HEDEF, { recursive: true });
  const basliktanQ = new Map<string, string>();
  for (const grup of parcalaraAyir(ILLER.map((il) => il.ad))) {
    const wiki = await json(
      `https://tr.wikipedia.org/w/api.php?action=query&redirects=1&prop=pageprops&ppprop=wikibase_item&titles=${encodeURIComponent(grup.join("|"))}&format=json&formatversion=2`,
    );
    const hedefQ = new Map<string, string>();
    for (const sayfa of wiki.query?.pages ?? []) {
      if (sayfa.pageprops?.wikibase_item) hedefQ.set(adAnahtari(sayfa.title), sayfa.pageprops.wikibase_item);
    }
    const yonlendirmeler = new Map<string, string>();
    for (const kayit of [...(wiki.query?.normalized ?? []), ...(wiki.query?.redirects ?? [])]) {
      yonlendirmeler.set(adAnahtari(kayit.from), adAnahtari(kayit.to));
    }
    for (const ad of grup) {
      let anahtar = adAnahtari(ad);
      for (let i = 0; i < 3 && yonlendirmeler.has(anahtar); i++) anahtar = yonlendirmeler.get(anahtar)!;
      const q = hedefQ.get(anahtar);
      if (q) basliktanQ.set(adAnahtari(ad), q);
    }
  }

  const qler = Array.from(new Set(basliktanQ.values()));
  const qdanDosya = new Map<string, string>();
  for (const grup of parcalaraAyir(qler)) {
    const varliklar = await json(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${grup.join("|")}&props=claims&format=json`,
    );
    for (const [q, varlik] of Object.entries<any>(varliklar.entities ?? {})) {
      const dosya = varlik.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
      if (dosya) qdanDosya.set(q, dosya);
    }
    await bekle(1000);
  }

  const dosyalar = Array.from(new Set(qdanDosya.values()));
  const bilgi = new Map<string, any>();
  for (const grup of parcalaraAyir(dosyalar)) {
    const commons = await json(
      `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1400&titles=${encodeURIComponent(grup.map((x) => `File:${x}`).join("|"))}&format=json&formatversion=2`,
    );
    for (const sayfa of commons.query?.pages ?? []) {
      const ii = sayfa.imageinfo?.[0];
      if (ii) bilgi.set(sayfa.title.replace(/^File:/, ""), ii);
    }
    await bekle(1000);
  }

  const manifest: Record<string, Gorsel> = fs.existsSync(MANIFEST)
    ? JSON.parse(fs.readFileSync(MANIFEST, "utf8"))
    : {};
  for (const il of ILLER.filter((kayit) => !yalnizIl || adAnahtari(kayit.ad) === adAnahtari(yalnizIl))) {
    const slug = slugYap(il.ad);
    const mevcut = manifest[slug];
    if (!zorla && mevcut && fs.existsSync(path.join(KOK, "public", mevcut.src.replace(/^\//, "")))) {
      console.log(`• ${il.ad} zaten hazır`);
      continue;
    }
    const q = basliktanQ.get(adAnahtari(il.ad));
    let dosya: string | undefined = TERCIH_EDILEN_DOSYALAR[il.ad] ?? (q ? qdanDosya.get(q) : undefined);
    let ii = dosya ? bilgi.get(dosya) : undefined;
    if (dosya && !ii) {
      const ozel = await json(`https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=1400&titles=${encodeURIComponent(`File:${dosya}`)}&format=json&formatversion=2`);
      ii = ozel.query?.pages?.[0]?.imageinfo?.[0];
    }
    if (!dosya || !(ii?.thumburl || ii?.url) || !/^(CC|Public domain|PD)/i.test(ii?.extmetadata?.LicenseShortName?.value ?? "")) {
      const bulunan = await commonsAra(il.ad);
      dosya = bulunan?.dosya;
      ii = bulunan?.ii;
    }
    const lisans = ii?.extmetadata?.LicenseShortName?.value ?? "";
    const izinli = /^(CC|Public domain|PD)/i.test(lisans);
    if (!dosya || !(ii?.thumburl || ii?.url) || !izinli) {
      console.warn(`Görsel bulunamadı veya lisansı uygun değil: ${il.ad}`);
      continue;
    }
    const hedef = path.join(HEDEF, `${slug}.webp`);
    let hamGorsel = await gorselIndir(ii.thumburl || ii.url);
    if (!hamGorsel && ii.url && ii.url !== ii.thumburl) hamGorsel = await gorselIndir(ii.url);
    if (!hamGorsel) {
      console.warn(`Görsel indirilemedi: ${il.ad}`);
      continue;
    }
    await sharp(hamGorsel)
      .rotate()
      .resize(1400, 900, { fit: "cover", position: "attention" })
      .webp({ quality: 78 })
      .toFile(hedef);
    manifest[slug] = {
      src: `/yoreler/${slug}.webp`,
      alt: `${il.ad} kent ve kültür görünümü`,
      baslik: il.ad,
      kaynakUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(dosya.replace(/ /g, "_"))}`,
      lisans,
      sanatci: temizle(ii.extmetadata?.Artist?.value),
    };
    // Uzun taramalar yarıda kesilse de doğrulanmış kayıtları koru.
    fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(`✓ ${il.ad}`);
  }
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`${Object.keys(manifest).length} şehir görseli hazırlandı.`);
}

main().catch((hata) => {
  console.error(hata);
  process.exit(1);
});
