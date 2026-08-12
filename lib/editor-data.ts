import type { Turku } from "./types";
import { sunucuSupabase } from "./supabase/server";

type EditorTurkusuKaydi = {
  slug: string;
  baslik: string;
  yore: string;
  ozet: string;
  hikaye: string;
  ozan: string | null;
  soz_yazari: string | null;
  derleyen: string | null;
  kaynak_kisi: string | null;
  etiketler: unknown;
  kaynaklar: unknown;
  durum: string;
};

type Kaynak = { baslik: string; url: string };

function kaynakMi(deger: unknown): deger is Kaynak {
  if (!deger || typeof deger !== "object") return false;
  const kaynak = deger as Record<string, unknown>;
  if (typeof kaynak.baslik !== "string" || typeof kaynak.url !== "string") return false;
  try {
    const url = new URL(kaynak.url);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function turkuyeCevir(kayit: EditorTurkusuKaydi): Turku {
  return {
    slug: kayit.slug,
    baslik: kayit.baslik,
    yore: kayit.yore,
    ozet: kayit.ozet,
    hikaye: kayit.hikaye,
    ozan: kayit.ozan ?? undefined,
    sozYazari: kayit.soz_yazari ?? undefined,
    derleyen: kayit.derleyen ?? undefined,
    kaynakKisi: kayit.kaynak_kisi ?? undefined,
    digerAdlar: [],
    sozler: [],
    baglantilar: [],
    kaynaklar: Array.isArray(kayit.kaynaklar)
      ? kayit.kaynaklar.filter(kaynakMi)
      : [],
    etiketler: Array.isArray(kayit.etiketler)
      ? kayit.etiketler.filter((etiket): etiket is string => typeof etiket === "string")
      : [],
    dogrulama: "dogrulandi",
  };
}

export async function editorTurkusuBul(slug: string): Promise<Turku | undefined> {
  try {
    const db = await sunucuSupabase();
    const { data, error } = await db
      .from("editor_turkuler")
      .select("slug,baslik,yore,ozet,hikaye,ozan,soz_yazari,derleyen,kaynak_kisi,etiketler,kaynaklar,durum")
      .eq("slug", slug)
      .eq("durum", "yayinda")
      .maybeSingle();
    if (error || !data) return undefined;
    return turkuyeCevir(data as EditorTurkusuKaydi);
  } catch {
    // Supabase kurulmamışsa dosya tabanlı açık arşiv çalışmaya devam eder.
    return undefined;
  }
}

export async function yayinlananEditorTurkuleri(): Promise<Turku[]> {
  try {
    const db = await sunucuSupabase();
    const { data, error } = await db
      .from("editor_turkuler")
      .select("slug,baslik,yore,ozet,hikaye,ozan,soz_yazari,derleyen,kaynak_kisi,etiketler,kaynaklar,durum")
      .eq("durum", "yayinda")
      .order("guncellenme", { ascending: false });
    if (error) return [];
    return (data ?? []).map((kayit) => turkuyeCevir(kayit as EditorTurkusuKaydi));
  } catch {
    return [];
  }
}
