import type { Bolge } from "@/lib/yore-bolge";
import { BOLGE_ADI } from "@/lib/yore-bolge";
import { slugYap } from "@/lib/slug";
import { tamlayan } from "@/lib/turkce";
import sehirGorselleri from "@/content/sehir-gorselleri.json";

const BOLGE_DILI: Record<Bolge, { baslik: string; aciklama: string; simge: string }> = {
  marmara: { baslik: "Göç yolları ve karşılamalar", aciklama: "Rumeli’den taşınan ezgiler, şehir yaşamı ve karşılamaların hareketli ritmi.", simge: "≈" },
  ege: { baslik: "Efe tavrı ve zeybek", aciklama: "Dağların ağır adımı, özgürlük ve zeybek geleneğinin güçlü silueti.", simge: "Λ" },
  akdeniz: { baslik: "Teke ve Yörük nefesi", aciklama: "Kaşık, sipsi ve Toros yaylalarından kıyıya inen göç yolları.", simge: "△" },
  "ic-anadolu": { baslik: "Bozkırın uzun sesi", aciklama: "Abdal geleneği, bozlaklar ve bağlamanın yalın ama derin anlatısı.", simge: "◇" },
  karadeniz: { baslik: "Yayla, kemençe, horon", aciklama: "Dik yamaçlardan denize uzanan kıvrak ritim ve gurbet sesi.", simge: "↝" },
  dogu: { baslik: "Barlar ve uzun havalar", aciklama: "Yüksek yaylaların, göçün ve âşık geleneğinin yankısı.", simge: "✦" },
  guneydogu: { baslik: "Sıra gecesi ve taş avlular", aciklama: "Makam, hoyrat ve çok katmanlı şehir kültürünün sıcak sesi.", simge: "×" },
};

type SehirGorseli = { src: string; alt: string; baslik: string; kaynakUrl: string; lisans: string; sanatci?: string };

export function YoreVitrini({ il, bolge, kompakt = false }: { il: string; bolge: Bolge; kompakt?: boolean }) {
  const dil = BOLGE_DILI[bolge];
  const ilAdi = il.split(/[(/]/)[0].trim();
  const sivas = slugYap(ilAdi) === "sivas";
  const gorsel = (sehirGorselleri as Record<string, SehirGorseli>)[slugYap(ilAdi)];
  const baslik = sivas ? "Selçuklu eserleri ve ozanlar" : `${ilAdi} türküleri ve kültürü`;
  const aciklama = sivas
    ? "Gök Medrese ve Çifte Minareli Medrese'nin taş süslemeleri, Pir Sultan Abdal'ın deyişleri ve Âşık Veysel'in türküleri Sivas kültüründe önemli bir yer tutar."
    : `${ilAdi} türkülerini, ${tamlayan(BOLGE_ADI[bolge])} söyleyiş özellikleri, gündelik yaşamı ve kuşaktan kuşağa aktarılan müzik geleneğiyle birlikte keşfedin.`;
  if (kompakt) return <div className="relative overflow-hidden rounded-2xl border border-toprak/25 bg-ceviz p-4 text-parsomen"><span className="absolute -right-3 -top-6 text-8xl text-toprak/15" aria-hidden>{dil.simge}</span><p className="relative text-[11px] font-semibold uppercase tracking-[.18em] text-toprak-light">{il} kültür izi</p><p className="relative mt-1 font-serif text-lg font-semibold">{sivas ? "Selçuklu geometrisi ve ozanlar" : dil.baslik}</p></div>;
  return (
    <section className="mb-9 overflow-hidden rounded-[2rem] border border-toprak/25 bg-ceviz text-parsomen shadow-motif">
      <div className="grid md:grid-cols-[1.15fr_.85fr]">
        <div className="relative min-h-64 p-7 sm:p-9"><span className="absolute -bottom-16 -right-8 text-[15rem] leading-none text-toprak/10" aria-hidden>{dil.simge}</span><div className="relative"><p className="text-xs font-semibold uppercase tracking-[.22em] text-toprak-light">Şehrin kültür atlası</p><h2 className="mt-2 font-serif text-3xl font-semibold">{baslik}</h2><p className="mt-4 max-w-lg leading-7 text-parsomen/75">{aciklama}</p><div className="mt-6 flex flex-wrap gap-2 text-xs"><span className="rounded-full border border-white/15 px-3 py-1.5">{ilAdi}</span><span className="rounded-full border border-white/15 px-3 py-1.5">{BOLGE_ADI[bolge]} müziği</span><span className="rounded-full border border-white/15 px-3 py-1.5">Sözlü kültür</span></div></div></div>
        {gorsel ? <figure className="relative min-h-64 overflow-hidden bg-parsomen-dark"><img src={gorsel.src} alt={gorsel.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-ceviz/90 via-ceviz/10 to-transparent" /><figcaption className="absolute inset-x-0 bottom-0 p-4 text-xs leading-5 text-white/90"><span className="font-semibold">{gorsel.baslik}</span><br /><a href={gorsel.kaynakUrl} target="_blank" rel="license noopener noreferrer" className="underline decoration-white/35 underline-offset-2">{gorsel.sanatci ? `${gorsel.sanatci} · ` : ""}{gorsel.lisans} · Wikimedia Commons</a></figcaption></figure> : <div className="grid min-h-64 place-items-center bg-parsomen-dark/10 p-8" role="img" aria-label={`${ilAdi} için ${BOLGE_ADI[bolge]} motifinden üretilen geometrik desen`}><div className="grid h-44 w-44 rotate-45 place-items-center border-2 border-toprak/40"><div className="h-24 w-24 border-2 border-cini/60"><span className="grid h-full -rotate-45 place-items-center font-serif text-5xl text-toprak">{dil.simge}</span></div></div></div>}
      </div>
    </section>
  );
}
