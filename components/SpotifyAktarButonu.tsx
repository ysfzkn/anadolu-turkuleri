"use client";

import { useState } from "react";
import { SpotifyIkon } from "./MarkaIkonlari";
import { tarayiciSupabase } from "@/lib/supabase/client";
import { olayKaydet } from "@/lib/analytics";

const SPOTIFY_SCOPES =
  "playlist-modify-public playlist-modify-private user-read-email";

const HATA_MESAJ: Record<string, string> = {
  "spotify-baglanti-gerekli": "Aktarmak için Spotify hesabını bağla",
  "giris-gerekli": "Giriş yapmalısın",
  "parca-bulunamadi": "Eşleşen parça bulunamadı",
  "playlist-olusmadi": "Çalma listesi oluşturulamadı",
  "parcalar-eklenemedi": "Çalma listesi oluştu ancak parçalar eklenemedi",
  "spotify-token": "Spotify oturumu süresi dolmuş — tekrar giriş yap",
  "spotify-yetki": "Spotify çalma listesi izni eksik",
  "liste-yok": "Liste bilgisi eksik",
  "liste-bulunamadi": "Liste bulunamadı veya erişim iznin yok",
};

export function SpotifyAktarButonu({ listeId }: { listeId: string }) {
  const [durum, setDurum] = useState<"hazir" | "calisiyor" | "bitti" | "hata">(
    "hazir",
  );
  const [url, setUrl] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState("");
  const [baglantiGerekli, setBaglantiGerekli] = useState(false);

  async function aktar() {
    olayKaydet("spotify_aktarim_basladi");
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
        olayKaydet("spotify_aktarim_tamamlandi", { eklenen: d.eklenen ?? 0, toplam: d.toplam ?? 0 });
      } else {
        setMesaj(HATA_MESAJ[d.hata] ?? "Aktarılamadı");
        setBaglantiGerekli(
          Boolean(d.yenidenBagla) || d.hata === "spotify-baglanti-gerekli" || d.hata === "spotify-token" || d.hata === "spotify-yetki",
        );
        setDurum("hata");
        olayKaydet("spotify_aktarim_hatasi", { hata: d.hata ?? "bilinmiyor" });
      }
    } catch {
      setMesaj("Bir hata oluştu");
      setDurum("hata");
      olayKaydet("spotify_aktarim_hatasi", { hata: "ag_hatasi" });
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
            options: { redirectTo, scopes: SPOTIFY_SCOPES, queryParams: { show_dialog: "true" } },
          })
        : await supabase.auth.linkIdentity({
            provider: "spotify",
            options: { redirectTo, scopes: SPOTIFY_SCOPES, queryParams: { show_dialog: "true" } },
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
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1DB954] px-4 text-sm font-semibold text-white hover:bg-[#1aa34a]"
      >
        <SpotifyIkon className="h-4 w-4" /> Spotify'da aç
      </a>
    );
  }

  return (
    <div className="w-full sm:w-auto">
      <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={aktar}
        disabled={durum === "calisiyor"}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#1DB954]/50 px-4 text-sm font-semibold text-[#16883f] transition-colors hover:bg-[#1DB954] hover:text-white disabled:cursor-wait disabled:opacity-60"
      >
        <SpotifyIkon className="h-4 w-4" />
        {durum === "calisiyor" ? "Aktarılıyor…" : "Spotify'a aktar"}
      </button>
      {baglantiGerekli && (
        <button
          type="button"
          onClick={spotifyBagla}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1DB954] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1aa34a]"
        >
          <SpotifyIkon className="h-4 w-4" /> Spotify'ı bağla
        </button>
      )}
      </div>
      {durum === "hata" && (
        <div role="alert" className="mt-2 flex max-w-md items-start gap-2 rounded-xl border border-kilim/25 bg-kilim/5 px-3 py-2 text-xs leading-5 text-kilim-dark">
          <span aria-hidden>!</span>
          <span>{mesaj}. {baglantiGerekli ? "Hesabını yeniden yetkilendirip tekrar deneyebilirsin." : "Lütfen biraz sonra yeniden dene."}</span>
        </div>
      )}
      {durum === "calisiyor" && mesaj && <p role="status" className="mt-2 text-xs text-ceviz-light">{mesaj}</p>}
    </div>
  );
}
