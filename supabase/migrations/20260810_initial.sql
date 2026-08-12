-- ================================================================
-- Anadolu Türküleri — İLK KURULUM (initial) veritabanı şeması
--
-- Yeni bir Supabase projesinde SQL Editor'de baştan sona BİR KEZ
-- çalıştırın. Bölümler doğru bağımlılık sırasındadır. Bu dosyadan
-- sonraki şema değişiklikleri ayrı, tarihli migration dosyalarında
-- tutulur (ör. 20260901_yeni_ozellik.sql).
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- Bölüm: temel_sistem
-- ────────────────────────────────────────────────────────────────

-- Anadolu Türküleri temel kullanıcı altyapısı
-- Bağımlılık: auth.users (Supabase Auth tarafından sağlanır)

create extension if not exists pgcrypto;

-- Kullanıcı profilleri
create table if not exists public.profiller (
  id uuid primary key references auth.users(id) on delete cascade,
  kullanici_adi text unique not null,
  olusturulma timestamptz not null default now()
);

-- Kullanıcının oluşturduğu türkü listeleri
create table if not exists public.listeler (
  id uuid primary key default gen_random_uuid(),
  kullanici_id uuid not null references auth.users(id) on delete cascade,
  baslik text not null,
  aciklama text,
  herkese_acik boolean not null default false,
  paylasim_kodu text unique default encode(gen_random_bytes(6), 'hex'),
  olusturulma timestamptz not null default now()
);

create table if not exists public.liste_turkuleri (
  liste_id uuid not null references public.listeler(id) on delete cascade,
  turku_slug text not null,
  sira integer not null default 0,
  eklenme timestamptz not null default now(),
  primary key (liste_id, turku_slug)
);

-- Bağlamada çalınan veya öğrenilmek istenen eserler
create table if not exists public.repertuvar (
  kullanici_id uuid not null references auth.users(id) on delete cascade,
  turku_slug text not null,
  durum text not null default 'calmak-istiyorum'
    check (durum in ('calabiliyorum', 'ogreniyorum', 'calmak-istiyorum')),
  eklenme timestamptz not null default now(),
  primary key (kullanici_id, turku_slug)
);

alter table public.profiller enable row level security;
alter table public.listeler enable row level security;
alter table public.liste_turkuleri enable row level security;
alter table public.repertuvar enable row level security;

drop policy if exists "profiller_oku" on public.profiller;
drop policy if exists "profiller_kendi" on public.profiller;
drop policy if exists "sahibi_listeler" on public.listeler;
drop policy if exists "acik_listeler_oku" on public.listeler;
drop policy if exists "sahibi_liste_turkuleri" on public.liste_turkuleri;
drop policy if exists "acik_liste_turkuleri_oku" on public.liste_turkuleri;
drop policy if exists "sahibi_repertuvar" on public.repertuvar;

-- Kullanıcı adları liste paylaşımı ve liderlik tablosu için okunabilir.
create policy "profiller_oku" on public.profiller
  for select using (true);

-- Admin migration'ı henüz uygulanmadıysa başlangıç profil politikasını kur.
-- `rol` sütunu varsa admin şeması kurulmuştur; geniş politikayı geri getirme.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiller'
      and column_name = 'rol'
  ) then
    execute $policy$
      create policy "profiller_kendi" on public.profiller
      for all to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id)
    $policy$;
  end if;
end $$;

create policy "sahibi_listeler" on public.listeler
  for all to authenticated
  using (auth.uid() = kullanici_id)
  with check (auth.uid() = kullanici_id);

create policy "acik_listeler_oku" on public.listeler
  for select using (herkese_acik = true);

create policy "sahibi_liste_turkuleri" on public.liste_turkuleri
  for all to authenticated
  using (
    exists (
      select 1 from public.listeler
      where listeler.id = liste_id
        and listeler.kullanici_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listeler
      where listeler.id = liste_id
        and listeler.kullanici_id = auth.uid()
    )
  );

create policy "acik_liste_turkuleri_oku" on public.liste_turkuleri
  for select using (
    exists (
      select 1 from public.listeler
      where listeler.id = liste_id
        and listeler.herkese_acik = true
    )
  );

create policy "sahibi_repertuvar" on public.repertuvar
  for all to authenticated
  using (auth.uid() = kullanici_id)
  with check (auth.uid() = kullanici_id);

create index if not exists listeler_kullanici_idx
  on public.listeler(kullanici_id, olusturulma desc);
