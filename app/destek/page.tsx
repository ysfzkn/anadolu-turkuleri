import type { Metadata } from "next";
import { destekKanallari } from "@/lib/destek";
import { IbanKopyala } from "@/components/IbanKopyala";

export const metadata: Metadata = {
  title: "Arşivi Destekle",
  description:
    "Anadolu Türküleri dijital kültür arşivinin sürdürülebilirlik ve destekçi modeli.",
  alternates: { canonical: "/destek" },
};

export default function Destek() {
  const kanallar = destekKanallari();
  const eposta =
    process.env.ILETISIM_ALICI_EMAIL?.trim() || "iletisim@anadoluturkuleri.com";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-kilim">
        Bağımsız kültür arşivi
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold text-ceviz">
        Hafızanın açık kalmasına destek olun.
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-ceviz-light">
        Temel arşiv ve kaynaklı kültür bilgisi herkese açık kalır. Destekçi
        katkıları; editoryal doğrulama, lisanslı görseller, saha derlemeleri ve
        teknik işletme giderlerini karşılamaya gider.
      </p>

      {kanallar.length > 0 ? (
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {kanallar.map((kanal) => (
            <article
              key={kanal.tur}
              className="flex flex-col rounded-3xl border border-toprak/25 bg-white/55 p-6"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-kilim">
                {kanal.etiket}
              </p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-ceviz">
                {kanal.baslik}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-ceviz-light">
                {kanal.aciklama}
              </p>
              {kanal.tur === "havale" && kanal.iban ? (
                <IbanKopyala iban={kanal.iban} ad={kanal.ibanAd} />
              ) : (
                <a
                  href={kanal.url}
                  target="_blank"
                  rel="noopener"
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-ceviz px-4 font-semibold text-white transition hover:bg-kilim-dark"
                >
                  {kanal.butonMetni} ↗
                </a>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-9 rounded-3xl border border-dashed border-toprak/35 bg-toprak/8 p-8 text-center">
          <p className="font-serif text-xl text-ceviz">
            Destek kanalları çok yakında açılıyor.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ceviz-light">
            Bağış altyapısı hazırlanıyor. O zamana kadar iş birliği ve destek
            için{" "}
            <a
              href={`mailto:${eposta}`}
              className="font-semibold text-cini-dark underline underline-offset-2"
            >
              {eposta}
            </a>{" "}
            üzerinden ulaşabilirsiniz.
          </p>
        </div>
      )}

      <p className="mt-8 rounded-2xl bg-toprak/10 p-4 text-sm leading-6 text-ceviz-light">
        Destek tamamen gönüllüdür ve temel arşiv erişimini etkilemez. Katkılar
        arşivin bağımsızlığını ve sürdürülebilirliğini güçlendirir.
      </p>
    </main>
  );
}
