import type { Metadata } from "next";
import { GirisPaneli } from "@/components/GirisPaneli";
import { StarMotif } from "@/components/Motif";

export const metadata: Metadata = {
  title: "Giriş",
  description:
    "Google veya Spotify ile giriş yapın; kişisel türkü listelerinizi oluşturun ve paylaşın.",
};

export default function GirisSayfasi() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 flex w-fit text-kilim">
          <StarMotif size={44} />
        </span>
        <h1 className="font-serif text-3xl font-semibold text-ceviz">Giriş</h1>
        <p className="mt-2 text-ceviz-light">
          Kendi türkü listelerini oluştur, kaydet ve paylaş.
        </p>
      </div>
      <div className="rounded-2xl border border-toprak/30 bg-parsomen p-6 shadow-motif">
        <GirisPaneli />
      </div>
    </div>
  );
}
