import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { iller, ilTurkuleri } from "@/lib/data";
import { bolgeBul, BOLGE_ADI } from "@/lib/yore-bolge";
import { YoreTurkuListesi } from "@/components/YoreTurkuListesi";
import { YoreMotifi } from "@/components/YoreMotifi";
import { KonserAra } from "@/components/KonserAra";
import { YoreVitrini } from "@/components/YoreVitrini";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";
import { yayinlananEditorTurkuleri } from "@/lib/editor-data";
import { ilSlug } from "@/lib/data";

export function generateStaticParams() {
  return iller().map((il) => ({ il: il.slug }));
}

type YoreSayfasiProps = { params: Promise<{ il: string }> };

export async function generateMetadata({
  params,
}: YoreSayfasiProps): Promise<Metadata> {
  const { il: ilSlugu } = await params;
  const il = iller().find((i) => i.slug === ilSlugu);
  if (!il) return { title: "Yöre bulunamadı" };
  return {
    title: `${il.ad} Türküleri ve Hikâyeleri`,
    description: `${il.ad} türküleri; hikâyeleri, yöre bilgileri, ozanları, sözleri ve çalım notlarıyla kaynaklı halk müziği arşivinde.`,
    alternates: { canonical: `/yore/${il.slug}` },
    keywords: [`${il.ad} türküleri`, `${il.ad} türkü listesi`, `${il.ad} halk müziği`, "türkü hikâyeleri"],
    openGraph: { type: "website", url: `/yore/${il.slug}`, title: `${il.ad} Türküleri ve Hikâyeleri`, description: `${il.ad} yöresinin kaynaklı türkü arşivi.`, images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: `${il.ad} türküleri` }] },
    twitter: { card: "summary_large_image", title: `${il.ad} Türküleri`, description: `${il.ad} yöresinin kaynaklı türkü arşivi.`, images: ["/opengraph-image.png"] },
  };
}

export default async function YoreSayfasi({ params }: YoreSayfasiProps) {
  const { il: ilSlugu } = await params;
  const il = iller().find((i) => i.slug === ilSlugu);
  if (!il) notFound();
  const editorTurkuleri = await yayinlananEditorTurkuleri();
  const turkuler = [...ilTurkuleri(ilSlugu), ...editorTurkuleri.filter((t) => ilSlug(t.yore) === ilSlugu && !ilTurkuleri(ilSlugu).some((yerel) => yerel.slug === t.slug))];
  const bolge = bolgeBul(ilSlugu);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <YapilandirilmisVeri veri={[
        { "@context": "https://schema.org", "@type": "CollectionPage", name: `${il.ad} Türküleri`, description: `${il.ad} yöresinin kaynaklı türkü arşivi.`, url: `https://anadoluturkuleri.com/yore/${il.slug}`, inLanguage: "tr-TR", mainEntity: { "@type": "ItemList", numberOfItems: turkuler.length, itemListElement: turkuler.slice(0, 100).map((turku, i) => ({ "@type": "ListItem", position: i + 1, name: turku.baslik, url: `https://anadoluturkuleri.com/turku/${turku.slug}` })) } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Türküler", item: "https://anadoluturkuleri.com" }, { "@type": "ListItem", position: 2, name: `${il.ad} Türküleri`, item: `https://anadoluturkuleri.com/yore/${il.slug}` }] },
      ]} />
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-cini-dark hover:text-kilim"
      >
        ← Haritaya dön
      </Link>

      <header className="mb-6">
        <p className="text-sm font-medium text-kilim">
          {BOLGE_ADI[bolge]} · {il.ad}
        </p>
        <h1 className="font-serif text-4xl font-semibold text-ceviz">
          {il.ad} Türküleri
        </h1>
        <p className="mt-2 text-ceviz-light">{il.ad} arşivinde {turkuler.length} türkü bulunuyor.</p>
      </header>

      <YoreMotifi bolge={bolge} il={il.ad} className="mb-8 opacity-80" />

      <YoreVitrini il={il.ad} bolge={bolge} />

      <YoreTurkuListesi turkuler={turkuler} />

      <div className="mt-10">
        <KonserAra il={il.ad} />
      </div>
    </div>
  );
}
