/**
 * Türkü Yolculukları — SAF veri ve istemci-güvenli mantık.
 *
 * Bu modül `fs`/sunucu bağımlılığı İÇERMEZ; hem istemci (pasaport ilerleme
 * hesabı) hem sunucu kullanabilir. Varlık doğrulaması ve çözümleme
 * lib/yolculuklar.ts'tedir (yalnızca sunucu).
 */

export type AdimTuru = "anlatim" | "turku" | "kisi" | "yore" | "tema" | "terim" | "quiz";

export interface Adim {
  id: string;
  tur: AdimTuru;
  ref?: string;
  baslik?: string;
  metin?: string;
}

export interface Yolculuk {
  slug: string;
  baslik: string;
  aciklama: string;
  emoji: string;
  seviye: "başlangıç" | "orta" | "ileri";
  tahminiDakika: number;
  rozetAdi: string;
  adimlar: Adim[];
}

export const YOLCULUKLAR: Yolculuk[] = [
  {
    slug: "asik-veyselin-izinde",
    baslik: "Âşık Veysel'in İzinde",
    aciklama:
      "Sivas'ın kör âşığının dünyasına bir yolculuk: hayatı, sazı ve “Uzun İnce Bir Yol” felsefesi.",
    emoji: "🪕",
    seviye: "başlangıç",
    tahminiDakika: 15,
    rozetAdi: "Veysel'in Yoldaşı",
    adimlar: [
      { id: "giris", tur: "anlatim", baslik: "Bir yola çıkıyoruz", metin: "Âşık Veysel, 20. yüzyıl Anadolu'sunun en sevilen halk ozanıdır. Bu yolculukta onun hayatını, türkülerini ve dünyaya bakışını adım adım keşfedeceğiz." },
      { id: "veysel", tur: "kisi", ref: "asik-veysel", metin: "Önce ozanı tanıyalım: yöresi, eserleri ve temaları." },
      { id: "uzun-ince", tur: "turku", ref: "uzun-ince-bir-yoldayim", metin: "Onun en bilinen türküsü — hayatı bir yolculuğa benzeten bu eserle başlıyoruz." },
      { id: "anlatamam", tur: "turku", ref: "anlatamam-derdimi-dertsiz-insana", metin: "Derdini ancak dert bilene anlatabilmenin türküsü." },
      { id: "sivas", tur: "yore", ref: "sivas", metin: "Veysel'in ve nice ozanın toprağı: Sivas yöresi." },
      { id: "deyis", tur: "terim", ref: "deyis", metin: "Veysel'in dilindeki “deyiş” geleneğini öğren." },
      { id: "quiz", tur: "quiz", metin: "Öğrendiklerini kısa bir bilgi yarışmasıyla pekiştir." },
    ],
  },
  {
    slug: "gurbetten-silaya",
    baslik: "Gurbetten Sılaya",
    aciklama:
      "Anadolu'nun en derin damarı: memleketten ayrı düşmenin, özlemin ve turnayla yollanan selamın türküleri.",
    emoji: "🧳",
    seviye: "başlangıç",
    tahminiDakika: 18,
    rozetAdi: "Sıla Yolcusu",
    adimlar: [
      { id: "giris", tur: "anlatim", baslik: "Uzağa düşenlerin sesi", metin: "Gurbet, Türk halk müziğinin en yürek burkan temalarından biridir. Bu yolculukta gurbetin dilini, imgelerini ve türkülerini keşfedeceğiz." },
      { id: "tema-gurbet", tur: "tema", ref: "gurbet", metin: "Gurbet temasının Anadolu'daki yerini gör." },
      { id: "terim-gurbet", tur: "terim", ref: "gurbet", metin: "“Gurbet” sözcüğünün halk şiirindeki anlamı." },
      { id: "terim-sila", tur: "terim", ref: "sila", metin: "Gurbetin karşıtı: özlenen memleket, sıla." },
      { id: "terim-turna", tur: "terim", ref: "turna", metin: "Sıladan haber getiren kuş: turna." },
      { id: "alli-turnam", tur: "turku", ref: "alli-turnam-bizim-ele-varirsan", metin: "Turnaya sılaya selam yollayan türkü." },
      { id: "gesi", tur: "turku", ref: "gesi-baglari", metin: "Kayseri'nin ünlü ağıt-gurbet türküsü: Gesi Bağları." },
      { id: "quiz", tur: "quiz", metin: "Gurbet bilgini test et." },
    ],
  },
  {
    slug: "pir-sultanin-deyisleri",
    baslik: "Pir Sultan'ın Deyişleri",
    aciklama:
      "Sivas'ın direnen sesi Pir Sultan Abdal, deyiş geleneği ve semah kültürüne bir giriş.",
    emoji: "🔥",
    seviye: "orta",
    tahminiDakika: 16,
    rozetAdi: "Deyiş Ustası",
    adimlar: [
      { id: "giris", tur: "anlatim", baslik: "Bir direniş sesi", metin: "Pir Sultan Abdal, Alevi-Bektaşi geleneğinin en güçlü ozanlarından biridir. Deyişleri hem inancı hem de haksızlığa başkaldırıyı yaşatır." },
      { id: "pir-sultan", tur: "kisi", ref: "pir-sultan-abdal", metin: "Ozanı tanı: yöresi ve eserleri." },
      { id: "acilin", tur: "turku", ref: "acilin-kapilar-saha-gidelim", metin: "En bilinen deyişlerinden biri." },
      { id: "deyis", tur: "terim", ref: "deyis", metin: "Deyiş nedir? Tasavvufi söz-ezginin dünyası." },
      { id: "semah", tur: "terim", ref: "semah", metin: "Deyişlerle dönülen ritüel: semah." },
      { id: "sivas", tur: "yore", ref: "sivas", metin: "Pir Sultan'ın toprağı: Sivas." },
      { id: "quiz", tur: "quiz", metin: "Öğrendiklerini sına." },
    ],
  },
  {
    slug: "egede-zeybekler-ve-efeler",
    baslik: "Ege'de Zeybekler ve Efeler",
    aciklama:
      "Batı Anadolu'nun mağrur duruşu: zeybek ezgileri, efelik kültürü ve ağır oyunların dünyası.",
    emoji: "⚔️",
    seviye: "orta",
    tahminiDakika: 16,
    rozetAdi: "Ege Efesi",
    adimlar: [
      { id: "giris", tur: "anlatim", baslik: "Dağların mağrur sesi", metin: "Zeybek, Ege'nin ağır ve vakur oyun-ezgi geleneğidir; efelik kültürüyle iç içedir. Bu yolculukta o duruşu keşfedeceğiz." },
      { id: "tema-zeybek", tur: "tema", ref: "zeybek", metin: "Zeybek temasını taşıyan türküler." },
      { id: "terim-zeybek", tur: "terim", ref: "zeybek", metin: "Zeybek nedir? 9 zamanlı ağır ezgi." },
      { id: "terim-efe", tur: "terim", ref: "efe", metin: "Efe: Ege'nin yiğitlik figürü." },
      { id: "cokertme", tur: "turku", ref: "cokertme", metin: "Ege'nin en bilinen zeybeklerinden: Çökertme." },
      { id: "harmandali", tur: "turku", ref: "harmandali", metin: "Ağır zeybeğin simgesi: Harmandalı." },
      { id: "quiz", tur: "quiz", metin: "Zeybek bilgini ölç." },
    ],
  },
  {
    slug: "derlemenin-ustasi-sarisozen",
    baslik: "Derlemenin Ustası: Muzaffer Sarısözen",
    aciklama:
      "Anadolu türkülerini derleyip notaya alan, radyoyla evlere taşıyan büyük derleyenin izinde.",
    emoji: "🎼",
    seviye: "ileri",
    tahminiDakika: 14,
    rozetAdi: "Repertuvar Bekçisi",
    adimlar: [
      { id: "giris", tur: "anlatim", baslik: "Türküleri kim topladı?", metin: "Bugün bildiğimiz pek çok türkü, derleyenlerin kayda geçirmesiyle bize ulaştı. Muzaffer Sarısözen bu geleneğin en önemli adıdır." },
      { id: "sarisozen", tur: "kisi", ref: "muzaffer-sarisozen", metin: "Derlediği türküler, yöreler ve temalar." },
      { id: "uzun-hava", tur: "terim", ref: "uzun-hava", metin: "Derlemelerde sık geçen bir tür: uzun hava." },
      { id: "kirik-hava", tur: "terim", ref: "kirik-hava", metin: "Tartımlı ezgiler: kırık hava." },
      { id: "alli-turnam", tur: "turku", ref: "alli-turnam-bizim-ele-varirsan", metin: "Sarısözen derlemelerinden bir türkü." },
      { id: "quiz", tur: "quiz", metin: "Derleme bilgini sına." },
    ],
  },
];

export function tumYolculukSluglari(): string[] {
  return YOLCULUKLAR.map((y) => y.slug);
}

/**
 * İlerleme satırlarından tamamlanan yolculuk sayısı (pasaport için,
 * istemci-güvenli). Bir yolculuk, TÜM adımları işaretlenmişse tamamlanmış
 * sayılır. Küratörlü adımların tümü geçerli olduğundan ham adım kimlikleri
 * çözülmüş adımlarla birebir örtüşür.
 */
export function tamamlananYolculukSayisi(
  ilerleme: { yolculuk_slug: string; adim_id: string }[],
): number {
  const harita = new Map<string, Set<string>>();
  for (const r of ilerleme) {
    if (!harita.has(r.yolculuk_slug)) harita.set(r.yolculuk_slug, new Set());
    harita.get(r.yolculuk_slug)!.add(r.adim_id);
  }
  let sayi = 0;
  for (const y of YOLCULUKLAR) {
    const tamamlanan = harita.get(y.slug);
    if (tamamlanan && y.adimlar.every((a) => tamamlanan.has(a.id))) sayi++;
  }
  return sayi;
}
