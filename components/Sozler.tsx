import type { Kita } from "@/lib/types";

export function Sozler({ sozler }: { sozler: Kita[] }) {
  return (
    <div className="space-y-6">
      {sozler.map((kita, i) => (
        <div
          key={i}
          className={
            kita.tur === "nakarat"
              ? "border-l-4 border-toprak pl-4 italic text-ceviz-light"
              : "border-l-4 border-transparent pl-4"
          }
        >
          {kita.tur === "nakarat" && (
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-toprak-dark">
              Nakarat
            </span>
          )}
          {kita.satirlar.map((satir, j) => (
            <p key={j} className="sozler-satir font-serif text-lg leading-relaxed">
              {satir}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
