import Link from "next/link";
import type { Turku } from "@/lib/types";
import { CornerFlourish } from "./Motif";
import { slugYap } from "@/lib/slug";
import sehirGorselleri from "@/content/sehir-gorselleri.json";

/** Kart için gereken hafif alt küme (hikâye/sözler taşımaz). */
export type KartTurku = Pick<
  Turku,
  "slug" | "baslik" | "yore" | "ozet" | "etiketler"
>;

export function TurkuCard({ turku }: { turku: KartTurku }) {
  const il = turku.yore.split(/[(/]/)[0].trim();
  const gorsel = (sehirGorselleri as Record<string, { src: string; alt: string }>)[slugYap(il)];
  return (
    <Link
      href={`/turku/${turku.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-toprak/30 bg-parsomen shadow-motif transition-all hover:-translate-y-0.5 hover:border-kilim/50"
    >
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-ceviz to-cini-dark">
        {gorsel ? <img src={gorsel.src} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-95" /> : <><span className="absolute -right-5 -top-7 text-[8rem] text-toprak/20"><CornerFlourish /></span><span className="absolute bottom-3 left-4 text-xs font-semibold uppercase tracking-[.18em] text-parsomen/80">{il} ezgileri</span></>}
        <div className="absolute inset-0 bg-gradient-to-t from-ceviz/75 via-transparent to-transparent" />
      </div>
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
