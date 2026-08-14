"use client";

import { useEffect, useRef, useState } from "react";
import { SpotifyIkon, YouTubeIkon, YouTubeMusicIkon } from "@/components/MarkaIkonlari";

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
  const [spotifyIframeAcik, setSpotifyIframeAcik] = useState(false);
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
  const aramaSorgusu = `${baslik} ${ozan || yore} türkü`;
  const spotifyArama = `https://open.spotify.com/search/${encodeURIComponent(aramaSorgusu)}`;
  const youtubeArama = `https://www.youtube.com/results?search_query=${encodeURIComponent(aramaSorgusu)}`;
  const youtubeMusicUrl = youtube
    ? `https://music.youtube.com/watch?v=${youtube.videoId}`
    : `https://music.youtube.com/search?q=${encodeURIComponent(aramaSorgusu)}`;
  const youtubeMusicKapak = youtube?.thumbnail ?? spotify?.gorsel ?? null;
  const youtubeMusicBaslik = youtube ? htmlCoz(youtube.baslik) : spotify?.ad ?? baslik;
  const youtubeMusicAltBilgi = youtube
    ? (youtube.kanal ?? "YouTube Music")
    : (spotify?.sanatci ?? "YouTube Music'te ara");
  const spotifyIframeMevcut = Boolean(spotify?.id) && !spotify?.onizlemeUrl;

  return (
    <section
      aria-labelledby="dinle-izle-baslik"
      className="mb-8 overflow-hidden rounded-[28px] border border-toprak/30 bg-white/55 shadow-motif"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-toprak/20 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.22em] text-kilim">Eser medyası</p>
          <h2 id="dinle-izle-baslik" className="mt-1 font-serif text-2xl font-semibold text-ceviz">Dinle ve izle</h2>
        </div>
        <p className="max-w-sm text-xs leading-5 text-ceviz-light">
          Eşleşmeler eser adı, yöre ve ozan bilgisine göre otomatik seçilir.
        </p>
      </div>

      {durum === "yukleniyor" ? (
        <div className="grid gap-3 p-3 sm:gap-4 sm:p-6 sm:grid-cols-2 xl:grid-cols-3">
          <div className="h-64 animate-pulse rounded-2xl bg-toprak/15" />
          <div className="h-64 animate-pulse rounded-2xl bg-ceviz/10" />
          <div className="h-64 animate-pulse rounded-2xl bg-kilim/10" />
        </div>
      ) : (
        <div className="grid items-stretch gap-3 p-3 sm:gap-4 sm:p-6 sm:grid-cols-2 xl:grid-cols-3">
          {/* Spotify */}
          <article className="group/card flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#1DB954]/25 bg-[#0f1712] text-white shadow-sm transition hover:border-[#1DB954]/45">
            <div className="relative aspect-video min-w-0 overflow-hidden bg-gradient-to-br from-[#193b25] to-black">
              {spotify?.gorsel ? (
                <a
                  href={spotify.spotifyUrl ?? spotifyArama}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${spotify.ad} kaydını Spotify'da aç`}
                  className="block h-full w-full"
                >
                  <img
                    src={spotify.gorsel}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                  />
                  <img
                    src={spotify.gorsel}
                    alt={`${spotify.ad} albüm kapağı`}
                    className="relative z-[1] h-full w-full object-contain transition duration-500 group-hover/card:scale-[1.03]"
                  />
                </a>
              ) : (
                <a
                  href={spotify?.spotifyUrl ?? spotifyArama}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-full place-items-center px-6 text-center"
                >
                  <div>
                    <SpotifyIkon className="mx-auto h-10 w-10 text-[#1DB954]" />
                    <p className="mt-3 text-sm text-white/60">
                      {spotify ? "Albüm kapağı yok — Spotify'da aç" : "Spotify'da ara"}
                    </p>
                  </div>
                </a>
              )}
              {spotify?.onizlemeUrl && (
                <button
                  type="button"
                  onClick={spotifyOnizleme}
                  aria-label={caliyor ? "Önizlemeyi duraklat" : "30 saniyelik önizlemeyi oynat"}
                  className="absolute bottom-3 right-3 z-[3] grid h-12 w-12 place-items-center rounded-full bg-[#1DB954] text-lg font-semibold text-white shadow-2xl transition hover:scale-105"
                >
                  {caliyor ? "Ⅱ" : "▶"}
                </button>
              )}
            </div>
            <div className="flex min-h-[88px] items-start gap-3 border-t border-white/5 p-4">
              <SpotifyIkon className="mt-0.5 h-5 w-5 shrink-0 text-[#1DB954]" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold">{spotify?.ad ?? baslik}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-white/60">
                  {spotify
                    ? [spotify.sanatci, spotify.album, spotify.yayinYili].filter(Boolean).join(" · ")
                    : "Eşleşme bulunamadı"}
                </p>
                {sesEngelli && (
                  <p className="mt-1 text-[11px] text-[#7ee2a0]">Tarayıcı sesi engelledi; yeniden dokun.</p>
                )}
              </div>
              <a
                href={spotify?.spotifyUrl ?? spotifyArama}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold transition hover:bg-white hover:text-black"
              >
                Aç
              </a>
            </div>
            {spotifyIframeMevcut && (
              <div className="border-t border-white/5 bg-black/25 p-3">
                {spotifyIframeAcik ? (
                  <iframe
                    title={`${spotify?.ad ?? baslik} Spotify oynatıcısı`}
                    src={`https://open.spotify.com/embed/track/${spotify?.id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="80"
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    className="block w-full min-w-0 rounded-xl border-0"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setSpotifyIframeAcik(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/70 transition hover:border-[#1DB954]/50 hover:text-white"
                  >
                    <SpotifyIkon className="h-3.5 w-3.5 text-[#1DB954]" />
                    Bu sayfada dinle
                  </button>
                )}
              </div>
            )}
            {spotify?.onizlemeUrl && (
              <audio
                ref={audioRef}
                src={spotify.onizlemeUrl}
                preload="metadata"
                onEnded={() => setCaliyor(false)}
                onPause={() => setCaliyor(false)}
              />
            )}
          </article>

          {/* YouTube */}
          <article className="group/card flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#FF0000]/20 bg-[#151111] text-white shadow-sm transition hover:border-[#FF0000]/45">
            <div className="relative aspect-video min-w-0 overflow-hidden bg-black">
              {youtube && youtubeAcik ? (
                <iframe
                  title={`${htmlCoz(youtube.baslik)} YouTube videosu`}
                  src={`https://www.youtube-nocookie.com/embed/${youtube.videoId}?autoplay=1&rel=0`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : youtube ? (
                <button
                  type="button"
                  onClick={() => setYoutubeAcik(true)}
                  className="group relative block h-full w-full overflow-hidden text-left"
                  aria-label={`${htmlCoz(youtube.baslik)} videosunu oynat`}
                >
                  <img
                    src={youtube.thumbnail}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                  />
                  <img
                    src={youtube.thumbnail}
                    alt={`${baslik} YouTube video önizlemesi`}
                    className="relative z-[1] h-full w-full object-cover transition duration-500 group-hover/card:scale-[1.03]"
                  />
                  <span className="absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                  <span className="absolute left-1/2 top-1/2 z-[3] grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-[#FF0000] shadow-2xl transition group-hover/card:scale-110">
                    <YouTubeIkon className="h-7 w-7" />
                  </span>
                  <span className="absolute bottom-3 left-3 right-3 z-[3] text-xs font-semibold text-white/95 drop-shadow">
                    Oynatmak için dokun
                  </span>
                </button>
              ) : (
                <a
                  href={youtubeArama}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-full place-items-center px-6 text-center"
                >
                  <div>
                    <YouTubeIkon className="mx-auto h-10 w-10 text-[#FF0000]" />
                    <p className="mt-3 text-sm text-white/60">YouTube'da ara</p>
                  </div>
                </a>
              )}
            </div>
            <div className="flex min-h-[88px] items-start gap-3 border-t border-white/5 p-4">
              <YouTubeIkon className="mt-0.5 h-5 w-5 shrink-0 text-[#FF0000]" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold">
                  {youtube ? htmlCoz(youtube.baslik) : "YouTube araması"}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-white/55">
                  {youtube?.kanal ?? (youtube?.kaynak === "arsiv" ? "Arşivde doğrulanan video" : "YouTube")}
                </p>
              </div>
              <a
                href={youtube?.youtubeUrl ?? youtubeArama}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold transition hover:bg-white hover:text-black"
              >
                Aç
              </a>
            </div>
          </article>

          {/* YouTube Music */}
          <article className="group/card flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#FF0000]/20 bg-gradient-to-br from-[#1a0e10] via-[#150a0d] to-black text-white shadow-sm transition hover:border-[#FF0000]/45 sm:col-span-2 xl:col-span-1">
            <a
              href={youtubeMusicUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${youtubeMusicBaslik} eserini YouTube Music'te aç`}
              className="group relative block aspect-video min-w-0 overflow-hidden"
            >
              {youtubeMusicKapak ? (
                <>
                  <img
                    src={youtubeMusicKapak}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                  />
                  <img
                    src={youtubeMusicKapak}
                    alt={`${baslik} YouTube Music kapağı`}
                    className="relative z-[1] h-full w-full object-cover transition duration-500 group-hover/card:scale-[1.03]"
                  />
                  <span className="absolute inset-0 z-[2] bg-gradient-to-t from-black/75 via-transparent to-black/10" />
                </>
              ) : (
                <div className="grid h-full place-items-center px-6 text-center">
                  <div>
                    <YouTubeMusicIkon className="mx-auto h-10 w-10 text-[#FF0000]" />
                    <p className="mt-3 text-sm text-white/60">YouTube Music'te ara</p>
                  </div>
                </div>
              )}
              <span className="absolute left-1/2 top-1/2 z-[3] grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#FF0000] shadow-2xl transition group-hover/card:scale-110">
                <YouTubeMusicIkon className="h-8 w-8 text-white" />
              </span>
              <span className="absolute bottom-3 left-3 right-3 z-[3] text-xs font-semibold text-white/95 drop-shadow">
                YouTube Music'te aç
              </span>
            </a>
            <div className="flex min-h-[88px] items-start gap-3 border-t border-white/5 p-4">
              <YouTubeMusicIkon className="mt-0.5 h-5 w-5 shrink-0 text-[#FF0000]" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold">{youtubeMusicBaslik}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-white/55">{youtubeMusicAltBilgi}</p>
              </div>
              <a
                href={youtubeMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold transition hover:bg-white hover:text-black"
              >
                Aç
              </a>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
