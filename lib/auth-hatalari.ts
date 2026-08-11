/** Supabase OAuth / oturum hata kodlarını kullanıcı dostu Türkçe metne çevirir. */
export function authHataMesaji(kod: string): string {
  switch (kod) {
    case "oturum":
      return "Giriş tamamlanamadı. Lütfen tekrar deneyin.";
    case "over_email_send_rate_limit":
      return (
        "Çok fazla giriş denemesi yapıldı ve Supabase e-posta limiti aşıldı. " +
        "Yaklaşık 1 saat bekleyip tekrar deneyin. Geliştirme sırasında Supabase " +
        "panelinde Authentication → Providers → Email → “Confirm email” seçeneğini " +
        "kapatarak bu limiti tetiklemeyi azaltabilirsiniz."
      );
    case "server_error":
      return "Kimlik doğrulama sunucusunda bir hata oluştu. Lütfen bir süre sonra tekrar deneyin.";
    case "access_denied":
      return "Giriş iptal edildi veya izin verilmedi.";
    default:
      if (kod.includes("rate_limit") || kod.includes("email"))
        return authHataMesaji("over_email_send_rate_limit");
      return "Giriş başarısız oldu. Lütfen tekrar deneyin.";
  }
}

/** URL hash'inden (#error=...) Supabase hata kodunu okur. */
export function hashHataKodu(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return params.get("error_code") ?? params.get("error");
}
