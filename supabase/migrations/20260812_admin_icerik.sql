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
