import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Supabase oturumunu tazeler ve yenilenen çerezleri yanıta taşır. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anahtar = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anahtar) return response;

  const supabase = createServerClient(url, anahtar, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cerezler) {
        cerezler.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cerezler.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|turkey.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
