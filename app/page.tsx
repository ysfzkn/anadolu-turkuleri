import Link from "next/link";
import type { Metadata } from "next";
import { tumTurkuler, iller, ilSlug, ilAdi } from "@/lib/data";
import { yayinlananEditorTurkuleri } from "@/lib/editor-data";
import { TurkuArsivi } from "@/components/TurkuArsivi";
import { GununTurkusu } from "@/components/GununTurkusu";
import { TurkiyeHaritasi, type HaritaIl } from "@/components/TurkiyeHaritasi";
import { RastgeleButon } from "@/components/RastgeleButon";
import { MotifBorder, StarMotif } from "@/components/Motif";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";

export const metadata: Metadata = {
  title: "Anadolu Türküleri: Türkü Hikâyeleri ve Yöresel Arşiv",
  description: "1.900'ü aşkın Anadolu türküsünü hikâyeleri, yöreleri, ozanları, sözleri ve çalım bilgileriyle keşfedin. Şehre, temaya ve sözlere göre arayın.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", title: "Anadolu Türküleri: Türkü Hikâyeleri ve Yöresel Arşiv", description: "1.900'ü aşkın türküyü hikâyeleri, yöreleri, ozanları ve sözleriyle keşfedin.", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Anadolu Türküleri arşivi" }] },
};

export default async function AnaSayfa() {
  const dosyaTurkuleri = tumTurkuler();
  const dosyaSluglari = new Set(dosyaTurkuleri.map((turku) => turku.slug));
  const editorTurkuleri = (await yayinlananEditorTurkuleri()).filter(
    (turku) => !dosyaSluglari.has(turku.slug),
  );
  const turkuler = [...dosyaTurkuleri, ...editorTurkuleri];
  const kartVerisi = turkuler.map((turku) => ({
    slug: turku.slug,
    baslik: turku.baslik,
    yore: turku.yore,
    ozet: turku.ozet,
    etiketler: turku.etiketler,
    ozan: turku.ozan,
    sozYazari: turku.sozYazari,
    sozMetni: (turku.sozler ?? []).flatMap((kita) => kita.satirlar).join(" ").toLowerCase(),
  }));
  const ilListesi = iller().map((il) => ({
    ...il,
    adet: turkuler.filter((turku) => ilSlug(turku.yore) === il.slug).length,
  }));
  const yoreAdlari = Array.from(
    new Set(turkuler.map((t) => ilAdi(t.yore))),
  ).sort((a, b) => a.localeCompare(b, "tr"));
  const etiketSayilari = new Map<string, number>();
  for (const turku of turkuler) {
    for (const etiket of turku.etiketler ?? []) {
      etiketSayilari.set(etiket, (etiketSayilari.get(etiket) ?? 0) + 1);
    }
  }
  const enCokEtiket = [...etiketSayilari]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr"))
    .slice(0, 14)
    .map(([etiket]) => etiket);

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
      <YapilandirilmisVeri veri={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Anadolu Türküleri ve Hikâyeleri", url: "https://anadoluturkuleri.com", inLanguage: "tr-TR", description: "Anadolu türkülerini yöreleri, hikâyeleri ve kaynaklarıyla bir araya getiren dijital arşiv.", mainEntity: { "@type": "ItemList", numberOfItems: turkuler.length, itemListElement: turkuler.slice(0, 100).map((turku, i) => ({ "@type": "ListItem", position: i + 1, name: turku.baslik, url: `https://anadoluturkuleri.com/turku/${turku.slug}` })) } }} />
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

      <section className="border-t border-toprak/20 bg-parsomen-dark/35">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-kilim">Anadolu'nun sözlü belleği</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-ceviz">Türküleri yalnızca dinlemeyin; izlerini keşfedin</h2>
            <div className="mt-4 space-y-4 leading-7 text-ceviz-light">
              <p>Türküler; yaşanmış olayları, göçleri, sevdaları, ağıtları ve yöresel yaşamı ezgiyle aktaran halk anlatılarıdır. Bu arşiv, her eseri mümkün olduğunca kaynak kişisi, derleyeni, yöresi ve farklı anlatılarıyla birlikte sunar.</p>
              <p>Arama alanından türkü adına, şehre, temaya veya hatırladığınız bir söz parçasına ulaşabilirsiniz. Editoryal durumu tamamlanan kayıtlarda hikâye, çalım bilgisi ve kaynak bağlantıları ayrıca gösterilir.</p>
            </div>
          </div>
          <nav aria-label="Öne çıkan yöre arşivleri" className="rounded-3xl border border-toprak/25 bg-white/45 p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-ceviz">Öne çıkan türkü yöreleri</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {ilListesi.slice().sort((a, b) => b.adet - a.adet).slice(0, 10).map((il) => <Link key={il.slug} href={`/yore/${il.slug}`} className="rounded-xl border border-toprak/20 bg-parsomen/70 px-3 py-2 text-sm font-semibold text-cini-dark transition hover:border-kilim/40 hover:text-kilim">{il.ad} <span className="font-normal text-ceviz-light">({il.adet})</span></Link>)}
            </div>
          </nav>
        </div>
      </section>
    </>
  );
}
