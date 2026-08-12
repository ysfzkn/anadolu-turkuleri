# Vercel Deploy + Domain Kılavuzu

Kod GitHub'da (`ysfzkn/anadolu-turkuleri`, `main`), production build doğrulandı
(Next 16, 1951 türkü). Aşağıdaki adımlar tek seferlik kurulumdur; sonrasında
`main`'e her push otomatik deploy eder.

---

## 1) Supabase (production) — önce veritabanı

Uygulama Supabase'e bağlı; şema production projesine uygulanmalı.

- **İlk kurulum:** `supabase/migrations/20260810_initial.sql` dosyasının
  tamamını, yeni Supabase projesinde **Dashboard → SQL Editor**'de baştan sona
  bir kez çalıştır. (Tüm tablolar, RLS politikaları ve fonksiyonlar doğru
  bağımlılık sırasında tek dosyada.)
- İlk admini atamak için (kullanıcı adını seçtikten sonra):
  `update public.profiller set rol='admin' where kullanici_adi='KULLANICI_ADIN';`
- (Zaten dev'de uyguladıysan ve prod = aynı proje ise atla.)
- Bundan sonraki şema değişiklikleri ayrı, tarihli dosyalarda tutulur
  (ör. `20260901_yeni_ozellik.sql`) ve yalnızca o dosyayı çalıştırırsın.

## 2) Vercel projesi oluştur

1. https://vercel.com → **Add New → Project** → GitHub'dan
   `ysfzkn/anadolu-turkuleri`'yi **Import** et.
2. Framework: **Next.js** (otomatik algılanır). Build Command / Output /
   Install: varsayılan bırak.
3. **Node.js Version**: Settings → General → 20.x (veya 22.x).

## 3) Ortam değişkenleri (Vercel → Settings → Environment Variables)

Tüm ortamlar (Production + Preview) için ekle:

| Anahtar | Kaynak |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API (anon public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (**service_role**, GİZLİ) — `/admin` için zorunlu |
| `SPOTIFY_CLIENT_ID` | Spotify Developer Dashboard |
| `SPOTIFY_CLIENT_SECRET` | Spotify Developer Dashboard (GİZLİ) |
| `YOUTUBE_API_KEY` | Google Cloud → YouTube Data API |
| `RESEND_API_KEY` | Resend (iletişim formu e-postası) |
| `ILETISIM_ALICI_EMAIL` | Formun düşeceği e-posta |
| `ILETISIM_GONDEREN_EMAIL` | Doğrulanmış gönderen adresi |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog (analitik) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (ör. https://eu.i.posthog.com) |
| `NEXT_PUBLIC_SADECE_DOGRULANMIS` | `0` (canlıda `1` = yalnız doğrulanmış türkü) |

> Not: `.env.local` değerlerini birebir buraya taşı. `NEXT_PUBLIC_` olanlar
> tarayıcıya gider (herkese açık); diğerleri gizlidir.

## 4) İlk deploy

**Deploy** de. Build ~1951 statik sayfa ürettiğinden birkaç dakika sürebilir.
Bitince Vercel bir `*.vercel.app` adresi verir — önce orada bir tur at, çalıştığını gör.

## 5) Domainleri bağla (anadoluturkuleri.com + .com.tr)

Vercel → Project → **Settings → Domains** → şu 4'ünü **Add** et:
- `anadoluturkuleri.com`  (birincil)
- `www.anadoluturkuleri.com`
- `anadoluturkuleri.com.tr`
- `www.anadoluturkuleri.com.tr`

Vercel her biri için gereken DNS kaydını gösterir. **Hostinger → hPanel → DNS
Zone Editor**'de (her iki domain için ayrı ayrı):

| Tür | Ad (Host) | Değer |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

- Aynısını hem `.com` hem `.com.tr` için yap.
- DNS yayılması 5 dk – birkaç saat sürebilir. Vercel domain'i "Valid" gösterince
  SSL sertifikası otomatik çıkar.
- **Birincil + yönlendirme**: Vercel'de `anadoluturkuleri.com`'u birincil yap;
  diğer 3'ünü ona **redirect** olarak ayarla (Vercel Domains ekranında seçenek var).

> `.com.tr` için: domain'in nameserver'ları Hostinger'a bakıyorsa DNS kayıtlarını
> Hostinger'dan yönetirsin. Bakmıyorsa registrar (nic.tr/Hostinger) panelinde
> nameserver'ı Hostinger'a çevir ya da kayıtları oradan ekle.

## 6) Deploy sonrası — Auth adreslerini güncelle

Canlı domain hazır olunca:
- **Supabase → Auth → URL Configuration**:
  - **Site URL**: `https://anadoluturkuleri.com`
  - **Redirect URLs**'e ekle: `https://anadoluturkuleri.com/**`,
    `https://www.anadoluturkuleri.com.tr/**`, `https://*.vercel.app/**`
- **Spotify / Google OAuth**: Redirect URI **Supabase callback**'i olduğundan
  değişmez (`https://<proje>.supabase.co/auth/v1/callback`) — dokunma.

## 7) Doğrulama turu

- Ana sayfa + harita, bir türkü, arama, `/quiz`, `/kultur-rotalari` açılıyor mu?
- Giriş (Google + Spotify) → kullanıcı adı → liste/repertuvar → Spotify'a aktar.
- İletişim formu bir test mesajı gönderiyor mu (Resend).

Sonraki her `main` push'u otomatik yeni deploy tetikler.
