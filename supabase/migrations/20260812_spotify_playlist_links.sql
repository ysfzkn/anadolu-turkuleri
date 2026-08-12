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
