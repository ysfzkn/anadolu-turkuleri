import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let istemci: SupabaseClient | undefined;

/**
 * Tarayıcı tarafı Supabase istemcisi.
 * Ortam değişkenleri yoksa (henüz .env.local doldurulmadıysa) hata fırlatır;
 * çağıran taraf try/catch ile yakalayıp "giriş yakında" durumuna düşer.
 */
export function tarayiciSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anahtar = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anahtar) {
    throw new Error("Supabase ortam değişkenleri tanımlı değil (.env.local).");
  }
  // Tek tarayıcı istemcisi kullanmak auth event'lerinin ve OAuth kod
  // alışverişinin birden fazla kez çalışmasını engeller. Callback akışını
  // /auth/callback sayfası yönettiği için URL algılamayı burada kapatıyoruz.
  istemci ??= createBrowserClient(url, anahtar, {
    auth: { detectSessionInUrl: false },
  });
  return istemci;
}

/** Env tanımlı mı? (Giriş özelliklerini koşullu göstermek için.) */
export function supabaseHazirMi(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
