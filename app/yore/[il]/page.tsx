import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { iller, ilTurkuleri } from "@/lib/data";
import { bolgeBul, BOLGE_ADI } from "@/lib/yore-bolge";
import { TurkuCard } from "@/components/TurkuCard";
import { YoreMotifi } from "@/components/YoreMotifi";
import { KonserAra } from "@/components/KonserAra";
import { YoreVitrini } from "@/components/YoreVitrini";

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
  const bolge = bolgeBul(params.il);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-cini-dark hover:text-kilim"
      >
        ← Haritaya dön
      </Link>

      <header className="mb-6">
        <p className="text-sm font-medium text-kilim">
          Yöre · {BOLGE_ADI[bolge]}
        </p>
        <h1 className="font-serif text-4xl font-semibold text-ceviz">
          {il.ad} Türküleri
        </h1>
        <p className="mt-2 text-ceviz-light">Bu yöreden {il.adet} türkü.</p>
      </header>

      <YoreMotifi bolge={bolge} className="mb-8 opacity-80" />

      <YoreVitrini il={il.ad} bolge={bolge} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {turkuler.map((t) => (
          <TurkuCard key={t.slug} turku={t} />
        ))}
      </div>

      <div className="mt-10">
        <KonserAra il={il.ad} />
      </div>
    </div>
  );
}
