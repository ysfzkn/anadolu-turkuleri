/**
 * Anadolu Rehberi — retrieval (RAG erişim) katmanı.
 *
 * Site verisine dayalı deterministik arama: bir soruya en ilgili türkü, kişi,
 * tema, terim ve yöreleri gerçek üstveriden bulur. LLM OLMADAN da çalışır ve
 * "ilgili sayfalar" üretir — yapay zekâ yalnızca bir gezinme/keşif katmanıdır,
 * siteyi ikame etmez. Uydurma yapılmaz; her sonuç gerçek bir sayfaya linktir.
 *
 * Sunucu tarafında (API route) çalışır.
 */

import { kartlar, iller } from "./data";
import { kisiler } from "./varliklar";
import { temalar } from "./varliklar";
import { SOZLUK } from "./sozluk";

/** Türkçe'yi arama için normalize eder (ascii küçük harf, boşluklar korunur). */
function normalize(metin: string): string {
  const harita: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    â: "a", î: "i", û: "u", "'": "", "’": "",
  };
  return metin
    .toLocaleLowerCase("tr")
    .split("")
    .map((h) => harita[h] ?? h)
    .join("")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Soruyu anlamlı arama sözcüklerine ayırır (kısa dolgu kelimeleri atar). */
const DURAK_KELIMELER = new Set([
  "ve", "ile", "bir", "bu", "şu", "için", "mi", "mı", "ne", "nedir", "kim",
  "kimdir", "nasıl", "hangi", "bana", "bul", "öner", "türkü", "türküsü",
  "türküleri", "hakkında", "var", "mı", "da", "de", "the", "a",
]);

function kelimeler(soru: string): string[] {
  return normalize(soru)
    .split(" ")
    .filter((k) => k.length >= 3 && !DURAK_KELIMELER.has(k));
}

export type SonucTuru = "turku" | "kisi" | "tema" | "terim" | "yore";

export interface RehberSonucu {
  tur: SonucTuru;
  baslik: string;
  url: string;
  ozet: string;
  skor: number;
}

export interface RehberYaniti {
  sonuclar: RehberSonucu[];
  /** LLM'e verilecek numaralı bağlam parçacıkları (yalnızca gerçek veri). */
  baglam: { no: number; metin: string; url: string }[];
}

/** Bir metinde geçen sözcük sayısına göre puan. */
function eslesmePuani(hedef: string, sozcukler: string[], agirlik: number): number {
  const n = normalize(hedef);
  let puan = 0;
  for (const s of sozcukler) if (n.includes(s)) puan += agirlik;
  return puan;
}

/**
 * Soruya en ilgili site varlıklarını döndürür. Tamamen site verisinden;
 * hiçbir şey uydurulmaz.
 */
export function rehberAra(soru: string, adet = 8): RehberYaniti {
  const sozcukler = kelimeler(soru);
  if (sozcukler.length === 0) return { sonuclar: [], baglam: [] };

  const sonuclar: RehberSonucu[] = [];

  // Türküler
  for (const t of kartlar()) {
    let skor = eslesmePuani(t.baslik, sozcukler, 6);
    skor += eslesmePuani(t.yore, sozcukler, 3);
    skor += eslesmePuani((t.etiketler ?? []).join(" "), sozcukler, 3);
    skor += eslesmePuani(t.ozet, sozcukler, 1);
    skor += eslesmePuani(t.sozMetni, sozcukler, 1);
    if (skor > 0) sonuclar.push({ tur: "turku", baslik: t.baslik, url: `/turku/${t.slug}`, ozet: t.ozet, skor });
  }

  // Kişiler (ozan/derleyen)
  for (const k of kisiler()) {
    const skor = eslesmePuani(k.ad, sozcukler, 8);
    if (skor > 0) sonuclar.push({ tur: "kisi", baslik: k.ad, url: `/kisi/${k.slug}`, ozet: `${k.adet} eserle ilişkili kişi.`, skor });
  }

  // Temalar
  for (const tema of temalar()) {
    const skor = eslesmePuani(tema.ad, sozcukler, 7);
    if (skor > 0) sonuclar.push({ tur: "tema", baslik: `${tema.ad} teması`, url: `/tema/${tema.slug}`, ozet: `${tema.adet} türküde işlenen tema.`, skor });
  }

  // Sözlük terimleri
  for (const terim of SOZLUK) {
    let skor = eslesmePuani(terim.terim, sozcukler, 8);
    skor += eslesmePuani((terim.desenler ?? []).join(" "), sozcukler, 4);
    if (skor > 0) sonuclar.push({ tur: "terim", baslik: terim.terim, url: `/sozluk/${terim.slug}`, ozet: terim.kisaTanim, skor });
  }

  // Yöreler
  for (const il of iller()) {
    const skor = eslesmePuani(il.ad, sozcukler, 5);
    if (skor > 0) sonuclar.push({ tur: "yore", baslik: `${il.ad} yöresi`, url: `/yore/${il.slug}`, ozet: `${il.adet} türkü.`, skor });
  }

  sonuclar.sort((a, b) => b.skor - a.skor || a.baslik.localeCompare(b.baslik, "tr"));
  const enIyi = sonuclar.slice(0, adet);

  const baglam = enIyi.map((s, i) => ({
    no: i + 1,
    metin: `[${i + 1}] ${s.baslik} — ${s.ozet}`,
    url: s.url,
  }));

  return { sonuclar: enIyi, baglam };
}
