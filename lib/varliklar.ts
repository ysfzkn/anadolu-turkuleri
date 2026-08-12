/**
 * Anlamsal varlık grafiği — türetme katmanı.
 *
 * Tüm veri content/turkuler/*.json'dan TÜRETİLİR; hiçbir kültürel bilgi
 * uydurulmaz. Kişiler (ozan/şair, derleyen, kaynak kişi) ve temalar (kavram
 * etiketleri) mevcut alanlardan toplanır. Benzer türkü motoru da yalnızca
 * gerçek üstveriyle çalışır ve neden eşleştiğini şeffaf biçimde açıklar.
 *
 * Sunucu tarafında (build/SSG) çalışır — istemciye taşınmaz.
 */

import { tumTurkuler, ilAdi, ilSlug } from "./data";
import { slugYap } from "./slug";
import { bolgeBul } from "./yore-bolge";
import { OZAN_GORSELLERI } from "./ozan-gorselleri";
import type { Turku } from "./types";
import type { KartTurku } from "@/components/TurkuCard";

// ── Yardımcılar ────────────────────────────────────────────────────────────

/** Kart görünümleri için hafif alt küme. */
export function karta(t: Turku): KartTurku {
  return {
    slug: t.slug,
    baslik: t.baslik,
    yore: t.yore,
    ozet: t.ozet,
    etiketler: t.etiketler,
    ozan: t.ozan,
    sozYazari: t.sozYazari,
  };
}

/**
 * Bir alan değerinin tek, temiz bir kişi adı olup olmadığını kontrol eder.
 * Virgül/parantez içeren birleşik veya rol açıklamalı ("... (derleyen)") kirli
 * kayıtlar ile sayı içeren değerler kişi sayfası üretmez.
 */
function temizKisiAdi(deger: string | undefined | null): string | null {
  if (!deger) return null;
  const ad = deger.trim();
  if (ad.length < 2 || ad.length > 60) return null;
  if (/[,(){}\[\]0-9]/.test(ad)) return null;
  if (!/\p{L}/u.test(ad)) return null;
  return ad;
}

// ── Kişi (ozan / derleyen / kaynak kişi) grafiği ────────────────────────────

export type KisiRol = "ozan" | "derleyen" | "kaynak";

export const ROL_ETIKETI: Record<KisiRol, string> = {
  ozan: "Ozan / Şair",
  derleyen: "Derleyen",
  kaynak: "Kaynak kişi",
};

interface KisiDurumu {
  ad: string;
  slug: string;
  roller: Set<KisiRol>;
  turkuler: Turku[];
}

let _kisiHaritasi: Map<string, KisiDurumu> | null = null;

function kisiHaritasi(): Map<string, KisiDurumu> {
  if (_kisiHaritasi) return _kisiHaritasi;
  const harita = new Map<string, KisiDurumu>();

  const ekle = (adHam: string | undefined, rol: KisiRol, t: Turku) => {
    const ad = temizKisiAdi(adHam);
    if (!ad) return;
    const slug = slugYap(ad);
    if (!slug) return;
    let durum = harita.get(slug);
    if (!durum) {
      durum = { ad, slug, roller: new Set(), turkuler: [] };
      harita.set(slug, durum);
    }
    // Büyük harfle başlayan yazımı tercih et (ör. "muhlis akarsu" → "Muhlis Akarsu").
    if (/^\p{Lu}/u.test(ad) && !/^\p{Lu}/u.test(durum.ad)) durum.ad = ad;
    durum.roller.add(rol);
    if (!durum.turkuler.some((x) => x.slug === t.slug)) durum.turkuler.push(t);
  };

  for (const t of tumTurkuler()) {
    ekle(t.ozan, "ozan", t);
    ekle(t.sozYazari, "ozan", t);
    ekle(t.derleyen, "derleyen", t);
    ekle(t.kaynakKisi, "kaynak", t);
  }

  for (const durum of harita.values()) {
    durum.turkuler.sort((a, b) => a.baslik.localeCompare(b.baslik, "tr"));
  }
  _kisiHaritasi = harita;
  return harita;
}

/**
 * Bir kişiye kendi sayfası verilip verilmeyeceği (ince sayfa üretmemek için):
 * ozan/şairler her zaman notludur; derleyen/kaynak kişiler için en az 2 eser
 * ya da küratörlü bir arşiv görseli gerekir.
 */
function sayfayaDeger(durum: KisiDurumu): boolean {
  if (durum.roller.has("ozan")) return true;
  if (durum.turkuler.length >= 2) return true;
  return Boolean(OZAN_GORSELLERI[durum.ad]);
}

export interface KisiOzeti {
  slug: string;
  ad: string;
  roller: KisiRol[];
  adet: number;
  gorselVar: boolean;
}

