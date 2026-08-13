import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { temaBul, tumTemaSluglari, ROL_ETIKETI } from "@/lib/varliklar";
import { TEMA_ACIKLAMALARI } from "@/lib/tema-aciklamalari";
import { YoreTurkuListesi } from "@/components/YoreTurkuListesi";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";
import { KesifKaydedici } from "@/components/KesifKaydedici";
import { YolculuklardaGecer } from "@/components/YolculuklardaGecer";
import { yolculuklardaGecen } from "@/lib/yolculuklar-veri";
import { MotifBorder } from "@/components/Motif";

export function generateStaticParams() {
  return tumTemaSluglari().map((slug) => ({ slug }));
}

type TemaSayfasiProps = { params: Promise<{ slug: string }> };

const KOK = "https://anadoluturkuleri.com";

/** Başlıklarda kullanmak için ilk harfi Türkçe kurallarıyla büyütür. */
function baslikAdi(ad: string): string {
  return ad.charAt(0).toLocaleUpperCase("tr") + ad.slice(1);
}

function aciklama(slug: string, ad: string, adet: number): string {
  return (
    TEMA_ACIKLAMALARI[slug] ??
    `“${ad}”, Anadolu türkülerinde işlenen konulardan biridir. Aşağıda bu temayı taşıyan ${adet} türküyü hikâyeleri, yöreleri ve kaynaklarıyla keşfedebilirsiniz.`
  );
}

export async function generateMetadata({ params }: TemaSayfasiProps): Promise<Metadata> {
  const { slug } = await params;
  const tema = temaBul(slug);
  if (!tema) return { title: "Tema bulunamadı" };
  const ad = baslikAdi(tema.ad);
  return {
    title: `${ad} Türküleri ve Hikâyeleri`,
    description: aciklama(tema.slug, tema.ad, tema.adet).slice(0, 160),
    alternates: { canonical: `/tema/${tema.slug}` },
    keywords: [`${ad} türküleri`, `${ad} temalı türküler`, ad, "türkü hikâyeleri", "Anadolu halk müziği"],
    openGraph: { type: "website", url: `/tema/${tema.slug}`, title: `${ad} Türküleri ve Hikâyeleri`, description: aciklama(tema.slug, tema.ad, tema.adet).slice(0, 200), images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: `${ad} türküleri` }] },
    twitter: { card: "summary_large_image", title: `${ad} Türküleri`, description: `${ad} temalı ${tema.adet} türkü.`, images: ["/opengraph-image.png"] },
  };
}

export default async function TemaSayfasi({ params }: TemaSayfasiProps) {
  const { slug } = await params;
  const tema = temaBul(slug);
  if (!tema) notFound();
  const metin = aciklama(tema.slug, tema.ad, tema.adet);
  const ad = baslikAdi(tema.ad);
  const url = `${KOK}/tema/${tema.slug}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <KesifKaydedici tur="tema" anahtar={tema.slug} />
      <YapilandirilmisVeri veri={[
        { "@context": "https://schema.org", "@type": "CollectionPage", name: `${ad} Türküleri`, description: metin, url, inLanguage: "tr-TR", mainEntity: { "@type": "ItemList", numberOfItems: tema.adet, itemListElement: tema.turkuler.slice(0, 100).map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.baslik, url: `${KOK}/turku/${t.slug}` })) } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Temalar", item: `${KOK}/tema` }, { "@type": "ListItem", position: 2, name: `${ad} Türküleri`, item: url }] },
      ]} />

      <Link href="/tema" className="mb-6 inline-flex items-center gap-1 text-sm text-cini-dark hover:text-kilim">
        ← Tüm temalar
      </Link>

      <header className="mb-6">
        <p className="text-sm font-medium text-kilim">Tema</p>
        <h1 className="font-serif text-4xl font-semibold text-ceviz">{ad} Türküleri</h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-7 text-ceviz">{metin}</p>
        <p className="mt-2 text-sm text-ceviz-light">Bu temada arşivde {tema.adet} türkü bulunuyor.</p>
      </header>

      {(tema.yoreler.length > 0 || tema.kisiler.length > 0) && (
        <section className="mb-8 grid gap-4 rounded-3xl border border-toprak/25 bg-parsomen-dark/30 p-6 sm:grid-cols-2">
          {tema.yoreler.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ceviz-light">Öne çıkan yöreler</h2>
              <div className="flex flex-wrap gap-1.5">
                {tema.yoreler.slice(0, 10).map((y) => (
                  <Link key={y.slug} href={`/yore/${y.slug}`} className="inline-flex items-center rounded-full bg-cini/10 px-2.5 py-0.5 text-[13px] text-cini-dark transition hover:bg-cini hover:text-white">
                    {y.ad} <span className="ml-1 opacity-60">{y.adet}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {tema.kisiler.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ceviz-light">İlgili ozan ve derleyenler</h2>
              <div className="flex flex-wrap gap-1.5">
                {tema.kisiler.map((k) => (
                  <Link key={k.slug} href={`/kisi/${k.slug}`} className="inline-flex items-center rounded-full bg-toprak/10 px-2.5 py-0.5 text-[13px] text-ceviz transition hover:bg-toprak/20" title={k.roller.map((r) => ROL_ETIKETI[r]).join(" · ")}>
                    {k.ad}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <YolculuklardaGecer baslik="Bu tema şu yolculuklarda geçiyor" rozetler={yolculuklardaGecen("tema", tema.slug)} />

      <MotifBorder className="my-8 opacity-70" />

      <YoreTurkuListesi turkuler={tema.turkuler} />
    </div>
  );
}
