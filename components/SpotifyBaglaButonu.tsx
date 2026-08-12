"use client";

import { useState } from "react";
import { SpotifyIkon } from "./MarkaIkonlari";
import { tarayiciSupabase } from "@/lib/supabase/client";
import { SPOTIFY_SCOPES } from "@/lib/spotify-scopes";

export function SpotifyBaglaButonu({ next = "/listelerim", etiket = "Spotify’ı bağla" }: { next?: string; etiket?: string }) {
  const [yukleniyor, setYukleniyor] = useState(false);

  async function bagla() {
    setYukleniyor(true);
    try {
      const supabase = tarayiciSupabase();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return window.location.assign("/giris");
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const spotifyBagli = data.user.identities?.some((identity) => identity.provider === "spotify");
      const sonuc = spotifyBagli
        ? await supabase.auth.signInWithOAuth({ provider: "spotify", options: { redirectTo, scopes: SPOTIFY_SCOPES, queryParams: { show_dialog: "true" } } })
        : await supabase.auth.linkIdentity({ provider: "spotify", options: { redirectTo, scopes: SPOTIFY_SCOPES, queryParams: { show_dialog: "true" } } });
      if (sonuc.error) throw sonuc.error;
    } catch {
      setYukleniyor(false);
    }
  }

  return <button type="button" onClick={bagla} disabled={yukleniyor} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1DB954] px-4 text-sm font-semibold text-white transition hover:bg-[#1aa34a] disabled:opacity-60"><SpotifyIkon className="h-4 w-4" />{yukleniyor ? "Spotify açılıyor…" : etiket}</button>;
}
