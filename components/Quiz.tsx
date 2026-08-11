"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface QuizTurku {
  slug: string;
  baslik: string;
  il: string;
}

const ROZETLER = [
  { esik: 3, ad: "Meraklı", ikon: "🌱" },
  { esik: 5, ad: "Türkü Dostu", ikon: "🎶" },
  { esik: 10, ad: "Yöre Ustası", ikon: "🪕" },
  { esik: 20, ad: "Türkü Ozanı", ikon: "⭐" },
];

function karistir<T>(dizi: T[]): T[] {
  const a = [...dizi];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Quiz({ turkuler }: { turkuler: QuizTurku[] }) {
  const iller = useMemo(
    () => Array.from(new Set(turkuler.map((t) => t.il))),
    [turkuler],
  );

  const [soru, setSoru] = useState<QuizTurku | null>(null);
  const [secenekler, setSecenekler] = useState<string[]>([]);
  const [secilen, setSecilen] = useState<string | null>(null);
  const [puan, setPuan] = useState(0);
  const [seri, setSeri] = useState(0);
  const [enIyiSeri, setEnIyiSeri] = useState(0);

  const yeniSoru = useCallback(() => {
    const t = turkuler[Math.floor(Math.random() * turkuler.length)];
    const yanlislar = karistir(iller.filter((i) => i !== t.il)).slice(0, 3);
    setSecenekler(karistir([t.il, ...yanlislar]));
    setSecilen(null);
    setSoru(t);
  }, [turkuler, iller]);

  useEffect(() => {
    const kayit = Number(
      typeof window !== "undefined"
        ? window.localStorage.getItem("quiz-en-iyi-seri")
        : 0,
    );
    if (!Number.isNaN(kayit)) setEnIyiSeri(kayit);
    yeniSoru();
  }, [yeniSoru]);

  function cevapla(il: string) {
    if (secilen || !soru) return;
    setSecilen(il);
    if (il === soru.il) {
      setPuan((p) => p + 1);
      setSeri((s) => {
        const yeni = s + 1;
        if (yeni > enIyiSeri) {
          setEnIyiSeri(yeni);
          window.localStorage.setItem("quiz-en-iyi-seri", String(yeni));
        }
        return yeni;
      });
    } else {
      setSeri(0);
    }
  }

  const kazanilanRozetler = ROZETLER.filter((r) => enIyiSeri >= r.esik);

  if (!soru) return <div className="h-64" aria-hidden />;

  return (
    <div className="mx-auto max-w-xl">
      {/* Skor */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-toprak/30 bg-parsomen p-4 text-center">
        <div className="flex-1">
          <div className="font-serif text-2xl font-semibold text-ceviz">{puan}</div>
          <div className="text-xs text-ceviz-light">Puan</div>
        </div>
        <div className="flex-1 border-x border-toprak/20">
          <div className="font-serif text-2xl font-semibold text-kilim">{seri}</div>
          <div className="text-xs text-ceviz-light">Seri</div>
        </div>
        <div className="flex-1">
          <div className="font-serif text-2xl font-semibold text-cini">{enIyiSeri}</div>
          <div className="text-xs text-ceviz-light">En iyi seri</div>
        </div>
      </div>

      {/* Soru */}
      <div className="rounded-2xl border border-toprak/30 bg-parsomen p-6 shadow-motif">
        <p className="mb-1 text-sm text-ceviz-light">Bu türkü hangi yöreye ait?</p>
        <h2 className="mb-5 font-serif text-2xl font-semibold text-ceviz">
          {soru.baslik}
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {secenekler.map((il) => {
            const cevaplandi = secilen !== null;
            const buDogru = il === soru.il;
            const buSecilen = il === secilen;
            let sinif =
              "border-toprak/40 bg-parsomen hover:border-kilim/50 hover:bg-kilim/5";
            if (cevaplandi) {
              if (buDogru) sinif = "border-cini bg-cini/10 text-cini-dark";
              else if (buSecilen) sinif = "border-kilim bg-kilim/10 text-kilim-dark";
              else sinif = "border-toprak/20 bg-parsomen opacity-60";
            }
            return (
              <button
                key={il}
                onClick={() => cevapla(il)}
                disabled={cevaplandi}
                className={`rounded-xl border px-4 py-3 text-left font-medium text-ceviz transition-colors ${sinif}`}
              >
                {il}
                {cevaplandi && buDogru && " ✓"}
                {cevaplandi && buSecilen && !buDogru && " ✗"}
              </button>
            );
          })}
        </div>

        {secilen !== null && (
          <div className="mt-5 flex items-center justify-between">
            <Link
              href={`/turku/${soru.slug}`}
              className="text-sm text-cini-dark underline hover:text-kilim"
            >
              {soru.baslik} hakkında oku →
            </Link>
            <button
              onClick={yeniSoru}
              className="rounded-xl bg-kilim px-5 py-2 text-sm font-medium text-parsomen transition-colors hover:bg-kilim-dark"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>

      {/* Rozetler */}
      <div className="mt-6">
        <h3 className="mb-2 text-sm font-medium text-ceviz-light">
          Rozetler {kazanilanRozetler.length}/{ROZETLER.length}
        </h3>
        <div className="flex flex-wrap gap-2">
          {ROZETLER.map((r) => {
            const acik = enIyiSeri >= r.esik;
            return (
              <span
                key={r.ad}
                title={`${r.esik} seri`}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                  acik
                    ? "border-toprak/50 bg-toprak/10 text-ceviz"
                    : "border-toprak/20 bg-parsomen text-ceviz-light/50"
                }`}
              >
                <span className={acik ? "" : "grayscale"}>{r.ikon}</span>
                {r.ad}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
