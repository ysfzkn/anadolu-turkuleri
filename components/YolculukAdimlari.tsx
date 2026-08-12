"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tarayiciSupabase } from "@/lib/supabase/client";
import { olayKaydet } from "@/lib/analytics";
import type { CozulmusAdim, AdimTuru } from "@/lib/yolculuklar";

const ADIM_IKON: Record<AdimTuru, string> = {
  anlatim: "✦",
  turku: "🎵",
  kisi: "🪕",
  yore: "📍",
  tema: "🎭",
  terim: "📜",
  quiz: "🏆",
};

const EYLEM_ETIKETI: Record<AdimTuru, string> = {
  anlatim: "Okudum",
  turku: "Türküye git",
  kisi: "Ozanı tanı",
  yore: "Yöreyi gör",
  tema: "Temayı keşfet",
  terim: "Terimi öğren",
  quiz: "Yarışmaya başla",
};

type Durum = "yukleniyor" | "misafir" | "hazir";

export function YolculukAdimlari({
  yolculukSlug,
  adimlar,
  rozetAdi,
  emoji,
}: {
  yolculukSlug: string;
  adimlar: CozulmusAdim[];
  rozetAdi: string;
  emoji: string;
}) {
  const [durum, setDurum] = useState<Durum>("yukleniyor");
  const [tamamlanan, setTamamlanan] = useState<Set<string>>(new Set());
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    olayKaydet("journey_view", { journey_id: yolculukSlug });
    let supabase: ReturnType<typeof tarayiciSupabase>;
    try {
      supabase = tarayiciSupabase();
    } catch {
      setDurum("misafir");
      return;
    }
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setDurum("misafir");
        return;
      }
      setUid(u.user.id);
      const { data } = await supabase
        .from("yolculuk_ilerleme")
        .select("adim_id")
        .eq("yolculuk_slug", yolculukSlug);
      setTamamlanan(new Set((data ?? []).map((r: { adim_id: string }) => r.adim_id)));
      setDurum("hazir");
    })();
  }, [yolculukSlug]);

  const toplam = adimlar.length;
  const bitenSayi = adimlar.filter((a) => tamamlanan.has(a.id)).length;
  const yuzde = toplam ? Math.round((bitenSayi / toplam) * 100) : 0;
  const bitti = toplam > 0 && bitenSayi === toplam;

  async function degistir(adimId: string) {
    if (!uid) return;
    const supabase = tarayiciSupabase();
    const zatenVar = tamamlanan.has(adimId);
    // Optimistik güncelleme
    setTamamlanan((eski) => {
      const yeni = new Set(eski);
      if (zatenVar) yeni.delete(adimId);
      else yeni.add(adimId);
      return yeni;
    });
    if (zatenVar) {
      await supabase
        .from("yolculuk_ilerleme")
        .delete()
        .eq("kullanici_id", uid)
        .eq("yolculuk_slug", yolculukSlug)
        .eq("adim_id", adimId);
    } else {
      await supabase
        .from("yolculuk_ilerleme")
        .upsert(
          { kullanici_id: uid, yolculuk_slug: yolculukSlug, adim_id: adimId },
          { onConflict: "kullanici_id,yolculuk_slug,adim_id", ignoreDuplicates: true },
        );
      olayKaydet("journey_step_complete", { journey_id: yolculukSlug, adim_id: adimId });
      const yeniSayi = bitenSayi + 1;
      if (yeniSayi === toplam) olayKaydet("journey_complete", { journey_id: yolculukSlug });
    }
  }

  return (
    <div>
      {/* İlerleme başlığı */}
      <div className="mb-6 rounded-2xl border border-toprak/25 bg-parsomen p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-ceviz">
            {durum === "hazir" ? `${bitenSayi} / ${toplam} tamamlandı` : `${toplam} adım`}
          </span>
          {durum === "hazir" && <span className="text-ceviz-light">%{yuzde}</span>}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-toprak/15">
          <div className="h-full rounded-full bg-kilim transition-all duration-500" style={{ width: `${durum === "hazir" ? yuzde : 0}%` }} />
        </div>
        {durum === "misafir" && (
          <p className="mt-3 text-sm text-ceviz-light">
            Adımları serbestçe gezebilirsin.{" "}
            <Link href="/giris" className="font-semibold text-kilim-dark underline">Giriş yap</Link>{" "}
            ki ilerlemen kaydedilsin ve rozetini kazan.
          </p>
        )}
      </div>

      {/* Tamamlandı kutlaması */}
      {bitti && (
        <div className="mb-6 rounded-3xl border border-kilim/40 bg-kilim/8 p-6 text-center">
          <div className="text-4xl" aria-hidden>{emoji}</div>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-ceviz">Yolculuk tamamlandı!</h2>
          <p className="mt-1 text-ceviz-light">
            “{rozetAdi}” rozetini kazandın. Kültür pasaportunda görebilirsin.
          </p>
          <Link href="/pasaport" className="mt-4 inline-block rounded-xl bg-kilim px-5 py-2.5 text-sm font-semibold text-parsomen hover:bg-kilim-dark">
            Pasaportuma git →
          </Link>
        </div>
      )}

      {/* Adımlar */}
      <ol className="space-y-3">
        {adimlar.map((adim, i) => {
          const biten = tamamlanan.has(adim.id);
          return (
            <li
              key={adim.id}
              className={`rounded-2xl border p-5 transition ${biten ? "border-kilim/40 bg-kilim/6" : "border-toprak/25 bg-parsomen"}`}
            >
              <div className="flex items-start gap-4">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg font-semibold ${biten ? "bg-kilim text-parsomen" : "bg-parsomen-dark text-ceviz"}`} aria-hidden>
                  {biten ? "✓" : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-kilim">
                    <span aria-hidden>{ADIM_IKON[adim.tur]}</span>
                    {adim.hedefEtiketi}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-ceviz">{adim.baslik}</h3>
                  {adim.metin && <p className="mt-1 text-sm leading-6 text-ceviz-light">{adim.metin}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {adim.href && (
                      <Link
                        href={adim.href}
                        target={adim.tur === "quiz" ? undefined : "_blank"}
                        rel={adim.tur === "quiz" ? undefined : "noopener noreferrer"}
                        className="inline-flex min-h-10 items-center rounded-xl border border-cini/30 bg-cini/5 px-4 text-sm font-semibold text-cini-dark transition hover:bg-cini hover:text-white"
                        onClick={() => olayKaydet("journey_step_open", { journey_id: yolculukSlug, adim_id: adim.id, hedef: adim.href })}
                      >
                        {EYLEM_ETIKETI[adim.tur]} →
                      </Link>
                    )}
                    {durum === "hazir" ? (
                      <button
                        type="button"
                        onClick={() => void degistir(adim.id)}
                        className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${biten ? "border border-kilim/40 text-kilim-dark hover:bg-kilim/10" : "bg-ceviz text-parsomen hover:bg-cini-dark"}`}
                      >
                        {biten ? "✓ Tamamlandı" : "Tamamladım"}
                      </button>
                    ) : (
                      durum === "misafir" && (
                        <span className="text-xs text-ceviz-light">İlerleme için giriş yap</span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
