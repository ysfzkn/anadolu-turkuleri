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
3. **Authentication → Providers → Spotify**'ı aç:
   - Aşağıdaki (2. adımdaki) Spotify Client ID/Secret'ı buraya gir.
   - Supabase sana bir **Redirect (callback) URL** verir
     (`https://<proje>.supabase.co/auth/v1/callback`) — bunu Spotify uygulamasına
     ekleyeceğiz.
   - (İsteğe bağlı) Google sağlayıcısını da aynı şekilde ekleyebilirsin.
4. **SQL Editor**'de aşağıdaki şemayı çalıştır (listeler + RLS):

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
```

---

## 2) Spotify Developer (giriş + önizleme + listeye ekleme)

1. https://developer.spotify.com/dashboard → **Create app**
   - App name: `Anadolu Türküleri`
   - **Redirect URIs** (hepsini ekle):
     - `https://<proje>.supabase.co/auth/v1/callback` (Supabase login için — 1.3'teki URL)
     - `http://localhost:3000/api/spotify/callback` (yerel geliştirme)
     - `https://anadoluturkuleri.com/api/spotify/callback` (canlı)
   - APIs: **Web API**
2. Oluşturunca **Settings**'ten kopyala:
   - `Client ID`     → `SPOTIFY_CLIENT_ID`
   - `Client secret` → `SPOTIFY_CLIENT_SECRET` (GİZLİ)
3. Kullanacağımız izinler (scope):
   - `playlist-modify-public`, `playlist-modify-private` — kullanıcı listesini
     Spotify çalma listesine dönüştürmek için
   - `user-read-email` — temel profil

> Not: 30 saniyelik **önizleme** (`preview_url`) için kullanıcı girişi gerekmez;
> arama Client Credentials ile yapılır. Yalnızca "listeme ekle" kullanıcı OAuth'ı ister.

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
