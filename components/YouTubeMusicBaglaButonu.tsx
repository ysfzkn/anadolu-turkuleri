"use client";

import { useState } from "react";
import { YouTubeMusicIkon } from "./MarkaIkonlari";
import { tarayiciSupabase } from "@/lib/supabase/client";
import { YOUTUBE_MUSIC_SCOPES } from "@/lib/youtube-music-scopes";

/**
 * Google/YouTube OAuth akışını başlatır. Google zaten bağlıysa signIn ile
 * yeniden yetkilendirme yapar (yeni kapsamların onaylanabilmesi için
 * prompt=consent). Aksi hâlde mevcut oturuma linkIdentity ile ekler.
 */
export function YouTubeMusicBaglaButonu({
  next = "/listelerim",
  etiket = "YouTube Music’i bağla",
}: {
  next?: string;
  etiket?: string;
}) {
  const [yukleniyor, setYukleniyor] = useState(false);

  async function bagla() {
    setYukleniyor(true);
    try {
      const supabase = tarayiciSupabase();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return window.location.assign("/giris");
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const googleBagli = data.user.identities?.some(
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
      setYukleniyor(false);
    }
  }

  return (
    <button
      type="button"
      onClick={bagla}
      disabled={yukleniyor}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FF0000] px-4 text-sm font-semibold text-white transition hover:bg-[#d90000] disabled:opacity-60"
    >
      <YouTubeMusicIkon className="h-4 w-4" />
      {yukleniyor ? "Google açılıyor…" : etiket}
    </button>
  );
}
