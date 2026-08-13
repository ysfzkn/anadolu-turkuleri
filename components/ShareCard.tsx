"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { Turku } from "@/lib/types";

/**
 * Türkü hikâyesini şık bir Anadolu temalı kart olarak gösterir ve
 * PNG olarak indirilmesini / mobilde paylaşılmasını sağlar.
 */
export function ShareCard({ turku }: { turku: Turku }) {
  const kartRef = useRef<HTMLDivElement>(null);
  const [durum, setDurum] = useState<"hazir" | "uretiliyor">("hazir");

  async function pngUret(): Promise<Blob | null> {
    const el = kartRef.current;
    if (!el) return null;
    // Kartı tam ve ofsetsiz yakala: mx-auto kaynaklı auto margin'i (html-to-image'da
    // sağa kayma/kırpılmaya yol açar) sıfırla ve genişlik/yüksekliği açıkça ver.
    const dataUrl = await toPng(el, {
      pixelRatio: 2,
      cacheBust: true,
      width: el.offsetWidth,
      height: el.offsetHeight,
      style: { margin: "0" },
    });
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
      a.download = `${turku.slug}-anadolu-turkuleri.png`;
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
      const dosya = new File([blob], `${turku.slug}.png`, { type: "image/png" });
      const paylasVeri: ShareData = {
        title: turku.baslik,
        text: `${turku.baslik} — ${turku.yore} · anadoluturkuleri.com`,
        files: [dosya],
      };
      if (navigator.canShare && navigator.canShare({ files: [dosya] })) {
        await navigator.share(paylasVeri);
      } else {
        // Web Share desteklenmiyorsa indirmeye düş
        await indir();
      }
    } catch {
      /* kullanıcı iptal etti veya desteklenmiyor */
    } finally {
      setDurum("hazir");
    }
  }

  return (
    <div className="space-y-4">
      {/* Paylaşılacak görsel kart */}
      <div className="overflow-x-auto">
        <div
          ref={kartRef}
          className="mx-auto w-[420px] shrink-0 rounded-2xl bg-parsomen p-0 shadow-motif"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          <div
            style={{
              height: 8,
              background:
                "repeating-linear-gradient(135deg,#9c2b21 0 10px,#c8873f 10px 20px,#1f5673 20px 30px)",
            }}
          />
          <div className="p-7">
            <div className="mb-1 text-xs font-medium uppercase tracking-widest text-kilim">
              {turku.yore} Türküsü
            </div>
            <h2 className="mb-3 text-3xl font-semibold leading-tight text-ceviz">
              {turku.baslik}
            </h2>
            <p className="text-[15px] leading-relaxed text-ceviz-light">
              {turku.ozet}
            </p>

            {turku.sozler[0] && (
              <div className="mt-5 border-l-4 border-toprak pl-4">
                {turku.sozler[0].satirlar.slice(0, 3).map((s, i) => (
                  <p key={i} className="text-[15px] italic text-ceviz">
                    {s}
                  </p>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-toprak/30 pt-4">
              <span className="text-sm font-semibold text-kilim-dark">
                Anadolu Türküleri
              </span>
              <span className="text-xs text-ceviz-light">
                anadoluturkuleri.com
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Aksiyon butonları */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={paylas}
          disabled={durum === "uretiliyor"}
          className="inline-flex items-center gap-2 rounded-xl bg-kilim px-4 py-2 text-sm font-medium text-parsomen transition-colors hover:bg-kilim-dark disabled:opacity-60"
        >
          {durum === "uretiliyor" ? "Hazırlanıyor…" : "Paylaş"}
        </button>
        <button
          onClick={indir}
          disabled={durum === "uretiliyor"}
          className="inline-flex items-center gap-2 rounded-xl border border-ceviz/30 px-4 py-2 text-sm font-medium text-ceviz transition-colors hover:bg-ceviz hover:text-parsomen disabled:opacity-60"
        >
          PNG indir
        </button>
      </div>
    </div>
  );
}
