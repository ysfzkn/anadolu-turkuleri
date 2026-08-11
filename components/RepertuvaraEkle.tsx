"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tarayiciSupabase } from "@/lib/supabase/client";
import {
  REPERTUVAR_DURUMLARI,
  durumBilgi,
} from "@/lib/repertuvar-durum";

export function RepertuvaraEkle({ turkuSlug }: { turkuSlug: string }) {
  const [durum, setDurum] = useState<
    "yukleniyor" | "giris-yok" | "hazir"
  >("yukleniyor");
  const [seciliDurum, setSeciliDurum] = useState<string | null>(null);
  const [acik, setAcik] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

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
      const { data } = await supabase
        .from("repertuvar")
        .select("durum")
        .eq("turku_slug", turkuSlug)
        .maybeSingle();
      setSeciliDurum(data?.durum ?? null);
      setDurum("hazir");
    })();
  }, [turkuSlug]);

  async function ayarla(yeni: string) {
    if (!uid) return;
    const supabase = tarayiciSupabase();
    await supabase
      .from("repertuvar")
      .upsert(
        { kullanici_id: uid, turku_slug: turkuSlug, durum: yeni },
        { onConflict: "kullanici_id,turku_slug" },
      );
    setSeciliDurum(yeni);
    setAcik(false);
  }

  async function cikar() {
    const supabase = tarayiciSupabase();
    await supabase
      .from("repertuvar")
      .delete()
      .eq("turku_slug", turkuSlug);
    setSeciliDurum(null);
    setAcik(false);
  }

  if (durum === "yukleniyor") return <div className="h-10" aria-hidden />;

  if (durum === "giris-yok") {
    return (
      <Link
        href="/giris"
        className="inline-flex items-center gap-2 rounded-xl border border-toprak/40 px-4 py-2 text-sm font-medium text-ceviz transition-colors hover:bg-toprak hover:text-parsomen"
      >
        🎸 Repertuvarıma ekle
      </Link>
    );
  }

  const mevcut = seciliDurum ? durumBilgi(seciliDurum) : null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setAcik((a) => !a)}
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
          mevcut
            ? "border-toprak bg-toprak/10 text-toprak-dark"
            : "border-toprak/40 text-ceviz hover:bg-toprak hover:text-parsomen"
        }`}
      >
        🎸 {mevcut ? `${mevcut.ikon} ${mevcut.etiket}` : "Repertuvarıma ekle"}
      </button>

      {acik && (
        <div className="absolute z-20 mt-2 w-56 rounded-2xl border border-toprak/40 bg-parsomen p-2 shadow-motif">
          {REPERTUVAR_DURUMLARI.map((d) => (
            <button
              key={d.deger}
              onClick={() => ayarla(d.deger)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-toprak/5 ${
                seciliDurum === d.deger ? "text-toprak-dark" : "text-ceviz"
              }`}
            >
              <span>{d.ikon}</span>
              {d.etiket}
              {seciliDurum === d.deger && (
                <span className="ml-auto text-toprak">✓</span>
              )}
            </button>
          ))}
          {seciliDurum && (
            <button
              onClick={cikar}
              className="mt-1 w-full rounded-lg border-t border-toprak/20 px-3 py-2 text-left text-sm text-kilim-dark hover:bg-kilim/5"
            >
              Repertuvardan çıkar
            </button>
          )}
          <Link
            href="/repertuvar"
            className="mt-1 block px-3 py-1.5 text-center text-xs text-cini-dark hover:text-kilim"
          >
            Repertuvarımı gör →
          </Link>
        </div>
      )}
    </div>
  );
}
