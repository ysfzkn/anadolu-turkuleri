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
  {
    slug: "harputun-musikisi",
    baslik: "Harput'un Musikisi",
    aciklama:
      "Elazığ-Harput'un kendine has müzik geleneği: gazel, maya ve zarif sevda türküleri.",
    emoji: "🎻",
    seviye: "orta",
    tahminiDakika: 15,
    rozetAdi: "Harput Bülbülü",
    adimlar: [
      { id: "giris", tur: "anlatim", baslik: "Bir şehrin sesi", metin: "Elazığ-Harput, kendine özgü makam anlayışı ve içli söyleyişiyle Anadolu'nun en zengin yerel müzik geleneklerinden birine sahiptir." },
      { id: "elazig", tur: "yore", ref: "elazig", metin: "Harput'un bağlı olduğu yöre: Elazığ." },
      { id: "maya", tur: "terim", ref: "maya", metin: "Harput'ta sıkça duyulan içli uzun hava: maya." },
      { id: "cayda-cira", tur: "turku", ref: "cayda-cira", metin: "Harput'un düğün geleneğinden ünlü ezgi: Çayda Çıra." },
      { id: "al-almayi", tur: "turku", ref: "al-almayi-daldan-al-elazig", metin: "Elazığ yöresinden bir sevda türküsü." },
      { id: "quiz", tur: "quiz", metin: "Harput bilgini sına." },
    ],
  },
  {
    slug: "agitlarin-anadolusu",
    baslik: "Ağıtların Anadolu'su",
    aciklama:
      "Anadolu'nun acıyı sese döktüğü gelenek: yitimin, selin ve genç ölümlerin ardından yakılan ağıtlar.",
    emoji: "🕯️",
    seviye: "orta",
    tahminiDakika: 16,
    rozetAdi: "Ağıt Yakan",
    adimlar: [
      { id: "giris", tur: "anlatim", baslik: "Acıyı söze dökmek", metin: "Ağıt, bir yitimin ardından yakılan söz-ezgidir. Anadolu'da acıyı hem paylaşan hem de belleğe kaydeden bir gelenektir." },
      { id: "tema-agit", tur: "tema", ref: "agit", metin: "Ağıt temasının arşivdeki yeri." },
      { id: "carsamba", tur: "turku", ref: "carsambayi-sel-aldi", metin: "Sel felaketinin ardından yakılan ünlü ağıt." },
      { id: "al-fadimem", tur: "turku", ref: "al-fadimem", metin: "Genç bir gelinin ardından yakılan ağıt." },
      { id: "bitlis", tur: "turku", ref: "bitliste-bes-minare", metin: "Bir başka acılı anlatı." },
      { id: "quiz", tur: "quiz", metin: "Ağıt geleneği bilgini sına." },
    ],
  },
  {
    slug: "turnalar-siladan-haber",
    baslik: "Turnalar: Sıladan Haber",
    aciklama:
      "Türkülerin en sevilen ulağı: sıladan haber getiren, sevgiliye selam götüren turnaların izinde.",
    emoji: "🕊️",
    seviye: "başlangıç",
    tahminiDakika: 15,
    rozetAdi: "Turna Katarı",
    adimlar: [
      { id: "giris", tur: "anlatim", baslik: "Gökyüzünün ulağı", metin: "Turna, halk şiirinde sıladan haber getiren ve götüren kuştur; gurbetin, hasretin ve yol imgesinin taşıyıcısıdır." },
      { id: "terim-turna", tur: "terim", ref: "turna", metin: "Turnanın türkülerdeki anlamı." },
      { id: "terim-sila", tur: "terim", ref: "sila", metin: "Turnanın selam götürdüğü yer: sıla." },
      { id: "alli-turnam", tur: "turku", ref: "alli-turnam-bizim-ele-varirsan", metin: "Turnaya sılaya selam yollayan türkü." },
      { id: "dost-eline", tur: "turku", ref: "dost-eline-giden-turnam", metin: "Dost eline giden turnaya seslenilen türkü." },
      { id: "boluk-boluk", tur: "turku", ref: "gok-yuzunde-boluk-boluk-turnalar", metin: "Gökyüzünde bölük bölük turnalar." },
      { id: "quiz", tur: "quiz", metin: "Turna sembolü bilgini sına." },
    ],
  },
  {
    slug: "anadoluda-dugun-ve-oyun",
    baslik: "Anadolu'da Düğün ve Oyun",
    aciklama:
      "Şenliğin sesi: davul-zurnayla, halaylarla ve oyun havalarıyla Anadolu'nun sevinç dili.",
    emoji: "🪘",
    seviye: "başlangıç",
    tahminiDakika: 16,
    rozetAdi: "Meydan Ustası",
    adimlar: [
      { id: "giris", tur: "anlatim", baslik: "Sevincin ritmi", metin: "Düğün ve şenlik meclisleri, oyun havaları ve halaylarla Anadolu'nun sevinç dilini oluşturur. Bu yolculukta o ritmi keşfedeceğiz." },
      { id: "tema-oyun", tur: "tema", ref: "oyun-havasi", metin: "Oyun havalarının dünyası." },
      { id: "tema-halay", tur: "tema", ref: "halay", metin: "Toplu oyun geleneği: halay." },
      { id: "terim-kirik", tur: "terim", ref: "kirik-hava", metin: "Oyun ezgilerinin tartımlı yapısı: kırık hava." },
      { id: "ankara", tur: "turku", ref: "ankaranin-baglari", metin: "Ankara'nın ünlü oyun havası." },
      { id: "atabari", tur: "turku", ref: "atabari", metin: "Bir başka hareketli oyun ezgisi." },
      { id: "quiz", tur: "quiz", metin: "Oyun havaları bilgini sına." },
    ],
  },
  {
    slug: "karadenizden-yaylalara",
    baslik: "Karadeniz'den Yaylalara",
    aciklama:
      "Dağların ve denizin arasında: Karadeniz'in coşkulu ezgileri, yayla sevdaları ve serin dağ havası.",
    emoji: "⛰️",
    seviye: "başlangıç",
    tahminiDakika: 14,
    rozetAdi: "Yayla Yolcusu",
    adimlar: [
      { id: "giris", tur: "anlatim", baslik: "Dağ ile deniz arası", metin: "Karadeniz, dik dağları ve yayla kültürüyle kendine özgü, coşkulu bir müzik geleneği taşır. Sevda çoğu zaman yaylayla, sisle ve dağ havasıyla anlatılır." },
      { id: "trabzon", tur: "yore", ref: "trabzon", metin: "Karadeniz'in kalbinden bir yöre: Trabzon." },
      { id: "cayeli", tur: "turku", ref: "cayelinden-oteye", metin: "Rize-Çayeli'nden coşkulu bir Karadeniz türküsü." },
      { id: "daglar", tur: "turku", ref: "ah-daglar-serin-daglar", metin: "Dağlara ve serinliğe seslenen bir ezgi." },
      { id: "tema-sevda", tur: "tema", ref: "sevda", metin: "Karadeniz türkülerinin sevda damarı." },
      { id: "quiz", tur: "quiz", metin: "Karadeniz bilgini sına." },
    ],
  },
  {
    slug: "sevda-turkuleri",
    baslik: "Sevda Türküleri",
    aciklama:
      "Anadolu'nun en geniş damarı: kavuşma umudu, gönül yangını ve güzelleme geleneğinde sevda.",
    emoji: "❤️",
    seviye: "başlangıç",
    tahminiDakika: 15,
    rozetAdi: "Gönül Ehli",
    adimlar: [
      { id: "giris", tur: "anlatim", baslik: "Gönlün dili", metin: "Sevda, Anadolu türkülerinin en geniş damarıdır; doğa imgeleriyle — gül, yar, zülüf — anlatılan bir gönül dilidir." },
      { id: "tema-sevda", tur: "tema", ref: "sevda", metin: "Sevda temasının arşivdeki yeri." },
      { id: "yar", tur: "terim", ref: "yar", metin: "Sevdanın merkezindeki sözcük: yâr." },
      { id: "zuluf", tur: "terim", ref: "zuluf", metin: "Güzelleme imgesi: zülüf." },
      { id: "gesi", tur: "turku", ref: "gesi-baglari", metin: "Kayseri'nin ünlü sevda-ağıt türküsü." },
      { id: "sari-gelin", tur: "turku", ref: "sari-gelin", metin: "Anadolu'nun dört bir yanında bilinen sevda türküsü." },
      { id: "quiz", tur: "quiz", metin: "Sevda geleneği bilgini sına." },
    ],
  },
];

export function tumYolculukSluglari(): string[] {
  return YOLCULUKLAR.map((y) => y.slug);
}

export interface YolculukRozeti {
  slug: string;
  baslik: string;
  emoji: string;
}

/**
 * Belirli bir varlığı (türkü/kişi/tema/terim/yöre) adımlarında içeren
 * yolculuklar. Entity sayfalarında "bu şu yolculuklarda geçiyor" çapraz
 * bağlantısı için. Saf — hem sunucu hem istemci kullanabilir.
 */
export function yolculuklardaGecen(tur: AdimTuru, ref: string): YolculukRozeti[] {
  return YOLCULUKLAR.filter((y) => y.adimlar.some((a) => a.tur === tur && a.ref === ref)).map((y) => ({
    slug: y.slug,
    baslik: y.baslik,
    emoji: y.emoji,
  }));
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
