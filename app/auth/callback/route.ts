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
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/giris?hata=oturum`);
}
