"use client";

import { useEffect, useState } from "react";
import { YouTubeMusicIkon } from "./MarkaIkonlari";
import { YouTubeMusicBaglaButonu } from "./YouTubeMusicBaglaButonu";
import type { YouTubeListe } from "./YouTubeMusicListelerim";

const HATALAR: Record<string, string> = {
  "parca-bulunamadi": "Bu türkü için güvenilir bir YouTube videosu bulunamadı.",
  "youtube-listesine-eklenemedi": "Video seçilen YouTube listesine eklenemedi.",
  "youtube-yetki": "Bu listeyi düzenleme iznin bulunmuyor.",
  "youtube-token": "Google oturumunun yenilenmesi gerekiyor.",
};

export function YouTubeMusicListeyeEkle({ turkuSlug }: { turkuSlug: string }) {
  const [listeler, setListeler] = useState<YouTubeListe[]>([]);
  const [secili, setSecili] = useState("");
  const [durum, setDurum] = useState<"kapali" | "yukleniyor" | "hazir" | "baglanti" | "ekleniyor">("kapali");
  const [mesaj, setMesaj] = useState("");

  async function listeleriAc() {
    if (durum === "hazir") return setDurum("kapali");
    setDurum("yukleniyor");
    setMesaj("");
    const cevap = await fetch("/api/youtube/playlists", { cache: "no-store" }).catch(() => null);
    if (!cevap) return setDurum("baglanti");
    const veri = await cevap.json();
    if (!cevap.ok) return setDurum(veri.yenidenBagla ? "baglanti" : "kapali");
    const yazilabilir = ((veri.listeler ?? []) as YouTubeListe[]).filter((liste) => liste.duzenlenebilir);
    setListeler(yazilabilir);
    setSecili(yazilabilir[0]?.id ?? "");
    setDurum("hazir");
  }

  useEffect(() => { setMesaj(""); }, [secili]);

  async function ekle() {
    if (!secili) return;
    setDurum("ekleniyor");
    setMesaj("");
    const cevap = await fetch("/api/youtube/playlists/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId: secili, turkuSlug }),
    }).catch(() => null);
    if (!cevap) { setMesaj("YouTube’a ulaşılamadı."); return setDurum("hazir"); }
    const veri = await cevap.json();
    if (veri.yenidenBagla) return setDurum("baglanti");
    setMesaj(
      cevap.ok
        ? (veri.zatenVar ? "Bu video seçili listede zaten var." : "Video YouTube Music listene eklendi.")
        : (HATALAR[veri.hata] ?? "İşlem tamamlanamadı."),
    );
    setDurum("hazir");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void listeleriAc()}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#FF0000]/45 bg-[#FF0000]/5 px-4 text-sm font-semibold text-[#c4302b] transition hover:bg-[#FF0000] hover:text-white"
      >
        <YouTubeMusicIkon className="h-4 w-4" />
        YouTube Music listeme ekle
      </button>
      {(durum === "yukleniyor" || durum === "hazir" || durum === "ekleniyor" || durum === "baglanti") && (
        <div className="absolute left-0 top-full z-40 mt-2 w-[min(90vw,360px)] rounded-2xl border border-toprak/25 bg-parsomen p-4 shadow-[0_18px_55px_rgba(43,33,24,.22)]">
          {durum === "yukleniyor" && (
            <p className="text-sm text-ceviz-light">YouTube Music listelerin yükleniyor…</p>
          )}
          {durum === "baglanti" && (
            <div>
              <p className="mb-3 text-sm leading-6 text-ceviz-light">
                Listelerini görebilmek ve düzenleyebilmek için YouTube Music (Google) erişimini yenile.
              </p>
              <YouTubeMusicBaglaButonu next={`/turku/${turkuSlug}`} etiket="YouTube Music erişimini yenile" />
            </div>
          )}
          {(durum === "hazir" || durum === "ekleniyor") && (
            <>
              <label
                htmlFor={`youtube-liste-${turkuSlug}`}
                className="text-xs font-semibold uppercase tracking-wide text-ceviz-light"
              >
                Çalma listesi
              </label>
              {listeler.length ? (
                <div className="mt-2 flex gap-2">
                  <select
                    id={`youtube-liste-${turkuSlug}`}
                    value={secili}
                    onChange={(e) => setSecili(e.target.value)}
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-toprak/30 bg-white/60 px-3 text-sm text-ceviz"
                  >
                    {listeler.map((liste) => (
                      <option key={liste.id} value={liste.id}>{liste.ad}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void ekle()}
                    disabled={durum === "ekleniyor"}
                    className="min-h-11 rounded-xl bg-[#FF0000] px-4 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {durum === "ekleniyor" ? "Ekleniyor…" : "Ekle"}
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-ceviz-light">
                  Düzenleyebileceğin bir YouTube listesi bulunamadı.
                </p>
              )}
              {mesaj && (
                <p role="status" className="mt-3 rounded-lg bg-toprak/10 px-3 py-2 text-xs leading-5 text-ceviz">
                  {mesaj}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
