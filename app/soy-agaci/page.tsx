import type { Metadata } from "next";
import { Suspense } from "react";
import { tumTurkuler } from "@/lib/data";
import { TurkuSoyAgaci } from "@/components/TurkuSoyAgaci";

export const metadata: Metadata = { title: "Türkü Soy Ağacı — Eserler Arasındaki Bağlar", description: "Türküleri ortak yöre, ozan, tema ve varyant ilişkileri üzerinden etkileşimli bir kültür grafiğinde keşfedin.", alternates: { canonical: "/soy-agaci" } };

export default function SoyAgaciSayfasi() {
  const turkuler = tumTurkuler().map((t) => ({ slug: t.slug, baslik: t.baslik, yore: t.yore, ozan: t.ozan ?? t.sozYazari ?? null, digerAdlar: t.digerAdlar ?? [], etiketler: t.etiketler ?? [] }));
  return <div className="mx-auto max-w-7xl px-4 py-8"><Suspense fallback={<div className="h-[650px] animate-pulse rounded-[2rem] bg-toprak/10" />}><TurkuSoyAgaci turkuler={turkuler} /></Suspense></div>;
}
