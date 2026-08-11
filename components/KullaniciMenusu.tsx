"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tarayiciSupabase } from "@/lib/supabase/client";

/** Header'da giriş durumunu gösterir: giriş linki ya da kullanıcı + çıkış. */
export function KullaniciMenusu() {
  const [email, setEmail] = useState<string | null>(null);
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    let supabase: ReturnType<typeof tarayiciSupabase>;
    try {
      supabase = tarayiciSupabase();
    } catch {
      setHazir(true); // env yok → giriş linki göster
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setHazir(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function cikis() {
    try {
      const supabase = tarayiciSupabase();
      await supabase.auth.signOut();
      setEmail(null);
    } catch {
      /* yok say */
    }
  }

  if (!hazir) return <span className="w-16" aria-hidden />;

  if (email) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/repertuvar"
          className="hidden font-medium text-toprak-dark hover:text-kilim sm:inline"
        >
          Repertuvarım
        </Link>
        <Link
          href="/listelerim"
          className="hidden font-medium text-cini-dark hover:text-kilim sm:inline"
        >
          Listelerim
        </Link>
        <span
          className="max-w-[9rem] truncate text-ceviz-light"
          title={email}
        >
          {email}
        </span>
        <button
          onClick={cikis}
          className="rounded-lg border border-toprak/40 px-2.5 py-1 text-ceviz transition-colors hover:bg-ceviz hover:text-parsomen"
        >
          Çıkış
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/giris"
      className="rounded-lg bg-kilim px-3 py-1.5 text-sm font-medium text-parsomen transition-colors hover:bg-kilim-dark"
    >
      Giriş
    </Link>
  );
}
