import type { Metadata } from "next";
import Link from "next/link";
import { kisiler, ROL_ETIKETI, type KisiRol } from "@/lib/varliklar";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";

const KOK = "https://anadoluturkuleri.com";

export const metadata: Metadata = {
  title: "Ozanlar, Âşıklar ve Derleyenler",
  description:
    "Anadolu Türküleri arşivindeki ozanlar, âşıklar, derleyenler ve kaynak kişiler. Her biri için türküleri, yöreleri ve temalarıyla ayrı sayfalar.",
  alternates: { canonical: "/kisi" },
  keywords: ["ozanlar", "âşıklar", "türkü derleyenleri", "kaynak kişiler", "halk müziği ustaları"],
  openGraph: { type: "website", url: "/kisi", title: "Ozanlar, Âşıklar ve Derleyenler", description: "Arşivdeki ozan, âşık ve derleyenler.", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Ozanlar ve derleyenler" }] },
};

const ROL_BASLIK: Record<KisiRol, string> = {
  ozan: "Ozanlar ve Âşıklar",
  derleyen: "Derleyenler",
  kaynak: "Kaynak Kişiler",
};

export default function KisilerSayfasi() {
  const tumu = kisiler();
  const gruplar: KisiRol[] = ["ozan", "derleyen", "kaynak"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <YapilandirilmisVeri veri={[
        { "@context": "https://schema.org", "@type": "CollectionPage", name: "Ozanlar, Âşıklar ve Derleyenler", url: `${KOK}/kisi`, inLanguage: "tr-TR", description: "Arşivdeki ozan, âşık, derleyen ve kaynak kişiler.", mainEntity: { "@type": "ItemList", numberOfItems: tumu.length, itemListElement: tumu.slice(0, 100).map((k, i) => ({ "@type": "ListItem", position: i + 1, name: k.ad, url: `${KOK}/kisi/${k.slug}` })) } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: KOK }, { "@type": "ListItem", position: 2, name: "Ozanlar", item: `${KOK}/kisi` }] },
      ]} />

      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold text-ceviz">Ozanlar, Âşıklar ve Derleyenler</h1>
        <p className="mt-2 max-w-2xl text-ceviz-light">
          Türküleri bize ulaştıran isimler: söyleyen ozanlar ve âşıklar, notaya alan derleyenler ve
          yörelerinden aktaran kaynak kişiler. Her biri için ayrı bir keşif sayfası.
        </p>
      </header>

      {gruplar.map((rol) => {
        const grup = tumu.filter((k) => k.roller[0] === rol);
        if (grup.length === 0) return null;
        return (
          <section key={rol} className="mb-10">
            <h2 className="mb-4 font-serif text-2xl font-semibold text-ceviz">{ROL_BASLIK[rol]}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grup.map((k) => (
                <li key={k.slug}>
                  <Link
                    href={`/kisi/${k.slug}`}
                    className="group flex items-center justify-between gap-2 rounded-2xl border border-toprak/25 bg-parsomen px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-kilim/50"
                  >
                    <span>
                      <span className="block font-serif text-lg font-semibold text-ceviz group-hover:text-kilim-dark">{k.ad}</span>
                      <span className="text-xs text-ceviz-light">
                        {k.roller.map((r) => ROL_ETIKETI[r]).join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-cini/10 px-2 py-0.5 text-xs font-semibold text-cini-dark">{k.adet}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
