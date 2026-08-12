import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { kisiBul, tumKisiSluglari, ROL_ETIKETI } from "@/lib/varliklar";
import { OZAN_GORSELLERI } from "@/lib/ozan-gorselleri";
import { YoreTurkuListesi } from "@/components/YoreTurkuListesi";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";
import { KesifKaydedici } from "@/components/KesifKaydedici";
import { MotifBorder } from "@/components/Motif";

export function generateStaticParams() {
  return tumKisiSluglari().map((slug) => ({ slug }));
}

type KisiSayfasiProps = { params: Promise<{ slug: string }> };

const KOK = "https://anadoluturkuleri.com";

export async function generateMetadata({
  params,
}: KisiSayfasiProps): Promise<Metadata> {
  const { slug } = await params;
  const kisi = kisiBul(slug);
  if (!kisi) return { title: "Kişi bulunamadı" };
  const rol = ROL_ETIKETI[kisi.roller[0]];
  return {
    title: `${kisi.ad}: Türküleri ve Hikâyeleri`,
    description: `${kisi.ad} (${rol}) ile arşivdeki ${kisi.adet} türkü; yöreleri, temaları, sözleri ve hikâyeleriyle kaynaklı halk müziği arşivinde.`.slice(0, 160),
    alternates: { canonical: `/kisi/${kisi.slug}` },
    keywords: [kisi.ad, `${kisi.ad} türküleri`, `${kisi.ad} kimdir`, "ozan", "âşık", "türkü derleyeni"],
    openGraph: { type: "profile", url: `/kisi/${kisi.slug}`, title: `${kisi.ad}: Türküleri ve Hikâyeleri`, description: `${kisi.ad} ile arşivdeki ${kisi.adet} türkü.`, images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: kisi.ad }] },
    twitter: { card: "summary_large_image", title: kisi.ad, description: `${kisi.ad} ile arşivdeki ${kisi.adet} türkü.`, images: ["/opengraph-image.png"] },
  };
}

export default async function KisiSayfasi({ params }: KisiSayfasiProps) {
  const { slug } = await params;
  const kisi = kisiBul(slug);
  if (!kisi) notFound();
  const gorsel = OZAN_GORSELLERI[kisi.ad];
  const url = `${KOK}/kisi/${kisi.slug}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <KesifKaydedici tur="ozan" anahtar={kisi.slug} />
      <YapilandirilmisVeri veri={[
        { "@context": "https://schema.org", "@type": "Person", "@id": url, name: kisi.ad, url, description: `${ROL_ETIKETI[kisi.roller[0]]} — Anadolu Türküleri arşivinde ${kisi.adet} eser.`, image: gorsel?.src, knowsAbout: kisi.temalar.map((t) => t.ad), mainEntityOfPage: url },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Ozanlar", item: `${KOK}/kisi` }, { "@type": "ListItem", position: 2, name: kisi.ad, item: url }] },
      ]} />

      <Link href="/kisi" className="mb-6 inline-flex items-center gap-1 text-sm text-cini-dark hover:text-kilim">
        ← Tüm ozanlar ve derleyenler
      </Link>

      <header className="mb-8 sm:flex sm:items-start sm:gap-6">
        {gorsel && (
          <img
            src={gorsel.src}
            alt={gorsel.alt}
            loading="lazy"
            className="mb-4 h-32 w-32 shrink-0 rounded-2xl border border-toprak/25 object-cover object-[center_30%] shadow-motif sm:mb-0"
          />
        )}
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {kisi.roller.map((r) => (
              <span key={r} className="rounded-full bg-kilim/12 px-2.5 py-0.5 text-xs font-semibold text-kilim-dark">
                {ROL_ETIKETI[r]}
              </span>
            ))}
          </div>
          <h1 className="font-serif text-4xl font-semibold text-ceviz">{kisi.ad}</h1>
          <p className="mt-2 text-ceviz-light">
            Arşivde bu kişiyle ilişkili {kisi.adet} türkü bulunuyor.
          </p>
          {gorsel && (
            <p className="mt-1 text-xs text-ceviz-light/80">
              Görsel: {gorsel.lisans} ·{" "}
              <a href={gorsel.kaynak} target="_blank" rel="noopener noreferrer" className="underline hover:text-kilim">
                kaynak
              </a>
            </p>
          )}
        </div>
      </header>

      {(kisi.yoreler.length > 0 || kisi.temalar.length > 0) && (
        <section className="mb-8 grid gap-4 rounded-3xl border border-toprak/25 bg-parsomen-dark/30 p-6 sm:grid-cols-2">
          {kisi.yoreler.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ceviz-light">Yöreler</h2>
              <div className="flex flex-wrap gap-1.5">
                {kisi.yoreler.map((y) => (
                  <Link key={y.slug} href={`/yore/${y.slug}`} className="inline-flex items-center rounded-full bg-cini/10 px-2.5 py-0.5 text-[13px] text-cini-dark transition hover:bg-cini hover:text-white">
                    {y.ad} <span className="ml-1 opacity-60">{y.adet}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {kisi.temalar.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ceviz-light">Temalar</h2>
              <div className="flex flex-wrap gap-1.5">
                {kisi.temalar.slice(0, 12).map((t) => (
                  <Link key={t.slug} href={`/tema/${t.slug}`} className="inline-flex items-center rounded-full bg-toprak/10 px-2.5 py-0.5 text-[13px] text-ceviz transition hover:bg-toprak/20">
                    {t.ad}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <MotifBorder className="my-8 opacity-70" />

      <h2 className="mb-4 font-serif text-2xl font-semibold text-ceviz">Türküleri</h2>
      <YoreTurkuListesi turkuler={kisi.turkuler} />
    </div>
  );
}
