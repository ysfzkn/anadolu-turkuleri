import type { Metadata } from "next";
import { tumTurkuler, ilAdi } from "@/lib/data";
import { OyunMerkezi } from "@/components/OyunMerkezi";

export const metadata: Metadata = {
  title: "Anadolu Oyunları",
  description: "Türküleri, yöreleri, ozanları ve hikâyeleri interaktif oyunlarla keşfet; arkadaşına canlı meydan oku.",
};

export default function OyunSayfasi() {
  const veri = tumTurkuler().map((t) => ({
    slug: t.slug,
    baslik: t.baslik,
    il: ilAdi(t.yore),
    ozet: t.ozet,
    ozan: t.ozan ?? t.sozYazari ?? null,
    etiketler: t.etiketler ?? [],
    sozler: t.sozler.flatMap((kita) => kita.satirlar),
  }));
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10"><OyunMerkezi turkuler={veri} /></main>;
}