create index if not exists liste_turkuleri_sira_idx
  on public.liste_turkuleri(liste_id, sira);
create index if not exists repertuvar_kullanici_idx
  on public.repertuvar(kullanici_id, eklenme desc);


-- ────────────────────────────────────────────────────────────────
-- Bölüm: oyunlar
-- ────────────────────────────────────────────────────────────────

-- Anadolu Oyunları: canlı iki kişilik odalar ve açık liderlik tablosu
create table if not exists public.oyun_odalari (
  id uuid primary key default gen_random_uuid(),
  kod text not null unique,
  kurucu_id uuid not null references public.profiller(id) on delete cascade,
  rakip_id uuid references public.profiller(id) on delete set null,
  eslesme_tipi text not null default 'davet' check (eslesme_tipi in ('davet','rastgele')),
  durum text not null default 'bekliyor' check (durum in ('bekliyor','oyunda','bitti')),
  sorular jsonb not null,
  kurucu_skor int not null default 0,
  rakip_skor int not null default 0,
  kurucu_tur int not null default 0,
  rakip_tur int not null default 0,
  olusturulma timestamptz not null default now()
);

-- Migration'ın eski sürümünü daha önce çalıştıran projeler için güvenli yükseltme.
alter table public.oyun_odalari add column if not exists eslesme_tipi text not null default 'davet';

create table if not exists public.oyun_skorlari (
  id bigint generated always as identity primary key,
  oda_id uuid references public.oyun_odalari(id) on delete cascade,
  kullanici_id uuid not null references public.profiller(id) on delete cascade,
  oyun text not null,
  puan int not null check (puan >= 0),
  olusturulma timestamptz not null default now(),
  unique (oda_id, kullanici_id)
);

alter table public.oyun_odalari enable row level security;
alter table public.oyun_skorlari enable row level security;

drop policy if exists "oyun_odasi_oku" on public.oyun_odalari;
drop policy if exists "oyun_odasi_kur" on public.oyun_odalari;
drop policy if exists "oyun_odasi_guncelle" on public.oyun_odalari;
drop policy if exists "oyun_odasi_sil" on public.oyun_odalari;
drop policy if exists "skorlar_oku" on public.oyun_skorlari;
drop policy if exists "kendi_skorunu_yaz" on public.oyun_skorlari;

create policy "oyun_odasi_oku" on public.oyun_odalari for select to authenticated using (true);
create policy "oyun_odasi_kur" on public.oyun_odalari for insert to authenticated with check (auth.uid() = kurucu_id);
create policy "oyun_odasi_guncelle" on public.oyun_odalari for update to authenticated
  using (auth.uid() = kurucu_id or auth.uid() = rakip_id or rakip_id is null)
  with check (auth.uid() = kurucu_id or auth.uid() = rakip_id);
create policy "oyun_odasi_sil" on public.oyun_odalari for delete to authenticated
  using (auth.uid() = kurucu_id and durum = 'bekliyor');
create policy "skorlar_oku" on public.oyun_skorlari for select using (true);
create policy "kendi_skorunu_yaz" on public.oyun_skorlari for insert to authenticated with check (auth.uid() = kullanici_id);

create index if not exists oyun_odalari_kod_idx on public.oyun_odalari(kod);
create index if not exists oyun_odalari_eslesme_idx on public.oyun_odalari(eslesme_tipi, durum, olusturulma);
create index if not exists oyun_skorlari_liderlik_idx on public.oyun_skorlari(puan desc);

do $$ begin
  alter publication supabase_realtime add table public.oyun_odalari;
exception when duplicate_object then null;
end $$;


-- ────────────────────────────────────────────────────────────────
-- Bölüm: yasayan_hafiza
-- ────────────────────────────────────────────────────────────────

-- Yaşayan Hafıza: kullanıcı kaynaklı hikâye, varyant, fotoğraf ve ses katkıları
create table if not exists public.hafiza_katkilari (
  id uuid primary key default gen_random_uuid(),
  kullanici_id uuid not null references public.profiller(id) on delete cascade,
  turku_slug text,
  katki_turu text not null check (katki_turu in ('hikaye','soz-varyanti','kaynak-bilgisi','fotograf','ses-kaydi','duzeltme')),
  il text not null,
  ilce_koy text,
  kaynak_kisi text,
  aciklama text not null check (char_length(aciklama) between 40 and 5000),
  dosya_yolu text,
  durum text not null default 'bekliyor' check (durum in ('bekliyor','inceleniyor','onaylandi','reddedildi')),
  editor_notu text,
  olusturulma timestamptz not null default now(),
  guncellenme timestamptz not null default now()
);

