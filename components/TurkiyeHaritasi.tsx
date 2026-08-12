"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PLAKA_SLUG } from "@/lib/iller-plaka";

export interface HaritaIl {
  slug: string;
  ad: string;
  adet: number;
  basliklar: string[];
}

interface TooltipDurum {
  x: number;
  y: number;
  ad: string;
  adet: number;
  baslik?: string;
}

/**
 * İnteraktif Türkiye haritası. /turkey.svg (MIT, ali-han/Turkey-SVG-Map)
 * istemci tarafında enjekte edilir; türküsü olan iller vurgulanır, üzerine
 * gelince bilgi kartı çıkar, tıklanınca ilin türkülerine gidilir.
 */
export function TurkiyeHaritasi({
  iller,
  birimEtiketi = "türkü",
  bosEtiketi = "Yakında",
}: {
  iller: HaritaIl[];
  birimEtiketi?: string;
  bosEtiketi?: string;
}) {
  const kapsayici = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [yuklendi, setYuklendi] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipDurum | null>(null);

  const ilHaritasi = new Map(iller.map((i) => [i.slug, i]));

  useEffect(() => {
    let iptal = false;
    fetch("/turkey.svg")
      .then((r) => r.text())
      .then((svg) => {
        if (iptal || !kapsayici.current) return;
        kapsayici.current.innerHTML = svg;
        // Türküsü olan illeri işaretle
        const gruplar =
          kapsayici.current.querySelectorAll<SVGGElement>("g[data-city-code]");
        gruplar.forEach((g) => {
          const kod = g.getAttribute("data-city-code") ?? "";
          const slug = PLAKA_SLUG[kod];
          g.classList.add(slug && ilHaritasi.has(slug) ? "il-dolu" : "il-bos");
        });
        setYuklendi(true);
      })
      .catch(() => setYuklendi(true));
    return () => {
      iptal = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function ilBul(hedef: EventTarget | null): { slug: string; il?: HaritaIl } | null {
    const el = (hedef as Element)?.closest?.("g[data-city-code]");
    if (!el) return null;
    const kod = el.getAttribute("data-city-code") ?? "";
    const slug = PLAKA_SLUG[kod];
    if (!slug) return null;
    return { slug, il: ilHaritasi.get(slug) };
  }

  function onMove(e: React.MouseEvent) {
    const bulunan = ilBul(e.target);
    const kutu = kapsayici.current?.getBoundingClientRect();
    if (!bulunan || !kutu) {
      setTooltip(null);
      return;
    }
    const il = bulunan.il;
    // İl adını SVG'den al (boş iller için de isim gösterelim)
    const g = (e.target as Element).closest("g[data-city-code]");
    const ad = il?.ad ?? g?.getAttribute("data-city-name") ?? "";
    setTooltip({
      x: e.clientX - kutu.left,
      y: e.clientY - kutu.top,
      ad,
      adet: il?.adet ?? 0,
      baslik: il?.basliklar[0],
    });
  }

  function onClick(e: React.MouseEvent) {
    const bulunan = ilBul(e.target);
    if (bulunan?.il) router.push(`/yore/${bulunan.slug}`);
  }

  return (
    <div className="relative">
      <style>{`
        .harita svg { width: 100%; height: auto; display: block; }
        .harita path { transition: fill .25s ease, opacity .25s ease; }
        .harita .il-bos path {
          fill: #e7dcc4; stroke: #cdbb98; stroke-width: .4;
        }
        .harita .il-bos:hover path { fill: #dbcaa4; }
        .harita .il-dolu path {
          fill: #c14134; stroke: #761d16; stroke-width: .5;
          cursor: pointer;
        }
        .harita .il-dolu { animation: nabiz 2.8s ease-in-out infinite; transform-box: fill-box; }
        .harita .il-dolu:hover path { fill: #9c2b21; }
        @keyframes nabiz { 0%,100% { opacity:.85 } 50% { opacity:1 } }
        @media (prefers-reduced-motion: reduce) {
          .harita .il-dolu { animation: none; }
        }
      `}</style>

      <div
        ref={kapsayici}
        className={`harita transition-opacity duration-700 ${yuklendi ? "opacity-100" : "opacity-0"}`}
        onMouseMove={onMove}
        onMouseLeave={() => setTooltip(null)}
        onClick={onClick}
        role="img"
        aria-label="Türkiye türkü haritası"
      />

      {!yuklendi && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-kilim/30 border-t-kilim" />
        </div>
      )}

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[120%] rounded-xl border border-toprak/40 bg-parsomen px-3 py-2 text-sm shadow-motif"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-serif font-semibold text-ceviz">{tooltip.ad}</div>
          {tooltip.adet > 0 ? (
            <div className="text-xs text-kilim-dark">
              {tooltip.adet} {birimEtiketi}{tooltip.baslik ? ` · ${tooltip.baslik}` : ""}
            </div>
          ) : (
            <div className="text-xs text-ceviz-light">{bosEtiketi}</div>
          )}
        </div>
      )}
    </div>
  );
}
