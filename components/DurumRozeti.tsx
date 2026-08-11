import type { DogrulamaDurumu } from "@/lib/types";

const HARITA: Record<
  DogrulamaDurumu,
  { etiket: string; sinif: string }
> = {
  taslak: {
    etiket: "Taslak · doğrulanmadı",
    sinif: "bg-toprak/15 text-toprak-dark border-toprak/40",
  },
  incelemede: {
    etiket: "İncelemede",
    sinif: "bg-cini/10 text-cini-dark border-cini/40",
  },
  dogrulandi: {
    etiket: "Doğrulandı",
    sinif: "bg-cini/10 text-cini border-cini/40",
  },
};

export function DurumRozeti({ durum }: { durum: DogrulamaDurumu }) {
  const { etiket, sinif } = HARITA[durum];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${sinif}`}
    >
      {etiket}
    </span>
  );
}
