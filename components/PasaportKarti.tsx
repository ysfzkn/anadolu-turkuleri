"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { TOPLAM_IL, type PasaportOzeti } from "@/lib/pasaport";

/**
 * Paylaşılabilir kültür pasaportu kartı. Yalnızca ilerleme özeti gösterilir;
 * e-posta veya kişisel veri içermez.
 */
export function PasaportKarti({
  ozet,
  rozetSayisi,
}: {
  ozet: PasaportOzeti;
  rozetSayisi: number;
}) {
  const kartRef = useRef<HTMLDivElement>(null);
  const [durum, setDurum] = useState<"hazir" | "uretiliyor">("hazir");

  async function pngUret(): Promise<Blob | null> {
    if (!kartRef.current) return null;
    const dataUrl = await toPng(kartRef.current, { pixelRatio: 2, cacheBust: true });
    const res = await fetch(dataUrl);
    return await res.blob();
  }

  async function indir() {
    try {
      setDurum("uretiliyor");
      const blob = await pngUret();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "anadolu-kultur-pasaportu.png";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDurum("hazir");
    }
  }

  async function paylas() {
    try {
      setDurum("uretiliyor");
      const blob = await pngUret();
      if (!blob) return;
      const dosya = new File([blob], "anadolu-kultur-pasaportu.png", { type: "image/png" });
      const veri: ShareData = {
        title: "Anadolu Kültür Pasaportum",
        text: `Anadolu'nun ${ozet.sehirler.length} şehrini keşfettim, ${ozet.turkuSayisi} türkü tanıdım. · anadoluturkuleri.com`,
        files: [dosya],
      };
      if (navigator.canShare && navigator.canShare({ files: [dosya] })) {
        await navigator.share(veri);
      } else {
        await indir();
      }
    } catch {
      /* iptal edildi veya desteklenmiyor */
    } finally {
      setDurum("hazir");
    }
  }

  const kutular: { deger: number | string; etiket: string }[] = [
    { deger: `${ozet.sehirler.length}/${TOPLAM_IL}`, etiket: "şehir" },
    { deger: ozet.turkuSayisi, etiket: "türkü" },
    { deger: ozet.ozanSayisi, etiket: "ozan" },
    { deger: rozetSayisi, etiket: "rozet" },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div
          ref={kartRef}
          className="mx-auto w-[420px] shrink-0 overflow-hidden rounded-2xl bg-parsomen shadow-motif"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          <div style={{ height: 8, background: "repeating-linear-gradient(135deg,#9c2b21 0 10px,#c8873f 10px 20px,#1f5673 20px 30px)" }} />
          <div className="p-7">
            <div className="mb-1 text-xs font-medium uppercase tracking-widest text-kilim">
              Anadolu Kültür Pasaportu
            </div>
            <h2 className="mb-4 text-2xl font-semibold leading-tight text-ceviz">
              Anadolu&apos;yu keşfediyorum
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {kutular.map((k) => (
                <div key={k.etiket} className="rounded-xl bg-parsomen-dark/50 p-2 text-center">
                  <div className="text-xl font-semibold text-kilim-dark">{k.deger}</div>
                  <div className="text-[11px] text-ceviz-light">{k.etiket}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-toprak/30 pt-4">
              <span className="text-sm font-semibold text-kilim-dark">{ozet.puan} kültür puanı</span>
              <span className="text-xs text-ceviz-light">anadoluturkuleri.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={paylas} disabled={durum === "uretiliyor"} className="inline-flex items-center gap-2 rounded-xl bg-kilim px-4 py-2 text-sm font-medium text-parsomen transition-colors hover:bg-kilim-dark disabled:opacity-60">
          {durum === "uretiliyor" ? "Hazırlanıyor…" : "Paylaş"}
        </button>
        <button onClick={indir} disabled={durum === "uretiliyor"} className="inline-flex items-center gap-2 rounded-xl border border-ceviz/30 px-4 py-2 text-sm font-medium text-ceviz transition-colors hover:bg-ceviz hover:text-parsomen disabled:opacity-60">
          PNG indir
        </button>
      </div>
    </div>
  );
}
