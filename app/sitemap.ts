import type { MetadataRoute } from "next";
import { iller, tumTurkuler } from "@/lib/data";
import { kisiler, temalar } from "@/lib/varliklar";
import { tumTerimSluglari } from "@/lib/sozluk";
import { tumYolculukSluglari } from "@/lib/yolculuklar";
import { yayinlananEditorTurkuleri } from "@/lib/editor-data";
import { kulturRotalari } from "@/lib/kultur";
import { sunucuSupabase } from "@/lib/supabase/server";

const KOK = "https://anadoluturkuleri.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sabit: MetadataRoute.Sitemap = [
    { url: KOK, changeFrequency: "daily", priority: 1 },
    { url: `${KOK}/quiz`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${KOK}/soy-agaci`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${KOK}/katki`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${KOK}/hakkinda`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${KOK}/kultur-rotalari`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${KOK}/kisi`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${KOK}/tema`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${KOK}/sozluk`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${KOK}/yolculuklar`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${KOK}/rehber`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${KOK}/kurslar`, changeFrequency: "monthly", priority: 0.65 },
    { url: `${KOK}/destek`, changeFrequency: "monthly", priority: 0.35 },
    { url: `${KOK}/is-birligi`, changeFrequency: "monthly", priority: 0.35 },
    { url: `${KOK}/gorsel-kaynaklari`, changeFrequency: "monthly", priority: 0.35 },
  ];
  const yoreler = iller().map((il) => ({ url: `${KOK}/yore/${il.slug}`, changeFrequency: "weekly" as const, priority: 0.75 }));
  const kisiUrlleri = kisiler().map((k) => ({ url: `${KOK}/kisi/${k.slug}`, changeFrequency: "monthly" as const, priority: 0.7 }));
  const temaUrlleri = temalar().map((t) => ({ url: `${KOK}/tema/${t.slug}`, changeFrequency: "monthly" as const, priority: 0.7 }));
  const terimUrlleri = tumTerimSluglari().map((slug) => ({ url: `${KOK}/sozluk/${slug}`, changeFrequency: "monthly" as const, priority: 0.65 }));
  const yolculukUrlleri = tumYolculukSluglari().map((slug) => ({ url: `${KOK}/yolculuk/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 }));
  const dosyaTurkuleri = tumTurkuler();
  const dosyaSluglari = new Set(dosyaTurkuleri.map((turku) => turku.slug));
  const editorTurkuleri = (await yayinlananEditorTurkuleri()).filter(
    (turku) => !dosyaSluglari.has(turku.slug),
  );
  const turkuler = [...dosyaTurkuleri, ...editorTurkuleri]
    .filter((turku) => turku.dogrulama !== "taslak")
    .map((turku) => ({ url: `${KOK}/turku/${turku.slug}`, changeFrequency: "monthly" as const, priority: turku.dogrulama === "dogrulandi" ? 0.9 : 0.65 }));
  const sabitRotaSluglari = new Set(kulturRotalari.map((rota) => rota.slug));
  let editorRotaSluglari: string[] = [];
  try {
    const db = await sunucuSupabase();
    const { data } = await db.from("kultur_icerikleri").select("slug").eq("tur", "kultur-rotasi").eq("durum", "yayinda");
    editorRotaSluglari = (data ?? []).map((kayit) => kayit.slug).filter((slug) => !sabitRotaSluglari.has(slug));
  } catch {
    editorRotaSluglari = [];
  }
  const rotalar: MetadataRoute.Sitemap = [...kulturRotalari.map((rota) => rota.slug), ...editorRotaSluglari].map((slug) => ({
    url: `${KOK}/kultur-rotalari/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [...sabit, ...yoreler, ...kisiUrlleri, ...temaUrlleri, ...terimUrlleri, ...yolculukUrlleri, ...turkuler, ...rotalar];
}
