"use client";

import { useState } from "react";
import { SpotifyIkon } from "./MarkaIkonlari";
import { tarayiciSupabase } from "@/lib/supabase/client";

const SPOTIFY_SCOPES =
  "playlist-modify-public playlist-modify-private user-read-email";

const HATA_MESAJ: Record<string, string> = {
  "spotify-baglanti-gerekli": "Aktarmak için Spotify hesabını bağla",
  "giris-gerekli": "Giriş yapmalısın",
  "parca-bulunamadi": "Eşleşen parça bulunamadı",
  "playlist-olusmadi": "Çalma listesi oluşturulamadı",
  "parcalar-eklenemedi": "Çalma listesi oluştu ancak parçalar eklenemedi",
  "spotify-token": "Spotify oturumu süresi dolmuş — tekrar giriş yap",
};

export function SpotifyAktarButonu({ listeId }: { listeId: string }) {
  const [durum, setDurum] = useState<"hazir" | "calisiyor" | "bitti" | "hata">(
    "hazir",
  );
  const [url, setUrl] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState("");
  const [baglantiGerekli, setBaglantiGerekli] = useState(false);

  async function aktar() {
    setDurum("calisiyor");
    setMesaj("");
    setBaglantiGerekli(false);
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
        setBaglantiGerekli(
          d.hata === "spotify-baglanti-gerekli" || d.hata === "spotify-token",
        );
        setDurum("hata");
      }
    } catch {
      setMesaj("Bir hata oluştu");
      setDurum("hata");
    }
  }

  async function spotifyBagla() {
    setDurum("calisiyor");
    setMesaj("Spotify yetkilendirmesine yönlendiriliyorsun…");
    try {
      const supabase = tarayiciSupabase();
      const { data: kullanici } = await supabase.auth.getUser();
      if (!kullanici.user) {
        window.location.assign("/giris");
        return;
      }
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/listelerim")}`;
      const spotifyBagli = kullanici.user.identities?.some(
        (identity) => identity.provider === "spotify",
      );
      const sonuc = spotifyBagli
        ? await supabase.auth.signInWithOAuth({
            provider: "spotify",
            options: { redirectTo, scopes: SPOTIFY_SCOPES },
          })
        : await supabase.auth.linkIdentity({
            provider: "spotify",
            options: { redirectTo, scopes: SPOTIFY_SCOPES },
          });
      if (sonuc.error) throw sonuc.error;
    } catch {
      setDurum("hata");
      setMesaj(
        "Spotify bağlantısı başlatılamadı. Supabase Auth ayarlarında elle hesap bağlamanın açık olduğunu denetle.",
      );
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
    <span className="inline-flex flex-wrap items-center gap-2">
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
      {baglantiGerekli && (
        <button
          type="button"
          onClick={spotifyBagla}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1DB954] px-2.5 py-1 text-sm font-medium text-white transition-colors hover:bg-[#1aa34a]"
        >
          <SpotifyIkon className="h-4 w-4" /> Spotify'ı bağla
        </button>
      )}
    </span>
  );
}
