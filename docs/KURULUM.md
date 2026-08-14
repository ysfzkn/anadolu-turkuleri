# Faz 2 Kurulum Kılavuzu (Supabase + Spotify)

Login, kişisel/paylaşılabilir listeler ve Spotify entegrasyonu için iki dış
servis gerekir. Bu adımları sen tamamlayınca anahtarları `.env.local`'e (ve
Vercel'e) girip entegrasyonu kuracağım.

> Öneri: **Login sağlayıcısı olarak Spotify'ı** kullan. Böylece tek bir Spotify
> uygulaması hem girişi hem de "listeye ekle" özelliğini karşılar. İstersen
> Google'ı da ekleriz.

---

## 1) Supabase (auth + veritabanı + listeler)

1. https://supabase.com → **New project**
   - Ad: `anadolu-turkuleri`
   - Bölge: **Frankfurt (eu-central-1)** (Türkiye'ye en yakın düşük gecikme)
   - Güçlü bir veritabanı şifresi belirle ve sakla.
2. **Project Settings → API** sayfasından şunları kopyala:
   - `Project URL`  → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public`  → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → mevcut uygulama akışlarında gerekli değil. İleride yönetim
     işlemleri için kullanılırsa `SUPABASE_SERVICE_ROLE_KEY` adıyla yalnızca
     sunucu ortamına eklenmeli.
   - `<proje>` kısmı senin **proje referansın** (Project URL'deki alt alan adı,
     ör. `abcd1234efgh`). Callback adresin şu olacak:
     **`https://<proje>.supabase.co/auth/v1/callback`**
3. **Authentication → Providers → Spotify**'ı aç:
   - 2. adımdaki Spotify **Client ID / Client Secret**'ı buraya gir, kaydet.
   - Bu ekranda Supabase **"Callback URL (for OAuth)"** diye bir adres gösterir —
     tam olarak bu adresi kopyala; **Spotify uygulamasının Redirect URI'sine bunu
     gireceğiz** (aşağıda 2. bölüm).
   - (İsteğe bağlı) Google sağlayıcısını da aynı mantıkla ekleyebilirsin.
4. **Authentication → URL Configuration**:
   - **Site URL**: geliştirme için `http://localhost:3000` (canlıda
     `https://anadoluturkuleri.com` yaparız)
   - **Redirect URLs** (izin listesi) — şunları ekle:
     - `http://localhost:3000/**`
     - `https://anadoluturkuleri.com/**`
     - `https://*.vercel.app/**` (Vercel önizleme dağıtımları için, isteğe bağlı)
   > Bunlar, giriş sonrası kullanıcının GERİ DÖNECEĞİ site adresleridir —
   > Spotify'daki Redirect URI'den FARKLIDIR (o Supabase callback'idir).
5. **SQL Editor**'de `supabase/migrations` klasöründeki migration dosyalarını
   aşağıdaki sırayla çalıştır:

   1. `20260810_temel_sistem.sql` — profil, listeler ve repertuvar
   2. `20260811_oyunlar.sql` — canlı oyun odaları ve skorlar
   3. `20260812_yasayan_hafiza.sql` — kullanıcı katkıları ve dosya alanı
   4. `20260812_admin_icerik.sql` — editör, admin ve yönetilebilir içerikler
   5. `20260812_admin_guvenlik_duzeltmesi.sql` — admin işlevlerinin güvenlik düzeltmeleri
   6. `20260812_spotify_playlist_links.sql` — kalıcı Spotify liste eşlemesi
   7. `20260813_youtube_liste.sql` — kalıcı YouTube (Music) liste eşlemesi

   Dosyalar yeni proje kurulumunda yukarıdaki sırayla uygulanmalıdır. Daha önce
   temel tabloları bu dokümandan elle oluşturduysan `20260810_temel_sistem.sql`
   mevcut kayıtları silmeden tablo ve politikaları güvenli biçimde tamamlar.

---

## 1b) Google ile giriş (Google Cloud)

1. https://console.cloud.google.com → üstten bir **proje oluştur** (ör.
   `anadolu-turkuleri`).
2. **Google Auth Platform** (yeni ad — eski "OAuth consent screen" menü linki
   artık buraya yönlendirir). Sol menüde `APIs & Services` altında değil,
   arama çubuğuna **"Google Auth Platform"** yazarak veya doğrudan
   `https://console.cloud.google.com/auth/overview` adresine giderek açabilirsin.
   İlk kez giriyorsan **"Get started"**'e tıkla:
   - **App information**: App name (`Anadolu Türküleri`), User support email
   - **Audience**: **External** seç
   - **Contact information**: Developer contact email
   - **Finish** → Google Auth Platform artık bu proje için etkin.
3. Aynı **Google Auth Platform** sol menüsünde şunları yap:
   - **Branding** — logo, uygulama alanı vb. (kaydettiğin bilgilerin
     görüntülendiği ekran; opsiyonel düzenlemeler).
   - **Audience** — sağ üstteki **+ Add users** ile kendi Gmail'ini
     **Test users** olarak ekle (uygulama "Testing" modundayken zorunlu).
   - **Data access** — **Add or remove scopes** düğmesine bas, açılan sağ
     panelde en alttaki "Manually add scopes" kutusuna şunu yaz ve **Add to
     table** de:
     ```
     https://www.googleapis.com/auth/youtube
     ```
     Sonra alttan **Update** → **Save**. Bu, kullanıcı onay ekranında YouTube
     playlist okuma/yazma iznini net göstermek içindir. `openid`, `email`,
     `profile` zaten temel scope'lar olarak kabul edilir.
4. **APIs & Services → Library → YouTube Data API v3**'ü aç (bu, giriş için
   kullanılan API-key'den bağımsız olarak kullanıcı OAuth çağrılarında da
   gereklidir).
5. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   (aynı işleve Google Auth Platform → **Clients** menüsünden de
   ulaşabilirsin):
   - Application type: **Web application**
   - **Authorized redirect URIs** → şunu ekle (Spotify'daki ile AYNI Supabase
     callback'i):
     ```
     https://<proje>.supabase.co/auth/v1/callback
     ```
   - Create → çıkan **Client ID** ve **Client Secret**'ı kopyala.
6. **Supabase → Authentication → Providers → Google**'ı aç:
   - Client ID / Client Secret'ı yapıştır ve kaydet.
   - Not: Bu ekranda Spotify'daki gibi bir **"Scopes"** alanı **yoktur**. Google
     için ek scope'lar Supabase Dashboard'dan değil, uygulama kodundan
     istenir — projede `YouTubeMusicBaglaButonu` bileşeni her giriş isteğinde
     `openid email profile https://www.googleapis.com/auth/youtube` scope'unu
     otomatik gönderir. Yani izin akışı için yapman gereken tek şey (a) Google
     Auth Platform → Data access ekranına YouTube scope'unu eklemek (yukarıda
     3. adım) ve (b) YouTube Data API v3'ü etkinleştirmek (4. adım).
7. Google ile açılmış bir hesabın sonradan Spotify'a bağlanabilmesi için
   **Supabase → Authentication → Settings → Manual Linking** seçeneğini aç.
   Bu ayar kapalıysa kullanıcı giriş yapabilir; ancak listesini Spotify'a
   aktarırken mevcut hesabına Spotify yetkisi ekleyemez.

> Yani hem Google hem Spotify aynı Supabase callback adresine döner; her iki
> sağlayıcının kendi panelinde de aynı redirect URI kullanılır.

### 1b.1) YouTube Music'e liste aktarımı

`https://www.googleapis.com/auth/youtube` kapsamı; **YouTube Music'e liste
aktarımı** ve "YouTube Music listeme ekle" özelliği için gereklidir. YouTube
Music'in ayrı bir public API'si olmadığı için playlist'ler YouTube Data API v3
üzerinden oluşturulur ve YouTube ile YouTube Music aynı hesap altında olduğu
için sonuç `music.youtube.com` üzerinde de görünür.

