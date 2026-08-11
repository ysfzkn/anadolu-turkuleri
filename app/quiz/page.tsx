import type { Metadata } from "next";
import { tumTurkuler, ilAdi } from "@/lib/data";
import { Quiz } from "@/components/Quiz";
import { StarMotif } from "@/components/Motif";

export const metadata: Metadata = {
  title: "Türkü Bilgi Oyunu",
  description:
    "Türküleri yörelerine göre bil, seri yap, rozet topla. Eğlenceli bir türkü bilgi oyunu.",
};

export default function QuizSayfasi() {
  const veri = tumTurkuler().map((t) => ({
    slug: t.slug,
    baslik: t.baslik,
    il: ilAdi(t.yore),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 flex w-fit text-toprak">
          <StarMotif size={40} />
        </span>
        <h1 className="font-serif text-3xl font-semibold text-ceviz">
          Türkü Bilgi Oyunu
        </h1>
        <p className="mt-2 text-ceviz-light">
          Türkünün adından yöresini bul; seri yap, rozet topla.
        </p>
      </div>
      <Quiz turkuler={veri} />
    </div>
  );
}
