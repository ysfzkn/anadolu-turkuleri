"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BAGLANTILAR = [
  { href: "/", etiket: "Türküler" },
  { href: "/quiz", etiket: "Oyunlar" },
  { href: "/soy-agaci", etiket: "Soy Ağacı" },
  { href: "/hakkinda", etiket: "Hakkında" },
];

export function AnaNavigasyon() {
  const pathname = usePathname();
  const [acik, setAcik] = useState(false);
  const kapsayici = useRef<HTMLDivElement>(null);

  useEffect(() => setAcik(false), [pathname]);
  useEffect(() => {
    function disTiklama(event: MouseEvent) {
      if (!kapsayici.current?.contains(event.target as Node)) setAcik(false);
    }
    document.addEventListener("mousedown", disTiklama);
    return () => document.removeEventListener("mousedown", disTiklama);
  }, []);
  useEffect(() => {
    function klavye(event: KeyboardEvent) {
      if (event.key === "Escape") setAcik(false);
    }
    document.addEventListener("keydown", klavye);
    return () => document.removeEventListener("keydown", klavye);
  }, []);

  return (
    <div ref={kapsayici} className="relative">
      <nav className="hidden items-center rounded-full border border-toprak/20 bg-white/45 p-1 text-sm font-medium shadow-sm backdrop-blur md:flex" aria-label="Ana menü">
        {BAGLANTILAR.map((baglanti) => {
          const aktif = baglanti.href === "/" ? pathname === "/" : pathname.startsWith(baglanti.href);
          return (
            <Link key={baglanti.href} href={baglanti.href} className={`rounded-full px-4 py-2 transition ${aktif ? "bg-parsomen text-kilim shadow-sm" : "text-ceviz-light hover:bg-white/70 hover:text-ceviz"}`}>
              {baglanti.etiket}
            </Link>
          );
        })}
      </nav>

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

      {acik && (
        <nav id="mobil-ana-menu" className="absolute right-0 z-40 mt-3 w-48 rounded-2xl border border-toprak/25 bg-parsomen p-2 shadow-[0_18px_50px_rgba(75,45,25,0.18)] md:hidden" aria-label="Mobil menü">
          {BAGLANTILAR.map((baglanti) => (
            <Link key={baglanti.href} href={baglanti.href} aria-current={(baglanti.href === "/" ? pathname === "/" : pathname.startsWith(baglanti.href)) ? "page" : undefined} className="block min-h-11 rounded-xl px-4 py-3 text-sm font-semibold text-ceviz transition hover:bg-toprak/8 aria-[current=page]:bg-toprak/10 aria-[current=page]:text-kilim">
              {baglanti.etiket}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
