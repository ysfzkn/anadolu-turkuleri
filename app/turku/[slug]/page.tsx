import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { turkuBul, tumSluglar, ilSlug, ayniAdliKayitlar } from "@/lib/data";
import { bolgeBul } from "@/lib/yore-bolge";
import { YoreMotifi } from "@/components/YoreMotifi";
import { Sozler } from "@/components/Sozler";
import { CalimPanel } from "@/components/CalimPanel";
import { DinlemeAlani } from "@/components/DinlemeAlani";
import { KesifKaydedici } from "@/components/KesifKaydedici";
import { ShareCard } from "@/components/ShareCard";
import { ListeyeEkle } from "@/components/ListeyeEkle";
import { TurkuMedyaVitrini } from "@/components/TurkuMedyaVitrini";
import { SpotifyListeyeEkle } from "@/components/SpotifyListeyeEkle";
import { RepertuvaraEkle } from "@/components/RepertuvaraEkle";
import { DurumRozeti } from "@/components/DurumRozeti";
import { MotifBorder } from "@/components/Motif";
import { YoreVitrini } from "@/components/YoreVitrini";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";
import { TurkuDNA } from "@/components/TurkuDNA";
import { BenzerTurkuler } from "@/components/BenzerTurkuler";
import { BuradanNereye } from "@/components/BuradanNereye";
import { KaynakDurumu } from "@/components/KaynakDurumu";
import { Varyantlar } from "@/components/Varyantlar";
import { ToplulukKatkilari } from "@/components/ToplulukKatkilari";
import { YolculuklardaGecer } from "@/components/YolculuklardaGecer";
import { yolculuklardaGecen } from "@/lib/yolculuklar-veri";
import { editorTurkusuBul } from "@/lib/editor-data";
import { benzerTurkuler } from "@/lib/varliklar";
import { turkudeGecenTerimler } from "@/lib/sozluk";
import { sozDurumu } from "@/lib/telif";

export function generateStaticParams() {
  return tumSluglar().map((slug) => ({ slug }));
}

type TurkuSayfasiProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: TurkuSayfasiProps): Promise<Metadata> {
  const { slug } = await params;
  const turku = turkuBul(slug) ?? await editorTurkusuBul(slug);
  if (!turku) return { title: "Türkü bulunamadı" };
  return {
    title: `${turku.baslik} Türküsü: Hikâyesi ve Yöresi`,
    description: `${turku.baslik} türküsünün hikâyesi, ${turku.yore} yöresi, ozan ve çalım bilgileri. ${turku.ozet}`.slice(0, 160),
    alternates: { canonical: `/turku/${turku.slug}` },
    robots: turku.dogrulama === "taslak" ? { index: false, follow: true } : { index: true, follow: true },
    keywords: [turku.baslik, `${turku.baslik} hikâyesi`, `${turku.baslik} sözleri`, `${turku.yore} türküleri`, ...(turku.etiketler ?? [])],
    openGraph: { type: "article", url: `/turku/${turku.slug}`, title: `${turku.baslik} Türküsü: Hikâyesi ve Yöresi`, description: turku.ozet, images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: `${turku.baslik} türküsünün hikâyesi` }] },
    twitter: { card: "summary_large_image", title: `${turku.baslik} Türküsü`, description: turku.ozet, images: ["/opengraph-image.png"] },
  };
}

