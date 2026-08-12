"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { tarayiciSupabase } from "@/lib/supabase/client";

interface Hesap {
  email: string;
  kullaniciAdi: string | null;
  ad: string | null;
  avatar: string | null;
  rol: string;
}

function BasHarfAvatar({ hesap, buyuk = false }: { hesap: Hesap; buyuk?: boolean }) {
  const harf = (hesap.kullaniciAdi || hesap.ad || hesap.email || "A")
    .charAt(0)
    .toLocaleUpperCase("tr-TR");
  const boyut = buyuk ? "h-11 w-11 text-base" : "h-9 w-9 text-sm";

  if (hesap.avatar) {
    return (
      <img
        src={hesap.avatar}
        alt=""
        referrerPolicy="no-referrer"
        className={`${boyut} shrink-0 rounded-full border border-toprak/30 object-cover shadow-sm`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${boyut} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-kilim to-toprak font-semibold text-white shadow-sm`}
    >
      {harf}
    </span>
  );
}

/** Kompakt profil rozeti ve hesap açılır menüsü. */
export function KullaniciMenusu() {
  const [hesap, setHesap] = useState<Hesap | null>(null);
  const [hazir, setHazir] = useState(false);
  const [acik, setAcik] = useState(false);
  const kapsayici = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let supabase: ReturnType<typeof tarayiciSupabase>;
    try {
      supabase = tarayiciSupabase();
    } catch {
      setHazir(true);
      return;
    }

    async function yukle(user: User | null) {
      if (!user?.email) {
        setHesap(null);
        setHazir(true);
        return;
      }

      const meta = user.user_metadata ?? {};
      const { data } = await supabase
        .from("profiller")
        .select("kullanici_adi,rol")
        .eq("id", user.id)
        .maybeSingle();

      setHesap({
        email: user.email,
        kullaniciAdi: data?.kullanici_adi ?? null,
        ad: (meta.full_name || meta.name || meta.display_name || null) as string | null,
        avatar: (meta.avatar_url || meta.picture || null) as string | null,
        rol: data?.rol ?? "uye",
      });
      setHazir(true);
    }

    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => yukle(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_olay: AuthChangeEvent, session: Session | null) => {
      void yukle(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function disTiklama(event: MouseEvent) {
      if (!kapsayici.current?.contains(event.target as Node)) setAcik(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setAcik(false);
    }
    document.addEventListener("mousedown", disTiklama);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", disTiklama);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  async function cikis() {
    const supabase = tarayiciSupabase();
    await supabase.auth.signOut();
    setHesap(null);
    setAcik(false);
    window.location.assign("/");
  }

  if (!hazir) return <span className="h-10 w-10 animate-pulse rounded-full bg-toprak/10" aria-hidden />;

  if (!hesap) {
    return (
      <Link
        href="/giris"
        aria-label="Giriş yap veya üye ol"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-kilim text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-kilim-dark hover:shadow-md sm:w-auto sm:px-4"
      >
        <svg className="h-5 w-5 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M15 7.5a3 3 0 11-6 0 3 3 0 016 0Z" />
          <path d="M5.5 19a6.5 6.5 0 0113 0" />
        </svg>
        <span className="hidden sm:inline">Giriş / Üye ol</span>
      </Link>
    );
  }

  const gorunenAd = hesap.kullaniciAdi ? `@${hesap.kullaniciAdi}` : hesap.ad || hesap.email.split("@")[0];

  return (
    <div ref={kapsayici} className="relative">
      <button
        type="button"
        onClick={() => setAcik((deger) => !deger)}
        aria-haspopup="menu"
        aria-expanded={acik}
        className="group flex min-h-11 items-center gap-2 rounded-full border border-toprak/25 bg-white/65 p-1.5 pr-2.5 shadow-sm backdrop-blur transition hover:border-kilim/35 hover:bg-white hover:shadow-md"
      >
        <BasHarfAvatar hesap={hesap} />
        <span className="hidden max-w-28 truncate text-sm font-semibold text-ceviz lg:block">
          {gorunenAd}
        </span>
        <svg className={`h-4 w-4 text-ceviz-light transition ${acik ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {acik && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-toprak/25 bg-parsomen shadow-[0_18px_50px_rgba(75,45,25,0.18)]"
        >
          <div className="flex items-center gap-3 border-b border-toprak/20 bg-parsomen-dark/45 p-4">
            <BasHarfAvatar hesap={hesap} buyuk />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ceviz">{gorunenAd}</p>
              <p className="truncate text-xs text-ceviz-light">{hesap.email}</p>
            </div>
          </div>

          <div className="p-2 text-sm">
            <MenuLink href="/pasaport" ikon="🧭" baslik="Kültür Pasaportum" aciklama="Keşiflerim, şehirler ve rozetler" onClick={() => setAcik(false)} />
            <MenuLink href="/repertuvar" ikon="🪕" baslik="Repertuvarım" aciklama="Çaldığım ve öğrendiğim türküler" onClick={() => setAcik(false)} />
            <MenuLink href="/listelerim" ikon="♫" baslik="Listelerim" aciklama="Kaydettiğim türkü seçkileri" onClick={() => setAcik(false)} />
            <MenuLink href="/katkilarim" ikon="✦" baslik="Katkılarım" aciklama="Arşive gönderdiğim anlatılar" onClick={() => setAcik(false)} />
            <MenuLink href="/quiz" ikon="🏆" baslik="Oyun ve rozetler" aciklama="Bilgini ölç, serini geliştir" onClick={() => setAcik(false)} />
            {(hesap.rol === "admin" || hesap.rol === "editor") && <MenuLink href="/admin" ikon="◆" baslik="Editör Masası" aciklama="Katkı ve içerik yönetimi" onClick={() => setAcik(false)} />}
          </div>

          <div className="border-t border-toprak/20 p-2">
            <button
              type="button"
              onClick={cikis}
              role="menuitem"
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-kilim-dark transition hover:bg-kilim/8"
            >
              <span aria-hidden>↪</span>
              Güvenli çıkış
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, ikon, baslik, aciklama, onClick }: { href: string; ikon: string; baslik: string; aciklama: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} role="menuitem" className="flex min-h-14 items-center gap-3 rounded-xl px-3 transition hover:bg-toprak/8">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-parsomen-dark text-base" aria-hidden>{ikon}</span>
      <span className="min-w-0">
        <span className="block font-semibold text-ceviz">{baslik}</span>
        <span className="block truncate text-xs text-ceviz-light">{aciklama}</span>
      </span>
    </Link>
  );
}
