"use client";

import { useEffect, useRef, useState } from "react";
import { SpotifyIkon, YouTubeIkon } from "@/components/MarkaIkonlari";

interface SpotifyMedya {
  id: string | null;
  ad: string;
  sanatci: string;
  onizlemeUrl: string | null;
  spotifyUrl: string | null;
  gorsel: string | null;
  album: string | null;
  yayinYili: string | null;
}

interface YouTubeMedya {
  videoId: string;
  baslik: string;
  kanal: string | null;
  thumbnail: string;
  youtubeUrl: string;
  kaynak: "arsiv" | "arama";
}

interface MedyaCevabi {
  spotify?: SpotifyMedya | null;
  youtube?: YouTubeMedya | null;
}

function htmlCoz(metin: string): string {
  return metin
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function TurkuMedyaVitrini({
  slug,
  baslik,
  yore,
  ozan,
  youtubeUrl,
}: {
  slug: string;
  baslik: string;
  yore: string;
  ozan?: string;
  youtubeUrl?: string;
}) {
  const [durum, setDurum] = useState<"yukleniyor" | "hazir">("yukleniyor");
  const [medya, setMedya] = useState<MedyaCevabi>({});
  const [youtubeAcik, setYoutubeAcik] = useState(false);
  const [caliyor, setCaliyor] = useState(false);
  const [sesEngelli, setSesEngelli] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let iptal = false;
    const params = new URLSearchParams({ slug, baslik, yore });
    params.set("eslesmeSurumu", "2");
    if (ozan) params.set("ozan", ozan);
    if (youtubeUrl) params.set("youtubeUrl", youtubeUrl);
    fetch(`/api/turku-medya?${params}`)
      .then((r) => r.json())
      .then((veri: MedyaCevabi) => { if (!iptal) setMedya(veri); })
      .catch(() => undefined)
      .finally(() => { if (!iptal) setDurum("hazir"); });
    return () => { iptal = true; };
  }, [slug, baslik, yore, ozan, youtubeUrl]);

  async function spotifyOnizleme() {
    const ses = audioRef.current;
    if (!ses) return;
    if (caliyor) {
      ses.pause();
      setCaliyor(false);
      return;
    }
    try {
      await ses.play();
      setCaliyor(true);
      setSesEngelli(false);
    } catch {
      setSesEngelli(true);
    }
  }

  const spotify = medya.spotify;
  const youtube = medya.youtube;
  const youtubeArama = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${baslik} ${ozan || yore} türkü`)}`;

  return (
    <section aria-labelledby="dinle-izle-baslik" className="mb-8 overflow-hidden rounded-[28px] border border-toprak/30 bg-white/55 shadow-motif">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-toprak/20 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.22em] text-kilim">Eser medyası</p>
          <h2 id="dinle-izle-baslik" className="mt-1 font-serif text-2xl font-semibold text-ceviz">Dinle ve izle</h2>
        </div>
        <p className="max-w-sm text-xs leading-5 text-ceviz-light">Eşleşmeler eser adı, yöre ve ozan bilgisine göre otomatik seçilir.</p>
      </div>

      {durum === "yukleniyor" ? (
        <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2">
          <div className="h-[240px] animate-pulse rounded-2xl bg-toprak/15" />
          <div className="h-[240px] animate-pulse rounded-2xl bg-ceviz/10" />
        </div>
      ) : (
        <div className="grid items-stretch gap-4 p-4 sm:p-6 md:grid-cols-2">
          {/* Spotify */}
          <article className="flex flex-col overflow-hidden rounded-2xl border border-[#1DB954]/25 bg-[#0f1712] text-white">
            {spotify?.id && !spotify.onizlemeUrl ? (
              <>
                <div className="p-3 sm:p-4">
                  <iframe
                    title={`${spotify.ad} Spotify oynatıcısı`}
                    src={`https://open.spotify.com/embed/track/${spotify.id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    className="block w-full rounded-xl border-0"
                    style={{ height: "152px" }}
                  />
                </div>
                <div className="mt-auto flex items-center gap-3 px-4 pb-4">
                  <SpotifyIkon className="h-6 w-6 shrink-0 text-[#1DB954]" />
                  <p className="min-w-0 flex-1 truncate text-sm text-white/55">Resmi Spotify oynatıcısından dinleyin</p>
                  {spotify.spotifyUrl && (
                    <a href={spotify.spotifyUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold transition hover:bg-white hover:text-black">Spotify’da aç</a>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#193b25] to-black">
                  {spotify?.gorsel ? (
                    <a href={spotify.spotifyUrl ?? "https://open.spotify.com"} target="_blank" rel="noopener noreferrer" aria-label={`${spotify.ad} kaydını Spotify'da aç`}>
                      <img src={spotify.gorsel} alt={`${spotify.ad} albüm kapağı`} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
                    </a>
                  ) : (
                    <div className="grid h-full place-items-center px-8 text-center"><div><SpotifyIkon className="mx-auto h-12 w-12 text-[#1DB954]" /><p className="mt-4 font-serif text-2xl">{baslik}</p><p className="mt-2 text-sm text-white/55">Albüm kapağı bulunamadı</p></div></div>
                  )}
                  {spotify?.onizlemeUrl && (
                    <button type="button" onClick={spotifyOnizleme} className="absolute bottom-4 right-4 grid h-14 w-14 place-items-center rounded-full bg-[#1DB954] text-xl text-white shadow-xl transition hover:scale-105" aria-label={caliyor ? "Önizlemeyi duraklat" : "30 saniyelik önizlemeyi oynat"}>
                      {caliyor ? "Ⅱ" : "▶"}
                    </button>
                  )}
                </div>
                <div className="mt-auto flex items-start gap-3 p-4">
                  <SpotifyIkon className="mt-0.5 h-6 w-6 shrink-0 text-[#1DB954]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{spotify?.ad ?? baslik}</p>
                    <p className="mt-0.5 truncate text-sm text-white/60">{spotify ? `${spotify.sanatci}${spotify.album ? ` · ${spotify.album}` : ""}${spotify.yayinYili ? ` · ${spotify.yayinYili}` : ""}` : "Spotify eşleşmesi bulunamadı"}</p>
                    {sesEngelli && <p className="mt-1 text-xs text-[#7ee2a0]">Tarayıcı sesli oynatmayı engelledi; yeniden dokunun.</p>}
                  </div>
                  {spotify?.spotifyUrl && <a href={spotify.spotifyUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold transition hover:bg-white hover:text-black">Spotify’da aç</a>}
                </div>
                {spotify?.onizlemeUrl && <audio ref={audioRef} src={spotify.onizlemeUrl} preload="metadata" onEnded={() => setCaliyor(false)} onPause={() => setCaliyor(false)} />}
              </>
            )}
          </article>

          {/* YouTube */}
          <article className="flex flex-col overflow-hidden rounded-2xl border border-[#FF0000]/20 bg-[#151111] text-white">
            <div className="relative aspect-video overflow-hidden bg-black">
              {youtube && youtubeAcik ? (
                <iframe title={`${htmlCoz(youtube.baslik)} YouTube videosu`} src={`https://www.youtube-nocookie.com/embed/${youtube.videoId}?autoplay=1&rel=0`} className="h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
              ) : youtube ? (
                <button type="button" onClick={() => setYoutubeAcik(true)} className="group relative block h-full w-full overflow-hidden text-left" aria-label={`${htmlCoz(youtube.baslik)} videosunu oynat`}>
                  <img src={youtube.thumbnail} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
                  <img src={youtube.thumbnail} alt={`${baslik} YouTube video önizlemesi`} className="relative z-[1] h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]" />
                  <span className="absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                  <span className="absolute left-1/2 top-1/2 z-[3] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-[#FF0000] shadow-2xl transition group-hover:scale-110"><YouTubeIkon className="h-8 w-8" /></span>
                  <span className="absolute bottom-4 left-4 right-4 z-[3] text-sm font-semibold text-white drop-shadow">Oynatmak için dokun</span>
                </button>
              ) : (
                <a href={youtubeArama} target="_blank" rel="noopener noreferrer" className="grid h-full place-items-center px-8 text-center"><div><YouTubeIkon className="mx-auto h-12 w-12 text-[#FF0000]" /><p className="mt-4 font-serif text-2xl">YouTube’da ara</p><p className="mt-2 text-sm text-white/55">Doğrudan video eşleşmesi henüz bulunamadı.</p></div></a>
              )}
            </div>
            <div className="mt-auto flex items-start gap-3 p-4">
              <YouTubeIkon className="mt-0.5 h-6 w-6 shrink-0 text-[#FF0000]" />
              <div className="min-w-0 flex-1"><p className="line-clamp-1 font-semibold">{youtube ? htmlCoz(youtube.baslik) : `${baslik} · YouTube araması`}</p><p className="mt-0.5 truncate text-sm text-white/55">{youtube?.kanal ?? (youtube?.kaynak === "arsiv" ? "Arşivde doğrulanan video" : "YouTube")}</p></div>
              <a href={youtube?.youtubeUrl ?? youtubeArama} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold transition hover:bg-white hover:text-black">YouTube’da aç</a>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