export default async function TurkuSayfasi({
  params,
}: TurkuSayfasiProps) {
  const { slug } = await params;
  const turku = turkuBul(slug) ?? await editorTurkusuBul(slug);
  if (!turku) notFound();
  const bolge = bolgeBul(ilSlug(turku.yore));
  const url = `https://anadoluturkuleri.com/turku/${turku.slug}`;
  const yoreUrl = `https://anadoluturkuleri.com/yore/${ilSlug(turku.yore)}`;
  const dogrudanYoutube = turku.baglantilar.find((b) => b.platform === "youtube" && b.dogrulandi)?.url;
  const sozHaklari = sozDurumu(turku.sozYazari, turku.ozan);
  const benzer = benzerTurkuler(turku);
  const gecenTerimler = turkudeGecenTerimler(turku);
  const digerKayitlar = ayniAdliKayitlar(turku);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <KesifKaydedici tur="turku" anahtar={turku.slug} il={ilSlug(turku.yore)} />
      <YapilandirilmisVeri veri={[
        { "@context": "https://schema.org", "@type": "MusicComposition", "@id": url, name: turku.baslik, alternateName: turku.digerAdlar, description: turku.ozet, inLanguage: "tr-TR", genre: "Türk halk müziği", keywords: [turku.yore, ...(turku.etiketler ?? [])].join(", "), isPartOf: { "@type": "CollectionPage", name: "Anadolu Türküleri", url: "https://anadoluturkuleri.com" }, about: { "@type": "Place", name: turku.yore }, lyricist: turku.sozYazari || turku.ozan ? { "@type": "Person", name: turku.sozYazari ?? turku.ozan } : undefined, composer: turku.besteci ? { "@type": "Person", name: turku.besteci } : undefined, sameAs: turku.baglantilar.filter((b) => b.dogrulandi).map((b) => b.url), citation: turku.kaynaklar.map((k) => k.url).filter(Boolean) },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Türküler", item: "https://anadoluturkuleri.com" }, { "@type": "ListItem", position: 2, name: `${turku.yore} Türküleri`, item: yoreUrl }, { "@type": "ListItem", position: 3, name: turku.baslik, item: url }] },
      ]} />
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-cini-dark hover:text-kilim"
      >
        ← Tüm türküler
      </Link>

      {/* Başlık */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-kilim">{turku.yore}</span>
          <DurumRozeti durum={turku.dogrulama} />
        </div>
        <h1 className="font-serif text-4xl font-semibold text-ceviz">
          {turku.baslik}
        </h1>
        {turku.digerAdlar && turku.digerAdlar.length > 0 && (
          <p className="mt-1 text-sm text-ceviz-light">
            Diğer adlar: {turku.digerAdlar.join(", ")}
          </p>
        )}
        <YoreMotifi bolge={bolge} il={turku.yore} className="mt-4 opacity-80" />
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ceviz-light">
          {turku.kaynakKisi && (
            <div>
              <dt className="inline font-medium text-ceviz">Kaynak kişi: </dt>
              <dd className="inline">{turku.kaynakKisi}</dd>
            </div>
          )}
          {turku.derleyen && (
            <div>
              <dt className="inline font-medium text-ceviz">Derleyen: </dt>
              <dd className="inline">{turku.derleyen}</dd>
            </div>
          )}
          {turku.ozan && (
            <div>
              <dt className="inline font-medium text-ceviz">Ozan: </dt>
              <dd className="inline">{turku.ozan}</dd>
            </div>
          )}
          {turku.sozYazari && (
            <div>
              <dt className="inline font-medium text-ceviz">Söz: </dt>
              <dd className="inline">{turku.sozYazari}</dd>
            </div>
          )}
        </dl>
      </header>

      <div className="mb-7"><YoreVitrini il={turku.yore} bolge={bolge} kompakt /></div>

      <TurkuMedyaVitrini
        slug={turku.slug}
        baslik={turku.baslik}
        yore={turku.yore}
        ozan={turku.ozan ?? turku.sozYazari}
        youtubeUrl={dogrudanYoutube}
      />

      {/* Platformlar + kişisel arşiv işlemleri */}
      <section className="mb-8 flex flex-wrap items-center gap-3">
        <DinlemeAlani baglantilar={turku.baglantilar} turkuSlug={turku.slug} il={ilSlug(turku.yore)} />
        <ListeyeEkle turkuSlug={turku.slug} />
        <SpotifyListeyeEkle turkuSlug={turku.slug} />
        <RepertuvaraEkle turkuSlug={turku.slug} />
        <Link href={`/soy-agaci?turku=${turku.slug}`} className="inline-flex min-h-11 items-center rounded-xl border border-cini/30 bg-cini/5 px-4 text-sm font-semibold text-cini-dark hover:bg-cini hover:text-white">◇ Soy ağacında gör</Link>
      </section>

      <TurkuDNA turku={turku} />

      {/* Hikâye */}
      <section className="mb-10">
        <h2 className="mb-3 font-serif text-2xl font-semibold text-ceviz">
          Hikâyesi
        </h2>
        <div className="hikaye text-[17px] text-ceviz">
          {turku.hikaye.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {(turku.sozler.length > 0 || turku.calim) && (
        <>
          <MotifBorder className="my-8 opacity-70" />

          {/* Sözler + Çalım */}
          <div className="grid gap-8 md:grid-cols-[1fr_280px]">
            {turku.sozler.length > 0 ? (
              <section>
                <h2 className="mb-4 font-serif text-2xl font-semibold text-ceviz">
                  Sözleri
                </h2>
                <Sozler sozler={turku.sozler} />
              </section>
            ) : (
              <section>
                <h2 className="mb-4 font-serif text-2xl font-semibold text-ceviz">
                  Sözleri
                </h2>
                <p className="text-sm italic text-ceviz-light">
                  {sozHaklari === "izin-gerekli"
                    ? "Bu eserin tam söz metnini yayımlamak için eser sahibinin veya hak sahibinin izni gerekir."
                    : "Bu anonim ya da kamu malı eserin doğrulanmış söz metni henüz arşive eklenmemiştir."}{" "}
                  {sozHaklari === "izin-gerekli"
                    ? "Eseri dinlemek için yukarıdaki bağlantıları kullanabilirsiniz."
                    : "Güvenilir bir kaynağınız varsa arşive katkı olarak gönderebilirsiniz."}
                </p>
                {sozHaklari !== "izin-gerekli" && (
                  <Link href={`/katki?turku=${turku.slug}`} className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-toprak/35 px-4 text-sm font-semibold text-ceviz transition hover:border-toprak hover:bg-toprak/10">
                    Söz kaynağı öner →
                  </Link>
                )}
              </section>
            )}
            {turku.calim && (
              <aside className="md:pt-14">
                <CalimPanel calim={turku.calim} />
              </aside>
            )}
          </div>
        </>
      )}

      {gecenTerimler.length > 0 && (
        <section className="mb-10 rounded-2xl border border-toprak/25 bg-parsomen-dark/30 p-5">
          <h2 className="mb-1 font-serif text-lg font-semibold text-ceviz">
            Bu türküde geçen sözlük terimleri
          </h2>
          <p className="mb-3 text-sm text-ceviz-light">
            Anlamlarını ve halk şiirindeki bağlamlarını keşfet.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {gecenTerimler.map((t) => (
              <Link
                key={t.slug}
                href={`/sozluk/${t.slug}`}
                className="inline-flex items-center rounded-full bg-cini/10 px-3 py-1 text-sm text-cini-dark transition hover:bg-cini hover:text-white"
              >
                {t.terim}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Varyantlar turku={turku} digerKayitlar={digerKayitlar} />

      <YolculuklardaGecer baslik="Bu türkü şu yolculuklarda geçiyor" rozetler={yolculuklardaGecen("turku", turku.slug)} />

      <MotifBorder className="my-8 opacity-70" />

      <BenzerTurkuler kaynakSlug={turku.slug} oneriler={benzer} />

      <BuradanNereye turku={turku} benzer={benzer[0]} />

      <ToplulukKatkilari turkuSlug={turku.slug} />

      <section className="mb-10 overflow-hidden rounded-3xl border border-toprak/25 bg-gradient-to-br from-ceviz to-cini-dark p-6 text-parsomen shadow-motif sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-toprak-light">Yaşayan Hafıza</p><h2 className="mt-2 font-serif text-2xl font-semibold">Bu türküyle ilgili bir anlatın var mı?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-parsomen/65">Ailenden duyduğun hikâyeyi, yöresel söz farkını, eski fotoğrafı veya kaynak kişi bilgisini incelememiz için gönder.</p></div>
        <Link href={`/katki?turku=${turku.slug}`} className="mt-5 inline-flex min-h-12 shrink-0 items-center rounded-xl bg-parsomen px-5 font-semibold text-ceviz sm:mt-0">Arşive katkı ver →</Link>
      </section>

      {/* Paylaş */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-ceviz">
          Hikâyeyi paylaş
        </h2>
        <ShareCard turku={turku} />
      </section>

      {/* Kaynak durumu (şeffaf provenance) */}
      <div className="mb-4">
        <KaynakDurumu turku={turku} />
      </div>

      {/* Kaynaklar */}
      {turku.kaynaklar.length > 0 && (
        <section className="rounded-2xl border border-toprak/30 bg-parsomen-dark/40 p-5">
          <h2 className="mb-2 font-serif text-lg font-semibold text-ceviz">
            Kaynaklar
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-ceviz-light">
            {turku.kaynaklar.map((k, i) => (
              <li key={i}>
                {k.url ? (
                  <a
                    href={k.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cini-dark underline hover:text-kilim"
                  >
                    {k.baslik}
                  </a>
                ) : (
                  k.baslik
                )}
                {k.tur ? ` · ${k.tur}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
