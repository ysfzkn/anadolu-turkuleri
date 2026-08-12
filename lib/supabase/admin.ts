import { createClient } from "@supabase/supabase-js";
import { sunucuSupabase } from "./server";

export async function yoneticiDogrula(editorYeterli = true) {
  const supabase = await sunucuSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profil } = await supabase.from("profiller").select("id,kullanici_adi,rol").eq("id", user.id).maybeSingle();
  const roller = editorYeterli ? ["editor", "admin"] : ["admin"];
  return profil && roller.includes(profil.rol) ? { user, profil } : null;
}

export function servisSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY eksik");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
