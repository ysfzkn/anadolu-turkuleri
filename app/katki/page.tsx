import type { Metadata } from "next";
import { HafizaKatkiFormu } from "@/components/HafizaKatkiFormu";
import { turkuBul } from "@/lib/data";

export const metadata: Metadata = { title: "Yaşayan Hafıza — Arşive Katkı Ver", description: "Ailenden veya yörenden bildiğin türkü hikâyesini, söz varyantını, fotoğrafı ya da sesli anlatıyı Anadolu Türküleri arşivine gönder.", alternates: { canonical: "/katki" } };

export default async function KatkiSayfasi({ searchParams }: { searchParams: Promise<{ turku?: string }> }) {
  const { turku: turkuSlugu } = await searchParams;
  const turku = turkuSlugu ? turkuBul(turkuSlugu) : undefined;
  return <div className="mx-auto max-w-4xl px-4 py-10"><header className="mb-8 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.22em] text-kilim">Yaşayan Hafıza</p><h1 className="mt-2 font-serif text-4xl font-semibold text-ceviz sm:text-5xl">Ailende kalan sesi arşive taşı.</h1><p className="mt-4 text-base leading-7 text-ceviz-light">Türkülerin yazılı kaynaklara girmeyen hikâyeleri çoğu zaman bir evde, köyde veya tek bir kişinin belleğinde yaşar. Bildiğin varyantı kaynağıyla paylaş; editoryal incelemeden sonra gelecek kuşaklara aktaralım.</p>{turku && <p className="mt-4 rounded-xl border border-cini/20 bg-cini/5 px-4 py-3 text-sm text-cini-dark"><strong>{turku.baslik}</strong> kaydına katkı gönderiyorsun · {turku.yore}</p>}</header><HafizaKatkiFormu turkuSlug={turku?.slug} varsayilanIl={turku?.yore} /></div>;
}
