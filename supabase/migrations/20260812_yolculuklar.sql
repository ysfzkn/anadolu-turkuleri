-- ================================================================
-- Türkü Yolculukları — kullanıcı adım ilerlemesi
--
-- Additive migration: mevcut tablo/politikalara dokunmaz. Initial script ve
-- 20260812_pasaport.sql'den SONRA bir kez çalıştırın.
-- ================================================================

-- Bir yolculuğun hangi adımlarını tamamladığı. Yolculuk ve adım tanımları
-- kodda (lib/yolculuklar.ts) tutulur; burada yalnızca ilerleme kaydı vardır.
create table if not exists public.yolculuk_ilerleme (
  kullanici_id uuid not null references auth.users(id) on delete cascade,
  yolculuk_slug text not null,
  adim_id text not null,
  olusturulma timestamptz not null default now(),
  primary key (kullanici_id, yolculuk_slug, adim_id)
);

alter table public.yolculuk_ilerleme enable row level security;

drop policy if exists "kendi_ilerlemem_oku" on public.yolculuk_ilerleme;
drop policy if exists "kendi_ilerlememi_yaz" on public.yolculuk_ilerleme;
drop policy if exists "kendi_ilerlememi_sil" on public.yolculuk_ilerleme;

-- Kullanıcı yalnızca kendi ilerlemesini görür, ekler ve (başa dönmek için) siler.
create policy "kendi_ilerlemem_oku" on public.yolculuk_ilerleme
  for select to authenticated using (auth.uid() = kullanici_id);
create policy "kendi_ilerlememi_yaz" on public.yolculuk_ilerleme
  for insert to authenticated with check (auth.uid() = kullanici_id);
create policy "kendi_ilerlememi_sil" on public.yolculuk_ilerleme
  for delete to authenticated using (auth.uid() = kullanici_id);

create index if not exists yolculuk_ilerleme_idx
  on public.yolculuk_ilerleme(kullanici_id, yolculuk_slug);
