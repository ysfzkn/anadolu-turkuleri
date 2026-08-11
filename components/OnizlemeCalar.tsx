"use client";

import { useRef, useState } from "react";

interface Veri {
  ad?: string;
  sanatci?: string;
  onizlemeUrl?: string | null;
  spotifyUrl?: string | null;
  gorsel?: string | null;
}

export function OnizlemeCalar({ sorgu }: { sorgu: string }) {
  const [durum, setDurum] = useState<
    "hazir" | "yukleniyor" | "acik" | "yok"
  >("hazir");
  const [veri, setVeri] = useState<Veri | null>(null);
  const [caliyor, setCaliyor] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function getir() {
    setDurum("yukleniyor");
    try {
      const res = await fetch(`/api/onizleme?q=${encodeURIComponent(sorgu)}`);
      const d: Veri = await res.json();
      if (!d || (!d.onizlemeUrl && !d.spotifyUrl)) {
        setDurum("yok");
        return;
      }
      setVeri(d);
      setDurum("acik");
    } catch {
      setDurum("yok");
    }
  }

  function calDurdur() {
    const a = audioRef.current;
    if (!a) return;
    if (caliyor) {
      a.pause();
      setCaliyor(false);
    } else {
      a.play();
      setCaliyor(true);
    }
  }

  if (durum === "hazir" || durum === "yukleniyor") {
    return (
      <button
        onClick={getir}
        disabled={durum === "yukleniyor"}
        className="inline-flex items-center gap-2 rounded-xl border border-cini/40 bg-cini/5 px-4 py-2 text-sm font-medium text-cini-dark transition-colors hover:bg-cini hover:text-parsomen disabled:opacity-60"
      >
        {durum === "yukleniyor" ? "Aranıyor…" : "♫ 30sn önizleme"}
      </button>
    );
  }

  if (durum === "yok") {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl border border-toprak/30 px-4 py-2 text-sm text-ceviz-light">
        Önizleme bulunamadı
      </span>
    );
  }

  // durum === "acik"
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-cini/40 bg-cini/5 px-3 py-2">
      {veri?.gorsel && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={veri.gorsel}
          alt=""
          className="h-10 w-10 rounded object-cover"
        />
      )}
      <div className="min-w-0 text-sm">
        <div className="truncate font-medium text-ceviz">{veri?.ad}</div>
        <div className="truncate text-xs text-ceviz-light">{veri?.sanatci}</div>
      </div>
      {veri?.onizlemeUrl ? (
        <>
          <button
            onClick={calDurdur}
            className="rounded-lg bg-cini px-3 py-1.5 text-sm font-medium text-parsomen hover:bg-cini-dark"
          >
            {caliyor ? "❚❚" : "▶"}
          </button>
          <audio
            ref={audioRef}
            src={veri.onizlemeUrl}
            onEnded={() => setCaliyor(false)}
            preload="none"
          />
        </>
      ) : (
        veri?.spotifyUrl && (
          <a
            href={veri.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-cini px-3 py-1.5 text-sm font-medium text-parsomen hover:bg-cini-dark"
          >
            Spotify'da aç
          </a>
        )
      )}
    </div>
  );
}
