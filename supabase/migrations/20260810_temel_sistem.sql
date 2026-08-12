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
