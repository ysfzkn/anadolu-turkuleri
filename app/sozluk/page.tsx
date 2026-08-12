import type { Metadata } from "next";
import Link from "next/link";
import { terimOzetleri } from "@/lib/sozluk";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";

const KOK = "https://anadoluturkuleri.com";

export const metadata: Metadata = {
  title: "Türkü Sözlüğü: Halk Müziği Terimleri ve Anlamları",
  description:
    "Gurbet, sıla, turna, bozlak, deyiş, semah, zeybek… Türk halk şiiri ve müziğinin sık geçen terimleri; modern anlamları, türkü bağlamları ve örnek türkülerle.",
  alternates: { canonical: "/sozluk" },
  keywords: ["türkü sözlüğü", "halk müziği terimleri", "gurbet nedir", "bozlak nedir", "deyiş", "semah", "uzun hava"],
  openGraph: { type: "website", url: "/sozluk", title: "Türkü Sözlüğü", description: "Halk müziği ve halk şiiri terimleri sözlüğü.", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Türkü sözlüğü" }] },
};

export default function SozlukSayfasi() {
  const terimler = terimOzetleri();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <YapilandirilmisVeri veri={[
        { "@context": "https://schema.org", "@type": "DefinedTermSet", name: "Türkü Sözlüğü", url: `${KOK}/sozluk`, inLanguage: "tr-TR", description: "Türk halk müziği ve halk şiiri terimleri sözlüğü.", hasDefinedTerm: terimler.map((t) => ({ "@type": "DefinedTerm", name: t.terim, description: t.kisaTanim, url: `${KOK}/sozluk/${t.slug}` })) },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Ana Sayfa", item: KOK }, { "@type": "ListItem", position: 2, name: "Sözlük", item: `${KOK}/sozluk` }] },
      ]} />

      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold text-ceviz">Türkü Sözlüğü</h1>
        <p className="mt-2 max-w-2xl text-ceviz-light">
          Türkülerde sık geçen sözcükler ve kavramlar: modern anlamları, halk şiirindeki bağlamları ve
          bu terimi taşıyan türkülerle birlikte.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {terimler.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/sozluk/${t.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-toprak/25 bg-parsomen p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-kilim/50"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-serif text-xl font-semibold text-ceviz group-hover:text-kilim-dark">{t.terim}</span>
                {t.adet > 0 && (
                  <span className="shrink-0 rounded-full bg-cini/10 px-2 py-0.5 text-[11px] font-semibold text-cini-dark">
                    {t.adet} türkü
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-ceviz-light">{t.kisaTanim}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
