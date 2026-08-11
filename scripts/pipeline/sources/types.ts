/**
 * Kaynak adaptörü arayüzü.
 *
 * Her veri kaynağı (Wikipedia, açık arşivler vb.) bu arayüzü uygular.
 * Adaptör, TohumKayit listesini alır ve yalnızca HAM veri (HamKayit) döndürür;
 * normalleştirme ve şema doğrulaması pipeline'ın ilerleyen adımlarında yapılır.
 */

/** İşlenecek türküyü tanımlayan tohum (seed) — küratörlü listeden gelir. */
export interface TohumKayit {
  /** Türkünün yaygın adı (slug ve görünen başlık bundan türer). */
  ad: string;
  yore?: string;
  /** Vikipedi'deki madde başlığı (farklıysa). Yoksa `ad` denenir. */
  wikiBaslik?: string;
  /** Tema/etiketler. */
  tema?: string[];
  /**
   * Söz/beste sahibi biliniyorsa (ör. Neşet Ertaş, Âşık Veysel). Doluysa eser
   * anonim DEĞİLDİR; telif duyarlıdır — sözler elle eklenmez, yalnızca olgusal
   * hikâye + atıf yayımlanır (bkz. Çemberimde Gül Oya örneği).
   */
  sozSahibi?: string;
}

export interface HamKayit {
  /** Kaynağın okunur adı, örn. "Vikipedi (TR)". */
  kaynakAdi: string;
  /** Bu kaydın alındığı tam URL (atıf için). */
  kaynakUrl: string;
  /** URL dostu slug (küçük harf, tire). */
  slug: string;
  baslik: string;
  yore?: string;
  /** Kaynaktan gelen aday özet/arka plan metni — İNSAN yeniden yazacak. */
  ozetMetni?: string;
  etiketler?: string[];
  /** Söz/beste sahibi (biliniyorsa) — anonim olmayan, telif duyarlı eser. */
  sozSahibi?: string;
  /** ISO erişim tarihi. */
  erisimTarihi: string;
}

export interface KaynakAdaptoru {
  ad: string;
  /**
   * Verilen tohumlar için ham kayıtlar döndürür.
   * Bulunamayan tohumlar sessizce atlanır.
   */
  getir(tohumlar: TohumKayit[]): Promise<HamKayit[]>;
}
