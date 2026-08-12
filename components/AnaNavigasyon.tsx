"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Baglanti = { href: string; etiket: string };
type Oge = Baglanti | { etiket: string; cocuklar: Baglanti[] };

const OGELER: Oge[] = [
  { href: "/", etiket: "Türküler" },
  {
    etiket: "Keşfet",
    cocuklar: [
      { href: "/rehber", etiket: "Anadolu Rehberi" },
      { href: "/yolculuklar", etiket: "Yolculuklar" },
      { href: "/kisi", etiket: "Ozanlar" },
      { href: "/tema", etiket: "Temalar" },
      { href: "/sozluk", etiket: "Sözlük" },
      { href: "/soy-agaci", etiket: "Soy Ağacı" },
    ],
  },
  { href: "/quiz", etiket: "Oyunlar" },
  { href: "/kultur-rotalari", etiket: "Rotalar" },
  { href: "/hakkinda", etiket: "Hakkında" },
];

function aktifMi(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AnaNavigasyon() {
  const pathname = usePathname();
  const [acik, setAcik] = useState(false); // mobil menü
  const [kesfetAcik, setKesfetAcik] = useState(false); // masaüstü "Keşfet"
  const kapsayici = useRef<HTMLDivElement>(null);
  const kesfetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAcik(false);
    setKesfetAcik(false);
  }, [pathname]);

  useEffect(() => {
    function disTiklama(event: MouseEvent) {
      if (!kapsayici.current?.contains(event.target as Node)) setAcik(false);
      if (!kesfetRef.current?.contains(event.target as Node)) setKesfetAcik(false);
    }
    function klavye(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAcik(false);
        setKesfetAcik(false);
      }
    }
    document.addEventListener("mousedown", disTiklama);
    document.addEventListener("keydown", klavye);
    return () => {
      document.removeEventListener("mousedown", disTiklama);
      document.removeEventListener("keydown", klavye);
    };
  }, []);

  return (
    <div ref={kapsayici} className="relative">
      {/* Masaüstü */}
      <nav className="hidden items-center rounded-full border border-toprak/20 bg-white/45 p-1 text-sm font-medium shadow-sm backdrop-blur md:flex" aria-label="Ana menü">
        {OGELER.map((oge) => {
          if ("href" in oge) {
            const aktif = aktifMi(pathname, oge.href);
            return (
              <Link key={oge.href} href={oge.href} className={`rounded-full px-4 py-2 transition ${aktif ? "bg-parsomen text-kilim shadow-sm" : "text-ceviz-light hover:bg-white/70 hover:text-ceviz"}`}>
                {oge.etiket}
              </Link>
            );
          }
          const grupAktif = oge.cocuklar.some((c) => aktifMi(pathname, c.href));
          return (
            <div key={oge.etiket} ref={kesfetRef} className="relative">
              <button
                type="button"
                onClick={() => setKesfetAcik((d) => !d)}
                aria-haspopup="menu"
                aria-expanded={kesfetAcik}
                className={`flex items-center gap-1 rounded-full px-4 py-2 transition ${grupAktif ? "bg-parsomen text-kilim shadow-sm" : "text-ceviz-light hover:bg-white/70 hover:text-ceviz"}`}
              >
                {oge.etiket}
                <svg className={`h-3.5 w-3.5 transition ${kesfetAcik ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </button>
              {kesfetAcik && (
                <div role="menu" className="absolute left-0 z-50 mt-2 w-48 rounded-2xl border border-toprak/25 bg-parsomen p-2 shadow-[0_18px_50px_rgba(75,45,25,0.18)]">
                  {oge.cocuklar.map((c) => (
                    <Link key={c.href} href={c.href} role="menuitem" aria-current={aktifMi(pathname, c.href) ? "page" : undefined} className="block min-h-10 rounded-xl px-3 py-2 text-sm font-semibold text-ceviz transition hover:bg-toprak/8 aria-[current=page]:bg-toprak/10 aria-[current=page]:text-kilim">
                      {c.etiket}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Mobil aç/kapa */}
      <button
        type="button"
        onClick={() => setAcik((deger) => !deger)}
        aria-label={acik ? "Menüyü kapat" : "Menüyü aç"}
        aria-controls="mobil-ana-menu"
        aria-expanded={acik}
        className="grid h-11 w-11 place-items-center rounded-full border border-toprak/25 bg-white/60 text-ceviz shadow-sm md:hidden"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          {acik ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {/* Mobil menü */}
      {acik && (
        <nav id="mobil-ana-menu" className="absolute right-0 z-40 mt-3 w-56 rounded-2xl border border-toprak/25 bg-parsomen p-2 shadow-[0_18px_50px_rgba(75,45,25,0.18)] md:hidden" aria-label="Mobil menü">
          {OGELER.map((oge) => {
            if ("href" in oge) {
              return (
                <Link key={oge.href} href={oge.href} aria-current={aktifMi(pathname, oge.href) ? "page" : undefined} className="block min-h-11 rounded-xl px-4 py-3 text-sm font-semibold text-ceviz transition hover:bg-toprak/8 aria-[current=page]:bg-toprak/10 aria-[current=page]:text-kilim">
                  {oge.etiket}
                </Link>
              );
            }
            return (
              <div key={oge.etiket} className="mt-1">
                <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ceviz-light">{oge.etiket}</div>
                {oge.cocuklar.map((c) => (
                  <Link key={c.href} href={c.href} aria-current={aktifMi(pathname, c.href) ? "page" : undefined} className="block min-h-11 rounded-xl px-4 py-3 text-sm font-semibold text-ceviz transition hover:bg-toprak/8 aria-[current=page]:bg-toprak/10 aria-[current=page]:text-kilim">
                    {c.etiket}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>
      )}
    </div>
  );
}
