"use client";

import { useEffect, useState } from "react";
import { tarayiciSupabase } from "@/lib/supabase/client";

interface YayinKatkisi {
  id: string;
  katki_turu: string;
  il: string | null;
  aciklama: string;
  atif_adi: string | null;
  olusturulma: string;
}

const TUR_ETIKETI: Record<string, string> = {
  hikaye: "Aile / yöre hikâyesi",
  "soz-varyanti": "Yöresel söz varyantı",
  "kaynak-bilgisi": "Kaynak bilgisi",
  fotograf: "Fotoğraf / belge notu",
  "ses-kaydi": "Sesli anlatı notu",
  duzeltme: "Düzeltme",
};

function tarihMetni(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("tr-TR", { year: "numeric", month: "long" });
}

/**
 * Onaylanmış topluluk katkılarını türkü sayfasında gösterir. Veri, yalnızca
 * güvenli sütunları döndüren `yayinlanan_katkilar` RPC'sinden gelir (kişisel
 * alanlar sunucuda filtrelenir). Katkı yoksa bölüm hiç render edilmez.
 */
export function ToplulukKatkilari({ turkuSlug }: { turkuSlug: string }) {
  const [katkilar, setKatkilar] = useState<YayinKatkisi[]>([]);
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    let iptal = false;
    (async () => {
      try {
        const supabase = tarayiciSupabase();
        const { data } = await supabase.rpc("yayinlanan_katkilar", { p_turku_slug: turkuSlug });
        if (!iptal) setKatkilar((data ?? []) as YayinKatkisi[]);
      } catch {
        // RPC yoksa (migration uygulanmadıysa) ya da hata olursa sessizce boş.
      } finally {
        if (!iptal) setHazir(true);
      }
    })();
    return () => {
      iptal = true;
    };
  }, [turkuSlug]);

  if (!hazir || katkilar.length === 0) return null;

  return (
    <section aria-labelledby="topluluk-baslik" className="mb-10">
      <div className="mb-1 flex items-center gap-2">
        <span aria-hidden className="text-lg text-kilim">✦</span>
        <h2 id="topluluk-baslik" className="font-serif text-2xl font-semibold text-ceviz">
          Topluluk Katkıları
        </h2>
      </div>
      <p className="mb-4 text-sm text-ceviz-light">
        Bu anlatılar topluluk üyeleri tarafından paylaşıldı ve editoryal incelemeden geçti. Kişisel
        anlatılar olup tarihsel kesinlik iddia etmez.
      </p>
      <ul className="space-y-3">
        {katkilar.map((k) => (
          <li key={k.id} className="rounded-2xl border border-toprak/25 bg-parsomen-dark/25 p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cini/12 px-2.5 py-0.5 text-xs font-semibold text-cini-dark">
                {TUR_ETIKETI[k.katki_turu] ?? "Topluluk katkısı"}
              </span>
              <span className="rounded-full bg-[#3f7a62]/12 px-2.5 py-0.5 text-xs font-semibold text-[#28523f]">
                ✓ Onaylandı
              </span>
            </div>
            <p className="whitespace-pre-line text-[15px] leading-7 text-ceviz">{k.aciklama}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ceviz-light">
              <span className="font-semibold text-ceviz">{k.atif_adi || "Topluluk üyesi"}</span>
              {k.il && <><span aria-hidden>·</span><span>{k.il}</span></>}
              {tarihMetni(k.olusturulma) && <><span aria-hidden>·</span><span>{tarihMetni(k.olusturulma)}</span></>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