function ozet(durum: KisiDurumu): KisiOzeti {
  const rolSira: KisiRol[] = ["ozan", "derleyen", "kaynak"];
  return {
    slug: durum.slug,
    ad: durum.ad,
    roller: rolSira.filter((r) => durum.roller.has(r)),
    adet: durum.turkuler.length,
    gorselVar: Boolean(OZAN_GORSELLERI[durum.ad]),
  };
}

/** Kendi sayfası olan tüm kişiler; eser sayısına göre azalan. */
export function kisiler(): KisiOzeti[] {
  return Array.from(kisiHaritasi().values())
    .filter(sayfayaDeger)
    .map(ozet)
    .sort((a, b) => b.adet - a.adet || a.ad.localeCompare(b.ad, "tr"));
}

export function tumKisiSluglari(): string[] {
  return kisiler().map((k) => k.slug);
}

/** Bir kişi adının kendi sayfası var mı (türkü DNA'sında link üretmek için). */
export function kisiSayfasiVarMi(adHam: string | undefined): string | null {
  const ad = temizKisiAdi(adHam);
  if (!ad) return null;
  const durum = kisiHaritasi().get(slugYap(ad));
  return durum && sayfayaDeger(durum) ? durum.slug : null;
}

export interface KisiDetay extends KisiOzeti {
  turkuler: KartTurku[];
  yoreler: { ad: string; slug: string; adet: number }[];
  temalar: { ad: string; slug: string }[];
}

export function kisiBul(slug: string): KisiDetay | null {
  const durum = kisiHaritasi().get(slug);
  if (!durum || !sayfayaDeger(durum)) return null;

  const yoreSayac = new Map<string, { ad: string; slug: string; adet: number }>();
  const temaSayac = new Map<string, number>();
  for (const t of durum.turkuler) {
    const ad = ilAdi(t.yore);
    const yslug = ilSlug(t.yore);
    const mevcut = yoreSayac.get(yslug);
    if (mevcut) mevcut.adet++;
    else yoreSayac.set(yslug, { ad, slug: yslug, adet: 1 });
    for (const e of t.etiketler ?? []) {
      // Yalnızca kendi sayfası olan temalar sayılır (kırık link üretmemek için).
      if (temaSayfasiVarMi(e)) temaSayac.set(e, (temaSayac.get(e) ?? 0) + 1);
    }
  }

  return {
    ...ozet(durum),
    turkuler: durum.turkuler.map(karta),
    yoreler: Array.from(yoreSayac.values()).sort((a, b) => b.adet - a.adet),
    temalar: Array.from(temaSayac.keys())
      .sort((a, b) => (temaSayac.get(b) ?? 0) - (temaSayac.get(a) ?? 0))
      .map((ad) => ({ ad, slug: temaSayfasiVarMi(ad)! })),
  };
}

// ── Tema (kavram etiketi) grafiği ───────────────────────────────────────────

/** Kavram/tema olmayan etiketler: köken ve yer etiketleri sayfa üretmez. */
const KOKEN_ETIKETLERI = new Set([
  "anonim",
  "açık arşiv",
  "geleneksel",
  "arşiv kaydı",
  "derleme",
]);

let _ilSluglari: Set<string> | null = null;
function ilSluglariKumesi(): Set<string> {
  if (_ilSluglari) return _ilSluglari;
  _ilSluglari = new Set(tumTurkuler().map((t) => ilSlug(t.yore)));
  return _ilSluglari;
}

/**
 * Bir etiket temaya (kavrama) karşılık geliyorsa slug'ını, aksi halde null
 * döndürür. Köken etiketleri ve il adları elenir.
 */
export function temaSlugu(etiket: string): string | null {
  const e = etiket.trim();
  if (!e || KOKEN_ETIKETLERI.has(e.toLowerCase())) return null;
  const slug = slugYap(e);
  if (!slug) return null;
  if (ilSluglariKumesi().has(slug)) return null; // il adı, tema değil
  return slug;
}

const TEMA_ESIK = 4; // ince tema sayfası üretmemek için asgari eser sayısı

interface TemaDurumu {
  ad: string;
  slug: string;
  turkuler: Turku[];
}

let _temaHaritasi: Map<string, TemaDurumu> | null = null;
function temaHaritasi(): Map<string, TemaDurumu> {
  if (_temaHaritasi) return _temaHaritasi;
  const harita = new Map<string, TemaDurumu>();
  for (const t of tumTurkuler()) {
    for (const e of t.etiketler ?? []) {
      const slug = temaSlugu(e);
      if (!slug) continue;
      let durum = harita.get(slug);
      if (!durum) {
        durum = { ad: e.trim(), slug, turkuler: [] };
        harita.set(slug, durum);
      }
      durum.turkuler.push(t);
    }
  }
  for (const durum of harita.values()) {
    durum.turkuler.sort((a, b) => a.baslik.localeCompare(b.baslik, "tr"));
  }
  _temaHaritasi = harita;
  return harita;
}

export interface TemaOzeti {
  slug: string;
  ad: string;
  adet: number;
}

