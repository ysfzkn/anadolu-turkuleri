/**
 * Türkü Yolculukları — SUNUCU çözümleme katmanı (build/SSG).
 *
 * Küratörlü adım referanslarını gerçek varlıklara (türkü/kişi/tema/terim/yöre)
 * doğrular; geçersiz adımları sessizce düşürür (kırık link olmaz). Saf veri ve
 * istemci-güvenli mantık lib/yolculuklar-veri.ts'tedir.
 */

import { turkuBul, iller } from "./data";
import { kisiler, temalar } from "./varliklar";
import { terimBul } from "./sozluk";
import {
  YOLCULUKLAR,
  type Adim,
  type AdimTuru,
  type Yolculuk,
} from "./yolculuklar-veri";

export type { AdimTuru, Adim, Yolculuk } from "./yolculuklar-veri";
export { YOLCULUKLAR, tumYolculukSluglari, tamamlananYolculukSayisi } from "./yolculuklar-veri";

export interface CozulmusAdim {
  id: string;
  tur: AdimTuru;
  baslik: string;
  metin?: string;
  href?: string;
  hedefEtiketi?: string;
}

export interface CozulmusYolculuk extends Omit<Yolculuk, "adimlar"> {
  adimlar: CozulmusAdim[];
}

const ADIM_ETIKETI: Record<AdimTuru, string> = {
  anlatim: "Giriş",
  turku: "Türkü",
  kisi: "Ozan",
  yore: "Yöre",
  tema: "Tema",
  terim: "Terim",
  quiz: "Quiz",
};

let _kisiAd: Map<string, string> | null = null;
let _temaAd: Map<string, string> | null = null;
let _ilAd: Map<string, string> | null = null;

function baslikYap(ad: string): string {
  return ad.charAt(0).toLocaleUpperCase("tr") + ad.slice(1);
}
function kisiAdi(slug: string): string | null {
  _kisiAd ??= new Map(kisiler().map((k) => [k.slug, k.ad]));
  return _kisiAd.get(slug) ?? null;
}
function temaAdi(slug: string): string | null {
  _temaAd ??= new Map(temalar().map((t) => [t.slug, baslikYap(t.ad)]));
  return _temaAd.get(slug) ?? null;
}
function ilAdiCoz(slug: string): string | null {
  _ilAd ??= new Map(iller().map((i) => [i.slug, i.ad]));
  return _ilAd.get(slug) ?? null;
}

/** Bir adımı, geçerliyse görüntülenebilir hâline çözer; değilse null. */
function adimiCoz(adim: Adim): CozulmusAdim | null {
  const temel = { id: adim.id, tur: adim.tur, metin: adim.metin, hedefEtiketi: ADIM_ETIKETI[adim.tur] };
  switch (adim.tur) {
    case "anlatim":
      return { ...temel, baslik: adim.baslik ?? "Giriş" };
    case "quiz":
      return { ...temel, baslik: adim.baslik ?? "Bilgi yarışması", href: "/quiz" };
    case "turku": {
      const t = adim.ref ? turkuBul(adim.ref) : undefined;
      if (!t) return null;
      return { ...temel, baslik: adim.baslik ?? t.baslik, href: `/turku/${t.slug}` };
    }
    case "kisi": {
      const ad = adim.ref ? kisiAdi(adim.ref) : null;
      if (!ad) return null;
      return { ...temel, baslik: adim.baslik ?? ad, href: `/kisi/${adim.ref}` };
    }
    case "tema": {
      const ad = adim.ref ? temaAdi(adim.ref) : null;
      if (!ad) return null;
      return { ...temel, baslik: adim.baslik ?? ad, href: `/tema/${adim.ref}` };
    }
    case "terim": {
      const terim = adim.ref ? terimBul(adim.ref) : undefined;
      if (!terim) return null;
      return { ...temel, baslik: adim.baslik ?? terim.terim, href: `/sozluk/${terim.slug}` };
    }
    case "yore": {
      const ad = adim.ref ? ilAdiCoz(adim.ref) : null;
      if (!ad) return null;
      return { ...temel, baslik: adim.baslik ?? ad, href: `/yore/${adim.ref}` };
    }
    default:
      return null;
  }
}

export function yolculukBul(slug: string): CozulmusYolculuk | null {
  const y = YOLCULUKLAR.find((x) => x.slug === slug);
  if (!y) return null;
  const adimlar = y.adimlar.map(adimiCoz).filter((a): a is CozulmusAdim => a !== null);
  if (adimlar.length === 0) return null;
  return { ...y, adimlar };
}

export interface YolculukOzeti {
  slug: string;
  baslik: string;
  aciklama: string;
  emoji: string;
  seviye: Yolculuk["seviye"];
  tahminiDakika: number;
  adimSayisi: number;
}

export function yolculukOzetleri(): YolculukOzeti[] {
  return YOLCULUKLAR.map((y) => {
    const cozulmus = yolculukBul(y.slug);
    return {
      slug: y.slug,
      baslik: y.baslik,
      aciklama: y.aciklama,
      emoji: y.emoji,
      seviye: y.seviye,
      tahminiDakika: y.tahminiDakika,
      adimSayisi: cozulmus?.adimlar.length ?? 0,
    };
  });
}
