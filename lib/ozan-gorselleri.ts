export interface OzanGorseli {
  src: string;
  alt: string;
  kaynak: string;
  lisans: string;
  tur: "portre" | "heykel" | "arsiv";
}

export const OZAN_GORSELLERI: Record<string, OzanGorseli> = {
  "Âşık Veysel": {
    src: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Asik_Veysel.jpg",
    alt: "Âşık Veysel'in arşiv portresi",
    kaynak: "https://commons.wikimedia.org/wiki/File:Asik_Veysel.jpg",
    lisans: "Kamu malı",
    tur: "portre",
  },
  "Neşet Ertaş": {
    src: "/ozanlar/neset-ertas.jpg",
    alt: "Neşet Ertaş'ı betimleyen anıt",
    kaynak: "https://commons.wikimedia.org/wiki/File:Ne%C5%9Fet_Erta%C5%9F_-_panoramio.jpg",
    lisans: "CC BY 3.0 · Tevfik Teker",
    tur: "heykel",
  },
  "Pir Sultan Abdal": {
    src: "/ozanlar/pir-sultan-abdal.jpg",
    alt: "Pir Sultan Abdal heykeli",
    kaynak: "https://commons.wikimedia.org/wiki/File:Pir_Sultan_Abdal_heykeli.jpg",
    lisans: "CC BY-SA 4.0 · BurakOtto",
    tur: "heykel",
  },
  "Kâmil Nizam Bigalı": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Biga_Halk_M%C3%BCzi%C4%9Fi.pdf/page1-500px-Biga_Halk_M%C3%BCzi%C4%9Fi.pdf.jpg",
    alt: "Biga Halk Müziği arşiv yayınının kapağı",
    kaynak: "https://commons.wikimedia.org/wiki/File:Biga_Halk_M%C3%BCzi%C4%9Fi.pdf",
    lisans: "CC BY 4.0 · Alaattin Canbay",
    tur: "arsiv",
  },
};
