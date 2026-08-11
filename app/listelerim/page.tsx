"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tarayiciSupabase } from "@/lib/supabase/client";
import { SpotifyAktarButonu } from "@/components/SpotifyAktarButonu";

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
  const [bildirim, setBildirim] = useState("");
  const [bildirimTuru, setBildirimTuru] = useState<"basari" | "hata">("basari");
  const [silinecek, setSilinecek] = useState<Liste | null>(null);

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
    const { data, error } = await supabase
      .from("listeler")
      .insert({ baslik: ad, kullanici_id: uid })
      .select("id,baslik,herkese_acik,paylasim_kodu")
      .single();
    if (error) {
      setBildirimTuru("hata");
      setBildirim("Liste oluşturulamadı. Lütfen yeniden deneyin.");
    } else if (data) {
      setListeler((ls) => [{ ...(data as any), adet: 0 }, ...ls]);
      setYeniAd("");
      setBildirimTuru("basari");
      setBildirim(`“${ad}” listesi oluşturuldu.`);
    }
  }

  async function gorunurluk(liste: Liste) {
    const supabase = tarayiciSupabase();
    const { error } = await supabase
      .from("listeler")
      .update({ herkese_acik: !liste.herkese_acik })
      .eq("id", liste.id);
    if (error) {
      setBildirimTuru("hata");
      setBildirim("Liste görünürlüğü değiştirilemedi. Lütfen yeniden dene.");
      return;
    }
    setListeler((ls) =>
      ls.map((l) =>
        l.id === liste.id ? { ...l, herkese_acik: !l.herkese_acik } : l,
      ),
    );
    setBildirimTuru("basari");
    setBildirim(liste.herkese_acik ? "Liste gizli hâle getirildi." : "Liste paylaşmaya açıldı.");
  }

  async function sil(liste: Liste) {
    const supabase = tarayiciSupabase();
    const { error } = await supabase.from("listeler").delete().eq("id", liste.id);
    if (error) {
      setBildirimTuru("hata");
      setBildirim("Liste silinemedi. Lütfen yeniden dene.");
      return;
    }
    setListeler((ls) => ls.filter((l) => l.id !== liste.id));
    setSilinecek(null);
    setBildirimTuru("basari");
    setBildirim(`“${liste.baslik}” listesi silindi.`);
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
      <div className="mb-8">
        <label htmlFor="yeni-liste-adi" className="mb-2 block text-sm font-semibold text-ceviz">Yeni liste oluştur</label>
        <div className="flex gap-2">
        <input
          id="yeni-liste-adi"
          value={yeniAd}
          onChange={(e) => setYeniAd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && olustur()}
          placeholder="Yeni liste adı…"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-toprak/40 bg-parsomen px-4 py-2.5 focus:border-kilim focus:outline-none"
        />
        <button
          onClick={olustur}
          className="min-h-11 rounded-xl bg-kilim px-5 py-2.5 font-medium text-parsomen hover:bg-kilim-dark"
        >
          Oluştur
        </button>
        </div>
        {bildirim && <div role={bildirimTuru === "hata" ? "alert" : "status"} className={`mt-3 rounded-xl border px-4 py-3 text-sm ${bildirimTuru === "hata" ? "border-kilim/25 bg-kilim/5 text-kilim-dark" : "border-[#3f7a62]/25 bg-[#3f7a62]/10 text-[#28523f]"}`}>{bildirim}</div>}
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
              className="grid gap-4 rounded-2xl border border-toprak/30 bg-parsomen p-5 shadow-motif lg:grid-cols-[minmax(150px,1fr)_minmax(0,2fr)] lg:items-center"
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
              <div className="flex min-w-0 flex-col gap-3 lg:items-end">
                {l.adet > 0 && <SpotifyAktarButonu listeId={l.id} />}
                <div className="flex flex-wrap items-center gap-2 text-sm lg:justify-end">
                <button
                  onClick={() => gorunurluk(l)}
                  className={`rounded-lg border px-2.5 py-1 ${
                    l.herkese_acik
                    ? "border-cini/40 bg-cini/10 text-cini-dark"
                      : "border-toprak/40 text-ceviz-light"
                  } min-h-11`}
                  title="Herkese açık paylaşım"
                >
                  {l.herkese_acik ? "Açık" : "Gizli"}
                </button>
                {l.herkese_acik && (
                  <button
                    onClick={() => paylasimKopyala(l.paylasim_kodu)}
                    className="min-h-11 rounded-lg border border-toprak/40 px-3 py-2 text-ceviz hover:bg-ceviz hover:text-parsomen"
                  >
                    {kopyalanan === l.paylasim_kodu ? "Kopyalandı ✓" : "Bağlantı"}
                  </button>
                )}
                <button
                  onClick={() => setSilinecek(l)}
                  className="min-h-11 rounded-lg border border-kilim/40 px-3 py-2 text-kilim-dark hover:bg-kilim hover:text-parsomen"
                >
                  Sil
                </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {silinecek && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-ceviz/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSilinecek(null); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="liste-sil-baslik" className="w-full max-w-md rounded-3xl border border-toprak/30 bg-parsomen p-6 shadow-[0_24px_80px_rgba(43,33,24,.3)]">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-kilim/10 text-xl text-kilim" aria-hidden>!</span>
            <h2 id="liste-sil-baslik" className="mt-4 font-serif text-2xl font-semibold text-ceviz">Liste silinsin mi?</h2>
            <p className="mt-2 text-sm leading-6 text-ceviz-light">“{silinecek.baslik}” ve içindeki kayıtlar kalıcı olarak silinecek. Bu işlem geri alınamaz.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setSilinecek(null)} className="min-h-11 rounded-xl border border-toprak/30 px-4 text-sm font-semibold text-ceviz hover:bg-toprak/10">Vazgeç</button>
              <button type="button" onClick={() => void sil(silinecek)} className="min-h-11 rounded-xl bg-kilim px-4 text-sm font-semibold text-white hover:bg-kilim-dark">Listeyi sil</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
