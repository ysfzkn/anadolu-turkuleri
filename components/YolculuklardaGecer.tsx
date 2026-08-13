import Link from "next/link";
import type { YolculukRozeti } from "@/lib/yolculuklar-veri";

/**
 * "Bu varlık şu yolculuklarda geçiyor" çapraz bağlantısı. Entity sayfalarını
 * küratörlü yolculuklara bağlar. Rozet yoksa render edilmez.
 */
export function YolculuklardaGecer({
  baslik,
  rozetler,
}: {
  baslik: string;
  rozetler: YolculukRozeti[];
}) {
  if (rozetler.length === 0) return null;
  return (
    <section aria-label="İlgili yolculuklar" className="mb-8">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ceviz-light">{baslik}</h2>
      <div className="flex flex-wrap gap-2">
        {rozetler.map((r) => (
          <Link
            key={r.slug}
            href={`/yolculuk/${r.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-toprak/25 bg-parsomen px-3 py-1.5 text-sm text-ceviz shadow-sm transition hover:-translate-y-0.5 hover:border-kilim/50 hover:text-kilim-dark"
          >
            <span aria-hidden>{r.emoji}</span>
            {r.baslik}
          </Link>
        ))}
      </div>
    </section>
  );
}
