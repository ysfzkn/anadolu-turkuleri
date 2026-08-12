import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { yolculukBul, tumYolculukSluglari } from "@/lib/yolculuklar";
import { YolculukAdimlari } from "@/components/YolculukAdimlari";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";

export function generateStaticParams() {
  return tumYolculukSluglari().map((slug) => ({ slug }));
}

type YolculukSayfasiProps = { params: Promise<{ slug: string }> };

const KOK = "https://anadoluturkuleri.com";

export async function generateMetadata({ params }: YolculukSayfasiProps): Promise<Metadata> {
  const { slug } = await params;
  const y = yolculukBul(slug);
  if (!y) return { title: "Yolculuk bulunamadı" };
  return {
    title: `${y.baslik} — Türkü Yolculuğu`,
    description: y.aciklama,
    alternates: { canonical: `/yolculuk/${y.slug}` },
    keywords: [y.baslik, "türkü yolculuğu", "Anadolu kültürü", "kültür keşfi"],
    openGraph: { type: "website", url: `/yolculuk/${y.slug}`, title: `${y.baslik} — Türkü Yolculuğu`, description: y.aciklama, images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: y.baslik }] },
    twitter: { card: "summary_large_image", title: y.baslik, description: y.aciklama, images: ["/opengraph-image.png"] },
  };
}

export default async function YolculukSayfasi({ params }: YolculukSayfasiProps) {
  const { slug } = await params;
  const y = yolculukBul(slug);
  if (!y) notFound();
  const url = `${KOK}/yolculuk/${y.slug}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <YapilandirilmisVeri veri={[
        { "@context": "https://schema.org", "@type": "Course", name: y.baslik, description: y.aciklama, url, inLanguage: "tr-TR", provider: { "@type": "Organization", name: "Anadolu Türküleri", url: KOK }, hasPart: y.adimlar.map((a) => ({ "@type": "ListItem", name: a.baslik })) },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Yolculuklar", item: `${KOK}/yolculuklar` }, { "@type": "ListItem", position: 2, name: y.baslik, item: url }] },
      ]} />

      <Link href="/yolculuklar" className="mb-6 inline-flex items-center gap-1 text-sm text-cini-dark hover:text-kilim">
        ← Tüm yolculuklar
      </Link>

      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-parsomen-dark text-3xl" aria-hidden>{y.emoji}</span>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-toprak/10 px-2.5 py-0.5 text-ceviz">{y.seviye}</span>
            <span className="rounded-full bg-toprak/10 px-2.5 py-0.5 text-ceviz">{y.adimlar.length} adım</span>
            <span className="rounded-full bg-toprak/10 px-2.5 py-0.5 text-ceviz">~{y.tahminiDakika} dk</span>
          </div>
        </div>
        <h1 className="font-serif text-4xl font-semibold text-ceviz">{y.baslik}</h1>
        <p className="mt-2 text-[17px] leading-7 text-ceviz-light">{y.aciklama}</p>
      </header>

      <YolculukAdimlari yolculukSlug={y.slug} adimlar={y.adimlar} rozetAdi={y.rozetAdi} emoji={y.emoji} />
    </div>
  );
}
