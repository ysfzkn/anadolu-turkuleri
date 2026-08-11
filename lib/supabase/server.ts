import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Sunucu tarafı Supabase istemcisi (RSC, route handler, server action).
 * Çerezleri Next'in cookie store'u üzerinden okur/yazar.
 */
export function sunucuSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anahtar = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cerez = cookies();

  return createServerClient(url, anahtar, {
    cookies: {
      getAll() {
        return cerez.getAll();
      },
      setAll(cerezler) {
        try {
          cerezler.forEach(({ name, value, options }) =>
            cerez.set(name, value, options),
          );
        } catch {
          // Server Component'ten çağrıldığında set() atılabilir; middleware
          // oturumu zaten tazeliyor, bu güvenle yok sayılır.
        }
      },
    },
  });
}
