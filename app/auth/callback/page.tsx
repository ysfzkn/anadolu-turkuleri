"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authHataMesaji, hashHataKodu } from "@/lib/auth-hatalari";
import { tarayiciSupabase } from "@/lib/supabase/client";

function CallbackIcerik() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mesaj, setMesaj] = useState("Giriş tamamlanıyor…");

  useEffect(() => {
    let aktif = true;

    function guvenliNext(deger: string | null) {
      return deger?.startsWith("/") && !deger.startsWith("//") ? deger : "/";
    }

    async function tamamla() {
      // Supabase OAuth hataları hash'te gelir; sunucu route bunları göremez.
      const hashHata = hashHataKodu();
      if (hashHata) {
        router.replace(`/giris?hata=${encodeURIComponent(hashHata)}`);
        return;
      }

      const code = searchParams.get("code");
      const next = guvenliNext(searchParams.get("next"));

      try {
        const supabase = tarayiciSupabase();

        // Geri/yenile gibi durumlarda kod daha önce işlenmiş olabilir. Geçerli
        // oturum varsa kullanıcıya yanlış bir "giriş tamamlanamadı" göstermeyiz.
        let { data: oturumVerisi } = await supabase.auth.getSession();
        if (!oturumVerisi.session && code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            // Kod başka bir istemci tarafından çoktan işlendiyse oturum oluşmuş
            // olabilir; hata göstermeden önce bir kez daha kontrol et.
            ({ data: oturumVerisi } = await supabase.auth.getSession());
            if (!oturumVerisi.session) {
              const kod =
                error.message.includes("rate") || error.message.includes("email")
                  ? "over_email_send_rate_limit"
                  : "oturum";
              router.replace(`/giris?hata=${encodeURIComponent(kod)}`);
              return;
            }
          }
        }

        if (!oturumVerisi.session) {
          router.replace("/giris?hata=oturum");
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profil, error: pErr } = await supabase
            .from("profiller")
            .select("kullanici_adi")
            .eq("id", user.id)
            .maybeSingle();

          if (!pErr && !profil) {
            router.replace(
              `/kullanici-adi?next=${encodeURIComponent(next)}`,
            );
            return;
          }
        }

        if (aktif) router.replace(next);
      } catch {
        if (!aktif) return;
        setMesaj(authHataMesaji("oturum"));
        router.replace("/giris?hata=oturum");
      }
    }

    tamamla();
    return () => {
      aktif = false;
    };
  }, [router, searchParams]);

  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <p className="text-ceviz-light">{mesaj}</p>
    </div>
  );
}

export default function AuthCallbackSayfasi() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <p className="text-ceviz-light">Giriş tamamlanıyor…</p>
        </div>
      }
    >
      <CallbackIcerik />
    </Suspense>
  );
}
