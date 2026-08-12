/**
 * Anadolu Kültür Pasaportu — saf toplama ve rozet mantığı.
 *
 * Keşif satırlarından (public.kesifler) türetilir; hem istemci hem sunucu
 * kullanabilir. Rozet kuralları veri odaklıdır (UI'da sabit kodlanmaz).
 */

export type KesifTuru =
  | "turku"
  | "ozan"
  | "tema"
  | "terim"
  | "yore"
  | "dinleme"
  | "quiz";

export interface KesifSatiri {
  tur: KesifTuru;
  anahtar: string;
  il: string | null;
  olusturulma?: string;
}

export const TOPLAM_IL = 81;

/** Keşif türüne göre kültür puanı katkısı. */
export const PUAN: Record<KesifTuru, number> = {
  turku: 10,
  dinleme: 12,
  ozan: 15,
  tema: 8,
  terim: 6,
  yore: 8,
  quiz: 20,
};

export interface PasaportOzeti {
  sehirler: string[]; // benzersiz il slug'ları
  turkuSayisi: number;
  ozanSayisi: number;
  temaSayisi: number;
  terimSayisi: number;
  dinlemeSayisi: number;
  quizSayisi: number;
  yolculukSayisi: number; // tamamlanan yolculuklar (dışarıdan set edilir)
  toplamKesif: number;
  puan: number;
}

export function ozetle(satirlar: KesifSatiri[]): PasaportOzeti {
  const sehirler = new Set<string>();
  const sayac: Record<KesifTuru, number> = {
    turku: 0, ozan: 0, tema: 0, terim: 0, yore: 0, dinleme: 0, quiz: 0,
  };
  let puan = 0;
  for (const s of satirlar) {
    if (s.tur in sayac) sayac[s.tur]++;
    puan += PUAN[s.tur] ?? 0;
    if (s.il) sehirler.add(s.il);
  }
  return {
    sehirler: Array.from(sehirler),
    turkuSayisi: sayac.turku,
    ozanSayisi: sayac.ozan,
    temaSayisi: sayac.tema,
    terimSayisi: sayac.terim,
    dinlemeSayisi: sayac.dinleme,
    quizSayisi: sayac.quiz,
    yolculukSayisi: 0,
    toplamKesif: satirlar.length,
    puan,
  };
}

export interface RozetTanimi {
  id: string;
  ad: string;
  aciklama: string;
  ikon: string;
  hedef: number;
  deger: (o: PasaportOzeti) => number;
}

/** Rozet kuralları — hepsi pasaport özetinden hesaplanır. */
export const ROZETLER: RozetTanimi[] = [
  { id: "ilk-adim", ad: "İlk Adım", ikon: "🌱", hedef: 1, aciklama: "İlk türkünü keşfet.", deger: (o) => o.turkuSayisi },
  { id: "hikaye-kasifi", ad: "Hikâye Kâşifi", ikon: "📖", hedef: 10, aciklama: "10 türkünün hikâyesini keşfet.", deger: (o) => o.turkuSayisi },
  { id: "turku-avcisi", ad: "Türkü Avcısı", ikon: "🎵", hedef: 50, aciklama: "50 türkü keşfet.", deger: (o) => o.turkuSayisi },
  { id: "anadolu-yolcusu", ad: "Anadolu Yolcusu", ikon: "🧭", hedef: 10, aciklama: "10 şehir keşfet.", deger: (o) => o.sehirler.length },
  { id: "yoruk", ad: "Yörük", ikon: "🐫", hedef: 25, aciklama: "25 şehir keşfet.", deger: (o) => o.sehirler.length },
  { id: "seyyah", ad: "Seyyah", ikon: "🗺️", hedef: 50, aciklama: "50 şehir keşfet.", deger: (o) => o.sehirler.length },
  { id: "81-il", ad: "81 İlin İzinde", ikon: "🇹🇷", hedef: TOPLAM_IL, aciklama: "Türkiye'nin 81 ilini keşfet.", deger: (o) => o.sehirler.length },
  { id: "ozan-dostu", ad: "Ozan Dostu", ikon: "🪕", hedef: 5, aciklama: "5 ozan ve derleyen tanı.", deger: (o) => o.ozanSayisi },
  { id: "tema-avcisi", ad: "Tema Avcısı", ikon: "🎭", hedef: 8, aciklama: "8 farklı temayı keşfet.", deger: (o) => o.temaSayisi },
  { id: "sozluk-kurdu", ad: "Sözlük Kurdu", ikon: "📜", hedef: 8, aciklama: "8 sözlük terimini öğren.", deger: (o) => o.terimSayisi },
  { id: "dinleyici", ad: "Sadık Dinleyici", ikon: "🎧", hedef: 20, aciklama: "20 türkü dinle.", deger: (o) => o.dinlemeSayisi },
  { id: "ilk-yolculuk", ad: "Yola Çıkan", ikon: "🚩", hedef: 1, aciklama: "İlk türkü yolculuğunu tamamla.", deger: (o) => o.yolculukSayisi },
  { id: "anadolu-kasifi", ad: "Anadolu Kâşifi", ikon: "🏅", hedef: 3, aciklama: "3 türkü yolculuğunu tamamla.", deger: (o) => o.yolculukSayisi },
];

export interface RozetDurumu extends RozetTanimi {
  ilerleme: number;
  kazanildi: boolean;
}

export function rozetler(o: PasaportOzeti): RozetDurumu[] {
  return ROZETLER.map((r) => {
    const ilerleme = Math.min(r.deger(o), r.hedef);
    return { ...r, ilerleme, kazanildi: r.deger(o) >= r.hedef };
  });
}

export function kazanilanRozetSayisi(o: PasaportOzeti): number {
  return ROZETLER.filter((r) => r.deger(o) >= r.hedef).length;
}
