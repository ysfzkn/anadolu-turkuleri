"use client";

import { useEffect, useState } from "react";
import { analitikIzni, analitikIzniKaydet, type AnalitikIzni as Izin } from "@/lib/analytics";

export function AnalitikIzni() {
  const [izin, setIzin] = useState<Izin>("ret");
  const etkin = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

  useEffect(() => {
    if (etkin) setIzin(analitikIzni());
  }, [etkin]);

  if (!etkin || izin !== "bekliyor") return null;

  function sec(yeni: "kabul" | "ret") {
    analitikIzniKaydet(yeni);
    setIzin(yeni);
  }

  return (
    <section className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-toprak/35 bg-parsomen/95 p-4 shadow-[0_18px_60px_rgba(43,33,24,.24)] backdrop-blur sm:flex sm:items-center sm:gap-5" aria-label="Analitik tercihi">
      <div className="min-w-0 flex-1">
        <h2 className="font-serif text-lg font-semibold text-ceviz">Deneyimi birlikte iyileştirelim</h2>
        <p className="mt-1 text-sm leading-5 text-ceviz-light">Anonim kullanım ölçümleriyle arama, harita ve oyunları geliştiriyoruz. Aradığın kelimeleri veya hesap bilgilerini kaydetmiyoruz.</p>
      </div>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button type="button" onClick={() => sec("ret")} className="min-h-11 rounded-xl border border-toprak/30 px-4 text-sm font-semibold text-ceviz hover:bg-toprak/10">Reddet</button>
        <button type="button" onClick={() => sec("kabul")} className="min-h-11 rounded-xl bg-kilim px-4 text-sm font-semibold text-white hover:bg-kilim-dark">İzin ver</button>
      </div>
    </section>
  );
}
