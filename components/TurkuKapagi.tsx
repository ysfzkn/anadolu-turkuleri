"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Kapak = {
  gorsel: string;
  ad: string;
  sanatci: string;
  album: string | null;
};

const bellek = new Map<string, Kapak | null>();
const kuyruk: Array<() => void> = [];
let etkinIstek = 0;
const EN_COK_ES_ZAMANLI_ISTEK = 4;

function siradakiniCalistir() {
  while (etkinIstek < EN_COK_ES_ZAMANLI_ISTEK && kuyruk.length) {
    etkinIstek += 1;
    kuyruk.shift()?.();
  }
}

function sirayaAl<T>(is: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    kuyruk.push(() => {
      is().then(resolve, reject).finally(() => {
        etkinIstek -= 1;
        siradakiniCalistir();
      });
    });
    siradakiniCalistir();
  });
}

function depoAnahtari(slug: string) {
  return `turku-kapagi:v2:${slug}`;
}

function depodanOku(slug: string): Kapak | null | undefined {
  try {
    const ham = sessionStorage.getItem(depoAnahtari(slug));
    return ham === null ? undefined : JSON.parse(ham) as Kapak | null;
  } catch {
    return undefined;
  }
}

function depoyaYaz(slug: string, kapak: Kapak | null) {
  try {
    sessionStorage.setItem(depoAnahtari(slug), JSON.stringify(kapak));
  } catch {
    // Gizli mod veya dolu depolama, kapağın gösterilmesini engellememeli.
  }
}

export function TurkuKapagi({
  slug,
  baslik,
  yore,
  ozan,
  fallback,
}: {
  slug: string;
  baslik: string;
  yore: string;
  ozan?: string;
  fallback: ReactNode;
}) {
  const alanRef = useRef<HTMLDivElement>(null);
  const [kapak, setKapak] = useState<Kapak | null>(() => bellek.get(slug) ?? null);

  useEffect(() => {
    if (bellek.has(slug)) {
      setKapak(bellek.get(slug) ?? null);
      return;
    }

    const depodaki = depodanOku(slug);
    if (depodaki !== undefined) {
      bellek.set(slug, depodaki);
      setKapak(depodaki);
      return;
    }

    const alan = alanRef.current;
    if (!alan) return;
    let yasiyor = true;

    const kapagiGetir = () => {
      const params = new URLSearchParams({ slug, baslik, yore });
      if (ozan) params.set("ozan", ozan);
      void sirayaAl(async () => {
        const cevap = await fetch(`/api/turku-kapak?${params}`);
        if (!cevap.ok) return null;
        const veri = await cevap.json() as { kapak?: Kapak | null };
        return veri.kapak ?? null;
      }).then((sonuc) => {
        bellek.set(slug, sonuc);
        depoyaYaz(slug, sonuc);
        if (yasiyor) setKapak(sonuc);
      }).catch(() => {
        // Ağ sorunu olduğunda yöresel/ozan görseli görünmeye devam eder.
      });
    };

    const gozlemci = new IntersectionObserver((kayitlar) => {
      if (kayitlar.some((kayit) => kayit.isIntersecting)) {
        gozlemci.disconnect();
        kapagiGetir();
      }
    }, { rootMargin: "500px 0px" });
    gozlemci.observe(alan);

    return () => {
      yasiyor = false;
      gozlemci.disconnect();
    };
  }, [baslik, ozan, slug, yore]);

  return (
    <div ref={alanRef} className="absolute inset-0">
      {fallback}
      {kapak?.gorsel && (
        <img
          src={kapak.gorsel}
          alt={`${baslik} için ${kapak.sanatci} albüm kapağı`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
        />
      )}
    </div>
  );
}
