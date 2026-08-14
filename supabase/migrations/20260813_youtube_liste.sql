-- YouTube (Music) çalma listesi ↔ yerel liste bağlantıları.
-- Spotify eşleme tablosuyla ("spotify_liste_baglantilari") aynı kalıp:
-- her yerel liste için tek bir YouTube playlist kaydı tutar; imza,
-- yerel liste ile Google/YouTube üzerindeki playlist'in senkron olup
-- olmadığını hızlıca kontrol etmek için kullanılır.
--
-- YouTube Music ve YouTube ortak hesap üzerinden çalıştığı için tek
-- playlist iki uygulamada da görünür. `music_url` yalnızca kısayoldur.

create table if not exists public.youtube_liste_baglantilari (
  liste_id uuid primary key references public.listeler(id) on delete cascade,
  kullanici_id uuid not null references auth.users(id) on delete cascade,
  youtube_playlist_id text not null unique,
  youtube_url text,
  music_url text,
  yerel_imza text not null default '',
  son_senkron timestamptz not null default now()
);

alter table public.youtube_liste_baglantilari enable row level security;

drop policy if exists "sahibi_youtube_liste_baglantilari"
  on public.youtube_liste_baglantilari;

create policy "sahibi_youtube_liste_baglantilari"
  on public.youtube_liste_baglantilari
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

create index if not exists youtube_liste_baglantilari_kullanici_idx
  on public.youtube_liste_baglantilari(kullanici_id);
