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
