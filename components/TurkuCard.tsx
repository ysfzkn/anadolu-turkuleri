import Link from "next/link";
import type { Turku } from "@/lib/types";
import { CornerFlourish } from "./Motif";

export function TurkuCard({ turku }: { turku: Turku }) {
  return (
    <Link
      href={`/turku/${turku.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-toprak/30 bg-parsomen shadow-motif transition-all hover:-translate-y-0.5 hover:border-kilim/50"
    >
      <span className="pointer-events-none absolute right-2 top-2 text-cini/25">
        <CornerFlourish />
      </span>
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-kilim">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-kilim" />
          {turku.yore}
        </div>
        <h3 className="font-serif text-xl font-semibold text-ceviz group-hover:text-kilim-dark transition-colors">
          {turku.baslik}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ceviz-light">{turku.ozet}</p>
        {turku.etiketler && turku.etiketler.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {turku.etiketler.slice(0, 3).map((e) => (
              <span
                key={e}
                className="rounded-full bg-cini/10 px-2 py-0.5 text-[11px] text-cini-dark"
              >
                {e}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
