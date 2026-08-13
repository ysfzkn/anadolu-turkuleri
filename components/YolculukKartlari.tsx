"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tarayiciSupabase } from "@/lib/supabase/client";
import type { YolculukOzeti } from "@/lib/yolculuklar";

const SEVIYE_RENK: Record<string, string> = {
  "başlangıç": "bg-[#3f7a62]/12 text-[#28523f]",
  orta: "bg-cini/12 text-cini-dark",
  ileri: "bg-kilim/12 text-kilim-dark",
};

/**
 * Yolculuk indeks kartları + giriş yapan kullanıcı için ilerleme rozetleri.
 * Kartlar SSR edilir (linkler/başlıklar taranabilir); ilerleme hidrasyondan
 * sonra istemcide yüklenir. Giriş yoksa yalnızca "Başla" gösterilir.
 */
export function YolculukKartlari({ yolculuklar }: { yolculuklar: YolculukOzeti[] }) {
  const [ilerleme, setIlerleme] = useState<Record<string, number>>({});

  useEffect(() => {
    let iptal = false;
    (async () => {
      try {
        const supabase = tarayiciSupabase();
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return;
        const { data } = await supabase.from("yolculuk_ilerleme").select("yolculuk_slug");
        if (iptal) return;
        const sayac: Record<string, number> = {};
        for (const r of (data ?? []) as { yolculuk_slug: string }[]) {
          sayac[r.yolculuk_slug] = (sayac[r.yolculuk_slug] ?? 0) + 1;
        }
        setIlerleme(sayac);
      } catch {
        /* giriş yok / supabase yok → sessiz */
      }
    })();
    return () => { iptal = true; };
  }, []);

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {yolculuklar.map((y) => {
        const biten = ilerleme[y.slug] ?? 0;
        const tamam = y.adimSayisi > 0 && biten >= y.adimSayisi;
        const basladi = biten > 0 && !tamam;
        const yuzde = y.adimSayisi > 0 ? Math.min(Math.round((biten / y.adimSayisi) * 100), 100) : 0;
        return (
          <li key={y.slug}>
            <Link
              href={`/yolculuk/${y.slug}`}
              className={`group flex h-full flex-col rounded-3xl border bg-parsomen p-6 shadow-motif transition hover:-translate-y-0.5 hover:border-kilim/50 ${tamam ? "border-[#3f7a62]/40" : "border-toprak/25"}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-parsomen-dark text-2xl" aria-hidden>{y.emoji}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVIYE_RENK[y.seviye] ?? "bg-toprak/10 text-ceviz"}`}>{y.seviye}</span>
                {tamam && (
                  <span className="ml-auto rounded-full bg-[#3f7a62]/12 px-2.5 py-0.5 text-xs font-semibold text-[#28523f]">✓ Tamamlandı</span>
                )}
              </div>
              <h2 className="font-serif text-2xl font-semibold text-ceviz group-hover:text-kilim-dark">{y.baslik}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-ceviz-light">{y.aciklama}</p>

              {basladi && (
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-toprak/15">
                    <div className="h-full rounded-full bg-kilim transition-all" style={{ width: `${yuzde}%` }} />
                  </div>
                  <div className="mt-1 text-right text-[11px] text-ceviz-light">{biten} / {y.adimSayisi} adım</div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-3 text-xs font-medium text-ceviz-light">
                <span>{y.adimSayisi} adım</span>
                <span aria-hidden>·</span>
                <span>~{y.tahminiDakika} dk</span>
                <span className="ml-auto font-semibold text-kilim-dark">
                  {tamam ? "Yeniden bak →" : basladi ? "Devam et →" : "Başla →"}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
