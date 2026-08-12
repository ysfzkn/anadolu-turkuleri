import Link from "next/link";
import type { Turku } from "@/lib/types";
import { ilSlug } from "@/lib/data";

/**
 * Varyantlar bölümü — iki dürüst kaynaktan beslenir:
 *  1) Editör tarafından girilmiş `varyantlar` (varsa) — karşılaştırmalı kartlar.
 *  2) Arşivde aynı adı taşıyan diğer yöre kayıtları — çoğu zaman aynı türkünün
 *     yöresel varyantları. Bu ilişki uydurulmaz; yalnızca gerçek kayıtlardan
 *     türetilir ve öyle etiketlenir.
 * Hiçbiri yoksa bölüm render edilmez.
 */
export function Varyantlar({
  turku,
  digerKayitlar,
}: {
  turku: Turku;
  digerKayitlar: Turku[];
}) {
  const editorVaryantlari = turku.varyantlar ?? [];
  if (editorVaryantlari.length === 0 && digerKayitlar.length === 0) return null;

  return (
    <section aria-labelledby="varyant-baslik" className="mb-10">
      <h2 id="varyant-baslik" className="mb-1 font-serif text-2xl font-semibold text-ceviz">
        Varyantlar
      </h2>
      <p className="mb-4 text-sm text-ceviz-light">
        Türküler yöreden yöreye söz ve ezgi farklarıyla dolaşır. Bu türkünün bilinen varyantları ve
        arşivdeki diğer yöre kayıtları aşağıdadır.
      </p>

      {editorVaryantlari.length > 0 && (
        <ul className="mb-5 grid gap-3 sm:grid-cols-2">
          {editorVaryantlari.map((v, i) => (
            <li key={i} className="rounded-2xl border border-toprak/25 bg-parsomen p-4">
              <div className="mb-1 text-xs font-medium text-kilim">{v.yore ?? "Yöre belirtilmemiş"}</div>
              <div className="font-serif text-lg font-semibold text-ceviz">{v.baslik ?? turku.baslik}</div>
              <dl className="mt-2 space-y-0.5 text-sm text-ceviz-light">
                {v.kaynakKisi && <div><dt className="inline font-medium text-ceviz">Kaynak kişi: </dt><dd className="inline">{v.kaynakKisi}</dd></div>}
                {v.derleyen && <div><dt className="inline font-medium text-ceviz">Derleyen: </dt><dd className="inline">{v.derleyen}</dd></div>}
              </dl>
              {v.farklar && <p className="mt-2 text-sm text-ceviz">{v.farklar}</p>}
              {v.notlar && <p className="mt-1 text-xs text-ceviz-light">{v.notlar}</p>}
              {v.kayit && (
                <a href={v.kayit} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-cini-dark underline hover:text-kilim">
                  Kaydı dinle →
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {digerKayitlar.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ceviz-light">
            Arşivde aynı adı taşıyan diğer yöre kayıtları
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {digerKayitlar.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/turku/${t.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-toprak/25 bg-parsomen p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-kilim/50"
                >
                  <span className="min-w-0">
                    <span className="block font-serif text-lg font-semibold text-ceviz group-hover:text-kilim-dark">{t.baslik}</span>
                    <span className="text-xs text-kilim">{t.yore}</span>
                  </span>
                  <span aria-hidden className="shrink-0 text-lg text-kilim transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ceviz-light/80">
            Aynı adı taşıyan bu kayıtlar çoğu zaman aynı türkünün yöresel varyantlarıdır; söz ve ezgi
            farkları için kayıtları karşılaştırabilirsiniz.
          </p>
        </div>
      )}
    </section>
  );
}
