import type { Metadata } from "next";
import { yolculukOzetleri } from "@/lib/yolculuklar";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";
import { YolculukKartlari } from "@/components/YolculukKartlari";

const KOK = "https://anadoluturkuleri.com";

export const metadata: Metadata = {
  title: "Türkü Yolculukları: Kültür Keşif Yolları",
  description:
    "Küratörlü öğrenme yollarıyla Anadolu kültürünü adım adım keşfet: Âşık Veysel'in izinde, gurbetten sılaya, Ege'de zeybekler ve efeler ve daha fazlası.",
  alternates: { canonical: "/yolculuklar" },
  keywords: ["türkü yolculukları", "Anadolu kültürü keşif", "âşık veysel", "zeybek", "gurbet türküleri"],
  openGraph: { type: "website", url: "/yolculuklar", title: "Türkü Yolculukları", description: "Küratörlü kültür keşif yolları.", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Türkü Yolculukları" }] },
};

export default function YolculuklarSayfasi() {
  const yolculuklar = yolculukOzetleri();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <YapilandirilmisVeri veri={[
        { "@context": "https://schema.org", "@type": "CollectionPage", name: "Türkü Yolculukları", url: `${KOK}/yolculuklar`, inLanguage: "tr-TR", description: "Küratörlü kültür keşif yolları.", mainEntity: { "@type": "ItemList", numberOfItems: yolculuklar.length, itemListElement: yolculuklar.map((y, i) => ({ "@type": "ListItem", position: i + 1, name: y.baslik, url: `${KOK}/yolculuk/${y.slug}` })) } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: KOK }, { "@type": "ListItem", position: 2, name: "Yolculuklar", item: `${KOK}/yolculuklar` }] },
      ]} />

      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold text-ceviz">Türkü Yolculukları</h1>
        <p className="mt-2 max-w-2xl text-ceviz-light">
          Her yolculuk, seçilmiş türküler, ozanlar, yöreler ve kavramlardan oluşan küratörlü bir keşif
          yoludur. Adım adım ilerle, öğren, rozetini kazan.
        </p>
      </header>

      <YolculukKartlari yolculuklar={yolculuklar} />
    </div>
  );
}