- Bu kapsam **hesap bağlanırken** onay ekranında istenir. Daha önce Google ile
  giriş yapmış kullanıcılar `YouTube Music'e aktar` butonuna bastığında
  "Google'ı bağla" adımına yönlendirilir; onay ekranından yeni izni verirler.
- Uygulama, OAuth çağrısını `access_type=offline` ve `prompt=consent` ile
  yaptığı için hem refresh token'a hem de eksik izinlerin görünmesine güvenir.
- Ek DB adımı: `supabase/migrations/20260813_youtube_liste.sql` dosyasını da
  SQL Editor'de çalıştır. Bu migration `youtube_liste_baglantilari` tablosunu
  ve RLS politikasını oluşturur (Spotify eşleme tablosuyla aynı kalıp).

---

## 2) Spotify Developer (giriş + önizleme + listeye ekleme)

1. https://developer.spotify.com/dashboard → **Create app**
   - App name: `Anadolu Türküleri` · App description: kısa bir açıklama
   - **Redirect URIs** — buraya SADECE **Supabase callback adresini** gir
     (Bölüm 1.3'te kopyaladığın adres):
     ```
     https://<proje>.supabase.co/auth/v1/callback
     ```
     Başka bir şey (localhost, /api/... vb.) EKLEMENE gerek yok — giriş akışı
     Supabase üzerinden döndüğü için Spotify yalnızca bu adresi tanımalı.
     (`<proje>` = senin Supabase proje referansın.)
   - **Which API/SDKs**: **Web API**'yi işaretle.
2. Oluşturunca **Settings**'ten kopyala:
   - `Client ID`     → `SPOTIFY_CLIENT_ID`
   - `Client secret` → `SPOTIFY_CLIENT_SECRET` (GİZLİ)
   - Bu ikisini **Supabase → Auth → Providers → Spotify** ekranına da girmiştin
     (Bölüm 1.3).
3. İzinler (scope) — bunları uygulama panelinde ayarlamana gerek YOK; giriş
   isteğinde koddan istiyoruz. Kullanacaklarımız:
   - `playlist-modify-public`, `playlist-modify-private` — listeyi Spotify çalma
     listesine dönüştürmek için
   - `playlist-read-private`, `playlist-read-collaborative` — Spotify'daki
     listeleri göstermek, güncelliği ve yinelenen parçaları denetlemek için
   - `user-read-email` — temel profil

> Not: 30 saniyelik **önizleme** (`preview_url`) için kullanıcı girişi gerekmez;
> arama Client Credentials ile sunucu tarafında yapılır. Yalnızca "listeme ekle"
> kullanıcı OAuth'ı (yukarıdaki scope'lar) gerektirir.
>
> ⚠️ Spotify, loopback dışındaki tüm Redirect URI'lerin **https** olmasını ister;
> Supabase callback'i zaten https olduğu için sorun yok.

---

## 3) Ortam değişkenleri

Proje kökünde `.env.local` (Git'e girmez — `.gitignore`'da):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<proje>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
# Yalnızca sunucuda kullanılır; NEXT_PUBLIC_ öneki eklemeyin ve tarayıcıya vermeyin.
# Editör Masası, özel katkı dosyaları ve Spotify liste aktarımı için gereklidir.
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Spotify
SPOTIFY_CLIENT_ID=<client-id>
SPOTIFY_CLIENT_SECRET=<client-secret>

# YouTube Data API v3 — yalnızca sunucuda kullanılır
YOUTUBE_API_KEY=<youtube-data-api-key>

