import { NextResponse } from "next/server";
import { sunucuSupabase } from "@/lib/supabase/server";

/**
 * OAuth callback: sağlayıcıdan gelen `code`'u oturuma çevirir ve
 * kullanıcıyı `next` (varsayılan ana sayfa) adresine yönlendirir.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = sunucuSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // İlk giriş mi? Kullanıcı adı yoksa belirleme sayfasına gönder.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profil, error: pErr } = await supabase
          .from("profiller")
          .select("kullanici_adi")
          .eq("id", user.id)
          .maybeSingle();
        // pErr varsa (tablo yoksa) atla; yalnızca profil yoksa yönlendir.
        if (!pErr && !profil) {
          return NextResponse.redirect(
            `${origin}/kullanici-adi?next=${encodeURIComponent(next)}`,
          );
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/giris?hata=oturum`);
}
