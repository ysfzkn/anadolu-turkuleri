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
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (GİZLİ — yalnızca sunucuda)
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
5. **SQL Editor**'de aşağıdaki şemayı çalıştır (listeler + RLS):

```sql
-- Kullanıcı listeleri
create table public.listeler (
  id uuid primary key default gen_random_uuid(),
  kullanici_id uuid not null references auth.users(id) on delete cascade,
  baslik text not null,
  aciklama text,
  herkese_acik boolean not null default false,
  paylasim_kodu text unique default encode(gen_random_bytes(6), 'hex'),
  olusturulma timestamptz not null default now()
);

create table public.liste_turkuleri (
  liste_id uuid not null references public.listeler(id) on delete cascade,
  turku_slug text not null,
  sira int not null default 0,
  eklenme timestamptz not null default now(),
  primary key (liste_id, turku_slug)
);

-- Row Level Security
alter table public.listeler enable row level security;
alter table public.liste_turkuleri enable row level security;

-- Sahibi kendi listelerinde her şeyi yapabilir
create policy "sahibi_listeler" on public.listeler
  for all using (auth.uid() = kullanici_id)
  with check (auth.uid() = kullanici_id);

-- Herkese açık listeler herkesçe okunabilir
create policy "acik_listeler_oku" on public.listeler
  for select using (herkese_acik = true);

-- Liste içeriği: sahibi yönetir
create policy "sahibi_liste_turkuleri" on public.liste_turkuleri
  for all using (
    exists (select 1 from public.listeler l
            where l.id = liste_id and l.kullanici_id = auth.uid())
  ) with check (
    exists (select 1 from public.listeler l
            where l.id = liste_id and l.kullanici_id = auth.uid())
  );

-- Herkese açık listelerin içeriği okunabilir
create policy "acik_liste_turkuleri_oku" on public.liste_turkuleri
  for select using (
    exists (select 1 from public.listeler l
            where l.id = liste_id and l.herkese_acik = true)
  );

-- Kullanıcı profilleri (kullanıcı adı — liderlik tablosu vb. için)
create table public.profiller (
  id uuid primary key references auth.users(id) on delete cascade,
  kullanici_adi text unique not null,
  olusturulma timestamptz not null default now()
);
alter table public.profiller enable row level security;
-- Kullanıcı adları herkese açık (liderlik tablosu, paylaşım)
create policy "profiller_oku" on public.profiller for select using (true);
-- Kişi yalnızca kendi profilini oluşturur/günceller
create policy "profiller_kendi" on public.profiller
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Kişisel repertuvar (bağlamada çalınan/öğrenilen türküler)
create table public.repertuvar (
  kullanici_id uuid not null references auth.users(id) on delete cascade,
  turku_slug text not null,
  durum text not null default 'calmak-istiyorum',
    -- 'calabiliyorum' | 'ogreniyorum' | 'calmak-istiyorum'
  eklenme timestamptz not null default now(),
  primary key (kullanici_id, turku_slug)
);
alter table public.repertuvar enable row level security;
create policy "sahibi_repertuvar" on public.repertuvar
  for all using (auth.uid() = kullanici_id)
  with check (auth.uid() = kullanici_id);
```

---

## 1b) Google ile giriş (Google Cloud)

1. https://console.cloud.google.com → üstten bir **proje oluştur** (ör.
   `anadolu-turkuleri`).
2. **APIs & Services → OAuth consent screen**:
   - User Type: **External** → Create
   - App name, User support email, Developer contact email doldur → Save
   - (Yayına almadan test edeceksen "Test users"a kendi Gmail'ini ekle.)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized redirect URIs** → şunu ekle (Spotify'daki ile AYNI Supabase
     callback'i):
     ```
     https://<proje>.supabase.co/auth/v1/callback
     ```
   - Create → çıkan **Client ID** ve **Client Secret**'ı kopyala.
4. **Supabase → Authentication → Providers → Google**'ı aç → bu Client ID /
   Secret'ı yapıştır, kaydet.

> Yani hem Google hem Spotify aynı Supabase callback adresine döner; her iki
> sağlayıcının kendi panelinde de aynı redirect URI kullanılır.

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
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Spotify
SPOTIFY_CLIENT_ID=<client-id>
SPOTIFY_CLIENT_SECRET=<client-secret>

# Yayın filtresi (opsiyonel): 1 = yalnızca doğrulanmış türküler
NEXT_PUBLIC_SADECE_DOGRULANMIS=0
```

Aynı değişkenleri Vercel → Project → Settings → Environment Variables'a da ekle.

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
