import type { Metadata } from "next";
import sehirGorselleri from "@/content/sehir-gorselleri.json";
import { OZAN_GORSELLERI } from "@/lib/ozan-gorselleri";
import type { SehirGorseli } from "@/components/SehirFotografi";

export const metadata: Metadata = {
  title: "Görsel Kaynakları ve Lisanslar",
  description: "Anadolu Türküleri arşivinde kullanılan şehir ve ozan görsellerinin kaynak, sanatçı ve açık lisans bilgileri.",
  alternates: { canonical: "/gorsel-kaynaklari" },
};

export default function GorselKaynaklariSayfasi() {
  const sehirler = Object.values(sehirGorselleri as Record<string, SehirGorseli>).sort((a, b) => a.baslik.localeCompare(b.baslik, "tr"));
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-kilim">Açık ve izlenebilir arşiv</p><h1 className="mt-2 font-serif text-4xl font-semibold text-ceviz sm:text-5xl">Görsel kaynakları ve lisanslar</h1><p className="mt-4 text-lg leading-8 text-ceviz-light">Şehir ve ozan görsellerini ağırlıklı olarak Wikimedia Commons’ın açık lisanslı veya kamu malı kayıtlarından seçiyoruz. Her görselin özgün dosyasına, sanatçı bilgisine ve lisansına buradan ulaşabilirsiniz.</p></header>
      <section className="mt-10"><h2 className="font-serif text-3xl font-semibold text-ceviz">Şehir fotoğrafları</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{sehirler.map((gorsel) => <figure key={gorsel.src} className="overflow-hidden rounded-2xl border border-toprak/25 bg-white/45"><img src={gorsel.src} alt={gorsel.alt} loading="lazy" className="aspect-[16/9] w-full object-cover" /><figcaption className="p-4"><strong className="font-serif text-xl text-ceviz">{gorsel.baslik}</strong><p className="mt-1 text-xs leading-5 text-ceviz-light">{gorsel.sanatci || "Sanatçı bilgisi kaynak sayfasında"} · {gorsel.lisans}</p><a href={gorsel.kaynakUrl} target="_blank" rel="license noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-cini-dark underline">Özgün kayıt ve lisans ↗</a></figcaption></figure>)}</div></section>
      <section className="mt-12"><h2 className="font-serif text-3xl font-semibold text-ceviz">Ozan ve arşiv görselleri</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(OZAN_GORSELLERI).map(([ad, gorsel]) => <article key={ad} className="flex gap-4 rounded-2xl border border-toprak/25 bg-white/45 p-4"><img src={gorsel.src} alt={gorsel.alt} loading="lazy" className="h-24 w-24 shrink-0 rounded-xl object-cover" /><div><h3 className="font-serif text-xl font-semibold text-ceviz">{ad}</h3><p className="mt-1 text-xs leading-5 text-ceviz-light">{gorsel.tur} · {gorsel.lisans}</p><a href={gorsel.kaynak} target="_blank" rel="license noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-cini-dark underline">Kaynağı aç ↗</a></div></article>)}</div></section>
    </main>
  );
}
