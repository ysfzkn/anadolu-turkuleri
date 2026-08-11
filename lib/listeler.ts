import { sunucuSupabase } from "./supabase/server";

export interface ListeSatiri {
  id: string;
  baslik: string;
  aciklama: string | null;
  herkese_acik: boolean;
  paylasim_kodu: string;
  kullanici_id: string;
  liste_turkuleri?: { turku_slug: string; sira: number }[];
}

function envVar(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Paylaşım koduyla herkese açık bir liste (anonim okuma — RLS izin verir). */
export async function herkeseAcikListe(
  kod: string,
): Promise<ListeSatiri | null> {
  if (!envVar()) return null;
  const supabase = sunucuSupabase();
  const { data, error } = await supabase
    .from("listeler")
    .select(
      "id,baslik,aciklama,herkese_acik,paylasim_kodu,kullanici_id,liste_turkuleri(turku_slug,sira)",
    )
    .eq("paylasim_kodu", kod)
    .eq("herkese_acik", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as ListeSatiri;
}

/** Şu anki oturum kullanıcısı (yoksa null). */
export async function aktifKullanici() {
  if (!envVar()) return null;
  const supabase = sunucuSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
