/**
 * Anadolu motifleri — hafif, satır içi SVG'ler (harici görsel/istek yok).
 * Kilim ve çini geleneğinden sadeleştirilmiş geometrik desenler.
 */

/** Yatay tekrarlanabilir kilim kenarlığı. */
export function MotifBorder({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="100%"
      height="18"
      viewBox="0 0 120 18"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <pattern
          id="kilim-pattern"
          x="0"
          y="0"
          width="30"
          height="18"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 9 L7.5 1 L15 9 L22.5 1 L30 9" fill="none" stroke="#9c2b21" strokeWidth="1.5" />
          <path d="M0 9 L7.5 17 L15 9 L22.5 17 L30 9" fill="none" stroke="#1f5673" strokeWidth="1.5" />
          <circle cx="15" cy="9" r="1.6" fill="#c8873f" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="120" height="18" fill="url(#kilim-pattern)" />
    </svg>
  );
}

/** Sekizgen yıldız (Selçuklu/çini yıldızı) — rozet/ikon olarak. */
export function StarMotif({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <g fill="none" stroke="currentColor" strokeWidth="4">
        <polygon points="50,6 62,38 94,38 68,58 78,90 50,70 22,90 32,58 6,38 38,38" />
        <circle cx="50" cy="50" r="10" />
      </g>
    </svg>
  );
}

/** Köşe süsü — kartların üst köşesinde ince çini kıvrımı. */
export function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M2 54 C2 30 10 12 30 6 C22 18 20 30 26 40 C30 30 40 24 54 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="30" cy="6" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="54" cy="24" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
