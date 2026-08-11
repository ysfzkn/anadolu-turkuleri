import type { Bolge } from "@/lib/yore-bolge";

/**
 * Yöreye (bölgeye) göre değişen, tekrarlanan kilim motif şeridi.
 * Her bölge kendi geometrik desenini taşır (satır içi SVG, hafif).
 */

const KILIM = "#9c2b21";
const CINI = "#1f5673";
const TOPRAK = "#c8873f";

function tile(bolge: Bolge): { w: number; el: React.ReactNode } {
  switch (bolge) {
    case "marmara": // deniz dalgası
      return {
        w: 24,
        el: (
          <path
            d="M0 12 q6 -9 12 0 t12 0"
            fill="none"
            stroke={CINI}
            strokeWidth="1.6"
          />
        ),
      };
    case "ege": // zeybek zikzağı
      return {
        w: 20,
        el: (
          <path
            d="M0 15 L10 5 L20 15"
            fill="none"
            stroke={KILIM}
            strokeWidth="1.6"
          />
        ),
      };
    case "akdeniz": // güneş üçgenleri
      return { w: 20, el: <polygon points="10,4 16,16 4,16" fill={TOPRAK} /> };
    case "ic-anadolu": // bozkır baklavası
      return {
        w: 20,
        el: (
          <path
            d="M10 3 L17 10 L10 17 L3 10 Z"
            fill="none"
            stroke={KILIM}
            strokeWidth="1.6"
          />
        ),
      };
    case "karadeniz": // horon kancası
      return {
        w: 20,
        el: (
          <path
            d="M2 17 q7 0 7 -7 q0 -7 7 -7"
            fill="none"
            stroke={CINI}
            strokeWidth="1.6"
          />
        ),
      };
    case "dogu": // sekiz köşeli yıldız
      return {
        w: 22,
        el: (
          <polygon
            points="11,3 13,9 19,9 14,13 16,19 11,15 6,19 8,13 3,9 9,9"
            fill={KILIM}
          />
        ),
      };
    case "guneydogu": // kafes
      return {
        w: 14,
        el: (
          <path
            d="M0 0 L14 14 M14 0 L0 14"
            fill="none"
            stroke={TOPRAK}
            strokeWidth="1.3"
          />
        ),
      };
  }
}

export function YoreMotifi({
  bolge,
  il = "",
  className = "",
}: {
  bolge: Bolge;
  /** Desenin şehir bazında tutarlı fakat dekoratif varyasyon üretmesini sağlar. */
  il?: string;
  className?: string;
}) {
  const { w, el } = tile(bolge);
  const imza = Array.from(il).reduce((toplam, harf) => toplam + harf.charCodeAt(0), 0);
  const id = `motif-${bolge}-${imza}`;
  return (
    <svg
      width="100%"
      height="20"
      className={className}
      aria-hidden
      role="presentation"
    >
      <defs>
        <pattern
          id={id}
          x="0"
          y="0"
          width={w}
          height="20"
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${imza % Math.max(w, 1)} 0)`}
        >
          {el}
        </pattern>
      </defs>
      <rect width="100%" height="20" fill={`url(#${id})`} />
    </svg>
  );
}
