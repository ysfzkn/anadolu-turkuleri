import Link from "next/link";
import sehirGorselleri from "@/content/sehir-gorselleri.json";
import { slugYap } from "@/lib/slug";

export type SehirGorseli = {
  src: string;
  alt: string;
  baslik: string;
  kaynakUrl: string;
  lisans: string;
  sanatci?: string;
};

export function sehirGorseliBul(il: string): SehirGorseli | undefined {
  return (sehirGorselleri as Record<string, SehirGorseli>)[slugYap(il.split(/[(/]/)[0].trim())];
}

export function SehirFotografi({
  il,
  href,
  baslik,
  aciklama,
  className = "",
  oncelikli = false,
}: {
  il: string;
  href: string;
  baslik?: string;
  aciklama?: string;
  className?: string;
  oncelikli?: boolean;
}) {
  const gorsel = sehirGorseliBul(il);
  if (!gorsel) return null;
  return (
    <figure className={`group relative overflow-hidden rounded-3xl bg-ceviz shadow-motif ${className}`}>
      <Link href={href} className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-toprak" aria-label={`${baslik ?? il} sayfasını aç`} />
      <img src={gorsel.src} alt={gorsel.alt} loading={oncelikli ? "eager" : "lazy"} fetchPriority={oncelikli ? "high" : "auto"} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      <div className="absolute inset-0 bg-gradient-to-t from-ceviz via-ceviz/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-20 p-5 text-white pointer-events-none">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-toprak-light">{il}</p>
        <h3 className="mt-1 font-serif text-2xl font-semibold">{baslik ?? gorsel.baslik}</h3>
        {aciklama && <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/75">{aciklama}</p>}
        <a href={gorsel.kaynakUrl} target="_blank" rel="license noopener noreferrer" className="pointer-events-auto relative z-30 mt-3 inline-block text-[10px] text-white/70 underline decoration-white/30 underline-offset-2">{gorsel.sanatci ? `${gorsel.sanatci} · ` : ""}{gorsel.lisans}</a>
      </div>
    </figure>
  );
}
