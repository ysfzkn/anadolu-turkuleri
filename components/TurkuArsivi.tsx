"use client";

import { useEffect, useMemo, useState } from "react";
import { TurkuCard, type KartTurku } from "./TurkuCard";
import { slugYap } from "@/lib/slug";

type ArsivTurku = KartTurku & { sozMetni?: string };

/** Yöre adını ("Muğla (Bodrum)" → "Muğla") ayıklar. */
function ilAdi(yore: string): string {
  return yore.split(/[(/]/)[0].trim();
}

function normalize(s: string): string {
  return slugYap(s).replace(/-/g, " ");
}

function AramaIkonu({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

export function TurkuArsivi({
  turkuler,
  yoreler,
  etiketler,
}: {
  turkuler: ArsivTurku[];
  yoreler: string[];
  etiketler: string[];
}) {
  const [arama, setArama] = useState("");
  const [seciliYore, setSeciliYore] = useState("");
  const [seciliEtiket, setSeciliEtiket] = useState<string | null>(null);
  const [temaAcik, setTemaAcik] = useState(false);
  const [limit, setLimit] = useState(30);

  const sonuclar = useMemo(() => {
    const q = normalize(arama.trim());
    return turkuler.filter((t) => {
      if (seciliYore && ilAdi(t.yore) !== seciliYore) return false;
      if (seciliEtiket && !(t.etiketler ?? []).includes(seciliEtiket))
        return false;
      if (q) {
        const havuz = normalize(
          `${t.baslik} ${t.yore} ${(t.etiketler ?? []).join(" ")} ${t.ozet} ${t.sozMetni ?? ""}`,
        );
        if (!havuz.includes(q)) return false;
      }
      return true;
    });
  }, [turkuler, arama, seciliYore, seciliEtiket]);

  useEffect(() => setLimit(30), [arama, seciliYore, seciliEtiket]);

  const filtreVar = arama || seciliYore || seciliEtiket;
  const gorunenTemalar = temaAcik ? etiketler : etiketler.slice(0, 10);

  function temizle() {
    setArama("");
    setSeciliYore("");
    setSeciliEtiket(null);
  }

  return (
    <div>
      {/* Arama */}
      <div className="relative">
        <AramaIkonu className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ceviz-light/60" />
        <input
          type="search"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Türkü, yöre, tema ya da söz ara…"
          className="w-full rounded-2xl border border-toprak/40 bg-parsomen py-3.5 pl-12 pr-4 text-ceviz shadow-sm placeholder:text-ceviz-light/60 focus:border-kilim focus:outline-none focus:ring-2 focus:ring-kilim/20"
        />
      </div>
      <p className="mt-1.5 px-1 text-xs text-ceviz-light/70">
        Arama şarkı sözlerinde de eşleşir.
      </p>

      {/* Filtre çubuğu */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Yöre seçimi */}
        <div className="relative">
          <select
            value={seciliYore}
            onChange={(e) => setSeciliYore(e.target.value)}
            className="appearance-none rounded-full border border-kilim/40 bg-kilim/5 py-1.5 pl-3.5 pr-9 text-sm font-medium text-kilim-dark focus:border-kilim focus:outline-none"
          >
            <option value="">Tüm yöreler</option>
            {yoreler.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-kilim-dark">
            ▾
          </span>
        </div>

        {/* Tema çipleri */}
        {gorunenTemalar.map((e) => (
          <button
            key={e}
            onClick={() => setSeciliEtiket(seciliEtiket === e ? null : e)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              seciliEtiket === e
                ? "border-cini bg-cini text-parsomen"
                : "border-cini/30 bg-cini/5 text-cini-dark hover:bg-cini/10"
            }`}
          >
            {e}
          </button>
        ))}
        {etiketler.length > 10 && (
          <button
            onClick={() => setTemaAcik((a) => !a)}
            className="rounded-full px-2 py-1.5 text-sm text-ceviz-light hover:text-kilim"
          >
            {temaAcik ? "− daha az" : `+${etiketler.length - 10} tema`}
          </button>
        )}
      </div>

      {/* Aktif filtreler + sonuç */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-toprak/20 pt-4">
        <span className="text-sm font-medium text-ceviz" aria-live="polite">
          {sonuclar.length} türkü
        </span>
        {seciliYore && (
          <FiltrePili etiket={seciliYore} onSil={() => setSeciliYore("")} />
        )}
        {seciliEtiket && (
          <FiltrePili
            etiket={seciliEtiket}
            onSil={() => setSeciliEtiket(null)}
          />
        )}
        {arama && (
          <FiltrePili etiket={`"${arama}"`} onSil={() => setArama("")} />
        )}
        {filtreVar && (
          <button
            onClick={temizle}
            className="ml-auto text-sm text-kilim hover:text-kilim-dark"
          >
            Tümünü temizle
          </button>
        )}
      </div>

      {/* Izgara */}
      <div className="mt-6">
        {sonuclar.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sonuclar.slice(0, limit).map((t) => (
              <TurkuCard key={t.slug} turku={t} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-toprak/30 bg-parsomen-dark/40 p-8 text-center text-ceviz-light">
            Aramanıza uygun türkü bulunamadı.
          </p>
        )}
        {sonuclar.length > limit && (
          <div className="mt-8 text-center">
            <button onClick={() => setLimit((deger) => deger + 30)} className="min-h-11 rounded-full border border-kilim/35 bg-white/45 px-6 text-sm font-semibold text-kilim transition hover:bg-kilim hover:text-white">
              30 türkü daha göster
            </button>
            <p className="mt-2 text-xs text-ceviz-light">{Math.min(limit, sonuclar.length)} / {sonuclar.length} kayıt gösteriliyor</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FiltrePili({ etiket, onSil }: { etiket: string; onSil: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-toprak/10 py-1 pl-3 pr-1.5 text-sm text-ceviz">
      {etiket}
      <button
        onClick={onSil}
        className="flex h-5 w-5 items-center justify-center rounded-full text-ceviz-light hover:bg-toprak/20 hover:text-kilim"
        aria-label="Kaldır"
      >
        ×
      </button>
    </span>
  );
}
