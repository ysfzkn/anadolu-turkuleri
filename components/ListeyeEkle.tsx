"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tarayiciSupabase } from "@/lib/supabase/client";

interface Liste {
  id: string;
  baslik: string;
  icinde: boolean;
}

export function ListeyeEkle({ turkuSlug }: { turkuSlug: string }) {
  const [durum, setDurum] = useState<
    "yukleniyor" | "giris-yok" | "hazir"
  >("yukleniyor");
  const [listeler, setListeler] = useState<Liste[]>([]);
  const [acik, setAcik] = useState(false);
  const [yeniAd, setYeniAd] = useState("");
  const [kullaniciId, setKullaniciId] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState("");

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
      setKullaniciId(u.user.id);
      await listeleriYukle(supabase, u.user.id);
      setDurum("hazir");
    })();
  }, [turkuSlug]);

  async function listeleriYukle(
    supabase: ReturnType<typeof tarayiciSupabase>,
    uid: string,
  ) {
    const { data: tumu } = await supabase
      .from("listeler")
      .select("id,baslik")
      .eq("kullanici_id", uid)
      .order("olusturulma", { ascending: false });
    const { data: icinde } = await supabase
      .from("liste_turkuleri")
      .select("liste_id")
      .eq("turku_slug", turkuSlug);
    const icindeSet = new Set((icinde ?? []).map((r) => r.liste_id));
    setListeler(
      (tumu ?? []).map((l) => ({
        id: l.id,
        baslik: l.baslik,
        icinde: icindeSet.has(l.id),
      })),
    );
  }

  async function degistir(liste: Liste) {
    const supabase = tarayiciSupabase();
    if (liste.icinde) {
      await supabase
        .from("liste_turkuleri")
        .delete()
        .eq("liste_id", liste.id)
        .eq("turku_slug", turkuSlug);
    } else {
      await supabase
        .from("liste_turkuleri")
        .insert({ liste_id: liste.id, turku_slug: turkuSlug });
    }
    setListeler((ls) =>
      ls.map((l) => (l.id === liste.id ? { ...l, icinde: !l.icinde } : l)),
    );
  }

  async function yeniListe() {
    const ad = yeniAd.trim();
    if (!ad || !kullaniciId) return;
    const supabase = tarayiciSupabase();
    const { data, error } = await supabase
      .from("listeler")
      .insert({ baslik: ad, kullanici_id: kullaniciId })
      .select("id,baslik")
      .single();
    if (error || !data) {
      setMesaj("Liste oluşturulamadı.");
      return;
    }
    await supabase
      .from("liste_turkuleri")
      .insert({ liste_id: data.id, turku_slug: turkuSlug });
    setYeniAd("");
    setListeler((ls) => [
      { id: data.id, baslik: data.baslik, icinde: true },
      ...ls,
    ]);
  }

  if (durum === "yukleniyor") {
    return <div className="h-10" aria-hidden />;
  }

  if (durum === "giris-yok") {
    return (
      <Link
        href="/giris"
        className="inline-flex items-center gap-2 rounded-xl border border-cini/40 px-4 py-2 text-sm font-medium text-cini-dark transition-colors hover:bg-cini hover:text-parsomen"
      >
        ♡ Listeye eklemek için giriş yap
      </Link>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setAcik((a) => !a)}
        className="inline-flex items-center gap-2 rounded-xl border border-cini/40 bg-cini/5 px-4 py-2 text-sm font-medium text-cini-dark transition-colors hover:bg-cini hover:text-parsomen"
      >
        ♡ Listeye ekle
      </button>

      {acik && (
        <div className="absolute z-20 mt-2 w-72 rounded-2xl border border-toprak/40 bg-parsomen p-3 shadow-motif">
          <div className="max-h-52 space-y-1 overflow-y-auto">
            {listeler.length === 0 && (
              <p className="px-1 py-2 text-sm text-ceviz-light">
                Henüz listen yok. Aşağıdan oluştur.
              </p>
            )}
            {listeler.map((l) => (
              <button
                key={l.id}
                onClick={() => degistir(l)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm text-ceviz hover:bg-kilim/5"
              >
                <span className="truncate">{l.baslik}</span>
                <span className={l.icinde ? "text-cini" : "text-ceviz-light/50"}>
                  {l.icinde ? "✓" : "+"}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2 border-t border-toprak/20 pt-2">
            <input
              value={yeniAd}
              onChange={(e) => setYeniAd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && yeniListe()}
              placeholder="Yeni liste adı…"
              className="min-w-0 flex-1 rounded-lg border border-toprak/40 bg-parsomen px-2 py-1 text-sm focus:border-kilim focus:outline-none"
            />
            <button
              onClick={yeniListe}
              className="rounded-lg bg-kilim px-3 py-1 text-sm font-medium text-parsomen hover:bg-kilim-dark"
            >
              Oluştur
            </button>
          </div>
          {mesaj && <p className="mt-1 text-xs text-kilim-dark">{mesaj}</p>}
          <Link
            href="/listelerim"
            className="mt-2 block text-center text-xs text-cini-dark hover:text-kilim"
          >
            Listelerimi yönet →
          </Link>
        </div>
      )}
    </div>
  );
}
