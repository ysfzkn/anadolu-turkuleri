# Vercel Yayın Kılavuzu

## 1. Yayın öncesi

Proje kökünde çalıştır:

```bash
npm ci
npm run verify:deploy
```

Bu komut TypeScript, zorunlu ortam değişkenleri, migration dosyaları ve production build'ini denetler.

## 2. Supabase

SQL Editor'de sırasıyla şu dosyaları çalıştır:

1. `docs/KURULUM.md` içindeki temel liste, profil ve repertuvar şeması
2. `supabase/migrations/20260811_oyunlar.sql`
3. `supabase/migrations/20260812_yasayan_hafiza.sql`
4. `supabase/migrations/20260812_admin_icerik.sql`

İlk admin ataması ve rol ayrıntıları için `docs/ADMIN-KURULUM.md` dosyasını izleyin.

Authentication → URL Configuration:

- Site URL: `https://anadoluturkuleri.com`
- Redirect URL: `https://anadoluturkuleri.com/**`
- Preview gerekiyorsa: `https://*.vercel.app/**`

Google ve Spotify sağlayıcılarında callback adresi Vercel adresi değil, Supabase'in gösterdiği şu adrestir:

```text
https://<proje>.supabase.co/auth/v1/callback
```

## 3. Vercel ortam değişkenleri

Project Settings → Environment Variables bölümüne Production, Preview ve Development için ekle:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
NEXT_PUBLIC_SADECE_DOGRULANMIS=0
```

İsteğe bağlı analitik:

```text
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

`SUPABASE_SERVICE_ROLE_KEY` mevcut kodda kullanılmıyor. Eklenirse yalnızca server ortamlarında tutulmalı; `NEXT_PUBLIC_` öneki verilmemeli.

## 4. Vercel projesi

- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm ci`
- Output Directory: boş bırak
- Node.js: 22.x (`package.json` ile sabitlendi)
- Ana production domain: `anadoluturkuleri.com`
- `www.anadoluturkuleri.com` adresini ana domaine yönlendir

## 5. Yayın sonrası smoke test

- `/`, `/soy-agaci`, `/quiz` ve rastgele bir `/turku/...` sayfası açılıyor.
- Google ve Spotify girişleri canlı domaine geri dönüyor.
- Kullanıcı adı seçimi ve profil menüsü çalışıyor.
- Liste oluşturma, türkü ekleme ve herkese açık bağlantı çalışıyor.
- Spotify bağlantısı ve playlist aktarımı çalışıyor.
- Yaşayan Hafıza görsel/ses yüklemesi çalışıyor.
- Canlı oyun odası oluşturuluyor ve ikinci kullanıcı katılabiliyor.
- `/robots.txt` ve `/sitemap.xml` 200 dönüyor.
- Mobil menü, grafik sürükleme ve filtreler çalışıyor.

## 6. Geri alma ölçütleri

Aşağıdakilerden biri oluşursa Vercel'de önceki başarılı deployment'a dön:

- Giriş callback'leri sürekli hata veriyorsa
- Liste veya profil işlemlerinde yaygın 5xx oluşuyorsa
- Ana sayfa ya da türkü sayfaları yüklenmiyorsa
- Spotify aktarımı tüm kullanıcılarda başarısızsa

Vercel → Deployments → son sağlıklı deployment → **Promote to Production** ile geri dönüş yapılabilir.
