"use client";

import { useMemo, useState } from "react";
import { TurkuCard, type KartTurku } from "./TurkuCard";
import { slugYap } from "@/lib/slug";

/** Yöre adını ("Muğla (Bodrum)" → "Muğla") ayıklar. */
function ilAdi(yore: string): string {
  return yore.split(/[(/]/)[0].trim();
}

function normalize(s: string): string {
  return slugYap(s).replace(/-/g, " ");
}

export function TurkuArsivi({
  turkuler,
  yoreler,
  etiketler,
}: {
  turkuler: KartTurku[];
  yoreler: string[];
  etiketler: string[];
}) {
  const [arama, setArama] = useState("");
  const [seciliYore, setSeciliYore] = useState<string | null>(null);
  const [seciliEtiket, setSeciliEtiket] = useState<string | null>(null);

  const sonuclar = useMemo(() => {
    const q = normalize(arama.trim());
    return turkuler.filter((t) => {
      if (seciliYore && ilAdi(t.yore) !== seciliYore) return false;
      if (seciliEtiket && !(t.etiketler ?? []).includes(seciliEtiket))
        return false;
      if (q) {
        const havuz = normalize(
          `${t.baslik} ${t.yore} ${(t.etiketler ?? []).join(" ")} ${t.ozet}`,
        );
        if (!havuz.includes(q)) return false;
      }
      return true;
    });
  }, [turkuler, arama, seciliYore, seciliEtiket]);

  const filtreVar = arama || seciliYore || seciliEtiket;

  return (
    <div>
      {/* Arama */}
      <div className="mb-4">
        <input
          type="search"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Türkü, yöre ya da tema ara…"
          className="w-full rounded-xl border border-toprak/40 bg-parsomen px-4 py-3 text-ceviz placeholder:text-ceviz-light/60 focus:border-kilim focus:outline-none focus:ring-2 focus:ring-kilim/20"
        />
      </div>

      {/* Filtreler */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium uppercase tracking-wide text-cini-dark/70">
            Yöre
          </span>
          {yoreler.map((y) => (
            <button
              key={y}
              onClick={() => setSeciliYore(seciliYore === y ? null : y)}
              className={`rounded-full border px-2.5 py-0.5 text-sm transition-colors ${
                seciliYore === y
                  ? "border-kilim bg-kilim text-parsomen"
                  : "border-kilim/30 bg-kilim/5 text-kilim-dark hover:bg-kilim/10"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium uppercase tracking-wide text-cini-dark/70">
            Tema
          </span>
          {etiketler.map((e) => (
            <button
              key={e}
              onClick={() => setSeciliEtiket(seciliEtiket === e ? null : e)}
              className={`rounded-full border px-2.5 py-0.5 text-sm transition-colors ${
                seciliEtiket === e
                  ? "border-cini bg-cini text-parsomen"
                  : "border-cini/30 bg-cini/5 text-cini-dark hover:bg-cini/10"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Sonuç başlığı */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-ceviz-light">
          {sonuclar.length} türkü
        </span>
        {filtreVar && (
          <button
            onClick={() => {
              setArama("");
              setSeciliYore(null);
              setSeciliEtiket(null);
            }}
            className="text-sm text-kilim hover:text-kilim-dark"
          >
            Filtreleri temizle
          </button>
        )}
      </div>

      {/* Izgara */}
      {sonuclar.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sonuclar.map((t) => (
            <TurkuCard key={t.slug} turku={t} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-toprak/30 bg-parsomen-dark/40 p-8 text-center text-ceviz-light">
          Aramanıza uygun türkü bulunamadı.
        </p>
      )}
    </div>
  );
}
