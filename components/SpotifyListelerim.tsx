"use client";

import { useEffect, useState } from "react";
import { SpotifyIkon } from "./MarkaIkonlari";
import { SpotifyBaglaButonu } from "./SpotifyBaglaButonu";

export type SpotifyListe = {
  id: string;
  ad: string;
  aciklama: string;
  gorsel: string | null;
  url: string | null;
  parcaSayisi: number;
  sahibi: string;
  duzenlenebilir: boolean;
};

export function SpotifyListelerim() {
  const [durum, setDurum] = useState<"yukleniyor" | "hazir" | "baglanti" | "hata">("yukleniyor");
  const [listeler, setListeler] = useState<SpotifyListe[]>([]);

  useEffect(() => {
    fetch("/api/spotify/playlists", { cache: "no-store" })
      .then(async (cevap) => ({ ok: cevap.ok, veri: await cevap.json() }))
      .then(({ ok, veri }) => {
        if (ok) {
          setListeler(veri.listeler ?? []);
          setDurum("hazir");
        } else {
          setDurum(veri.yenidenBagla || veri.hata === "spotify-baglanti-gerekli" ? "baglanti" : "hata");
        }
      })
      .catch(() => setDurum("hata"));
  }, []);

  return (
    <section className="mt-12 border-t border-toprak/20 pt-10" aria-labelledby="spotify-listeler-baslik">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#16883f]">Spotify hesabın</p><h2 id="spotify-listeler-baslik" className="mt-1 font-serif text-2xl font-semibold text-ceviz">Spotify çalma listelerin</h2><p className="mt-2 text-sm text-ceviz-light">Spotify’da oluşturduğun ve takip ettiğin listeleri buradan görüntüleyebilirsin.</p></div>
        {durum === "baglanti" && <SpotifyBaglaButonu etiket="Spotify erişimini yenile" />}
      </div>
      {durum === "yukleniyor" && <div className="mt-5 h-36 animate-pulse rounded-2xl bg-toprak/10" aria-label="Spotify listeleri yükleniyor" />}
      {durum === "hata" && <p role="alert" className="mt-5 rounded-xl border border-kilim/25 bg-kilim/5 p-4 text-sm text-kilim-dark">Spotify listeleri şu anda alınamadı. Biraz sonra yeniden deneyebilirsin.</p>}
      {durum === "hazir" && listeler.length === 0 && <p className="mt-5 rounded-2xl border border-toprak/25 bg-white/35 p-6 text-sm text-ceviz-light">Spotify hesabında henüz çalma listesi bulunmuyor.</p>}
      {durum === "hazir" && listeler.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {listeler.map((liste) => (
            <article key={liste.id} className="flex min-w-0 gap-4 rounded-2xl border border-toprak/25 bg-white/45 p-3 shadow-sm">
              {liste.gorsel ? <img src={liste.gorsel} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" /> : <span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-[#1DB954]/10 text-[#16883f]"><SpotifyIkon className="h-8 w-8" /></span>}
              <div className="min-w-0 flex-1 py-1"><h3 className="truncate font-semibold text-ceviz">{liste.ad}</h3><p className="mt-1 truncate text-xs text-ceviz-light">{liste.parcaSayisi} parça · {liste.sahibi}</p><div className="mt-3 flex items-center gap-2">{liste.url && <a href={liste.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#16883f] underline underline-offset-2">Spotify’da aç ↗</a>}{liste.duzenlenebilir && <span className="rounded-full bg-cini/10 px-2 py-0.5 text-[10px] font-semibold text-cini-dark">Düzenlenebilir</span>}</div></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
