"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Veri {
  id?: string | null;
  ad?: string;
  sanatci?: string;
  onizlemeUrl?: string | null;
  spotifyUrl?: string | null;
  gorsel?: string | null;
  guven?: number;
}

const SES_IZNI = "anadolu-sesli-onizleme";

export function OnizlemeCalar({
  sorgu,
  baslik,
  yore,
  ozan,
  kompakt = false,
}: {
  sorgu: string;
  baslik?: string;
  yore?: string;
  ozan?: string;
  kompakt?: boolean;
}) {
  const [durum, setDurum] = useState<"yukleniyor" | "izin" | "acik" | "yok">("yukleniyor");
  const [veri, setVeri] = useState<Veri | null>(null);
  const [caliyor, setCaliyor] = useState(false);
  const [engellendi, setEngellendi] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const oynat = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setCaliyor(true);
      setEngellendi(false);
    } catch {
      setCaliyor(false);
      setEngellendi(true);
    }
  }, []);

  useEffect(() => {
    let iptal = false;
    async function getir() {
      setDurum("yukleniyor");
      try {
        const params = new URLSearchParams({ q: sorgu });
        if (baslik) params.set("baslik", baslik);
        if (yore) params.set("yore", yore);
        if (ozan) params.set("ozan", ozan);
        const res = await fetch(`/api/onizleme?${params}`);
        const data: Veri = await res.json();
        if (iptal) return;
        if (!data?.onizlemeUrl && !data?.spotifyUrl) {
          setDurum("yok");
          return;
        }
        setVeri(data);
        const izinli = window.sessionStorage.getItem(SES_IZNI) === "1";
        setDurum(izinli ? "acik" : "izin");
      } catch {
        if (!iptal) setDurum("yok");
      }
    }
    void getir();
    return () => { iptal = true; };
  }, [sorgu, baslik, yore, ozan]);

  useEffect(() => {
    if (durum === "acik" && veri?.onizlemeUrl && window.sessionStorage.getItem(SES_IZNI) === "1") {
      void oynat();
    }
  }, [durum, veri?.onizlemeUrl, oynat]);

  async function izinVer() {
    window.sessionStorage.setItem(SES_IZNI, "1");
    setDurum("acik");
    setTimeout(() => void oynat(), 0);
  }

  function calDurdur() {
    const audio = audioRef.current;
    if (!audio) return;
    if (caliyor) {
      audio.pause();
      setCaliyor(false);
    } else void oynat();
  }

  if (durum === "yukleniyor") {
    return <span className="inline-flex min-h-11 animate-pulse items-center rounded-xl border border-cini/20 bg-cini/5 px-4 text-sm text-cini-dark">Spotify eşleşmesi aranıyor…</span>;
  }

  if (durum === "yok") {
    return <span className="inline-flex min-h-11 items-center rounded-xl border border-toprak/25 px-4 text-sm text-ceviz-light">Önizleme bulunamadı</span>;
  }

  if (durum === "izin") {
    return (
      <button onClick={izinVer} className="group inline-flex min-h-12 items-center gap-3 rounded-2xl border border-[#1DB954]/35 bg-[#1DB954]/10 px-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1DB954]/15 hover:shadow-md">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1DB954] text-white" aria-hidden>▶</span>
        <span>
          <span className="block text-sm font-semibold text-ceviz">30 sn önizlemeyi otomatik çal</span>
          {!kompakt && <span className="block text-xs text-ceviz-light">Bu sekme için ses izni ver</span>}
        </span>
      </button>
    );
  }

  if (!veri?.onizlemeUrl && veri?.id) {
    return (
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#1DB954]/35 bg-white/55 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          {veri.gorsel && <img src={veri.gorsel} alt="" className="h-10 w-10 rounded-xl object-cover" />}
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ceviz">En olası Spotify eşleşmesi · {veri.ad}</p><p className="truncate text-xs text-ceviz-light">{veri.sanatci} · Spotify oynatıcısı</p></div>
        </div>
        <iframe
          title={`${veri.ad} Spotify oynatıcısı`}
          src={`https://open.spotify.com/embed/track/${veri.id}?utm_source=generator&theme=0&autoplay=1`}
          width="100%"
          height="152"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="block border-0"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-[#1DB954]/35 bg-white/55 p-2.5 shadow-sm ${kompakt ? "max-w-sm" : "min-w-[280px]"}`}>
      {veri?.gorsel ? <img src={veri.gorsel} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" /> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1DB954] text-white">♫</span>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ceviz">{veri?.ad}</div>
        <div className="truncate text-xs text-ceviz-light">{veri?.sanatci}</div>
        {engellendi && <div className="text-[11px] text-kilim">Tarayıcı engelledi · oynat’a dokun</div>}
      </div>
      {veri?.onizlemeUrl ? (
        <>
          <button onClick={calDurdur} aria-label={caliyor ? "Önizlemeyi duraklat" : "Önizlemeyi oynat"} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1DB954] font-semibold text-white transition hover:scale-105">
            {caliyor ? "Ⅱ" : "▶"}
          </button>
          <audio ref={audioRef} src={veri.onizlemeUrl} onEnded={() => setCaliyor(false)} onPause={() => setCaliyor(false)} preload="auto" />
        </>
      ) : null}
    </div>
  );
}
