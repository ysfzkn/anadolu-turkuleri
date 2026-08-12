/**
 * Bağış / destekçi kanalları.
 * Linkler .env'den okunur; yalnızca değeri girilmiş kanallar sitede görünür.
 * Hiçbiri girilmemişse /destek sayfası zarif bir "yakında" durumu gösterir.
 * Tüm anahtarlar NEXT_PUBLIC_ (herkese açık bağlantılar) olduğundan sunucu ve
 * istemci tarafında güvenle okunur.
 */

export type DestekTuru = "duzenli" | "tek-sefer" | "havale";

export interface DestekKanali {
  tur: DestekTuru;
  etiket: string;
  baslik: string;
  aciklama: string;
  butonMetni: string;
  url?: string;
  iban?: string;
  ibanAd?: string;
}

/** İlk dolu (boşluk kırpılmış) değeri döndürür. */
function ilk(...adaylar: (string | undefined)[]): string | undefined {
  for (const aday of adaylar) {
    const temiz = aday?.trim();
    if (temiz) return temiz;
  }
  return undefined;
}

export function destekKanallari(): DestekKanali[] {
  const kanallar: DestekKanali[] = [];

  const duzenli = ilk(
    process.env.NEXT_PUBLIC_DESTEK_PATREON,
    process.env.NEXT_PUBLIC_DESTEK_KREOSUS,
  );
  if (duzenli) {
    kanallar.push({
      tur: "duzenli",
      etiket: "Aylık destek",
      baslik: "Gönül Dostu",
      aciklama:
        "Her ay küçük bir katkıyla arşivin işletme ve editoryal doğrulama giderlerine düzenli destek olun. Reklamsız kullanım ve destekçi rozeti.",
      butonMetni: "Aylık destek ol",
      url: duzenli,
    });
  }

  const tekSefer = ilk(
    process.env.NEXT_PUBLIC_DESTEK_SHOPIER,
    process.env.NEXT_PUBLIC_DESTEK_KOFI,
  );
  if (tekSefer) {
    kanallar.push({
      tur: "tek-sefer",
      etiket: "Tek seferlik",
      baslik: "Bir Türkü Ismarla",
      aciklama:
        "Dilediğiniz tutarda tek seferlik katkı. Belirli bir şehir dosyasının kaynak taraması ve saha derlemesine doğrudan destek olur.",
      butonMetni: "Tek seferlik katkı",
      url: tekSefer,
    });
  }

  const iban = process.env.NEXT_PUBLIC_DESTEK_IBAN?.trim();
  if (iban) {
    kanallar.push({
      tur: "havale",
      etiket: "Doğrudan havale",
      baslik: "IBAN ile destek",
      aciklama:
        "Komisyonsuz; doğrudan banka havalesi veya EFT ile destek olun. Katkının tamamı arşive kalır.",
      butonMetni: "IBAN'ı kopyala",
      iban,
      ibanAd: process.env.NEXT_PUBLIC_DESTEK_IBAN_AD?.trim(),
    });
  }

  return kanallar;
}
