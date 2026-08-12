import type { BenzerTurku } from "@/lib/varliklar";
import { KesifLink } from "./KesifLink";

/**
 * "Bu türküyü sevdiysen…" — ağırlıklı benzerlik motorunun sonuçlarını, neden
 * önerildiklerini şeffaf biçimde açıklayarak gösterir.
 */
export function BenzerTurkuler({
  kaynakSlug,
  oneriler,
}: {
  kaynakSlug: string;
  oneriler: BenzerTurku[];
}) {
  if (oneriler.length === 0) return null;
  return (
    <section aria-labelledby="benzer-baslik" className="mb-10">
      <h2
        id="benzer-baslik"
        className="mb-4 font-serif text-2xl font-semibold text-ceviz"
      >
        Bu türküyü sevdiysen…
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {oneriler.map(({ turku, nedenler }) => (
          <li key={turku.slug}>
            <KesifLink
              href={`/turku/${turku.slug}`}
              olay="related_turku_click"
              ozellikler={{
                kaynak_slug: kaynakSlug,
                hedef_slug: turku.slug,
                recommendation_source: "benzerlik-motoru",
              }}
              className="group block h-full rounded-2xl border border-toprak/25 bg-parsomen p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-kilim/50"
            >
              <div className="mb-1 text-xs font-medium text-kilim">
                {turku.yore}
              </div>
              <div className="font-serif text-lg font-semibold text-ceviz group-hover:text-kilim-dark">
                {turku.baslik}
              </div>
              {nedenler.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {nedenler.map((neden) => (
                    <span
                      key={neden}
                      className="rounded-full bg-cini/10 px-2 py-0.5 text-[11px] text-cini-dark"
                    >
                      {neden}
                    </span>
                  ))}
                </div>
              )}
            </KesifLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
