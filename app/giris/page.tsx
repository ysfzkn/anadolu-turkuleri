import type { Metadata } from "next";
import { GirisPaneli } from "@/components/GirisPaneli";

export const metadata: Metadata = {
  title: "Giriş",
  description:
    "Google veya Spotify ile giriş yapın; kişisel türkü listelerinizi oluşturun ve paylaşın.",
};

export default function GirisSayfasi() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center">
        <img
          src="/logo-baglama.png"
          alt=""
          className="mx-auto mb-4 h-40 w-auto rounded-2xl object-contain"
        />
        <h1 className="font-serif text-3xl font-semibold text-ceviz">
          Giriş / Üye ol
        </h1>
        <p className="mt-2 text-ceviz-light">
          Google ya da Spotify ile devam et; ilk girişte sana bir kullanıcı
          adı seçtireceğiz.
        </p>
      </div>
      <div className="rounded-2xl border border-toprak/30 bg-parsomen p-6 shadow-motif">
        <GirisPaneli />
      </div>
    </div>
  );
}
