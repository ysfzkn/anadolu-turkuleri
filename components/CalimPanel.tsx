import type { CalimBilgisi } from "@/lib/types";

function Satir({ etiket, deger }: { etiket: string; deger?: string }) {
  if (!deger) return null;
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-medium uppercase tracking-wide text-cini-dark/70">
        {etiket}
      </dt>
      <dd className="text-sm text-ceviz">{deger}</dd>
    </div>
  );
}

export function CalimPanel({ calim }: { calim: CalimBilgisi }) {
  return (
    <div className="rounded-2xl border border-cini/30 bg-cini/5 p-5">
      <h3 className="mb-4 font-serif text-lg font-semibold text-cini-dark">
        Bağlama · Çalım Bilgisi
      </h3>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Satir etiket="Düzen" deger={calim.duzen} />
        <Satir etiket="Ayak / Makam" deger={calim.ayak} />
        <Satir etiket="Usül" deger={calim.usul} />
      </dl>
      {calim.akorlar && calim.akorlar.length > 0 && (
        <div className="mt-4">
          <span className="text-xs font-medium uppercase tracking-wide text-cini-dark/70">
            Akorlar
          </span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {calim.akorlar.map((a) => (
              <span
                key={a}
                className="rounded-lg border border-cini/40 bg-parsomen px-2.5 py-1 font-mono text-sm text-cini-dark"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
      {calim.notlar && (
        <p className="mt-4 text-sm leading-relaxed text-ceviz-light">
          {calim.notlar}
        </p>
      )}
    </div>
  );
}
