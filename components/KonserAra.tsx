import { lokatif } from "@/lib/turkce";

/**
 * Yöreye göre türkü konseri arama — CANLI deep-link'ler.
 * Konser verisi DEPOLANMAZ (bayatlar + ToS); bunun yerine bilet platformu,
 * web araması ve belediye etkinliklerine güncel arama bağlantıları verilir.
 */
export function KonserAra({ il }: { il: string }) {
  const biletix = `https://www.biletix.com/search/TURKIYE/tr?searchq=${encodeURIComponent(
    il,
  )}`;
  const web = `https://www.google.com/search?q=${encodeURIComponent(
    `${il} türkü konseri bilet`,
  )}`;
  const belediye = `https://www.google.com/search?q=${encodeURIComponent(
    `${il} belediyesi kültür etkinlikleri konser`,
  )}`;

  const Btn = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-toprak/40 bg-parsomen px-4 py-2 text-sm font-medium text-ceviz transition-colors hover:border-kilim/50 hover:bg-kilim/5"
    >
      {children}
    </a>
  );

  return (
    <div className="rounded-2xl border border-cini/30 bg-cini/5 p-6">
      <h2 className="font-serif text-xl font-semibold text-cini-dark">
        🎫 {lokatif(il)} türkü konseri
      </h2>
      <p className="mt-1 text-sm text-ceviz-light">
        Yöredeki güncel türkü konserlerini ara ve bilet/etkinlik sayfasına git.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Btn href={biletix}>Biletix'te ara</Btn>
        <Btn href={web}>Web'de konser ara</Btn>
        <Btn href={belediye}>Belediye etkinlikleri</Btn>
      </div>
    </div>
  );
}
