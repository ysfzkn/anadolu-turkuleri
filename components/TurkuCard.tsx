import Link from "next/link";
import type { Turku } from "@/lib/types";
import { OZAN_GORSELLERI } from "@/lib/ozan-gorselleri";

/** Kart için gereken hafif alt küme (hikâye/sözler taşımaz). */
export type KartTurku = Pick<
  Turku,
  "slug" | "baslik" | "yore" | "ozet" | "etiketler" | "ozan" | "sozYazari"
>;

const RENKLER = [
  ["#2f493e", "#b36a43"],
  ["#163f59", "#c39143"],
  ["#542f27", "#bb5846"],
  ["#3d3557", "#af7950"],
  ["#304f57", "#7f9a6b"],
  ["#6a3d36", "#d09958"],
] as const;
const SIMGELER = ["◇", "✦", "≈", "△", "✧", "⌁"];

function kartKimligi(slug: string) {
  const sayi = Array.from(slug).reduce((toplam, harf) => toplam + harf.charCodeAt(0), 0);
  return { renk: RENKLER[sayi % RENKLER.length], simge: SIMGELER[sayi % SIMGELER.length] };
}

export function TurkuCard({ turku }: { turku: KartTurku }) {
  const il = turku.yore.split(/[(/]/)[0].trim();
  const ozanAdi = turku.ozan ?? turku.sozYazari;
  const ozan = ozanAdi ? OZAN_GORSELLERI[ozanAdi] : undefined;
  const kimlik = kartKimligi(turku.slug);
  return (
    <Link
      href={`/turku/${turku.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-toprak/30 bg-parsomen shadow-motif transition-all hover:-translate-y-0.5 hover:border-kilim/50"
    >
      <div className="relative h-28 overflow-hidden" style={{ background: `linear-gradient(125deg, ${kimlik.renk[0]}, ${kimlik.renk[1]})` }}>
        {ozan ? (
          <img src={ozan.src} alt="" loading="lazy" className="h-full w-full object-cover object-[center_35%] opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-90" />
        ) : (
          <>
            <span className="absolute -right-4 -top-12 select-none font-serif text-[10rem] leading-none text-white/15 transition-transform duration-500 group-hover:rotate-6" aria-hidden>{kimlik.simge}</span>
            <span className="absolute left-5 top-4 h-10 w-10 rotate-45 border border-white/25" aria-hidden><span className="absolute inset-2 border border-white/20" /></span>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ceviz/75 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-4 text-xs font-semibold uppercase tracking-[.18em] text-white/90">{ozan ? ozanAdi : `${il} ezgileri`}</span>
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
