import { Suspense } from "react";
import type { Metadata } from "next";
import { KullaniciAdiFormu } from "@/components/KullaniciAdiFormu";

export const metadata: Metadata = {
  title: "Kullanıcı adı seç",
};

export default function KullaniciAdiSayfasi() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-6 text-center">
        <h1 className="font-serif text-3xl font-semibold text-ceviz">
          Hoş geldin!
        </h1>
        <p className="mt-2 text-ceviz-light">
          Son bir adım: sana bir kullanıcı adı seç.
        </p>
      </div>
      <div className="rounded-2xl border border-toprak/30 bg-parsomen p-6 shadow-motif">
        <Suspense fallback={<div className="h-24" aria-hidden />}>
          <KullaniciAdiFormu />
        </Suspense>
      </div>
    </div>
  );
}
