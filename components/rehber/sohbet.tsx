"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { olayKaydet } from "@/lib/analytics";

// ── Tipler ──────────────────────────────────────────────────────────────────
export interface Sonuc {
  tur: string;
  baslik: string;
  url: string;
  ozet: string;
}

type Rol = "user" | "asistan";

export interface Mesaj {
  id: number;
  rol: Rol;
  metin: string;
  sonuclar?: Sonuc[];
  not?: string;
  akiyor?: boolean;
  hata?: boolean;
}

export const TUR_ETIKETI: Record<string, string> = {
  turku: "Türkü",
  kisi: "Ozan / Kişi",
  tema: "Tema",
  terim: "Sözlük",
  yore: "Yöre",
};

export const ORNEKLER = [
  "Ayrılık üzerine Erzurum türküleri",
  "Bozlak nedir?",
  "Pir Sultan Abdal kimdir?",
  "Gurbet temalı türküler öner",
  "Ege'de zeybek ve efeler",
  "Âşık Veysel'i anlat",
];

// ── Sohbet motoru (paylaşımlı hook — sayfa ve widget aynı akışı kullanır) ────
export function useRehberSohbet() {
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([]);
  const [yaziyor, setYaziyor] = useState(false);
  const kimlikRef = useRef(0);

  const guncelle = useCallback((id: number, fn: (m: Mesaj) => Mesaj) => {
    setMesajlar((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));
  }, []);

  const gonder = useCallback(
    async (metin: string, yer: string) => {
      const q = metin.trim();
      if (q.length < 3 || yaziyor) return;

      let gecmis: { rol: Rol; metin: string }[] = [];
      setMesajlar((prev) => {
        gecmis = prev.filter((m) => !m.hata && m.metin).map((m) => ({ rol: m.rol, metin: m.metin }));
        return prev;
      });

      const kullaniciId = ++kimlikRef.current;
      const asistanId = ++kimlikRef.current;
      setMesajlar((prev) => [
        ...prev,
        { id: kullaniciId, rol: "user", metin: q },
        { id: asistanId, rol: "asistan", metin: "", akiyor: true },
      ]);
      setYaziyor(true);
      olayKaydet("ai_guide_query", { uzunluk: q.length, yer });

      try {
        const resp = await fetch("/api/rehber", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ soru: q, gecmis }),
        });

        if (!resp.ok || !resp.body) {
          guncelle(asistanId, (m) => ({
            ...m,
            akiyor: false,
            hata: true,
            metin: resp.status === 429 ? "Çok sık soru sordun, birkaç saniye bekle." : "Bir sorun oluştu, tekrar dene.",
          }));
          return;
        }

        const reader = resp.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const satirlar = buf.split("\n");
          buf = satirlar.pop() ?? "";
          for (const satir of satirlar) {
            if (!satir.trim()) continue;
            let j: { t: string; sonuclar?: Sonuc[]; metin?: string; not?: string };
            try {
              j = JSON.parse(satir);
            } catch {
              continue;
            }
            if (j.t === "kaynaklar") guncelle(asistanId, (m) => ({ ...m, sonuclar: j.sonuclar }));
            else if (j.t === "delta") guncelle(asistanId, (m) => ({ ...m, metin: m.metin + (j.metin ?? "") }));
            else if (j.t === "son") guncelle(asistanId, (m) => ({ ...m, akiyor: false, not: j.not }));
            else if (j.t === "hata") guncelle(asistanId, (m) => ({ ...m, akiyor: false, hata: true }));
          }
        }
        guncelle(asistanId, (m) => ({ ...m, akiyor: false }));
      } catch {
        guncelle(asistanId, (m) => ({ ...m, akiyor: false, hata: true, metin: "Bağlantı kurulamadı. İnternetini kontrol et." }));
      } finally {
        setYaziyor(false);
      }
    },
    [yaziyor, guncelle],
  );

  const sifirla = useCallback(() => {
    setYaziyor((y) => {
      if (!y) setMesajlar([]);
      return y;
    });
  }, []);

  return { mesajlar, yaziyor, gonder, sifirla };
}

// ── Atıf ([n]) → kaynak linki ────────────────────────────────────────────────
function icerik(metin: string, sonuclar: Sonuc[]) {
  return metin.split(/(\[\d+\])/g).map((parca, i) => {
    const eslesme = /^\[(\d+)\]$/.exec(parca);
    if (eslesme) {
      const no = Number(eslesme[1]);
      const kaynak = sonuclar[no - 1];
      if (kaynak)
        return (
          <Link
            key={i}
            href={kaynak.url}
            className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cini/15 px-1 align-baseline text-[11px] font-semibold text-cini-dark transition hover:bg-cini hover:text-white"
            title={kaynak.baslik}
          >
            {no}
          </Link>
        );
    }
    return <span key={i}>{parca}</span>;
  });
}

