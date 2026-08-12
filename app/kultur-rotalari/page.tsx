import type { Metadata } from "next";
import Link from "next/link";
import { kulturRotalari, type KulturRotasi } from "@/lib/kultur";
import { sunucuSupabase } from "@/lib/supabase/server";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";
import { SehirFotografi } from "@/components/SehirFotografi";

export const metadata: Metadata = {
  title: "Anadolu Kültür Rotaları",
  description: "Türküleri şehir tarihi, ozanlık geleneği, mimari ve yerel müzik duraklarıyla birlikte keşfedeceğiniz kültür rotaları.",
  alternates: { canonical: "/kultur-rotalari" },
};

type EditorRotaKaydi = {
  slug: string;
  baslik: string;
  il: string | null;
  ozet: string;
  gorsel_url: string | null;
  meta: unknown;
};

function editorRotasinaCevir(kayit: EditorRotaKaydi): KulturRotasi {
  const meta = kayit.meta && typeof kayit.meta === "object" ? kayit.meta as Record<string, unknown> : {};
  return {
    slug: kayit.slug,
    il: kayit.il ?? "Anadolu",
    baslik: kayit.baslik,
    sure: typeof meta.sure === "string" ? meta.sure : "Önerilen rota",
    tema: typeof meta.tema === "string" ? meta.tema : "Yerel kültür",
    ozet: kayit.ozet,
    duraklar: Array.isArray(meta.duraklar) ? meta.duraklar.filter((durak): durak is string => typeof durak === "string") : [],
    gorsel: kayit.gorsel_url ?? undefined,
  };
}

async function editorRotalari(): Promise<KulturRotasi[]> {
  try {
    const db = await sunucuSupabase();
    const { data, error } = await db.from("kultur_icerikleri").select("slug,baslik,il,ozet,gorsel_url,meta").eq("tur", "kultur-rotasi").eq("durum", "yayinda").order("sira");
    if (error) return [];
    return (data ?? []).map((kayit) => editorRotasinaCevir(kayit as EditorRotaKaydi));
  } catch {
    return [];
  }
}

export default async function RotalarSayfasi() {
  const sabitSluglar = new Set(kulturRotalari.map((rota) => rota.slug));
  const ekRotalar = (await editorRotalari()).filter((rota) => !sabitSluglar.has(rota.slug));
  const tumRotalar = [...kulturRotalari, ...ekRotalar];
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <YapilandirilmisVeri veri={{ "@context": "https://schema.org", "@type": "ItemList", name: "Anadolu Kültür Rotaları", itemListElement: tumRotalar.map((rota, sira) => ({ "@type": "ListItem", position: sira + 1, name: rota.baslik, url: `https://anadoluturkuleri.com/kultur-rotalari/${rota.slug}` })) }} />
      <header className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-kilim">Ezginin izinde yolculuk</p><h1 className="mt-2 font-serif text-4xl font-semibold text-ceviz sm:text-5xl">Türküyü doğduğu coğrafyada okuyun.</h1><p className="mt-4 text-lg leading-8 text-ceviz-light">Şehir tarihi, mimari, ozanlar ve yerel icra gelenekleri tek bir yürüyüşte buluşuyor. Rotalar kültürel bağlam sunar; açılış saatlerini ve erişim koşullarını yola çıkmadan önce resmî kaynaklardan doğrulayın.</p></header>
      <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tumRotalar.map((rota, sira) => <SehirFotografi key={rota.slug} il={rota.il} href={`/kultur-rotalari/${rota.slug}`} baslik={rota.baslik} aciklama={`${rota.sure} · ${rota.ozet}`} className={`min-h-80 ${sira === 0 ? "md:col-span-2 lg:col-span-2" : ""}`} oncelikli={sira === 0} />)}
      </div>
    </main>
  );
}
