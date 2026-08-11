import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { iller, ilTurkuleri } from "@/lib/data";
import { TurkuCard } from "@/components/TurkuCard";
import { MotifBorder } from "@/components/Motif";

export function generateStaticParams() {
  return iller().map((il) => ({ il: il.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { il: string };
}): Metadata {
  const il = iller().find((i) => i.slug === params.il);
  if (!il) return { title: "Yöre bulunamadı" };
  return {
    title: `${il.ad} Türküleri`,
    description: `${il.ad} yöresine ait türküler, hikâyeleri ve çalım bilgileriyle.`,
  };
}

export default function YoreSayfasi({ params }: { params: { il: string } }) {
  const il = iller().find((i) => i.slug === params.il);
  if (!il) notFound();
  const turkuler = ilTurkuleri(params.il);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-cini-dark hover:text-kilim"
      >
        ← Haritaya dön
      </Link>

      <header className="mb-8">
        <p className="text-sm font-medium text-kilim">Yöre</p>
        <h1 className="font-serif text-4xl font-semibold text-ceviz">
          {il.ad} Türküleri
        </h1>
        <p className="mt-2 text-ceviz-light">
          Bu yöreden {il.adet} türkü.
        </p>
      </header>

      <MotifBorder className="mb-8 opacity-70" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {turkuler.map((t) => (
          <TurkuCard key={t.slug} turku={t} />
        ))}
      </div>
    </div>
  );
}
