import Link from "next/link";
import type { Turku } from "@/lib/types";
import { ilAdi, ilSlug } from "@/lib/data";
import { BOLGE_ADI, bolgeBul } from "@/lib/yore-bolge";
import { kisiSayfasiVarMi, temaSayfasiVarMi } from "@/lib/varliklar";

/**
 * Türkü DNA'sı — bir türkünün kültürel kimliğini kompakt, bağlantılı bir
 * künye olarak özetler. Bilinen tüm varlıklar kendi keşif sayfasına linktir;
 * sayfası olmayanlar düz metin olarak gösterilir.
 */

function Satir({ etiket, children }: { etiket: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-toprak/15 py-2 last:border-0">
      <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-ceviz-light">
        {etiket}
      </dt>
      <dd className="flex flex-wrap gap-1.5 text-sm text-ceviz">{children}</dd>
    </div>
  );
}

function Cip({ href, children }: { href?: string; children: React.ReactNode }) {
  const sinif =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] transition";
  if (!href)
    return <span className={`${sinif} bg-toprak/8 text-ceviz`}>{children}</span>;
  return (
    <Link
      href={href}
      className={`${sinif} bg-cini/10 text-cini-dark hover:bg-cini hover:text-white`}
    >
      {children}
    </Link>
  );
}

export function TurkuDNA({ turku }: { turku: Turku }) {
  const il = ilAdi(turku.yore);
  const yslug = ilSlug(turku.yore);
  const bolge = bolgeBul(yslug);

  const kisiSatiri = (
    etiket: string,
    ad: string | undefined,
  ): React.ReactNode => {
    if (!ad) return null;
    const kslug = kisiSayfasiVarMi(ad);
    return (
      <Satir etiket={etiket}>
        <Cip href={kslug ? `/kisi/${kslug}` : undefined}>{ad}</Cip>
      </Satir>
    );
  };

  const temalar = (turku.etiketler ?? [])
    .map((e) => ({ ad: e, slug: temaSayfasiVarMi(e) }))
    .filter((x) => x.slug);

  const calim = turku.calim;

  return (
    <section
      aria-labelledby="turku-dna-baslik"
      className="mb-10 rounded-3xl border border-toprak/25 bg-parsomen-dark/30 p-6"
    >
      <div className="mb-3 flex items-center gap-2">
        <span aria-hidden className="text-lg text-kilim">
          ⌘
        </span>
        <h2
          id="turku-dna-baslik"
          className="font-serif text-xl font-semibold text-ceviz"
        >
          Türkü DNA&apos;sı
        </h2>
      </div>
      <dl className="divide-y divide-toprak/10">
        <Satir etiket="Yöre">
          <Cip href={`/yore/${yslug}`}>{turku.yore}</Cip>
          <Cip>{BOLGE_ADI[bolge]}</Cip>
        </Satir>
        {kisiSatiri("Ozan / Söz", turku.sozYazari ?? turku.ozan)}
        {kisiSatiri("Derleyen", turku.derleyen)}
        {kisiSatiri("Kaynak kişi", turku.kaynakKisi)}
        {temalar.length > 0 && (
          <Satir etiket="Tema">
            {temalar.map((t) => (
              <Cip key={t.slug} href={`/tema/${t.slug}`}>
                {t.ad}
              </Cip>
            ))}
          </Satir>
        )}
        {calim?.usul && (
          <Satir etiket="Usul">
            <Cip>{calim.usul}</Cip>
          </Satir>
        )}
        {calim?.ayak && (
          <Satir etiket="Ayak">
            <Cip>{calim.ayak}</Cip>
          </Satir>
        )}
      </dl>
    </section>
  );
}