alter table public.hafiza_katkilari enable row level security;
drop policy if exists "katki_ekle" on public.hafiza_katkilari;
drop policy if exists "kendi_katkilari_oku" on public.hafiza_katkilari;
create policy "katki_ekle" on public.hafiza_katkilari for insert to authenticated
  with check (auth.uid() = kullanici_id and durum = 'bekliyor');
create policy "kendi_katkilari_oku" on public.hafiza_katkilari for select to authenticated
  using (auth.uid() = kullanici_id);

create index if not exists hafiza_katkilari_durum_idx on public.hafiza_katkilari(durum, olusturulma);
create index if not exists hafiza_katkilari_turku_idx on public.hafiza_katkilari(turku_slug);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hafiza-katkilari', 'hafiza-katkilari', false, 10485760, array['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/webm','audio/wav'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "katki_dosyasi_yukle" on storage.objects;
drop policy if exists "kendi_katki_dosyasini_oku" on storage.objects;
create policy "katki_dosyasi_yukle" on storage.objects for insert to authenticated
  with check (bucket_id = 'hafiza-katkilari' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "kendi_katki_dosyasini_oku" on storage.objects for select to authenticated
  using (bucket_id = 'hafiza-katkilari' and (storage.foldername(name))[1] = auth.uid()::text);


-- ────────────────────────────────────────────────────────────────
-- Bölüm: admin_icerik
-- ────────────────────────────────────────────────────────────────

-- Yönetim, moderasyon ve sürdürülebilir içerik altyapısı
alter table public.profiller add column if not exists rol text not null default 'uye'
  check (rol in ('uye','editor','admin'));
alter table public.profiller add column if not exists gorunen_ad text;

-- Eski "for all" profil politikası rol sütunu eklendikten sonra fazla geniş
-- kalır. Üye yalnızca ilk profilini uye rolüyle oluşturabilir; rol ve profil
-- yönetimi admin sunucu işlemlerinden yapılır.
drop policy if exists "profiller_kendi" on public.profiller;
drop policy if exists "profil_kendi_olustur" on public.profiller;
create policy "profil_kendi_olustur" on public.profiller for insert to authenticated
  with check (auth.uid() = id and rol = 'uye');

create or replace function public.admin_mi()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiller where id = auth.uid() and rol = 'admin') $$;

create or replace function public.editor_mi()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiller where id = auth.uid() and rol in ('editor','admin')) $$;

-- SECURITY DEFINER yardımcıları anonim ziyaretçiler tarafından çağrılamaz.
revoke all on function public.admin_mi() from public;
revoke all on function public.editor_mi() from public;
grant execute on function public.admin_mi() to authenticated;
grant execute on function public.editor_mi() to authenticated;

create table if not exists public.editor_turkuler (
  id uuid primary key default gen_random_uuid(), slug text unique not null,
  baslik text not null, yore text not null, ozet text not null, hikaye text not null,
  ozan text, soz_yazari text, derleyen text, kaynak_kisi text,
  etiketler text[] not null default '{}', kaynaklar jsonb not null default '[]',
  durum text not null default 'taslak' check (durum in ('taslak','incelemede','yayinda','arsivlendi')),
  olusturan uuid references public.profiller(id), guncelleyen uuid references public.profiller(id),
  olusturulma timestamptz not null default now(), guncellenme timestamptz not null default now()
);

create table if not exists public.kultur_icerikleri (
  id uuid primary key default gen_random_uuid(), tur text not null check (tur in ('kultur-rotasi','sehir-tarihi','kurs','etkinlik','sponsor')),
  slug text not null, baslik text not null, il text, ozet text not null, icerik text not null,
  gorsel_url text, dis_url text, meta jsonb not null default '{}',
  durum text not null default 'taslak' check (durum in ('taslak','incelemede','yayinda','arsivlendi')),
  sira integer not null default 0, olusturan uuid references public.profiller(id),
  olusturulma timestamptz not null default now(), guncellenme timestamptz not null default now(),
  unique(tur, slug)
);

alter table public.hafiza_katkilari add column if not exists yayin_izni boolean not null default false;
alter table public.hafiza_katkilari add column if not exists kaynak_onayi boolean not null default false;
alter table public.hafiza_katkilari add column if not exists atif_adi text;
alter table public.hafiza_katkilari add column if not exists incelenen_tarih timestamptz;
alter table public.hafiza_katkilari add column if not exists inceleyen uuid references public.profiller(id);

