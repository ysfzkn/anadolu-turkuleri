"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tarayiciSupabase } from "@/lib/supabase/client";

const GECERLI = /^[a-z0-9_]{3,20}$/;

export function KullaniciAdiFormu() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [ad, setAd] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [durum, setDurum] = useState<
    "yukleniyor" | "hazir" | "kaydediliyor" | "giris-yok"
  >("yukleniyor");
  const [hata, setHata] = useState("");

  useEffect(() => {
    let supabase: ReturnType<typeof tarayiciSupabase>;
    try {
      supabase = tarayiciSupabase();
    } catch {
      setDurum("giris-yok");
      return;
    }
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setDurum("giris-yok");
        return;
      }
      setUid(data.user.id);
      // Zaten kullanıcı adı varsa devam et
      const { data: profil } = await supabase
        .from("profiller")
        .select("kullanici_adi")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profil) {
        router.replace(next);
        return;
      }
      setDurum("hazir");
    })();
  }, [router, next]);

  async function kaydet() {
    const temiz = ad.trim().toLowerCase();
    if (!GECERLI.test(temiz)) {
      setHata("3-20 karakter; yalnızca küçük harf, rakam ve alt çizgi.");
      return;
    }
    if (!uid) return;
    setDurum("kaydediliyor");
    setHata("");
    const supabase = tarayiciSupabase();

    // Kullanılabilirlik kontrolü
    const { data: mevcut } = await supabase
      .from("profiller")
      .select("id")
      .eq("kullanici_adi", temiz)
      .maybeSingle();
    if (mevcut) {
      setHata("Bu kullanıcı adı alınmış, başka bir tane dene.");
      setDurum("hazir");
      return;
    }

    const { error } = await supabase
      .from("profiller")
      .insert({ id: uid, kullanici_adi: temiz });
    if (error) {
      setHata(
        error.code === "23505"
          ? "Bu kullanıcı adı alınmış, başka bir tane dene."
          : "Kaydedilemedi. Tekrar dene.",
      );
      setDurum("hazir");
      return;
    }
    router.replace(next);
  }

  if (durum === "giris-yok") {
    return (
      <p className="text-center text-ceviz-light">
        Bu adım için giriş yapmış olmalısın.
      </p>
    );
  }
  if (durum === "yukleniyor") return <div className="h-24" aria-hidden />;

  return (
    <div>
      <div className="flex items-center rounded-xl border border-toprak/40 bg-parsomen focus-within:border-kilim focus-within:ring-2 focus-within:ring-kilim/20">
        <span className="pl-4 text-ceviz-light">@</span>
        <input
          value={ad}
          onChange={(e) => setAd(e.target.value.toLowerCase())}
          onKeyDown={(e) => e.key === "Enter" && kaydet()}
          placeholder="kullanici_adin"
          autoFocus
          maxLength={20}
          className="w-full bg-transparent px-2 py-3 focus:outline-none"
        />
      </div>
      {hata && <p className="mt-2 text-sm text-kilim-dark">{hata}</p>}
      <button
        onClick={kaydet}
        disabled={durum === "kaydediliyor"}
        className="mt-4 w-full rounded-xl bg-kilim px-4 py-3 font-medium text-parsomen transition-colors hover:bg-kilim-dark disabled:opacity-60"
      >
        {durum === "kaydediliyor" ? "Kaydediliyor…" : "Devam et"}
      </button>
      <p className="mt-3 text-center text-xs text-ceviz-light">
        Kullanıcı adın listelerinde ve liderlik tablosunda görünür.
      </p>
    </div>
  );
}
