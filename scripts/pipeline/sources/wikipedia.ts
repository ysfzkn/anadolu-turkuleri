import { nazikGetir } from "../fetcher";
import { slugYap } from "../slug";
import type { HamKayit, KaynakAdaptoru, TohumKayit } from "./types";

/**
 * Vikipedi (Türkçe) adaptörü.
 *
 * robots.txt, tr.wikipedia.org için /api/ ve /w/ yollarını yasaklar; bu yüzden
 * bu adaptör robots'un İZİN VERDİĞİ makale sayfasını (/wiki/<Başlık>) çeker ve
 * baştaki özet paragrafı çıkarır. İçerik CC BY-SA'dır; burada yalnızca ATIFLI
 * aday özet toplanır ve normalize adımında "özgün metinle yeniden yazılmalı"
 * işaretiyle staging'e konur. Sözler ASLA otomatik alınmaz.
 */

const WIKI_TABANI = "https://tr.wikipedia.org/wiki/";

/** Basit HTML → düz metin: etiketleri, dipnot köşeli parantezlerini temizler. */
function metneCevir(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\[\d+\]/g, "") // [1] dipnot işaretleri
    .replace(/\s+/g, " ")
    .trim();
}

/** Makale HTML'inden ilk anlamlı özet paragrafını çıkarır. */
function ilkParagraf(html: string): string | undefined {
  const paragraflar = html.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) ?? [];
  for (const p of paragraflar) {
    const metin = metneCevir(p);
    if (metin.length >= 120) return metin.slice(0, 900);
  }
  return undefined;
}

export const wikipediaAdaptoru: KaynakAdaptoru = {
  ad: "Vikipedi (TR)",

  async getir(tohumlar: TohumKayit[]): Promise<HamKayit[]> {
    const sonuclar: HamKayit[] = [];
    for (const tohum of tohumlar) {
      const wikiBaslik = tohum.wikiBaslik ?? tohum.ad;
      const baslikYolu = encodeURIComponent(wikiBaslik.replace(/ /g, "_"));
      const url = WIKI_TABANI + baslikYolu;
      try {
        const res = await nazikGetir(url);
        const html = await res.text();
        const ozet = ilkParagraf(html);
        if (!ozet) {
          console.warn(`  ↷ atlandı (özet paragraf bulunamadı): ${tohum.ad}`);
          continue;
        }
        sonuclar.push({
          kaynakAdi: this.ad,
          kaynakUrl: url,
          slug: slugYap(tohum.ad),
          baslik: tohum.ad,
          yore: tohum.yore,
          ozetMetni: ozet,
          etiketler: tohum.tema,
          sozSahibi: tohum.sozSahibi,
          erisimTarihi: new Date().toISOString().slice(0, 10),
        });
        console.log(`  ✓ bulundu: ${tohum.ad}`);
      } catch (e) {
        console.warn(`  ✗ hata (${tohum.ad}): ${(e as Error).message}`);
      }
    }
    return sonuclar;
  },
};
