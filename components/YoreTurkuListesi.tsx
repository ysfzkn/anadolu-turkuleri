"use client";

import { useState } from "react";
import { TurkuCard, type KartTurku } from "./TurkuCard";

const SAYFA_BOYUTU = 30;

export function YoreTurkuListesi({ turkuler }: { turkuler: KartTurku[] }) {
  const [gorunen, setGorunen] = useState(SAYFA_BOYUTU);
  const liste = turkuler.slice(0, gorunen);
  const kalan = turkuler.length - liste.length;

  return (
    <section aria-label="Yörenin türküleri">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {liste.map((turku) => (
          <TurkuCard key={turku.slug} turku={turku} />
        ))}
      </div>

      {kalan > 0 && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setGorunen((adet) => adet + SAYFA_BOYUTU)}
            className="rounded-full border border-toprak/40 bg-parsomen px-6 py-3 font-medium text-ceviz shadow-sm transition hover:-translate-y-0.5 hover:border-kilim/60 hover:text-kilim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kilim"
          >
            30 türkü daha göster
          </button>
          <p className="text-sm text-ceviz-light">Listede {kalan} türkü daha var.</p>
        </div>
      )}
    </section>
  );
}
