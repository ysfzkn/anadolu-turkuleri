import type { Metadata } from "next";
import Link from "next/link";
import { kurslar } from "@/lib/kultur";
import { sunucuSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Bağlama, Ney ve Halk Müziği Öğrenme Rehberi",
  description: "Bağlama ve ney kurslarını seçerken dikkat edilmesi gerekenler, seviyeye göre çalışma yolları ve halk müziği eğitim programları.",
  alternates: { canonical: "/kurslar" },
};

type EgitimDuyurusu = { slug: string; baslik: string; ozet: string; dis_url: string | null };

async function egitimDuyurulari(): Promise<EgitimDuyurusu[]> {
  try {
    const db = await sunucuSupabase();
    const { data, error } = await db.from("kultur_icerikleri").select("slug,baslik,ozet,dis_url").eq("tur", "kurs").eq("durum", "yayinda");
    if (error) return [];
    return (data ?? []) as EgitimDuyurusu[];
  } catch {
    return [];
  }
}

export default async function KurslarSayfasi() {
  const duyurular = await egitimDuyurulari();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-kilim">Dinlemekten icraya</p><h1 className="mt-2 font-serif text-4xl font-semibold text-ceviz sm:text-5xl">Bağlama ve ney öğrenme yolları</h1><p className="mt-4 text-lg leading-8 text-ceviz-light">Doğru eğitmeni, seviyeyi ve çalışma yöntemini seçmenize yardımcı olan bağımsız rehber. Sponsorlu kurslar ayrıca ve açıkça işaretlenir.</p></header>
      <section className="mt-9 grid gap-5 md:grid-cols-2">{kurslar.map((kurs, sira) => <article key={kurs.slug} className="relative overflow-hidden rounded-3xl border border-toprak/25 bg-white/55 p-6 shadow-sm"><span className="absolute right-5 top-4 font-serif text-5xl text-toprak/15">{sira + 1}</span><p className="text-xs font-bold uppercase tracking-wider text-cini-dark">{kurs.alan} · {kurs.seviye}</p><h2 className="mt-2 font-serif text-2xl font-semibold text-ceviz">{kurs.baslik}</h2><p className="mt-2 text-sm leading-6 text-ceviz-light">{kurs.ozet}</p><ul className="mt-4 space-y-2 text-sm text-ceviz">{kurs.kazanimlar.map((kazanim) => <li key={kazanim}>◇ {kazanim}</li>)}</ul><p className="mt-5 text-xs font-semibold text-kilim">{kurs.format}</p></article>)}</section>
      {duyurular.length > 0 && <section className="mt-12"><h2 className="font-serif text-3xl font-semibold text-ceviz">Doğrulanmış eğitim duyuruları</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-ceviz-light">Bağlantılar dış kurumlara açılır. Program içeriğini, eğitmeni, ücretleri ve iptal koşullarını kurum sayfasında doğrulayın.</p><div className="mt-5 grid gap-4 md:grid-cols-2">{duyurular.map((duyuru) => <article key={duyuru.slug} className="rounded-2xl border border-toprak/25 bg-white/35 p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-kilim">Dış kurum içeriği</p><h3 className="mt-2 font-serif text-xl font-semibold text-ceviz">{duyuru.baslik}</h3><p className="mt-2 text-sm leading-6 text-ceviz-light">{duyuru.ozet}</p>{duyuru.dis_url && <a href={duyuru.dis_url} rel="sponsored noopener noreferrer" target="_blank" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-cini-dark underline">Kurum sayfasını aç ↗</a>}</article>)}</div></section>}
      <section className="mt-12 rounded-3xl bg-ceviz p-7 text-parsomen"><h2 className="font-serif text-2xl font-semibold">Eğitmen veya kurum musunuz?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-parsomen/65">Programınız kaynaklı halk müziği eğitimi, şeffaf ücret ve açık eğitmen bilgisi sunuyorsa rehbere değerlendirilmek üzere başvurabilirsiniz. Ücretli yerleşimler editoryal sıralamayı satın alamaz.</p><Link href="/is-birligi" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-parsomen px-5 font-semibold text-ceviz">İş birliği ilkelerini incele</Link></section>
    </main>
  );
}
