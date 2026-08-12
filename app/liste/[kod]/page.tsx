import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { herkeseAcikListe } from "@/lib/listeler";
import { turkuBul } from "@/lib/data";
import { TurkuCard } from "@/components/TurkuCard";
import { MotifBorder, StarMotif } from "@/components/Motif";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";

export const dynamic = "force-dynamic";
type ListeSayfasiProps = { params: Promise<{ kod: string }> };

export async function generateMetadata({
  params,
}: ListeSayfasiProps): Promise<Metadata> {
  const { kod } = await params;
  const liste = await herkeseAcikListe(kod);
  if (!liste) return { title: "Liste bulunamadı" };
  return {
    title: `${liste.baslik} — Türkü Listesi`,
    description:
      liste.aciklama ?? `${liste.baslik} adlı paylaşılan türkü listesi.`,
    alternates: { canonical: `/liste/${kod}` },
    openGraph: { type: "website", url: `/liste/${kod}`, title: `${liste.baslik} — Türkü Listesi`, description: liste.aciklama ?? `${liste.baslik} adlı paylaşılan türkü listesi.`, images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: liste.baslik }] },
  };
}

export default async function ListeSayfasi({
  params,
}: ListeSayfasiProps) {
  const { kod } = await params;
  const liste = await herkeseAcikListe(kod);
  if (!liste) notFound();

  const sirali = [...(liste.liste_turkuleri ?? [])].sort(
    (a, b) => a.sira - b.sira,
  );
  const turkuler = sirali
    .map((r) => turkuBul(r.turku_slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <YapilandirilmisVeri veri={{ "@context": "https://schema.org", "@type": "ItemList", name: liste.baslik, description: liste.aciklama ?? `${liste.baslik} adlı paylaşılan türkü listesi.`, url: `https://anadoluturkuleri.com/liste/${kod}`, numberOfItems: turkuler.length, itemListElement: turkuler.map((turku, indeks) => ({ "@type": "ListItem", position: indeks + 1, name: turku.baslik, url: `https://anadoluturkuleri.com/turku/${turku.slug}` })) }} />
      {/* Başlık kartı — Anadolu desenli */}
      <div className="relative overflow-hidden rounded-3xl border border-toprak/40 bg-parsomen p-8 text-center shadow-motif">
        <div className="kilim-strip absolute inset-x-0 top-0" />
        <span className="mx-auto mb-3 mt-2 flex w-fit text-kilim">
          <StarMotif size={48} />
        </span>
        <p className="text-xs font-medium uppercase tracking-widest text-cini-dark">
          Paylaşılan türkü listesi
        </p>
        <h1 className="mt-1 font-serif text-4xl font-semibold text-ceviz">
          {liste.baslik}
        </h1>
        {liste.aciklama && (
          <p className="mx-auto mt-2 max-w-xl text-ceviz-light">
            {liste.aciklama}
          </p>
        )}
        <p className="mt-3 text-sm text-ceviz-light">
          {turkuler.length} türkü · anadoluturkuleri.com
        </p>
      </div>

      <MotifBorder className="my-8 opacity-70" />

      {turkuler.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {turkuler.map((t) => (
            <TurkuCard key={t.slug} turku={t} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-toprak/30 bg-parsomen-dark/40 p-8 text-center text-ceviz-light">
          Bu liste henüz boş.
        </p>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-kilim/40 bg-kilim/5 px-5 py-2.5 text-sm font-medium text-kilim-dark transition-colors hover:bg-kilim hover:text-parsomen"
        >
          Kendi listeni oluştur →
        </Link>
      </div>
    </div>
  );
}
