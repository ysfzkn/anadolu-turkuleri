"use client";

import { useState } from "react";
import { SpotifyIkon } from "./MarkaIkonlari";

const HATA_MESAJ: Record<string, string> = {
  "spotify-baglanti-gerekli": "Spotify ile giriş yapmalısın",
  "giris-gerekli": "Giriş yapmalısın",
  "parca-bulunamadi": "Eşleşen parça bulunamadı",
  "playlist-olusmadi": "Çalma listesi oluşturulamadı",
  "spotify-token": "Spotify oturumu süresi dolmuş — tekrar giriş yap",
};

export function SpotifyAktarButonu({ listeId }: { listeId: string }) {
  const [durum, setDurum] = useState<"hazir" | "calisiyor" | "bitti" | "hata">(
    "hazir",
  );
  const [url, setUrl] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState("");

  async function aktar() {
    setDurum("calisiyor");
    setMesaj("");
    try {
      const res = await fetch("/api/spotify/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listeId }),
      });
      const d = await res.json();
      if (d.url) {
        setUrl(d.url);
        setDurum("bitti");
      } else {
        setMesaj(HATA_MESAJ[d.hata] ?? "Aktarılamadı");
        setDurum("hata");
      }
    } catch {
      setMesaj("Bir hata oluştu");
      setDurum("hata");
    }
  }

  if (durum === "bitti" && url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1DB954] px-2.5 py-1 text-sm font-medium text-white hover:bg-[#1aa34a]"
      >
        <SpotifyIkon className="h-4 w-4" /> Spotify'da aç
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={aktar}
        disabled={durum === "calisiyor"}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#1DB954]/50 px-2.5 py-1 text-sm font-medium text-[#1a9e49] transition-colors hover:bg-[#1DB954] hover:text-white disabled:opacity-60"
      >
        <SpotifyIkon className="h-4 w-4" />
        {durum === "calisiyor" ? "Aktarılıyor…" : "Spotify'a aktar"}
      </button>
      {durum === "hata" && (
        <span className="text-xs text-kilim-dark">{mesaj}</span>
      )}
    </span>
  );
}
