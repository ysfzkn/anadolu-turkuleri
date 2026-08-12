import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { kulturRotalari } from "@/lib/kultur";
import { ilSlug } from "@/lib/data";
import { sunucuSupabase } from "@/lib/supabase/server";

type SayfaProps = { params: Promise<{ slug: string }> };
type Rota = {
  slug: string;
  baslik: string;
  il: string;
  tema: string;
  sure: string;
  ozet: string;
  icerik?: string;
  duraklar: string[];
};

export function generateStaticParams() {
  return kulturRotalari.map((rota) => ({ slug: rota.slug }));
}

async function rotaBul(slug: string): Promise<Rota | undefined> {
  const sabitRota = kulturRotalari.find((rota) => rota.slug === slug);
  if (sabitRota) return sabitRota;

  try {
    const db = await sunucuSupabase();
    const { data, error } = await db
      .from("kultur_icerikleri")
      .select("slug,baslik,il,ozet,icerik,meta")
      .eq("tur", "kultur-rotasi")
      .eq("slug", slug)
      .eq("durum", "yayinda")
      .maybeSingle();
    if (error || !data) return undefined;
    const meta = data.meta && typeof data.meta === "object" ? data.meta as Record<string, unknown> : {};
    const duraklar = Array.isArray(meta.duraklar)
      ? meta.duraklar.filter((durak): durak is string => typeof durak === "string")
      : [];
    return {
      slug: data.slug,
      baslik: data.baslik,
      il: data.il || "Anadolu",
      tema: typeof meta.tema === "string" ? meta.tema : "Kültür ve hafıza",
      sure: typeof meta.sure === "string" ? meta.sure : "Kendi ritminizde",
      ozet: data.ozet,
      icerik: data.icerik,
      duraklar,
    };
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: SayfaProps): Promise<Metadata> {
  const { slug } = await params;
  const rota = await rotaBul(slug);
  return rota
    ? { title: rota.baslik, description: rota.ozet, alternates: { canonical: `/kultur-rotalari/${slug}` } }
    : { title: "Rota bulunamadı" };
}

export default async function RotaSayfasi({ params }: SayfaProps) {
  const { slug } = await params;
  const rota = await rotaBul(slug);
  if (!rota) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/kultur-rotalari" className="text-sm text-cini-dark">← Tüm rotalar</Link>
      <header className="mt-6 rounded-[2rem] bg-ceviz p-7 text-parsomen sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-toprak-light">{rota.il} · {rota.tema} · {rota.sure}</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">{rota.baslik}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-parsomen/70">{rota.ozet}</p>
      </header>
      <section className="mt-10 grid gap-8 md:grid-cols-[1fr_280px]">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-ceviz">Şehrin hikâyesine açılan duraklar</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-ceviz-light">
            {rota.icerik || `${rota.il}, müziğin gündelik hayat, inanç, göç, üretim ve kent belleğiyle iç içe geçtiği katmanlı bir kültür alanıdır. Bu rota, türküleri onları yaşatan mekânlar, ustalar ve toplumsal hafıza üzerinden okumayı önerir.`}
          </p>
          {rota.duraklar.length > 0 && (
            <ol className="mt-7 space-y-4">
              {rota.duraklar.map((durak, sira) => (
                <li key={durak} className="flex gap-4 rounded-2xl border border-toprak/20 bg-white/45 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-kilim font-serif font-bold text-white">{sira + 1}</span>
                  <div><strong className="text-ceviz">{durak}</strong><p className="mt-1 text-sm leading-6 text-ceviz-light">Bu durakta çevrenin yerel müzik belleğiyle ilişkisini gözlemleyin; sözlü anlatıları mümkünse kaynak kişisiyle not edin.</p></div>
                </li>
              ))}
            </ol>
          )}
        </div>
        <aside className="h-fit rounded-3xl border border-toprak/25 bg-parsomen-dark/40 p-5">
          <h2 className="font-serif text-xl font-semibold text-ceviz">Rotayı zenginleştir</h2>
          <p className="mt-2 text-sm leading-6 text-ceviz-light">Bu şehirden bildiğiniz bir mekân, usta veya anlatı varsa yaşayan arşive ekleyin.</p>
          <Link href="/katki" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-kilim px-4 font-semibold text-white">Bilgi katkısı yap</Link>
          <Link href={`/yore/${ilSlug(rota.il)}`} className="mt-2 block text-sm font-semibold text-cini-dark underline">{rota.il} türkülerini aç →</Link>
        </aside>
      </section>
    </main>
  );
}
