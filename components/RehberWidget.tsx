"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { olayKaydet } from "@/lib/analytics";
import { useRehberSohbet, RehberMesajlar, RehberComposer, ORNEKLER } from "./rehber/sohbet";

/**
 * Yüzen "Anadolu Rehberi" sohbet paneli. Her sayfada sağ altta bir buton;
 * tıklanınca sayfadan ayrılmadan streaming RAG sohbeti açılır. Mobilde tam
 * ekran alt-sayfa, masaüstünde sağ-alt panel. /rehber sayfasında gizlenir
 * (orada zaten tam sayfa sohbet var).
 */
export function RehberWidget() {
  const pathname = usePathname();
  const [acik, setAcik] = useState(false);
  const { mesajlar, yaziyor, gonder, sifirla } = useRehberSohbet();

  // Escape ile kapat
  useEffect(() => {
    if (!acik) return;
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") setAcik(false); };
    document.addEventListener("keydown", f);
    return () => document.removeEventListener("keydown", f);
  }, [acik]);

  // Mobilde açıkken arkadaki sayfa kaymasını kilitle
  useEffect(() => {
    if (!acik) return;
    const kucuk = window.matchMedia("(max-width: 639px)").matches;
    if (!kucuk) return;
    const eski = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = eski; };
  }, [acik]);

  if (pathname?.startsWith("/rehber")) return null;

  const bosMu = mesajlar.length === 0;

  return (
    <>
      {/* Yüzen açma butonu */}
      {!acik && (
        <button
          type="button"
          onClick={() => { setAcik(true); olayKaydet("ai_guide_open", { kaynak: "yuzen-panel" }); }}
          aria-label="Anadolu Rehberi'ne sor"
          className="group fixed right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-kilim to-toprak px-4 py-3.5 font-semibold text-white shadow-[0_10px_30px_rgba(75,45,25,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(75,45,25,0.45)]"
          style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
        >
          <span aria-hidden className="text-xl leading-none transition-transform group-hover:rotate-12">🧭</span>
          <span className="hidden text-sm sm:inline">Rehber&apos;e sor</span>
          <span aria-hidden className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-parsomen ring-2 ring-kilim" />
        </button>
      )}

      {acik && (
        <>
          {/* Mobil karartma */}
          <div className="fixed inset-0 z-40 bg-ceviz/40 backdrop-blur-sm sm:hidden" onClick={() => setAcik(false)} aria-hidden />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Anadolu Rehberi sohbeti"
            className="fixed inset-0 z-50 flex flex-col overflow-hidden border-toprak/25 bg-parsomen shadow-[0_24px_80px_rgba(43,33,24,.35)] sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(620px,calc(100dvh-6rem))] sm:w-[390px] sm:rounded-3xl sm:border"
          >
            {/* Başlık */}
            <header className="flex items-center gap-3 border-b border-toprak/15 bg-gradient-to-br from-ceviz to-cini-dark px-4 py-3 text-parsomen">
              <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-lg">🧭</span>
              <div className="min-w-0 flex-1">
                <div className="font-serif text-base font-semibold leading-tight">Anadolu Rehberi</div>
                <div className="text-[11px] text-parsomen/70">Kaynaklı · uydurmasız</div>
              </div>
              {!bosMu && (
                <button type="button" onClick={() => !yaziyor && sifirla()} disabled={yaziyor} className="rounded-full border border-parsomen/25 px-2.5 py-1 text-[11px] font-semibold text-parsomen/90 transition hover:bg-white/10 disabled:opacity-40">
                  Yeni
                </button>
              )}
              <button type="button" onClick={() => setAcik(false)} aria-label="Kapat" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-parsomen/90 transition hover:bg-white/10">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </header>

            {/* Akış */}
            {bosMu ? (
              <div className="flex min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <div className="flex w-full flex-col items-center justify-center text-center">
                  <span aria-hidden className="mb-3 text-4xl">🎶</span>
                  <h2 className="font-serif text-lg font-semibold text-ceviz">Ne keşfetmek istersin?</h2>
                  <p className="mt-1 max-w-xs text-sm text-ceviz-light">
                    Bir türkü, ozan, yöre ya da kavram sor; arşivdeki bilgiye dayanarak — uydurmadan — anlatayım.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {ORNEKLER.slice(0, 4).map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => void gonder(o, "widget")}
                        className="rounded-full border border-toprak/25 bg-parsomen px-3 py-1.5 text-[13px] text-ceviz transition hover:border-kilim/50 hover:text-kilim-dark"
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <RehberMesajlar mesajlar={mesajlar} kompakt className="min-h-0 flex-1" />
            )}

            {/* Composer */}
            <div className="border-t border-toprak/15 bg-parsomen/90 px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur">
              <RehberComposer onGonder={(m) => void gonder(m, "widget")} yaziyor={yaziyor} otomatikOdak={acik} />
              <p className="mt-1 text-center text-[10px] text-ceviz-light/70">Yanıtlar arşiv verisine dayanır · Enter gönder</p>
            </div>
          </section>
        </>
      )}
    </>
  );
}
