-- ================================================================
-- Anadolu Kültür Pasaportu — kullanıcı keşif kayıtları
--
-- Additive migration: mevcut tablo/politikalara dokunmaz. Yeni Supabase
-- projesinde initial script'ten SONRA bir kez çalıştırın.
-- ================================================================

-- Kullanıcının anlamlı keşifleri (türkü okuma, ozan/tema/terim ziyareti,
-- dinleme, quiz). Her (kullanıcı, tür, anahtar) yalnızca bir kez sayılır;
-- kayıtlar yalnızca eklenir (append-only) — pasaport ilerlemesi geriye gitmez.
create table if not exists public.kesifler (
  kullanici_id uuid not null references auth.users(id) on delete cascade,
  tur text not null check (tur in ('turku','ozan','tema','terim','yore','dinleme','quiz')),
  anahtar text not null,
  il text,                         -- şehir keşfi için il slug'ı (yalnızca türkü/yöre/dinleme'de dolu)
  olusturulma timestamptz not null default now(),
  primary key (kullanici_id, tur, anahtar)
);

alter table public.kesifler enable row level security;

drop policy if exists "kendi_kesiflerim_oku" on public.kesifler;
drop policy if exists "kendi_kesfimi_yaz" on public.kesifler;

-- Kullanıcı yalnızca kendi keşiflerini okur ve yazar. Güncelleme/silme yok:
-- keşif kaydı geri alınamaz (idempotent upsert ile yinelenmez).
create policy "kendi_kesiflerim_oku" on public.kesifler
  for select to authenticated using (auth.uid() = kullanici_id);
create policy "kendi_kesfimi_yaz" on public.kesifler
  for insert to authenticated with check (auth.uid() = kullanici_id);

create index if not exists kesifler_kullanici_idx
  on public.kesifler(kullanici_id, olusturulma desc);
create index if not exists kesifler_il_idx
  on public.kesifler(kullanici_id, il) where il is not null;
