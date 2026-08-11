import type { PlatformBaglantisi } from "@/lib/types";

const ETIKET: Record<PlatformBaglantisi["platform"], string> = {
  youtube: "YouTube'da dinle",
  spotify: "Spotify'da dinle",
  "apple-music": "Apple Music",
  diger: "Dinle",
};

const RENK: Record<PlatformBaglantisi["platform"], string> = {
  youtube: "border-kilim/40 text-kilim-dark hover:bg-kilim hover:text-parsomen",
  spotify: "border-cini/40 text-cini-dark hover:bg-cini hover:text-parsomen",
  "apple-music": "border-ceviz/30 text-ceviz hover:bg-ceviz hover:text-parsomen",
  diger: "border-toprak/40 text-toprak-dark hover:bg-toprak hover:text-parsomen",
};

export function PlatformLinks({
  baglantilar,
}: {
  baglantilar: PlatformBaglantisi[];
}) {
  if (!baglantilar.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {baglantilar.map((b, i) => (
        <a
          key={i}
          href={b.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${RENK[b.platform]}`}
        >
          {ETIKET[b.platform]}
          {b.icra ? ` · ${b.icra}` : ""}
          {!b.dogrulandi && (
            <span className="text-[10px] opacity-70">(arama)</span>
          )}
        </a>
      ))}
    </div>
  );
}