// ── Mesaj listesi (sayfa + widget ortak) ─────────────────────────────────────
// Kendi scroll kabına sahiptir. Yalnızca kullanıcı zaten dipteyken otomatik
// (anlık) kaydırır — yukarı kaydırıp geçmişi okuyanı yerinden etmez.
export function RehberMesajlar({
  mesajlar,
  kompakt = false,
  className = "",
}: {
  mesajlar: Mesaj[];
  kompakt?: boolean;
  className?: string;
}) {
  const kap = useRef<HTMLDivElement>(null);
  const dipte = useRef(true);

  useEffect(() => {
    const el = kap.current;
    if (el && dipte.current) el.scrollTop = el.scrollHeight;
  }, [mesajlar]);

  return (
    <div
      ref={kap}
      onScroll={() => {
        const el = kap.current;
        if (el) dipte.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      }}
      className={`overflow-y-auto overscroll-contain ${className}`}
      aria-live="polite"
    >
      <ul className={`mx-auto max-w-3xl px-4 ${kompakt ? "space-y-3 py-3" : "space-y-4 py-5"}`}>
        {mesajlar.map((m) => (
          <li key={m.id} className={m.rol === "user" ? "flex justify-end" : "flex justify-start"}>
            {m.rol === "user" ? (
              <div className={`max-w-[85%] rounded-2xl rounded-br-md bg-ceviz px-4 py-2.5 leading-6 text-parsomen shadow-sm ${kompakt ? "text-sm" : "text-[15px]"}`}>
                {m.metin}
              </div>
            ) : (
              <div className="w-full max-w-[94%]">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-kilim">
                  <span aria-hidden>✦</span> Rehber
                </div>
                <div
                  className={`rounded-2xl rounded-bl-md border px-4 py-3 leading-7 shadow-sm ${kompakt ? "text-[14px]" : "text-[15px]"} ${
                    m.hata ? "border-kilim/30 bg-kilim/5 text-kilim-dark" : "border-toprak/25 bg-parsomen text-ceviz"
                  }`}
                >
                  {m.metin ? (
                    <p className="whitespace-pre-line">
                      {icerik(m.metin, m.sonuclar ?? [])}
                      {m.akiyor && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-kilim" aria-hidden />}
                    </p>
                  ) : m.akiyor ? (
                    <span className="inline-flex gap-1" aria-label="Rehber yazıyor">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-kilim/60 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-kilim/60 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-kilim/60" />
                    </span>
                  ) : (
                    <span className="text-ceviz-light">{m.not ?? "—"}</span>
                  )}
                </div>

                {m.sonuclar && m.sonuclar.length > 0 && (
                  <div className="mt-2.5">
                    <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ceviz-light">İlgili sayfalar</div>
                    <ul className={`grid gap-2 ${kompakt ? "" : "sm:grid-cols-2"}`}>
                      {m.sonuclar.map((s, i) => (
                        <li key={s.url}>
                          <Link
                            href={s.url}
                            onClick={() => olayKaydet("ai_guide_result_click", { tur: s.tur, url: s.url })}
                            className="group flex items-start gap-2.5 rounded-xl border border-toprak/25 bg-parsomen p-3 transition hover:-translate-y-0.5 hover:border-kilim/50"
                          >
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cini/10 text-[11px] font-semibold text-cini-dark">{i + 1}</span>
                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className="font-serif text-[15px] font-semibold text-ceviz group-hover:text-kilim-dark">{s.baslik}</span>
                                <span className="rounded-full bg-toprak/10 px-1.5 py-0.5 text-[10px] text-ceviz-light">{TUR_ETIKETI[s.tur] ?? s.tur}</span>
                              </span>
                              <span className="mt-0.5 line-clamp-2 block text-xs text-ceviz-light">{s.ozet}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Composer (sayfa + widget ortak) ──────────────────────────────────────────
export function RehberComposer({
  onGonder,
  yaziyor,
  otomatikOdak = false,
}: {
  onGonder: (metin: string) => void;
  yaziyor: boolean;
  otomatikOdak?: boolean;
}) {
  const [giris, setGiris] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (otomatikOdak) ref.current?.focus();
  }, [otomatikOdak]);

  function buyut() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  function yolla() {
    if (giris.trim().length < 3 || yaziyor) return;
    onGonder(giris);
    setGiris("");
    if (ref.current) ref.current.style.height = "auto";
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); yolla(); }} className="flex items-end gap-2">
      <textarea
        ref={ref}
        value={giris}
        onChange={(e) => { setGiris(e.target.value); buyut(); }}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); yolla(); } }}
        rows={1}
        maxLength={300}
        placeholder="Bir türkü, ozan, yöre ya da kavram sor…"
        aria-label="Rehbere sorun"
        className="max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-toprak/35 bg-parsomen px-4 py-2.5 text-[15px] leading-6 focus:border-kilim focus:outline-none"
      />
      <button
        type="submit"
        disabled={yaziyor || giris.trim().length < 3}
        aria-label="Gönder"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-kilim text-white shadow-sm transition hover:bg-kilim-dark disabled:opacity-40"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" />
        </svg>
      </button>
    </form>
  );
}
