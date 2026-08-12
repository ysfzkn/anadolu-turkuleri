import { existsSync } from "node:fs";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const zorunlu = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const sorunlar: string[] = [];
for (const ad of zorunlu) {
  const deger = process.env[ad]?.trim();
  if (!deger || /<[^>]+>/.test(deger)) sorunlar.push(`${ad} eksik veya örnek değer içeriyor.`);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) sorunlar.push("NEXT_PUBLIC_SUPABASE_URL geçerli bir HTTPS Supabase proje adresi değil.");
  } catch { sorunlar.push("NEXT_PUBLIC_SUPABASE_URL geçerli bir URL değil."); }
}

const yayinFiltresi = process.env.NEXT_PUBLIC_SADECE_DOGRULANMIS;
if (yayinFiltresi && !["0", "1"].includes(yayinFiltresi)) sorunlar.push("NEXT_PUBLIC_SADECE_DOGRULANMIS yalnızca 0 veya 1 olabilir.");

for (const migration of ["20260811_oyunlar.sql", "20260812_yasayan_hafiza.sql", "20260812_admin_icerik.sql"]) {
  if (!existsSync(`supabase/migrations/${migration}`)) sorunlar.push(`Migration bulunamadı: ${migration}`);
}

if (sorunlar.length) {
  console.error("\nVercel yayın kontrolü başarısız:\n");
  sorunlar.forEach((sorun) => console.error(`- ${sorun}`));
  process.exit(1);
}

if (!process.env.YOUTUBE_API_KEY?.trim()) {
  console.warn("Uyarı: YOUTUBE_API_KEY tanımlı değil; doğrudan kaydı olmayan türkülerde gömülü YouTube eşleşmesi yerine arama bağlantısı gösterilecek.");
}

for (const ad of ["RESEND_API_KEY", "ILETISIM_ALICI_EMAIL", "ILETISIM_GONDEREN_EMAIL"] as const) {
  if (!process.env[ad]?.trim()) console.warn(`Uyarı: ${ad} tanımlı değil; iletişim formu e-posta gönderemez.`);
}

console.log("Vercel yayın kontrolü tamam: zorunlu değişkenler ve migration dosyaları hazır.");