alter table public.editor_turkuler enable row level security;
alter table public.kultur_icerikleri enable row level security;
drop policy if exists "yayin_turkusu_oku" on public.editor_turkuler;
drop policy if exists "editor_turkusu_yonet" on public.editor_turkuler;
drop policy if exists "yayin_kultur_oku" on public.kultur_icerikleri;
drop policy if exists "editor_kultur_yonet" on public.kultur_icerikleri;
drop policy if exists "editor_katki_oku" on public.hafiza_katkilari;
drop policy if exists "editor_katki_guncelle" on public.hafiza_katkilari;
drop policy if exists "admin_profil_guncelle" on public.profiller;
drop policy if exists "editor_katki_dosyasi_oku" on storage.objects;
drop policy if exists "kendi_katki_dosyasini_sil" on storage.objects;
create policy "yayin_turkusu_oku" on public.editor_turkuler for select using (durum = 'yayinda' or public.editor_mi());
create policy "editor_turkusu_yonet" on public.editor_turkuler for all using (public.editor_mi()) with check (public.editor_mi());
create policy "yayin_kultur_oku" on public.kultur_icerikleri for select using (durum = 'yayinda' or public.editor_mi());
create policy "editor_kultur_yonet" on public.kultur_icerikleri for all using (public.editor_mi()) with check (public.editor_mi());
create policy "editor_katki_oku" on public.hafiza_katkilari for select using (public.editor_mi());
create policy "editor_katki_guncelle" on public.hafiza_katkilari for update using (public.editor_mi()) with check (public.editor_mi());
create policy "admin_profil_guncelle" on public.profiller for update using (public.admin_mi()) with check (public.admin_mi());
create policy "editor_katki_dosyasi_oku" on storage.objects for select using (bucket_id = 'hafiza-katkilari' and public.editor_mi());
create policy "kendi_katki_dosyasini_sil" on storage.objects for delete to authenticated
  using (bucket_id = 'hafiza-katkilari' and (storage.foldername(name))[1] = auth.uid()::text);

create index if not exists editor_turkuler_durum_idx on public.editor_turkuler(durum, guncellenme desc);
create index if not exists kultur_icerikleri_tur_idx on public.kultur_icerikleri(tur, durum, sira);

-- İlk admini SQL Editor'dan kendiniz atayın:
-- update public.profiller set rol='admin' where kullanici_adi='KULLANICI_ADINIZ';


-- ────────────────────────────────────────────────────────────────
-- Bölüm: admin_guvenlik_duzeltmesi
-- ────────────────────────────────────────────────────────────────

-- Daha önce 20260812_admin_icerik.sql uygulanmış projeler için ileri yönlü
-- güvenlik ve tekrar çalıştırılabilirlik düzeltmesi.

revoke all on function public.admin_mi() from public;
revoke all on function public.editor_mi() from public;
grant execute on function public.admin_mi() to authenticated;
grant execute on function public.editor_mi() to authenticated;

drop policy if exists "kendi_katki_dosyasini_sil" on storage.objects;
create policy "kendi_katki_dosyasini_sil" on storage.objects for delete to authenticated
  using (
    bucket_id = 'hafiza-katkilari'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ────────────────────────────────────────────────────────────────
-- Bölüm: spotify_playlist_links
-- ────────────────────────────────────────────────────────────────

-- Yerel listelerin aynı Spotify playlistiyle tekrar senkronize edilebilmesi için.
create table if not exists public.spotify_liste_baglantilari (
  liste_id uuid primary key references public.listeler(id) on delete cascade,
  kullanici_id uuid not null references auth.users(id) on delete cascade,
  spotify_playlist_id text not null unique,
  spotify_url text,
  yerel_imza text not null default '',
  son_senkron timestamptz not null default now()
);

alter table public.spotify_liste_baglantilari enable row level security;

drop policy if exists "sahibi_spotify_liste_baglantilari"
  on public.spotify_liste_baglantilari;

create policy "sahibi_spotify_liste_baglantilari"
  on public.spotify_liste_baglantilari
  for all
  using (auth.uid() = kullanici_id)
  with check (
    auth.uid() = kullanici_id
    and exists (
      select 1 from public.listeler
      where listeler.id = liste_id
        and listeler.kullanici_id = auth.uid()
    )
  );

create index if not exists spotify_liste_baglantilari_kullanici_idx
  on public.spotify_liste_baglantilari(kullanici_id);
