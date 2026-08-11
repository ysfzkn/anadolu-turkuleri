import Link from "next/link";
import { tumTurkuler, iller, ilSlug, ilAdi, kartlar, tumEtiketler } from "@/lib/data";
import { TurkuArsivi } from "@/components/TurkuArsivi";
import { GununTurkusu } from "@/components/GununTurkusu";
import { TurkiyeHaritasi, type HaritaIl } from "@/components/TurkiyeHaritasi";
import { RastgeleButon } from "@/components/RastgeleButon";
import { MotifBorder, StarMotif } from "@/components/Motif";

export default function AnaSayfa() {
  const turkuler = tumTurkuler();
  const ilListesi = iller();
  const kartVerisi = kartlar();
  const yoreAdlari = Array.from(
    new Set(turkuler.map((t) => ilAdi(t.yore))),
  ).sort((a, b) => a.localeCompare(b, "tr"));
  const enCokEtiket = tumEtiketler()
    .slice(0, 14)
    .map((e) => e.etiket);

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

        {/* Keşif kısayolları */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <RastgeleButon sluglar={turkuler.map((t) => t.slug)} />
          <Link
            href="/quiz"
            className="inline-flex items-center gap-1.5 rounded-full border border-toprak/40 bg-toprak/5 px-3 py-1 text-sm font-medium text-toprak-dark transition-colors hover:bg-toprak hover:text-parsomen"
          >
            🪕 Bilgi oyunu
          </Link>
          <span className="text-sm text-ceviz-light">
            {turkuler.length} türkü · {ilListesi.length} yöre
          </span>
        </div>
      </section>

      {/* Günün türküsü + Ayın favorisi */}
      <section className="mx-auto mt-10 max-w-5xl px-4">
        <GununTurkusu turkuler={kartVerisi} />
      </section>

      <MotifBorder className="mt-12 opacity-80" />

      {/* Arşiv — arama + filtre */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 font-serif text-2xl font-semibold text-ceviz">
          Türkü arşivi
        </h2>
        <TurkuArsivi
          turkuler={kartVerisi}
          yoreler={yoreAdlari}
          etiketler={enCokEtiket}
        />
      </section>
    </>
  );
}