/** Eşiği geçen tüm temalar; sıklığa göre azalan. */
export function temalar(): TemaOzeti[] {
  return Array.from(temaHaritasi().values())
    .filter((d) => d.turkuler.length >= TEMA_ESIK)
    .map((d) => ({ slug: d.slug, ad: d.ad, adet: d.turkuler.length }))
    .sort((a, b) => b.adet - a.adet || a.ad.localeCompare(b.ad, "tr"));
}

export function tumTemaSluglari(): string[] {
  return temalar().map((t) => t.slug);
}

/** Türkü DNA'sında link üretmek için: bu etiketin tema sayfası var mı. */
export function temaSayfasiVarMi(etiket: string): string | null {
  const slug = temaSlugu(etiket);
  if (!slug) return null;
  const durum = temaHaritasi().get(slug);
  return durum && durum.turkuler.length >= TEMA_ESIK ? slug : null;
}

export interface TemaDetay extends TemaOzeti {
  turkuler: KartTurku[];
  yoreler: { ad: string; slug: string; adet: number }[];
  kisiler: KisiOzeti[];
}

export function temaBul(slug: string): TemaDetay | null {
  const durum = temaHaritasi().get(slug);
  if (!durum || durum.turkuler.length < TEMA_ESIK) return null;

  const yoreSayac = new Map<string, { ad: string; slug: string; adet: number }>();
  const kisiSluglari = new Set<string>();
  for (const t of durum.turkuler) {
    const ad = ilAdi(t.yore);
    const yslug = ilSlug(t.yore);
    const mevcut = yoreSayac.get(yslug);
    if (mevcut) mevcut.adet++;
    else yoreSayac.set(yslug, { ad, slug: yslug, adet: 1 });
    for (const alan of [t.sozYazari, t.ozan, t.derleyen, t.kaynakKisi]) {
      const kslug = kisiSayfasiVarMi(alan ?? undefined);
      if (kslug) kisiSluglari.add(kslug);
    }
  }

  const kisiOzetleri = kisiler().filter((k) => kisiSluglari.has(k.slug));

  return {
    slug: durum.slug,
    ad: durum.ad,
    adet: durum.turkuler.length,
    turkuler: durum.turkuler.map(karta),
    yoreler: Array.from(yoreSayac.values()).sort((a, b) => b.adet - a.adet),
    kisiler: kisiOzetleri.slice(0, 12),
  };
}

// ── Benzer türkü motoru (şeffaf ağırlıklı skor) ─────────────────────────────

export interface BenzerTurku {
  turku: KartTurku;
  skor: number;
  nedenler: string[];
}

/** Bir etiketin kavram/tema olup olmadığını (yer/köken değil) kontrol eder. */
function kavramEtiketleri(t: Turku): string[] {
  return (t.etiketler ?? []).filter((e) => temaSlugu(e));
}

/**
 * Verilen türküye en benzer türküleri, neden benzediklerini açıklayarak
 * döndürür. Skor tamamen gerçek üstveriye dayanır; kendisini içermez.
 */
export function benzerTurkuler(kaynak: Turku, adet = 6): BenzerTurku[] {
  const kaynakIl = ilSlug(kaynak.yore);
  const kaynakBolge = bolgeBul(kaynakIl);
  const kaynakTemalar = new Set(kavramEtiketleri(kaynak));

  const puanli: BenzerTurku[] = [];
  for (const t of tumTurkuler()) {
    if (t.slug === kaynak.slug) continue;
    let skor = 0;
    const nedenler: string[] = [];

    const ortakTemalar = kavramEtiketleri(t).filter((e) => kaynakTemalar.has(e));
    if (ortakTemalar.length) {
      skor += Math.min(ortakTemalar.length * 12, 30);
      nedenler.push(`Benzer tema: ${ortakTemalar.slice(0, 2).join(", ")}`);
    }

    const il = ilSlug(t.yore);
    if (il === kaynakIl) {
      skor += 20;
      nedenler.push(`Aynı yöre: ${ilAdi(t.yore)}`);
    } else if (bolgeBul(il) === kaynakBolge) {
      skor += 8;
    }

    const kaynakOzan = temizKisiAdi(kaynak.sozYazari ?? kaynak.ozan);
    const tOzan = temizKisiAdi(t.sozYazari ?? t.ozan);
    if (kaynakOzan && tOzan && slugYap(kaynakOzan) === slugYap(tOzan)) {
      skor += 20;
      nedenler.push(`Aynı ozan: ${tOzan}`);
    }

    const kd = temizKisiAdi(kaynak.derleyen);
    const td = temizKisiAdi(t.derleyen);
    if (kd && td && slugYap(kd) === slugYap(td)) {
      skor += 10;
      nedenler.push(`Aynı derleyen: ${td}`);
    }

    if (skor > 0) puanli.push({ turku: karta(t), skor, nedenler });
  }

  puanli.sort(
    (a, b) => b.skor - a.skor || a.turku.baslik.localeCompare(b.turku.baslik, "tr"),
  );
  return puanli.slice(0, adet);
}
