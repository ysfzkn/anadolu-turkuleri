import type { Turku } from "@/lib/types";
import { kaynakDurumu, type GuvenTonu } from "@/lib/kaynak-guveni";

const TON_SINIF: Record<GuvenTonu, { kutu: string; nokta: string }> = {
  guclu: { kutu: "border-[#3f7a62]/30 bg-[#3f7a62]/8 text-[#28523f]", nokta: "bg-[#3f7a62]" },
  orta: { kutu: "border-cini/30 bg-cini/8 text-cini-dark", nokta: "bg-cini" },
  notr: { kutu: "border-toprak/30 bg-toprak/8 text-ceviz", nokta: "bg-toprak" },
  zayif: { kutu: "border-kilim/30 bg-kilim/6 text-kilim-dark", nokta: "bg-kilim" },
};

/**
 * Kaynak durumu paneli — bir kaydın köken ve doğrulama durumunu şeffaf ve
 * anlaşılır biçimde gösterir. Akademik kesinlik iddia etmez.
 */
export function KaynakDurumu({ turku }: { turku: Turku }) {
  const durum = kaynakDurumu(turku);
  const sinif = TON_SINIF[durum.ton];
  return (
    <section aria-label="Kaynak durumu" className={`rounded-2xl border p-5 ${sinif.kutu}`}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${sinif.nokta}`} aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Kaynak durumu</span>
      </div>
      <h2 className="font-serif text-lg font-semibold">{durum.etiket}</h2>
      <p className="mt-1 text-sm leading-6 opacity-90">{durum.aciklama}</p>
      {turku.kaynaklar.length > 0 && (
        <p className="mt-2 text-xs opacity-70">
          Bu kayıt {turku.kaynaklar.length} kaynağa dayanıyor. Kaynakları aşağıda görebilirsiniz.
        </p>
      )}
    </section>
  );
}
