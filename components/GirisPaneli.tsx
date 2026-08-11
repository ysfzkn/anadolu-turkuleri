"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authHataMesaji, hashHataKodu } from "@/lib/auth-hatalari";
import { tarayiciSupabase } from "@/lib/supabase/client";
import { GoogleIkon, SpotifyIkon } from "./MarkaIkonlari";

const SPOTIFY_SCOPES =
  "playlist-modify-public playlist-modify-private user-read-email";

export function GirisPaneli() {
  const searchParams = useSearchParams();
  const [durum, setDurum] = useState<"hazir" | "yonleniyor" | "hata">("hazir");
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    const hashHata = hashHataKodu();
    const queryHata = searchParams.get("hata");
    const kod = hashHata ?? queryHata;
    if (!kod) return;

    setDurum("hata");
    setMesaj(authHataMesaji(kod));

    // Hash'i temizle; query param kalabilir (sayfa yenilemede mesaj görünsün).
    if (hashHata) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, [searchParams]);

  async function giris(saglayici: "google" | "spotify") {
    try {
      setDurum("yonleniyor");
      const supabase = tarayiciSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: saglayici,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: saglayici === "spotify" ? SPOTIFY_SCOPES : undefined,
        },
      });
      if (error) throw error;
      // Başarılıysa tarayıcı sağlayıcıya yönlenir.
    } catch (e) {
      setDurum("hata");
      setMesaj(
        e instanceof Error && e.message.includes("ortam")
          ? "Giriş henüz yapılandırılmadı (.env.local eksik)."
          : "Giriş başlatılamadı. Lütfen tekrar deneyin.",
      );
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => giris("google")}
        disabled={durum === "yonleniyor"}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-toprak/40 bg-parsomen px-4 py-3 font-medium text-ceviz transition-colors hover:border-kilim/50 hover:bg-kilim/5 disabled:opacity-60"
      >
        <GoogleIkon className="h-5 w-5" />
        Google ile giriş
      </button>
      <button
        onClick={() => giris("spotify")}
        disabled={durum === "yonleniyor"}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1DB954] px-4 py-3 font-medium text-white transition-colors hover:bg-[#1aa34a] disabled:opacity-60"
      >
        <SpotifyIkon className="h-5 w-5" />
        Spotify ile giriş
      </button>

      {durum === "hata" && (
        <p className="text-sm text-kilim-dark">{mesaj}</p>
      )}
      <p className="pt-2 text-center text-xs text-ceviz-light">
        Giriş yaparak kişisel türkü listeleri oluşturabilir, kaydedebilir ve
        paylaşabilirsiniz.
      </p>
    </div>
  );
}
