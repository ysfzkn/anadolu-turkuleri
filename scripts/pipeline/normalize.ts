import { turkuSchema, type Turku } from "../../lib/schema";
import type { HamKayit } from "./sources/types";

/** İnsan editöre "bu metni özgün olarak yeniden yaz" hatırlatması. */
export const YENIDEN_YAZ_ISARETI =
  "[ÖZGÜN METİNLE YENİDEN YAZILMALI — aşağıdaki kaynak özeti yalnızca taslaktır]";

function ytArama(q: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}
function spotifyArama(q: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(q)}`;
}

function ilkCumle(metin: string): string {
  const nokta = metin.indexOf(". ");
  const ozet = nokta > 40 ? metin.slice(0, nokta + 1) : metin.slice(0, 160);
  return ozet.trim();
}

/**
 * Ham kaydı şema-geçerli bir TASLAK türküye çevirir.
 *
 * Kritik güvenlik kuralları:
 * - `dogrulama` daima "taslak".
 * - `hikaye` kaynağın özetiyle DOLDURULUR ama başına YENIDEN_YAZ_ISARETI konur;
 *   böylece hiçbir kaynak metni yanlışlıkla birebir yayımlanamaz (review kapısı
 *   bu işareti taşıyan kayıtların yayına geçmesini engeller).
 * - `sozler` ASLA otomatik doldurulmaz; editör ekler.
 */
export function normallestir(ham: HamKayit): Turku {
  const aday: Turku = {
    slug: ham.slug,
    baslik: ham.baslik,
    yore: ham.yore ?? "Bilinmiyor",
    // Söz sahibi biliniyorsa sozYazari doldurulur; bu, eserin anonim olmadığını
    // ve sözlerin telif duyarlı olduğunu (elle karar verilmeli) belgeler.
    ...(ham.sozSahibi ? { sozYazari: ham.sozSahibi } : {}),
    hikaye: ham.ozetMetni
      ? `${YENIDEN_YAZ_ISARETI}\n\n${ham.ozetMetni}`
      : YENIDEN_YAZ_ISARETI,
    ozet: ham.ozetMetni ? ilkCumle(ham.ozetMetni) : "Özet eklenecek.",
    sozler: [],
    baglantilar: [
      { platform: "youtube", url: ytArama(`${ham.baslik} türkü`), dogrulandi: false },
      { platform: "spotify", url: spotifyArama(ham.baslik), dogrulandi: false },
    ],
    kaynaklar: [
      {
        baslik: ham.kaynakAdi,
        url: ham.kaynakUrl,
        tur: "diger",
        erisimTarihi: ham.erisimTarihi,
      },
    ],
    dogrulama: "taslak",
    etiketler: ham.etiketler,
  };

  // Şemaya uygunluğu burada da garanti et.
  return turkuSchema.parse(aday);
}
