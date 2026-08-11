import Link from "next/link";
import { tumTurkuler, iller, ilSlug } from "@/lib/data";
import { TurkuCard } from "@/components/TurkuCard";
import { TurkiyeHaritasi, type HaritaIl } from "@/components/TurkiyeHaritasi";
import { RastgeleButon } from "@/components/RastgeleButon";
import { MotifBorder, StarMotif } from "@/components/Motif";

export default function AnaSayfa() {
  const turkuler = tumTurkuler();
  const ilListesi = iller();

  // Harita için: her ile ait başlıklar
  const haritaIller: HaritaIl[] = ilListesi.map((il) => ({
    slug: il.slug,
    ad: il.ad,
    adet: il.adet,
    basliklar: turkuler
      .filter((t) => ilSlug(t.yore) === il.slug)
      .map((t) => t.baslik),
  }));

  return (
    <>
      {/* Hero + Harita */}
      <section className="mx-auto max-w-5xl px-4 pt-10 sm:pt-14">
        <div className="text-center">
          <span className="mx-auto mb-4 flex w-fit text-kilim">
            <StarMotif size={46} />
          </span>
          <h1 className="font-serif text-3xl font-semibold leading-tight text-ceviz sm:text-5xl">
            Türkülerin ardındaki <span className="text-kilim">hikâyeler</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-ceviz-light sm:text-lg">
            Haritadan bir yöre seçin; o toprağın türkülerini hikâyeleri, ozanları
            ve çalım bilgileriyle keşfedin.
          </p>
        </div>

        <div className="mt-8">
          <TurkiyeHaritasi iller={haritaIller} />
        </div>

        {/* Yöre rozetleri (mobil + SEO + JS'siz erişim) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-ceviz-light">Türküsü olan yöreler:</span>
          {ilListesi.map((il) => (
            <Link
              key={il.slug}
              href={`/yore/${il.slug}`}
              className="rounded-full border border-kilim/40 bg-kilim/5 px-3 py-1 text-sm font-medium text-kilim-dark transition-colors hover:bg-kilim hover:text-parsomen"
            >
              {il.ad}
              <span className="ml-1 text-xs opacity-70">{il.adet}</span>
            </Link>
          ))}
          <RastgeleButon sluglar={turkuler.map((t) => t.slug)} />
        </div>
      </section>

      <MotifBorder className="mt-12 opacity-80" />

      {/* Arşiv */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-2xl font-semibold text-ceviz">
            Tüm türküler
          </h2>
          <span className="text-sm text-ceviz-light">{turkuler.length} türkü</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {turkuler.map((t) => (
            <TurkuCard key={t.slug} turku={t} />
          ))}
        </div>
      </section>
    </>
  );
}
