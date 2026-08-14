"use client";

import { useState } from "react";
import { YouTubeMusicIkon } from "./MarkaIkonlari";
import { tarayiciSupabase } from "@/lib/supabase/client";
import { olayKaydet } from "@/lib/analytics";
import { YOUTUBE_MUSIC_SCOPES } from "@/lib/youtube-music-scopes";

const HATA_MESAJ: Record<string, string> = {
  "youtube-baglanti-gerekli": "Aktarmak için YouTube Music (Google) hesabını bağla",
  "giris-gerekli": "Giriş yapmalısın",
  "parca-bulunamadi": "Eşleşen video bulunamadı",
  "youtube-token": "Google oturumu süresi dolmuş — tekrar giriş yap",
  "youtube-yetki": "YouTube playlist izni eksik",
  "liste-yok": "Liste bilgisi eksik",
  "liste-bulunamadi": "Liste bulunamadı veya erişim iznin yok",
  "youtube-esleme-tablosu-yok": "YouTube liste bağlantısı için veritabanı güncellemesi gerekli",
  "youtube-esleme-kaydedilemedi": "YouTube liste bağlantısı kaydedilemedi",
  "youtube-api": "YouTube listesine ulaşılamadı",
};

export function YouTubeMusicAktarButonu({
  listeId,
  youtubeUrl: ilkYoutubeUrl,
  musicUrl: ilkMusicUrl,
}: {
  listeId: string;
  youtubeUrl?: string | null;
  musicUrl?: string | null;
}) {
  const [durum, setDurum] = useState<"hazir" | "calisiyor" | "bitti" | "hata">("hazir");
  const [url, setUrl] = useState<string | null>(ilkYoutubeUrl ?? null);
  const [musicUrl, setMusicUrl] = useState<string | null>(ilkMusicUrl ?? null);
  const [mesaj, setMesaj] = useState("");
  const [baglantiGerekli, setBaglantiGerekli] = useState(false);

  async function aktar() {
    olayKaydet("youtube_aktarim_basladi");
    setDurum("calisiyor");
    setMesaj("");
    setBaglantiGerekli(false);
    try {
      const res = await fetch("/api/youtube/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listeId }),
      });
      const d = await res.json();
      if (d.musicUrl || d.url) {
        setUrl(d.url ?? null);
        setMusicUrl(d.musicUrl ?? null);
        setDurum("bitti");
        setMesaj(
          d.zatenGuncel
            ? "YouTube Music listen zaten güncel."
            : d.guncellendi
              ? "YouTube Music listen güncellendi."
              : "YouTube Music listen oluşturuldu.",
        );
        olayKaydet("youtube_aktarim_tamamlandi", { eklenen: d.eklenen ?? 0, toplam: d.toplam ?? 0 });
      } else {
        setMesaj(HATA_MESAJ[d.hata] ?? "Aktarılamadı");
        setBaglantiGerekli(
          Boolean(d.yenidenBagla) ||
            d.hata === "youtube-baglanti-gerekli" ||
            d.hata === "youtube-token" ||
            d.hata === "youtube-yetki",
        );
        setDurum("hata");
        olayKaydet("youtube_aktarim_hatasi", { hata: d.hata ?? "bilinmiyor" });
      }
    } catch {
      setMesaj("Bir hata oluştu");
      setDurum("hata");
      olayKaydet("youtube_aktarim_hatasi", { hata: "ag_hatasi" });
    }
  }

  async function googleBagla() {
    setDurum("calisiyor");
    setMesaj("Google yetkilendirmesine yönlendiriliyorsun…");
    try {
      const supabase = tarayiciSupabase();
      const { data: kullanici } = await supabase.auth.getUser();
      if (!kullanici.user) {
        window.location.assign("/giris");
        return;
      }
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/listelerim")}`;
      const googleBagli = kullanici.user.identities?.some(
        (identity) => identity.provider === "google",
      );
      const secenekler = {
        redirectTo,
        scopes: YOUTUBE_MUSIC_SCOPES,
        queryParams: { access_type: "offline", prompt: "consent" },
      };
      const sonuc = googleBagli
        ? await supabase.auth.signInWithOAuth({ provider: "google", options: secenekler })
        : await supabase.auth.linkIdentity({ provider: "google", options: secenekler });
      if (sonuc.error) throw sonuc.error;
    } catch {
      setDurum("hata");
      setMesaj(
        "Google bağlantısı başlatılamadı. Supabase Auth ayarlarında elle hesap bağlamanın açık olduğunu denetle.",
      );
    }
  }

  return (
    <div className="w-full sm:w-auto">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={aktar}
          disabled={durum === "calisiyor"}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#FF0000]/50 px-4 text-sm font-semibold text-[#c4302b] transition-colors hover:bg-[#FF0000] hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          <YouTubeMusicIkon className="h-4 w-4" />
          {durum === "calisiyor"
            ? "Güncelleniyor…"
            : musicUrl || url
              ? "YouTube Music listesini güncelle"
              : "YouTube Music’e aktar"}
        </button>
        {musicUrl && (
          <a
            href={musicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FF0000] px-4 text-sm font-semibold text-white hover:bg-[#d90000]"
          >
            <YouTubeMusicIkon className="h-4 w-4" /> YouTube Music’te aç
          </a>
        )}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-toprak/30 px-3 text-xs font-semibold text-ceviz hover:bg-toprak/10"
          >
            YouTube’da aç
          </a>
        )}
        {baglantiGerekli && (
          <button
            type="button"
            onClick={googleBagla}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FF0000] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#d90000]"
          >
            <YouTubeMusicIkon className="h-4 w-4" /> Google’ı bağla
          </button>
        )}
      </div>
      {durum === "hata" && (
        <div role="alert" className="mt-2 flex max-w-md items-start gap-2 rounded-xl border border-kilim/25 bg-kilim/5 px-3 py-2 text-xs leading-5 text-kilim-dark">
          <span aria-hidden>!</span>
          <span>
            {mesaj}. {baglantiGerekli ? "Hesabını yeniden yetkilendirip tekrar deneyebilirsin." : "Lütfen biraz sonra yeniden dene."}
          </span>
        </div>
      )}
      {durum === "bitti" && mesaj && (
        <p role="status" className="mt-2 text-xs font-medium text-[#8a1d1d]">{mesaj}</p>
      )}
      {durum === "calisiyor" && mesaj && (
        <p role="status" className="mt-2 text-xs text-ceviz-light">{mesaj}</p>
      )}
    </div>
  );
}
