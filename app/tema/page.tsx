import type { Metadata } from "next";
import Link from "next/link";
import { temalar } from "@/lib/varliklar";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";

const KOK = "https://anadoluturkuleri.com";

export const metadata: Metadata = {
  title: "Türkü Temaları: Sevda, Ağıt, Gurbet ve Daha Fazlası",
  description:
    "Anadolu türkülerini temalarına göre keşfedin: sevda, ağıt, gurbet, hasret, ayrılık, kahramanlık, zeybek ve daha fazlası. Her tema için hikâyeli türkü listeleri.",
  alternates: { canonical: "/tema" },
  keywords: ["türkü temaları", "sevda türküleri", "ağıt", "gurbet türküleri", "hasret", "zeybek"],
  openGraph: { type: "website", url: "/tema", title: "Türkü Temaları", description: "Anadolu türkülerini temalarına göre keşfedin.", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Türkü temaları" }] },
};

export default function TemalarSayfasi() {
  const tumu = temalar();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <YapilandirilmisVeri veri={[
        { "@context": "https://schema.org", "@type": "CollectionPage", name: "Türkü Temaları", url: `${KOK}/tema`, inLanguage: "tr-TR", description: "Anadolu türkülerinin temaları.", mainEntity: { "@type": "ItemList", numberOfItems: tumu.length, itemListElement: tumu.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.ad, url: `${KOK}/tema/${t.slug}` })) } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: KOK }, { "@type": "ListItem", position: 2, name: "Temalar", item: `${KOK}/tema` }] },
      ]} />

      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold text-ceviz">Türkü Temaları</h1>
        <p className="mt-2 max-w-2xl text-ceviz-light">
          Anadolu türkülerini duygu ve konularına göre keşfedin. Bir temaya tıklayın; o temayı taşıyan
          türküleri hikâyeleri ve yöreleriyle birlikte görün.
        </p>
      </header>

      <ul className="flex flex-wrap gap-2.5">
        {tumu.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/tema/${t.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-toprak/25 bg-parsomen px-4 py-2 text-sm font-medium text-ceviz shadow-sm transition hover:-translate-y-0.5 hover:border-kilim/50 hover:text-kilim-dark"
            >
              {t.ad}
              <span className="rounded-full bg-cini/10 px-1.5 py-0.5 text-[11px] font-semibold text-cini-dark">{t.adet}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
