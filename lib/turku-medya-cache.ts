import hamKatalog from "@/content/turku-medya.json";

export interface SpotifyMedyaKaydi {
  id: string | null;
  ad: string;
  sanatci: string;
  onizlemeUrl: string | null;
  spotifyUrl: string | null;
  gorsel: string | null;
  album: string | null;
  yayinYili: string | null;
  guven: number;
}

export interface YouTubeMedyaKaydi {
  videoId: string;
  baslik: string;
  kanal: string | null;
  thumbnail: string;
  youtubeUrl: string;
  kaynak: "arsiv" | "arama";
}

export interface TurkuMedyaKaydi {
  spotify: SpotifyMedyaKaydi | null;
  youtube: YouTubeMedyaKaydi | null;
  guncellendi: string;
}

const katalog = hamKatalog as {
  surum: number;
  guncellendi: string | null;
  kayitlar: Record<string, TurkuMedyaKaydi>;
};

export function turkuMedyaCache(slug?: string | null): TurkuMedyaKaydi | null {
  return slug ? katalog.kayitlar[slug] ?? null : null;
}
