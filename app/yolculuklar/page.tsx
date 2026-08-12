import type { Metadata } from "next";
import Link from "next/link";
import { yolculukOzetleri } from "@/lib/yolculuklar";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";

const KOK = "https://anadoluturkuleri.com";

export const metadata: Metadata = {
  title: "Türkü Yolculukları: Kültür Keşif Yolları",
  description:
    "Küratörlü öğrenme yollarıyla Anadolu kültürünü adım adım keşfet: Âşık Veysel'in izinde, gurbetten sılaya, Ege'de zeybekler ve efeler ve daha fazlası.",
  alternates: { canonical: "/yolculuklar" },
  keywords: ["türkü yolculukları", "Anadolu kültürü keşif", "âşık veysel", "zeybek", "gurbet türküleri"],
  openGraph: { type: "website", url: "/yolculuklar", title: "Türkü Yolculukları", description: "Küratörlü kültür keşif yolları.", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Türkü Yolculukları" }] },
};

const SEVIYE_RENK: Record<string, string> = {
  "başlangıç": "bg-[#3f7a62]/12 text-[#28523f]",
  orta: "bg-cini/12 text-cini-dark",
  ileri: "bg-kilim/12 text-kilim-dark",
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

      <ul className="grid gap-4 sm:grid-cols-2">
        {yolculuklar.map((y) => (
          <li key={y.slug}>
            <Link
              href={`/yolculuk/${y.slug}`}
              className="group flex h-full flex-col rounded-3xl border border-toprak/25 bg-parsomen p-6 shadow-motif transition hover:-translate-y-0.5 hover:border-kilim/50"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-parsomen-dark text-2xl" aria-hidden>{y.emoji}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVIYE_RENK[y.seviye] ?? "bg-toprak/10 text-ceviz"}`}>{y.seviye}</span>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-ceviz group-hover:text-kilim-dark">{y.baslik}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-ceviz-light">{y.aciklama}</p>
              <div className="mt-4 flex items-center gap-3 text-xs font-medium text-ceviz-light">
                <span>{y.adimSayisi} adım</span>
                <span aria-hidden>·</span>
                <span>~{y.tahminiDakika} dk</span>
                <span className="ml-auto text-kilim-dark opacity-0 transition group-hover:opacity-100">Başla →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
