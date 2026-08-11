/** Türkiye'nin 7 coğrafi bölgesi — yöreye göre motif seçimi için. */
export type Bolge =
  | "marmara"
  | "ege"
  | "akdeniz"
  | "ic-anadolu"
  | "karadeniz"
  | "dogu"
  | "guneydogu";

export const BOLGE_ADI: Record<Bolge, string> = {
  marmara: "Marmara",
  ege: "Ege",
  akdeniz: "Akdeniz",
  "ic-anadolu": "İç Anadolu",
  karadeniz: "Karadeniz",
  dogu: "Doğu Anadolu",
  guneydogu: "Güneydoğu Anadolu",
};

const BOLGE_ILLERI: Record<Bolge, string[]> = {
  marmara: [
    "balikesir", "bilecik", "bursa", "canakkale", "edirne", "istanbul",
    "kirklareli", "kocaeli", "sakarya", "tekirdag", "yalova", "rumeli",
  ],
  ege: [
    "afyonkarahisar", "aydin", "denizli", "izmir", "kutahya", "manisa",
    "mugla", "usak",
  ],
  akdeniz: [
    "adana", "antalya", "burdur", "hatay", "isparta", "mersin", "osmaniye",
    "kahramanmaras", "kilis",
  ],
  "ic-anadolu": [
    "aksaray", "ankara", "cankiri", "eskisehir", "karaman", "kayseri",
    "kirikkale", "kirsehir", "konya", "nevsehir", "nigde", "sivas", "yozgat",
  ],
  karadeniz: [
    "amasya", "artvin", "bartin", "bayburt", "bolu", "corum", "duzce",
    "giresun", "gumushane", "karabuk", "kastamonu", "ordu", "rize", "samsun",
    "sinop", "tokat", "trabzon", "zonguldak",
  ],
  dogu: [
    "agri", "ardahan", "bingol", "bitlis", "elazig", "erzincan", "erzurum",
    "hakkari", "igdir", "kars", "malatya", "mus", "tunceli", "van",
  ],
  guneydogu: [
    "adiyaman", "batman", "diyarbakir", "gaziantep", "mardin", "siirt",
    "sanliurfa", "sirnak",
  ],
};

const SLUG_BOLGE: Record<string, Bolge> = Object.fromEntries(
  (Object.entries(BOLGE_ILLERI) as [Bolge, string[]][]).flatMap(([b, iller]) =>
    iller.map((s) => [s, b]),
  ),
);

/** İl slug'ından bölge; bilinmiyorsa İç Anadolu'ya düşer. */
export function bolgeBul(ilSlugu: string): Bolge {
  return SLUG_BOLGE[ilSlugu] ?? "ic-anadolu";
}
