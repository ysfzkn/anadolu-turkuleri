"use client";

import { useRehberSohbet, RehberMesajlar, RehberComposer, ORNEKLER } from "@/components/rehber/sohbet";

export default function RehberSayfasi() {
  const { mesajlar, yaziyor, gonder, sifirla } = useRehberSohbet();
  const bosMu = mesajlar.length === 0;

  return (
    <div className="mx-auto flex h-[calc(100dvh-73px)] max-w-3xl flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-kilim to-toprak text-xl text-white shadow-sm">🧭</span>
          <div>
            <h1 className="font-serif text-2xl font-semibold leading-tight text-ceviz">Anadolu Rehberi</h1>
            <p className="text-xs text-ceviz-light">Arşiv verisine dayalı · kaynaklı · uydurmasız</p>
          </div>
        </div>
        {!bosMu && (
          <button
            type="button"
            onClick={() => sifirla()}
            disabled={yaziyor}
            className="shrink-0 rounded-full border border-toprak/30 px-3 py-1.5 text-xs font-semibold text-ceviz transition hover:bg-toprak/10 disabled:opacity-40"
          >
            Yeni konuşma
          </button>
        )}
      </header>

      {bosMu ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <span aria-hidden className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-parsomen-dark/50 text-3xl">🎶</span>
            <h2 className="font-serif text-2xl font-semibold text-ceviz">Ne keşfetmek istersin?</h2>
            <p className="mt-2 max-w-md text-ceviz-light">
              Bir türkü, ozan, yöre ya da kavram sor. Sana en uygun sayfaları bulur, arşivdeki bilgiye
              dayanarak — uydurmadan — anlatırım.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {ORNEKLER.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => void gonder(o, "sayfa")}
                  className="rounded-full border border-toprak/25 bg-parsomen px-3.5 py-2 text-sm text-ceviz shadow-sm transition hover:-translate-y-0.5 hover:border-kilim/50 hover:text-kilim-dark"
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <RehberMesajlar mesajlar={mesajlar} className="min-h-0 flex-1" />
      )}

      <div className="shrink-0 border-t border-toprak/15 bg-parsomen/85 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl">
          <RehberComposer onGonder={(m) => void gonder(m, "sayfa")} yaziyor={yaziyor} />
          <p className="mt-1.5 text-center text-[11px] text-ceviz-light/70">
            Yanıtlar yalnızca arşiv verisine dayanır. Enter ile gönder · Shift+Enter alt satır.
          </p>
        </div>
      </div>
    </div>
  );
}
