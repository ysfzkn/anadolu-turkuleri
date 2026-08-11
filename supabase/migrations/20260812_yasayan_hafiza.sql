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
