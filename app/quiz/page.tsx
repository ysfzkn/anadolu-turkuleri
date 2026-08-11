import type { Metadata } from "next";
import { tumTurkuler, ilAdi } from "@/lib/data";
import { OyunMerkezi } from "@/components/OyunMerkezi";
import { OZAN_GORSELLERI } from "@/lib/ozan-gorselleri";

export const metadata: Metadata = {
  title: "Anadolu Oyunları",
  description: "Türküleri, yöreleri, ozanları ve hikâyeleri interaktif oyunlarla keşfet; arkadaşına canlı meydan oku.",
  alternates: { canonical: "/quiz" },
};

export default function OyunSayfasi() {
  const veri = tumTurkuler().filter((t) => t.dogrulama !== "taslak").map((t) => ({
    slug: t.slug,
    baslik: t.baslik,
    il: ilAdi(t.yore),
    ozet: t.ozet,
    ozan: t.ozan ?? t.sozYazari ?? null,
    ozanGorseli: OZAN_GORSELLERI[t.ozan ?? t.sozYazari ?? ""] ?? null,
    etiketler: t.etiketler ?? [],
    sozler: t.sozler.flatMap((kita) => kita.satirlar),
  }));
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10"><OyunMerkezi turkuler={veri} /></div>;
}
