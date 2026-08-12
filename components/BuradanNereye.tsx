import type { Turku } from "@/lib/types";
import type { BenzerTurku } from "@/lib/varliklar";
import { ilAdi, ilSlug } from "@/lib/data";
import { kisiSayfasiVarMi } from "@/lib/varliklar";
import { KesifLink } from "./KesifLink";

/**
 * "Buradan nereye?" — hikâyenin sonunda bağlama duyarlı keşif devamı. Her kart
 * gerçek bir sonraki adımı önerir: yöreyi keşfet, ozanı/derleyeni tanı, benzer
 * bir türkü, bilgini test et. Amaç ikinci anlamlı etkileşimi artırmaktır.
 */

interface Kart {
  ustBaslik: string;
  baslik: string;
  href: string;
  olay: string;
  ozellikler?: Record<string, string | number | boolean | null | undefined>;
}

export function BuradanNereye({
  turku,
  benzer,
}: {
  turku: Turku;
  benzer?: BenzerTurku;
}) {
  const yslug = ilSlug(turku.yore);
  const kartlar: Kart[] = [];

  kartlar.push({
    ustBaslik: "Yöreyi keşfet",
    baslik: `${ilAdi(turku.yore)} türküleri`,
    href: `/yore/${yslug}`,
    olay: "region_click",
    ozellikler: { turku_slug: turku.slug, region_slug: yslug, referrer_type: "buradan-nereye" },
  });

  const ozanAdi = turku.sozYazari ?? turku.ozan ?? turku.derleyen;
  const kslug = kisiSayfasiVarMi(ozanAdi ?? undefined);
  if (kslug && ozanAdi) {
    kartlar.push({
      ustBaslik: turku.sozYazari || turku.ozan ? "Ozanı tanı" : "Derleyeni tanı",
      baslik: ozanAdi,
      href: `/kisi/${kslug}`,
      olay: "ozan_click",
      ozellikler: { turku_slug: turku.slug, referrer_type: "buradan-nereye" },
    });
  }

  if (benzer) {
    kartlar.push({
      ustBaslik: "Benzer bir türkü",
      baslik: benzer.turku.baslik,
      href: `/turku/${benzer.turku.slug}`,
      olay: "related_turku_click",
      ozellikler: {
        kaynak_slug: turku.slug,
        hedef_slug: benzer.turku.slug,
        recommendation_source: "buradan-nereye",
      },
    });
  }

  kartlar.push({
    ustBaslik: "Bilgini test et",
    baslik: "Türkü bilgi yarışması",
    href: "/quiz",
    olay: "quiz_start",
    ozellikler: { turku_slug: turku.slug, referrer_type: "buradan-nereye" },
  });

  return (
    <section
      aria-labelledby="nereye-baslik"
      className="mb-10 rounded-3xl border border-toprak/25 bg-gradient-to-br from-parsomen to-parsomen-dark/60 p-6"
    >
      <h2
        id="nereye-baslik"
        className="mb-1 font-serif text-2xl font-semibold text-ceviz"
      >
        Buradan nereye?
      </h2>
      <p className="mb-5 text-sm text-ceviz-light">
        Keşfe devam et — Anadolu&apos;nun izini sür.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {kartlar.map((k) => (
          <KesifLink
            key={k.href + k.ustBaslik}
            href={k.href}
            olay={k.olay}
            ozellikler={k.ozellikler}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-toprak/20 bg-white/50 px-4 py-3 transition hover:border-kilim/50 hover:bg-white/80"
          >
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-kilim">
                {k.ustBaslik}
              </span>
              <span className="block font-serif text-lg text-ceviz group-hover:text-kilim-dark">
                {k.baslik}
              </span>
            </span>
            <span
              aria-hidden
              className="text-xl text-kilim transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </KesifLink>
        ))}
      </div>
    </section>
  );
}
