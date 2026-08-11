"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tarayiciSupabase } from "@/lib/supabase/client";

interface Liste {
  id: string;
  baslik: string;
  herkese_acik: boolean;
  paylasim_kodu: string;
  adet: number;
}

export default function ListelerimSayfasi() {
  const [durum, setDurum] = useState<"yukleniyor" | "giris-yok" | "hazir">(
    "yukleniyor",
  );
  const [listeler, setListeler] = useState<Liste[]>([]);
  const [yeniAd, setYeniAd] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [kopyalanan, setKopyalanan] = useState<string | null>(null);

  useEffect(() => {
    let supabase: ReturnType<typeof tarayiciSupabase>;
    try {
      supabase = tarayiciSupabase();
    } catch {
      setDurum("giris-yok");
      return;
    }
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setDurum("giris-yok");
        return;
      }
      setUid(u.user.id);
      await yukle(supabase);
      setDurum("hazir");
    })();
  }, []);

  async function yukle(supabase: ReturnType<typeof tarayiciSupabase>) {
    const { data } = await supabase
      .from("listeler")
      .select("id,baslik,herkese_acik,paylasim_kodu,liste_turkuleri(count)")
      .order("olusturulma", { ascending: false });
    setListeler(
      (data ?? []).map((l: any) => ({
        id: l.id,
        baslik: l.baslik,
        herkese_acik: l.herkese_acik,
        paylasim_kodu: l.paylasim_kodu,
        adet: l.liste_turkuleri?.[0]?.count ?? 0,
      })),
    );
  }

  async function olustur() {
    const ad = yeniAd.trim();
    if (!ad || !uid) return;
    const supabase = tarayiciSupabase();
    const { data } = await supabase
      .from("listeler")
      .insert({ baslik: ad, kullanici_id: uid })
      .select("id,baslik,herkese_acik,paylasim_kodu")
      .single();
    if (data) {
      setListeler((ls) => [{ ...(data as any), adet: 0 }, ...ls]);
      setYeniAd("");
    }
  }

  async function gorunurluk(liste: Liste) {
    const supabase = tarayiciSupabase();
    await supabase
      .from("listeler")
      .update({ herkese_acik: !liste.herkese_acik })
      .eq("id", liste.id);
    setListeler((ls) =>
      ls.map((l) =>
        l.id === liste.id ? { ...l, herkese_acik: !l.herkese_acik } : l,
      ),
    );
  }

  async function sil(liste: Liste) {
    if (!confirm(`"${liste.baslik}" listesi silinsin mi?`)) return;
    const supabase = tarayiciSupabase();
    await supabase.from("listeler").delete().eq("id", liste.id);
    setListeler((ls) => ls.filter((l) => l.id !== liste.id));
  }

  function paylasimKopyala(kod: string) {
    const url = `${window.location.origin}/liste/${kod}`;
    navigator.clipboard?.writeText(url);
    setKopyalanan(kod);
    setTimeout(() => setKopyalanan(null), 2000);
  }

  if (durum === "yukleniyor") {
    return <div className="mx-auto max-w-2xl px-4 py-16" aria-hidden />;
  }

  if (durum === "giris-yok") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold text-ceviz">
          Listelerim
        </h1>
        <p className="mt-2 text-ceviz-light">
          Listelerini görmek için giriş yapmalısın.
        </p>
        <Link
          href="/giris"
          className="mt-6 inline-block rounded-xl bg-kilim px-5 py-2.5 font-medium text-parsomen hover:bg-kilim-dark"
        >
          Giriş yap
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-serif text-3xl font-semibold text-ceviz">
        Listelerim
      </h1>

      {/* Yeni liste */}
      <div className="mb-8 flex gap-2">
        <input
          value={yeniAd}
          onChange={(e) => setYeniAd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && olustur()}
          placeholder="Yeni liste adı…"
          className="flex-1 rounded-xl border border-toprak/40 bg-parsomen px-4 py-2.5 focus:border-kilim focus:outline-none"
        />
        <button
          onClick={olustur}
          className="rounded-xl bg-kilim px-5 py-2.5 font-medium text-parsomen hover:bg-kilim-dark"
        >
          Oluştur
        </button>
      </div>

      {listeler.length === 0 ? (
        <p className="rounded-2xl border border-toprak/30 bg-parsomen-dark/40 p-8 text-center text-ceviz-light">
          Henüz listen yok. Yukarıdan ilk listeni oluştur, sonra türkü
          sayfalarından "Listeye ekle" ile doldur.
        </p>
      ) : (
        <ul className="space-y-3">
          {listeler.map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-toprak/30 bg-parsomen p-4 shadow-motif"
            >
              <div className="min-w-0">
                <Link
                  href={`/liste/${l.paylasim_kodu}`}
                  className="font-serif text-lg font-semibold text-ceviz hover:text-kilim"
                >
                  {l.baslik}
                </Link>
                <div className="text-sm text-ceviz-light">{l.adet} türkü</div>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm">
                <button
                  onClick={() => gorunurluk(l)}
                  className={`rounded-lg border px-2.5 py-1 ${
                    l.herkese_acik
                      ? "border-cini/40 bg-cini/10 text-cini-dark"
                      : "border-toprak/40 text-ceviz-light"
                  }`}
                  title="Herkese açık paylaşım"
                >
                  {l.herkese_acik ? "Açık" : "Gizli"}
                </button>
                {l.herkese_acik && (
                  <button
                    onClick={() => paylasimKopyala(l.paylasim_kodu)}
                    className="rounded-lg border border-toprak/40 px-2.5 py-1 text-ceviz hover:bg-ceviz hover:text-parsomen"
                  >
                    {kopyalanan === l.paylasim_kodu ? "Kopyalandı ✓" : "Bağlantı"}
                  </button>
                )}
                <button
                  onClick={() => sil(l)}
                  className="rounded-lg border border-kilim/40 px-2.5 py-1 text-kilim-dark hover:bg-kilim hover:text-parsomen"
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