# Yayın filtresi (opsiyonel): 1 = yalnızca doğrulanmış türküler
NEXT_PUBLIC_SADECE_DOGRULANMIS=0
```

Aynı değişkenleri Vercel → Project → Settings → Environment Variables'a da ekle.

### YouTube video önizlemesi

1. [Google Cloud Console](https://console.cloud.google.com/) içinde mevcut projeyi
   seç veya yeni bir proje oluştur.
2. **APIs & Services → Library** ekranında **YouTube Data API v3** hizmetini aç.
3. **Credentials → Create credentials → API key** ile bir anahtar oluştur.
4. Anahtarın **API restrictions** ayarını `YouTube Data API v3` ile sınırla.
   Bu anahtar sunucu tarafında kullanıldığı için adına `NEXT_PUBLIC_` ekleme.
5. Anahtarı yerelde `.env.local`, Vercel'de Production/Preview/Development
   ortamlarına `YOUTUBE_API_KEY` adıyla ekle.

Arşivde doğrulanmış doğrudan bir YouTube videosu varsa o kayıt kullanılır ve API
kotası harcanmaz. Diğer eserlerde en fazla beş sonuç taranır; sonuç 30 gün
önbelleğe alınır. Anahtar tanımlı değilse sayfa bozulmaz, YouTube arama bağlantısı
gösterilir.

### İletişim formu ve e-posta teslimi

İletişim formu, mesajları sunucu tarafından [Resend](https://resend.com) üzerinden
belirlediğiniz posta kutusuna yollar. Gizli anahtar tarayıcıya gönderilmez.

1. Resend hesabı oluşturup **Domains → Add domain** adımıyla tercihen
   `mail.anadoluturkuleri.com` gibi bir gönderim alt alan adı ekleyin.
2. Resend'in verdiği SPF ve DKIM kayıtlarını domain DNS paneline ekleyip alan
   adının `verified` olmasını bekleyin.
3. **API Keys** bölümünden yalnızca e-posta gönderme yetkili bir anahtar üretin.
4. Aşağıdaki değişkenleri `.env.local` ve Vercel Environment Variables alanına
   ekleyin:

```bash
RESEND_API_KEY=re_...
ILETISIM_ALICI_EMAIL=iletisim@anadoluturkuleri.com
ILETISIM_GONDEREN_EMAIL=Anadolu Türküleri <bildirim@mail.anadoluturkuleri.com>
```

`ILETISIM_ALICI_EMAIL`, form mesajlarının düşeceği gerçek posta kutusudur.
`ILETISIM_GONDEREN_EMAIL` ise Resend'de doğrulanmış alan adını kullanmalıdır.
Ziyaretçinin adresi e-postanın yanıt adresi olarak atanır; böylece posta
kutunuzdan doğrudan yanıt verebilirsiniz.

---

## Tamamlayınca

Bu değerleri bana ver (service_role ve client_secret gibi GİZLİ olanları
dikkatli paylaş); ben şunları kurayım:
- Supabase istemcisi + "Spotify ile giriş" akışı
- Kişisel liste oluşturma/kaydetme + herkese açık paylaşım sayfası (Anadolu
  desenli liste görünümü, PNG/PDF dışa aktarma)
- "Spotify listeme ekle" butonu ve türkü sayfalarında 30sn önizleme

## 4) Canlı oyunlar ve liderlik tablosu

Supabase Dashboard → **SQL Editor** ekranında ayrıca
`supabase/migrations/20260811_oyunlar.sql` dosyasının tamamını çalıştır.
Bu migration davet kodlu iki kişilik odaları, Realtime yayınını ve kullanıcı
adıyla görünen liderlik tablosunu kurar. Tek kişilik oyunlar bu migration
olmadan da çalışır; yalnızca “Canlı Meydan Okuma” veritabanını bekler.

## 5) Editör Masası ve katkı yönetimi

Supabase Dashboard → **SQL Editor** ekranında şu dosyaları sırayla çalıştır:

1. `supabase/migrations/20260812_admin_icerik.sql`
2. `supabase/migrations/20260812_admin_guvenlik_duzeltmesi.sql`

İkinci dosya, yönetim migration'ını daha önce çalıştırmış projelerde de yetki
ve özel dosya politikalarını günceller. Ardından ilk admin hesabını kullanıcı
adı üzerinden yetkilendir:

```sql
update public.profiller
set rol = 'admin'
where kullanici_adi = 'KULLANICI_ADINIZ';
```

`SUPABASE_SERVICE_ROLE_KEY` yalnızca Vercel Environment Variables ve yerel
`.env.local` içinde bulunmalıdır. Git'e eklemeyin, ekran görüntüsünde
paylaşmayın ve hiçbir `NEXT_PUBLIC_` değişkenine koymayın.
