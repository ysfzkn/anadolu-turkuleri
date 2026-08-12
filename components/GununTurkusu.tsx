"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { KartTurku } from "./TurkuCard";
import { StarMotif } from "./Motif";

/** Deterministik seçim: aynı gün/ay herkeste aynı türküyü gösterir. */
function secim(turkuler: KartTurku[], tohum: number): KartTurku | null {
  if (!turkuler.length) return null;
  return turkuler[tohum % turkuler.length];
}

function OneCikan({
  etiket,
  turku,
  renk,
}: {
  etiket: string;
  turku: KartTurku;
  renk: "kilim" | "cini";
}) {
  const sinif =
    renk === "kilim"
      ? "border-kilim/30 bg-kilim/5 text-kilim-dark"
      : "border-cini/30 bg-cini/5 text-cini-dark";
  return (
    <Link
      href={`/turku/${turku.slug}`}
      className={`group flex min-w-0 items-center gap-4 overflow-hidden rounded-2xl border p-4 shadow-motif transition-all hover:-translate-y-0.5 ${sinif} bg-parsomen`}
    >
      <span className={`shrink-0 ${renk === "kilim" ? "text-kilim" : "text-cini"}`}>
        <StarMotif size={40} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide opacity-80">
          {etiket}
        </div>
        <div className="truncate font-serif text-lg font-semibold text-ceviz">
          {turku.baslik}
        </div>
        <div className="line-clamp-2 text-sm text-ceviz-light">
          {turku.yore} · {turku.ozet}
        </div>
      </div>
    </Link>
  );
}

export function GununTurkusu({ turkuler }: { turkuler: KartTurku[] }) {
  // Hydration uyuşmazlığını önlemek için tarihi istemcide hesapla.
  const [tohumlar, setTohumlar] = useState<{ gun: number; ay: number } | null>(
    null,
  );

  useEffect(() => {
    const now = new Date();
    const gun = Math.floor(now.getTime() / 86_400_000);
    const ay = now.getFullYear() * 12 + now.getMonth();
    setTohumlar({ gun, ay });
  }, []);

  if (!tohumlar) {
    return <div className="h-[92px]" aria-hidden />;
  }

  const gununku = secim(turkuler, tohumlar.gun);
  const ayinki = secim(turkuler, tohumlar.ay * 7 + 3); // ay için farklı dağılım
  if (!gununku || !ayinki) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <OneCikan etiket="Günün türküsü" turku={gununku} renk="kilim" />
      <OneCikan etiket="Ayın favorisi" turku={ayinki} renk="cini" />
    </div>
  );
}
