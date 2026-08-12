"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { tarayiciSupabase } from "@/lib/supabase/client";
import { olayKaydet } from "@/lib/analytics";
import { ILLER_PLAKA } from "@/lib/iller-plaka";
import {
  ozetle,
  rozetler as rozetHesapla,
  kazanilanRozetSayisi,
  TOPLAM_IL,
  type KesifSatiri,
  type PasaportOzeti,
} from "@/lib/pasaport";
import type { HaritaIl } from "@/components/TurkiyeHaritasi";
import { PasaportKarti } from "@/components/PasaportKarti";
import { tamamlananYolculukSayisi } from "@/lib/yolculuklar-veri";

const TurkiyeHaritasi = dynamic(
  () => import("@/components/TurkiyeHaritasi").then((m) => m.TurkiyeHaritasi),
  { ssr: false, loading: () => <div className="grid h-64 place-items-center text-ceviz-light">Harita yükleniyor…</div> },
);

const IL_ADI = new Map(ILLER_PLAKA.map((i) => [i.slug, i.ad]));

export default function PasaportSayfasi() {
  const [durum, setDurum] = useState<"yukleniyor" | "giris-yok" | "hazir">("yukleniyor");
  const [satirlar, setSatirlar] = useState<KesifSatiri[]>([]);
  const [yolculukSayisi, setYolculukSayisi] = useState(0);

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
      const [{ data }, { data: ilerleme }] = await Promise.all([
        supabase.from("kesifler").select("tur,anahtar,il,olusturulma").order("olusturulma", { ascending: false }),
        supabase.from("yolculuk_ilerleme").select("yolculuk_slug,adim_id"),
      ]);
      setSatirlar((data ?? []) as KesifSatiri[]);
      setYolculukSayisi(tamamlananYolculukSayisi((ilerleme ?? []) as { yolculuk_slug: string; adim_id: string }[]));
      setDurum("hazir");
      olayKaydet("passport_view", { kesif_sayisi: (data ?? []).length });
    })();
  }, []);

  const ozet: PasaportOzeti = useMemo(
    () => ({ ...ozetle(satirlar), yolculukSayisi }),
    [satirlar, yolculukSayisi],
  );
  const rozetler = useMemo(() => rozetHesapla(ozet), [ozet]);
  const rozetSayisi = kazanilanRozetSayisi(ozet);

  const haritaIlleri: HaritaIl[] = useMemo(() => {
    const sayac = new Map<string, number>();
    for (const s of satirlar) if (s.il) sayac.set(s.il, (sayac.get(s.il) ?? 0) + 1);
    return Array.from(sayac.entries()).map(([slug, adet]) => ({
      slug,
      ad: IL_ADI.get(slug) ?? slug,
      adet,
      basliklar: [],
    }));
  }, [satirlar]);

  if (durum === "yukleniyor") return <div className="mx-auto max-w-2xl px-4 py-16" aria-hidden />;

  if (durum === "giris-yok") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-4 text-5xl" aria-hidden>🧭</div>
        <h1 className="font-serif text-2xl font-semibold text-ceviz">Anadolu Kültür Pasaportu</h1>
        <p className="mt-2 text-ceviz-light">
          Keşiflerini kaydetmek ve pasaportunu doldurmak için giriş yap. Okuduğun her hikâye,
          tanıdığın her ozan ve şehir pasaportuna işlenir.
        </p>
        <Link href="/giris" className="mt-6 inline-block rounded-xl bg-kilim px-5 py-2.5 font-medium text-parsomen hover:bg-kilim-dark">
          Giriş yap
        </Link>
      </div>
    );
  }

  const bosPasaport = ozet.toplamKesif === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-medium text-kilim">Kişisel yolculuk</p>
        <h1 className="font-serif text-4xl font-semibold text-ceviz">Anadolu Kültür Pasaportu</h1>
        <p className="mt-2 text-ceviz-light">
          {bosPasaport
            ? "Pasaportun henüz boş. Bir türkü sayfasını aç, hikâyesini oku — keşiflerin buraya işlenmeye başlasın."
            : `${ozet.puan} kültür puanı · ${rozetSayisi} rozet kazandın.`}
        </p>
      </header>

      {/* İstatistik kartları */}
      <section className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <IstatistikKart deger={`${ozet.sehirler.length}/${TOPLAM_IL}`} etiket="Şehir" vurgu />
        <IstatistikKart deger={ozet.turkuSayisi} etiket="Türkü" />
        <IstatistikKart deger={ozet.dinlemeSayisi} etiket="Dinleme" />
        <IstatistikKart deger={ozet.ozanSayisi} etiket="Ozan" />
        <IstatistikKart deger={ozet.temaSayisi} etiket="Tema" />
        <IstatistikKart deger={ozet.terimSayisi} etiket="Terim" />
        <IstatistikKart deger={yolculukSayisi} etiket="Yolculuk" />
      </section>

      {/* Harita */}
      <section className="mb-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold text-ceviz">Keşif Haritan</h2>
          <span className="text-sm text-ceviz-light">{ozet.sehirler.length} / {TOPLAM_IL} il</span>
        </div>
        <div className="rounded-3xl border border-toprak/25 bg-parsomen-dark/20 p-4">
          <TurkiyeHaritasi iller={haritaIlleri} birimEtiketi="keşif" bosEtiketi="Henüz keşfedilmedi" />
        </div>
        <p className="mt-2 text-xs text-ceviz-light">
          Kırmızı iller keşfettiğin şehirler. Bir türkünün hikâyesini okuduğunda o yöre haritana işlenir.
        </p>
      </section>

      {/* Rozetler */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-ceviz">Rozetler</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rozetler.map((r) => (
            <li
              key={r.id}
              className={`rounded-2xl border p-4 transition ${
                r.kazanildi
                  ? "border-kilim/40 bg-kilim/8"
                  : "border-toprak/20 bg-parsomen"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl ${r.kazanildi ? "" : "opacity-40 grayscale"}`} aria-hidden>
                  {r.ikon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-semibold text-ceviz">{r.ad}</span>
                    {r.kazanildi && <span className="rounded-full bg-kilim/15 px-2 py-0.5 text-[11px] font-semibold text-kilim-dark">kazanıldı</span>}
                  </div>
                  <p className="text-xs text-ceviz-light">{r.aciklama}</p>
                </div>
              </div>
              {!r.kazanildi && (
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-toprak/15">
                    <div className="h-full rounded-full bg-kilim/60" style={{ width: `${Math.round((r.ilerleme / r.hedef) * 100)}%` }} />
                  </div>
                  <div className="mt-1 text-right text-[11px] text-ceviz-light">{r.ilerleme} / {r.hedef}</div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Paylaş */}
      {!bosPasaport && (
        <section className="mb-6">
          <h2 className="mb-4 font-serif text-2xl font-semibold text-ceviz">Pasaportunu paylaş</h2>
          <PasaportKarti ozet={ozet} rozetSayisi={rozetSayisi} />
        </section>
      )}

      {bosPasaport && (
        <div className="rounded-2xl border border-toprak/25 bg-parsomen-dark/30 p-8 text-center">
          <Link href="/" className="inline-block rounded-xl bg-kilim px-5 py-2.5 font-medium text-parsomen hover:bg-kilim-dark">
            Keşfe başla →
          </Link>
        </div>
      )}
    </div>
  );
}

function IstatistikKart({ deger, etiket, vurgu = false }: { deger: number | string; etiket: string; vurgu?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 text-center ${vurgu ? "border-kilim/40 bg-kilim/8" : "border-toprak/25 bg-parsomen"}`}>
      <div className="font-serif text-2xl font-semibold text-ceviz">{deger}</div>
      <div className="mt-0.5 text-xs text-ceviz-light">{etiket}</div>
    </div>
  );
}
