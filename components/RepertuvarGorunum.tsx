"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tarayiciSupabase } from "@/lib/supabase/client";
import { TurkuCard, type KartTurku } from "./TurkuCard";
import { REPERTUVAR_DURUMLARI } from "@/lib/repertuvar-durum";

export function RepertuvarGorunum({ turkuler }: { turkuler: KartTurku[] }) {
  const [durum, setDurum] = useState<"yukleniyor" | "giris-yok" | "hazir">(
    "yukleniyor",
  );
  const [kayitlar, setKayitlar] = useState<
    { turku_slug: string; durum: string }[]
  >([]);

  const harita = new Map(turkuler.map((t) => [t.slug, t]));

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
      const { data } = await supabase
        .from("repertuvar")
        .select("turku_slug,durum")
        .order("eklenme", { ascending: false });
      setKayitlar(data ?? []);
      setDurum("hazir");
    })();
  }, []);

  if (durum === "yukleniyor") return <div className="h-40" aria-hidden />;

  if (durum === "giris-yok") {
    return (
      <div className="py-12 text-center">
        <p className="text-ceviz-light">
          Repertuvarını görmek için giriş yapmalısın.
        </p>
        <Link
          href="/giris"
          className="mt-5 inline-block rounded-xl bg-kilim px-5 py-2.5 font-medium text-parsomen hover:bg-kilim-dark"
        >
          Giriş yap
        </Link>
      </div>
    );
  }

  if (kayitlar.length === 0) {
    return (
      <p className="rounded-2xl border border-toprak/30 bg-parsomen-dark/40 p-8 text-center text-ceviz-light">
        Repertuvarın henüz boş. Türkü sayfalarından "Repertuvarıma ekle" ile
        çalabildiğin ya da öğrenmek istediğin türküleri buraya ekle.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {REPERTUVAR_DURUMLARI.map((d) => {
        const grup = kayitlar
          .filter((k) => k.durum === d.deger)
          .map((k) => harita.get(k.turku_slug))
          .filter((t): t is KartTurku => Boolean(t));
        if (grup.length === 0) return null;
        return (
          <section key={d.deger}>
            <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-semibold text-ceviz">
              <span>{d.ikon}</span>
              {d.etiket}
              <span className="text-sm font-normal text-ceviz-light">
                ({grup.length})
              </span>
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {grup.map((t) => (
                <TurkuCard key={t.slug} turku={t} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
