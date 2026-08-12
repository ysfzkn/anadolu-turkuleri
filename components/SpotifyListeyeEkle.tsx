"use client";

import { useEffect, useState } from "react";
import { SpotifyIkon } from "./MarkaIkonlari";
import { SpotifyBaglaButonu } from "./SpotifyBaglaButonu";
import type { SpotifyListe } from "./SpotifyListelerim";

const HATALAR: Record<string, string> = {
  "parca-bulunamadi": "Bu türkü için güvenilir bir Spotify kaydı bulunamadı.",
  "spotify-listesine-eklenemedi": "Parça seçilen Spotify listesine eklenemedi.",
  "spotify-yetki": "Bu listeyi düzenleme iznin bulunmuyor.",
  "spotify-token": "Spotify oturumunun yenilenmesi gerekiyor.",
};

export function SpotifyListeyeEkle({ turkuSlug }: { turkuSlug: string }) {
  const [listeler, setListeler] = useState<SpotifyListe[]>([]);
  const [secili, setSecili] = useState("");
  const [durum, setDurum] = useState<"kapali" | "yukleniyor" | "hazir" | "baglanti" | "ekleniyor">("kapali");
  const [mesaj, setMesaj] = useState("");

  async function listeleriAc() {
    if (durum === "hazir") return setDurum("kapali");
    setDurum("yukleniyor");
    setMesaj("");
    const cevap = await fetch("/api/spotify/playlists", { cache: "no-store" }).catch(() => null);
    if (!cevap) return setDurum("baglanti");
    const veri = await cevap.json();
    if (!cevap.ok) return setDurum(veri.yenidenBagla ? "baglanti" : "kapali");
    const yazilabilir = ((veri.listeler ?? []) as SpotifyListe[]).filter((liste) => liste.duzenlenebilir);
    setListeler(yazilabilir);
    setSecili(yazilabilir[0]?.id ?? "");
    setDurum("hazir");
  }

  useEffect(() => { setMesaj(""); }, [secili]);

  async function ekle() {
    if (!secili) return;
    setDurum("ekleniyor");
    setMesaj("");
    const cevap = await fetch("/api/spotify/playlists/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId: secili, turkuSlug }),
    }).catch(() => null);
    if (!cevap) { setMesaj("Spotify’a ulaşılamadı."); return setDurum("hazir"); }
    const veri = await cevap.json();
    if (veri.yenidenBagla) return setDurum("baglanti");
    setMesaj(cevap.ok ? (veri.zatenVar ? "Bu parça seçili listede zaten var." : "Parça Spotify listene eklendi.") : (HATALAR[veri.hata] ?? "İşlem tamamlanamadı."));
    setDurum("hazir");
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => void listeleriAc()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#1DB954]/45 bg-[#1DB954]/5 px-4 text-sm font-semibold text-[#16883f] transition hover:bg-[#1DB954] hover:text-white"><SpotifyIkon className="h-4 w-4" />Spotify listeme ekle</button>
      {(durum === "yukleniyor" || durum === "hazir" || durum === "ekleniyor" || durum === "baglanti") && (
        <div className="absolute left-0 top-full z-40 mt-2 w-[min(90vw,360px)] rounded-2xl border border-toprak/25 bg-parsomen p-4 shadow-[0_18px_55px_rgba(43,33,24,.22)]">
          {durum === "yukleniyor" && <p className="text-sm text-ceviz-light">Spotify listelerin yükleniyor…</p>}
          {durum === "baglanti" && <div><p className="mb-3 text-sm leading-6 text-ceviz-light">Listelerini görebilmek ve düzenleyebilmek için Spotify erişimini yenile.</p><SpotifyBaglaButonu next={`/turku/${turkuSlug}`} etiket="Spotify erişimini yenile" /></div>}
          {(durum === "hazir" || durum === "ekleniyor") && <><label htmlFor={`spotify-liste-${turkuSlug}`} className="text-xs font-semibold uppercase tracking-wide text-ceviz-light">Çalma listesi</label>{listeler.length ? <div className="mt-2 flex gap-2"><select id={`spotify-liste-${turkuSlug}`} value={secili} onChange={(e) => setSecili(e.target.value)} className="min-h-11 min-w-0 flex-1 rounded-xl border border-toprak/30 bg-white/60 px-3 text-sm text-ceviz">{listeler.map((liste) => <option key={liste.id} value={liste.id}>{liste.ad}</option>)}</select><button type="button" onClick={() => void ekle()} disabled={durum === "ekleniyor"} className="min-h-11 rounded-xl bg-[#1DB954] px-4 text-sm font-semibold text-white disabled:opacity-60">{durum === "ekleniyor" ? "Ekleniyor…" : "Ekle"}</button></div> : <p className="mt-2 text-sm leading-6 text-ceviz-light">Düzenleyebileceğin bir Spotify listesi bulunamadı.</p>}{mesaj && <p role="status" className="mt-3 rounded-lg bg-toprak/10 px-3 py-2 text-xs leading-5 text-ceviz">{mesaj}</p>}</>}
        </div>
      )}
    </div>
  );
}
