import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { turkuBul, tumSluglar } from "@/lib/data";
import { Sozler } from "@/components/Sozler";
import { CalimPanel } from "@/components/CalimPanel";
import { PlatformLinks } from "@/components/PlatformLinks";
import { ShareCard } from "@/components/ShareCard";
import { ListeyeEkle } from "@/components/ListeyeEkle";
import { DurumRozeti } from "@/components/DurumRozeti";
import { MotifBorder } from "@/components/Motif";

export function generateStaticParams() {
  return tumSluglar().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const turku = turkuBul(params.slug);
  if (!turku) return { title: "Türkü bulunamadı" };
  return {
    title: `${turku.baslik} (${turku.yore})`,
    description: turku.ozet,
    openGraph: { title: turku.baslik, description: turku.ozet },
  };
}

export default function TurkuSayfasi({
  params,
}: {
  params: { slug: string };
}) {
  const turku = turkuBul(params.slug);
  if (!turku) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-cini-dark hover:text-kilim"
      >
        ← Tüm türküler
      </Link>

      {/* Başlık */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-kilim">{turku.yore}</span>
          <DurumRozeti durum={turku.dogrulama} />
        </div>
        <h1 className="font-serif text-4xl font-semibold text-ceviz">
          {turku.baslik}
        </h1>
        {turku.digerAdlar && turku.digerAdlar.length > 0 && (
          <p className="mt-1 text-sm text-ceviz-light">
            Diğer adlar: {turku.digerAdlar.join(", ")}
          </p>
        )}
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ceviz-light">
          {turku.kaynakKisi && (
            <div>
              <dt className="inline font-medium text-ceviz">Kaynak kişi: </dt>
              <dd className="inline">{turku.kaynakKisi}</dd>
            </div>
          )}
          {turku.derleyen && (
            <div>
              <dt className="inline font-medium text-ceviz">Derleyen: </dt>
              <dd className="inline">{turku.derleyen}</dd>
            </div>
          )}
          {turku.ozan && (
            <div>
              <dt className="inline font-medium text-ceviz">Ozan: </dt>
              <dd className="inline">{turku.ozan}</dd>
            </div>
          )}
          {turku.sozYazari && (
            <div>
              <dt className="inline font-medium text-ceviz">Söz: </dt>
              <dd className="inline">{turku.sozYazari}</dd>
            </div>
          )}
        </dl>
      </header>

      {/* Dinle + Listeye ekle */}
      <section className="mb-8 flex flex-wrap items-center gap-3">
        <PlatformLinks baglantilar={turku.baglantilar} />
        <ListeyeEkle turkuSlug={turku.slug} />
      </section>

      {/* Hikâye */}
      <section className="mb-10">
        <h2 className="mb-3 font-serif text-2xl font-semibold text-ceviz">
          Hikâyesi
        </h2>
        <div className="hikaye text-[17px] text-ceviz">
          {turku.hikaye.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {(turku.sozler.length > 0 || turku.calim) && (
        <>
          <MotifBorder className="my-8 opacity-70" />

          {/* Sözler + Çalım */}
          <div className="grid gap-8 md:grid-cols-[1fr_280px]">
            {turku.sozler.length > 0 ? (
              <section>
                <h2 className="mb-4 font-serif text-2xl font-semibold text-ceviz">
                  Sözleri
                </h2>
                <Sozler sozler={turku.sozler} />
              </section>
            ) : (
              <section>
                <h2 className="mb-4 font-serif text-2xl font-semibold text-ceviz">
                  Sözleri
                </h2>
                <p className="text-sm italic text-ceviz-light">
                  {turku.sozYazari
                    ? "Bu türkünün sözleri bilinen bir söz yazarına ait olduğundan, telif durumu netleşene dek burada paylaşılmamaktadır."
                    : "Sözler editör doğrulamasından sonra eklenecektir."}{" "}
                  Dinlemek için yukarıdaki bağlantıları kullanabilirsiniz.
                </p>
              </section>
            )}
            {turku.calim && (
              <aside className="md:pt-14">
                <CalimPanel calim={turku.calim} />
              </aside>
            )}
          </div>
        </>
      )}

      <MotifBorder className="my-8 opacity-70" />

      {/* Paylaş */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-ceviz">
          Hikâyeyi paylaş
        </h2>
        <ShareCard turku={turku} />
      </section>

      {/* Kaynaklar */}
      {turku.kaynaklar.length > 0 && (
        <section className="rounded-2xl border border-toprak/30 bg-parsomen-dark/40 p-5">
          <h2 className="mb-2 font-serif text-lg font-semibold text-ceviz">
            Kaynaklar
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-ceviz-light">
            {turku.kaynaklar.map((k, i) => (
              <li key={i}>
                {k.url ? (
                  <a
                    href={k.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cini-dark underline hover:text-kilim"
                  >
                    {k.baslik}
                  </a>
                ) : (
                  k.baslik
                )}
                {k.tur ? ` · ${k.tur}` : ""}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ceviz-light/80">
            Bu türkü kaydı geleneksel/anonim kaynaklardan derlenmiştir ve editör
            doğrulaması sürecindedir.
          </p>
        </section>
      )}
    </article>
  );
}
