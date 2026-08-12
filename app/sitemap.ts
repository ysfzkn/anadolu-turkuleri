import type { MetadataRoute } from "next";
import { iller, tumTurkuler } from "@/lib/data";
import { yayinlananEditorTurkuleri } from "@/lib/editor-data";

const KOK = "https://anadoluturkuleri.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sabit: MetadataRoute.Sitemap = [
    { url: KOK, changeFrequency: "daily", priority: 1 },
    { url: `${KOK}/quiz`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${KOK}/soy-agaci`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${KOK}/katki`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${KOK}/hakkinda`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${KOK}/kultur-rotalari`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${KOK}/kurslar`, changeFrequency: "monthly", priority: 0.65 },
    { url: `${KOK}/destek`, changeFrequency: "monthly", priority: 0.35 },
    { url: `${KOK}/is-birligi`, changeFrequency: "monthly", priority: 0.35 },
  ];
  const yoreler = iller().map((il) => ({ url: `${KOK}/yore/${il.slug}`, changeFrequency: "weekly" as const, priority: 0.75 }));
  const dosyaTurkuleri = tumTurkuler();
  const dosyaSluglari = new Set(dosyaTurkuleri.map((turku) => turku.slug));
  const editorTurkuleri = (await yayinlananEditorTurkuleri()).filter(
    (turku) => !dosyaSluglari.has(turku.slug),
  );
  const turkuler = [...dosyaTurkuleri, ...editorTurkuleri]
    .filter((turku) => turku.dogrulama !== "taslak")
    .map((turku) => ({ url: `${KOK}/turku/${turku.slug}`, changeFrequency: "monthly" as const, priority: turku.dogrulama === "dogrulandi" ? 0.9 : 0.65 }));
  return [...sabit, ...yoreler, ...turkuler];
}
