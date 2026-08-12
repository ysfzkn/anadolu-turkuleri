import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { terimDetay, tumTerimSluglari } from "@/lib/sozluk";
import { YoreTurkuListesi } from "@/components/YoreTurkuListesi";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";
import { KesifKaydedici } from "@/components/KesifKaydedici";
import { MotifBorder } from "@/components/Motif";

export function generateStaticParams() {
  return tumTerimSluglari().map((slug) => ({ slug }));
}

type TerimSayfasiProps = { params: Promise<{ slug: string }> };

const KOK = "https://anadoluturkuleri.com";

export async function generateMetadata({ params }: TerimSayfasiProps): Promise<Metadata> {
  const { slug } = await params;
  const terim = terimDetay(slug);
  if (!terim) return { title: "Terim bulunamadı" };
  return {
    title: `${terim.terim} Nedir? Anlamı ve Türküleri`,
    description: `${terim.terim}: ${terim.kisaTanim} ${terim.turkuBaglami}`.slice(0, 160),
    alternates: { canonical: `/sozluk/${terim.slug}` },
    keywords: [`${terim.terim} nedir`, `${terim.terim} anlamı`, `${terim.terim} türküleri`, "halk müziği terimleri"],
    openGraph: { type: "article", url: `/sozluk/${terim.slug}`, title: `${terim.terim} Nedir? Anlamı ve Türküleri`, description: terim.kisaTanim, images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: terim.terim }] },
    twitter: { card: "summary_large_image", title: `${terim.terim} Nedir?`, description: terim.kisaTanim, images: ["/opengraph-image.png"] },
  };
}

export default async function TerimSayfasi({ params }: TerimSayfasiProps) {
  const { slug } = await params;
  const terim = terimDetay(slug);
  if (!terim) notFound();
  const url = `${KOK}/sozluk/${terim.slug}`;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <KesifKaydedici tur="terim" anahtar={terim.slug} />
      <YapilandirilmisVeri veri={[
        { "@context": "https://schema.org", "@type": "DefinedTerm", name: terim.terim, description: terim.kisaTanim, url, inLanguage: "tr-TR", inDefinedTermSet: { "@type": "DefinedTermSet", name: "Türkü Sözlüğü", url: `${KOK}/sozluk` } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Sözlük", item: `${KOK}/sozluk` }, { "@type": "ListItem", position: 2, name: terim.terim, item: url }] },
      ]} />

      <Link href="/sozluk" className="mb-6 inline-flex items-center gap-1 text-sm text-cini-dark hover:text-kilim">
        ← Sözlük
      </Link>

      <header className="mb-8">
        <p className="text-sm font-medium text-kilim">Sözlük</p>
        <h1 className="font-serif text-4xl font-semibold text-ceviz">{terim.terim}</h1>
        <p className="mt-2 text-[17px] text-ceviz-light">{terim.kisaTanim}</p>
      </header>

      <dl className="mb-8 space-y-5">
        <div className="rounded-2xl border border-toprak/25 bg-parsomen p-5">
          <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-kilim">Modern anlam</dt>
          <dd className="text-[17px] leading-7 text-ceviz">{terim.modernAnlam}</dd>
        </div>
        <div className="rounded-2xl border border-toprak/25 bg-parsomen-dark/30 p-5">
          <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-kilim">Türkü bağlamında</dt>
          <dd className="text-[17px] leading-7 text-ceviz">{terim.turkuBaglami}</dd>
        </div>
        {terim.kulturelYorum && (
          <div className="rounded-2xl border border-toprak/25 bg-parsomen p-5">
            <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-kilim">Kültürel yorum</dt>
            <dd className="text-[17px] leading-7 text-ceviz">{terim.kulturelYorum}</dd>
          </div>
        )}
      </dl>

      {terim.ilgiliTerimler.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ceviz-light">İlgili terimler</h2>
          <div className="flex flex-wrap gap-1.5">
            {terim.ilgiliTerimler.map((t) => (
              <Link key={t.slug} href={`/sozluk/${t.slug}`} className="inline-flex items-center rounded-full bg-toprak/10 px-3 py-1 text-sm text-ceviz transition hover:bg-toprak/20">
                {t.terim}
              </Link>
            ))}
          </div>
        </section>
      )}

      {terim.yoreler.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ceviz-light">Öne çıkan yöreler</h2>
          <div className="flex flex-wrap gap-1.5">
            {terim.yoreler.map((y) => (
              <Link key={y.slug} href={`/yore/${y.slug}`} className="inline-flex items-center rounded-full bg-cini/10 px-2.5 py-0.5 text-[13px] text-cini-dark transition hover:bg-cini hover:text-white">
                {y.ad} <span className="ml-1 opacity-60">{y.adet}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {terim.turkuler.length > 0 && (
        <>
          <MotifBorder className="my-8 opacity-70" />
          <h2 className="mb-4 font-serif text-2xl font-semibold text-ceviz">
            “{terim.terim}” geçen türküler
          </h2>
          <p className="mb-5 text-sm text-ceviz-light">
            Bu terim, aşağıdaki {terim.turkuler.length} türkünün metninde (söz, hikâye ya da özet) geçiyor.
          </p>
          <YoreTurkuListesi turkuler={terim.turkuler} />
        </>
      )}
    </article>
  );
}
