"use client";

import { useMemo, useState } from "react";
import { CanliMeydan } from "@/components/CanliMeydan";

export interface OyunTurkusu {
  slug: string;
  baslik: string;
  il: string;
  ozet: string;
  ozan: string | null;
  etiketler: string[];
  sozler: string[];
}

type OyunKodu = "yore" | "hikaye" | "ozan" | "soz" | "iz" | "hafiza" | "canli";

const OYUNLAR: Array<{ kod: OyunKodu; ad: string; aciklama: string; ikon: string; renk: string; rozet: string }> = [
  { kod: "yore", ad: "Yöre Avı", aciklama: "Türküyü doğru şehre bağla.", ikon: "⌖", renk: "from-kilim to-kilim-dark", rozet: "Hız + coğrafya" },
  { kod: "hikaye", ad: "Hikâye Dedektifi", aciklama: "Anlatının ait olduğu türküyü bul.", ikon: "⌕", renk: "from-cini to-cini-dark", rozet: "Kültür + hafıza" },
  { kod: "ozan", ad: "Ozanı Tanı", aciklama: "Eseri ozanı veya söz sahibiyle eşleştir.", ikon: "♬", renk: "from-toprak to-toprak-dark", rozet: "Ozan geleneği" },
  { kod: "soz", ad: "Sözün Devamı", aciklama: "Eksik kalan anonim dizeyi tamamla.", ikon: "“", renk: "from-[#6e4b7c] to-[#40304c]", rozet: "Dikkat + dil" },
  { kod: "iz", ad: "Anadolu İzleri", aciklama: "Tema ve ipuçlarından şehri keşfet.", ikon: "✦", renk: "from-[#3f7a62] to-[#244d3d]", rozet: "İpuçları" },
  { kod: "hafiza", ad: "Motif Hafızası", aciklama: "Şehir ve motif çiftlerini en az hamlede aç.", ikon: "◇", renk: "from-[#ad6540] to-[#713c29]", rozet: "Görsel hafıza" },
  { kod: "canli", ad: "Canlı Meydan Okuma", aciklama: "Davet koduyla bir arkadaşına karşı yarış.", ikon: "⚔", renk: "from-[#234f67] to-[#173142]", rozet: "2 oyuncu · canlı" },
];

function karistir<T>(dizi: T[]): T[] {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

function farkliSecenekler(tumu: string[], cevap: string): string[] {
  return karistir([cevap, ...karistir(Array.from(new Set(tumu.filter((x) => x && x !== cevap)))).slice(0, 3)]);
}

export function OyunMerkezi({ turkuler }: { turkuler: OyunTurkusu[] }) {
  const [aktif, setAktif] = useState<OyunKodu | null>(null);
  const [toplamPuan, setToplamPuan] = useState(0);

  if (aktif) {
    const oyun = OYUNLAR.find((o) => o.kod === aktif)!;
    return (
      <div>
        <button onClick={() => setAktif(null)} className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-toprak/25 bg-white/45 px-4 text-sm font-semibold text-ceviz transition hover:bg-white">← Oyun merkezine dön</button>
        <div className={`mb-6 overflow-hidden rounded-3xl bg-gradient-to-br ${oyun.renk} p-6 text-white shadow-motif`}>
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-3xl backdrop-blur" aria-hidden>{oyun.ikon}</span>
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{oyun.rozet}</p><h1 className="font-serif text-3xl font-semibold">{oyun.ad}</h1><p className="mt-1 text-sm text-white/80">{oyun.aciklama}</p></div>
          </div>
        </div>
        {aktif === "hafiza" ? <HafizaOyunu turkuler={turkuler} puanEkle={setToplamPuan} /> : aktif === "canli" ? <CanliMeydan turkuler={turkuler} /> : <SoruOyunu turkuler={turkuler} mod={aktif} puanEkle={setToplamPuan} />}
      </div>
    );
  }

  return (
    <div>
      <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-toprak/25 bg-gradient-to-br from-ceviz to-[#493322] p-7 text-parsomen shadow-[0_24px_60px_rgba(43,33,24,.2)] sm:p-10">
        <div className="absolute -right-10 -top-16 h-56 w-56 rotate-12 border-[18px] border-toprak/20 [clip-path:polygon(50%_0,61%_35%,100%_50%,61%_65%,50%_100%,39%_65%,0_50%,39%_35%)]" aria-hidden />
        <div className="relative max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-toprak-light">Anadolu Oyunları</p><h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Dinle, keşfet, meydan oku.</h1><p className="mt-4 max-w-xl text-base leading-7 text-parsomen/75">Türküleri ezberlemekten fazlası: hikâyeleri, şehirleri, ozanları ve kültürel izleri oyunla öğren.</p></div>
        <div className="relative mt-7 flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-white/10 px-4 py-2">7 farklı deneyim</span><span className="rounded-full bg-white/10 px-4 py-2">Canlı arkadaş düellosu</span><span className="rounded-full bg-white/10 px-4 py-2">Toplam {toplamPuan} puan</span></div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OYUNLAR.map((oyun, i) => (
          <button key={oyun.kod} onClick={() => setAktif(oyun.kod)} className="group relative min-h-56 overflow-hidden rounded-3xl border border-toprak/25 bg-white/45 p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-toprak/45 hover:shadow-motif">
            <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${oyun.renk}`} />
            <div className="flex items-start justify-between"><span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${oyun.renk} text-3xl text-white shadow-md`}>{oyun.ikon}</span><span className="rounded-full border border-toprak/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ceviz-light">{String(i + 1).padStart(2, "0")}</span></div>
            <h2 className="mt-6 font-serif text-2xl font-semibold text-ceviz">{oyun.ad}</h2><p className="mt-2 text-sm leading-6 text-ceviz-light">{oyun.aciklama}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-kilim transition group-hover:gap-3">Oyuna gir <span>→</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SoruOyunu({ turkuler, mod, puanEkle }: { turkuler: OyunTurkusu[]; mod: Exclude<OyunKodu, "hafiza" | "canli">; puanEkle: React.Dispatch<React.SetStateAction<number>> }) {
  const uygun = useMemo(() => turkuler.filter((t) => mod !== "ozan" || t.ozan).filter((t) => mod !== "soz" || t.sozler.length > 1), [turkuler, mod]);
  const [indeks, setIndeks] = useState(0);
  const [soru, setSoru] = useState(() => soruOlustur(uygun, mod));
  const [secilen, setSecilen] = useState<string | null>(null);
  const [puan, setPuan] = useState(0);
  const [seri, setSeri] = useState(0);

  function cevapla(deger: string) {
    if (secilen) return;
    setSecilen(deger);
    if (deger === soru.cevap) { const artis = 100 + seri * 15; setPuan((p) => p + artis); puanEkle((p) => p + artis); setSeri((s) => s + 1); } else setSeri(0);
  }
  function sonraki() { setIndeks((i) => i + 1); setSoru(soruOlustur(uygun, mod)); setSecilen(null); }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="rounded-3xl border border-toprak/25 bg-white/55 p-5 shadow-motif sm:p-7">
        <div className="mb-5 flex items-center justify-between text-sm"><span className="rounded-full bg-toprak/10 px-3 py-1 font-semibold text-toprak-dark">Soru {indeks + 1}</span><span className="font-semibold text-kilim">{seri > 1 ? `${seri} seri · ` : ""}{puan} puan</span></div>
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-ceviz-light">{soru.ust}</p><h2 className="mt-2 font-serif text-2xl font-semibold leading-snug text-ceviz sm:text-3xl">{soru.soru}</h2>{soru.detay && <p className="mt-3 line-clamp-3 text-sm leading-6 text-ceviz-light">{soru.detay}</p>}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">{soru.secenekler.map((secenek) => { const cevaplandi = secilen !== null; const dogru = secenek === soru.cevap; const yanlis = secenek === secilen && !dogru; return <button key={secenek} disabled={cevaplandi} onClick={() => cevapla(secenek)} className={`min-h-14 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${cevaplandi && dogru ? "border-[#3f7a62] bg-[#3f7a62]/10 text-[#28523f]" : yanlis ? "border-kilim bg-kilim/10 text-kilim-dark" : "border-toprak/25 bg-parsomen/60 text-ceviz hover:-translate-y-0.5 hover:border-cini/40 hover:bg-white"}`}>{secenek}{cevaplandi && dogru ? "  ✓" : yanlis ? "  ×" : ""}</button>; })}</div>
        {secilen && <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-parsomen-dark/55 p-4"><p className="text-sm text-ceviz-light">{secilen === soru.cevap ? "Harika! Kültür serin büyüyor." : `Doğru cevap: ${soru.cevap}`}</p><button onClick={sonraki} className="shrink-0 rounded-xl bg-kilim px-4 py-2 text-sm font-semibold text-white">Sonraki →</button></div>}
      </div>
      <aside className="rounded-3xl border border-toprak/25 bg-parsomen-dark/45 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-ceviz-light">Oyun ilerlemesi</p><div className="mt-4 grid grid-cols-5 gap-1.5">{Array.from({ length: 10 }, (_, i) => <span key={i} className={`h-2 rounded-full ${i < indeks ? "bg-cini" : i === indeks ? "bg-kilim" : "bg-toprak/15"}`} />)}</div><p className="mt-6 font-serif text-3xl font-semibold text-ceviz">{puan}</p><p className="text-sm text-ceviz-light">kültür puanı</p><div className="mt-6 rounded-2xl border border-toprak/20 bg-white/35 p-4 text-sm leading-6 text-ceviz-light">Her doğru cevap 100 puan. Seri yaptıkça hız bonusun artar.</div></aside>
    </div>
  );
}

function soruOlustur(turkuler: OyunTurkusu[], mod: Exclude<OyunKodu, "hafiza" | "canli">) {
  const t = turkuler[Math.floor(Math.random() * turkuler.length)];
  if (mod === "yore") return { ust: "Bu türkü hangi yöreye ait?", soru: t.baslik, detay: null, cevap: t.il, secenekler: farkliSecenekler(turkuler.map((x) => x.il), t.il) };
  if (mod === "hikaye") return { ust: "Bu hikâye hangi türküye ait?", soru: t.ozet, detay: null, cevap: t.baslik, secenekler: farkliSecenekler(turkuler.map((x) => x.baslik), t.baslik) };
  if (mod === "ozan") return { ust: "Bu eserin ozanı veya söz sahibi kim?", soru: t.baslik, detay: t.ozet, cevap: t.ozan!, secenekler: farkliSecenekler(turkuler.map((x) => x.ozan ?? "").filter(Boolean), t.ozan!) };
  if (mod === "soz") return { ust: "İkinci dizeyi tamamla", soru: `“${t.sozler[0]}”`, detay: null, cevap: t.sozler[1], secenekler: farkliSecenekler(turkuler.flatMap((x) => x.sozler.slice(1, 3)), t.sozler[1]) };
  return { ust: "İpuçlarının ait olduğu şehri bul", soru: t.etiketler.slice(0, 3).join(" · ") || t.ozet, detay: t.baslik, cevap: t.il, secenekler: farkliSecenekler(turkuler.map((x) => x.il), t.il) };
}

function HafizaOyunu({ turkuler, puanEkle }: { turkuler: OyunTurkusu[]; puanEkle: React.Dispatch<React.SetStateAction<number>> }) {
  const [kartlar, setKartlar] = useState(() => { const secilen = karistir(turkuler).slice(0, 6); return karistir(secilen.flatMap((t) => [{ id: `${t.slug}-a`, es: t.slug, yazi: t.il, tip: "il" }, { id: `${t.slug}-b`, es: t.slug, yazi: t.baslik, tip: "turku" }])); });
  const [aciklar, setAciklar] = useState<string[]>([]); const [bulunan, setBulunan] = useState<string[]>([]); const [hamle, setHamle] = useState(0);
  function ac(kart: (typeof kartlar)[number]) { if (aciklar.length === 2 || aciklar.includes(kart.id) || bulunan.includes(kart.es)) return; const yeni = [...aciklar, kart.id]; setAciklar(yeni); if (yeni.length === 2) { setHamle((h) => h + 1); const ilk = kartlar.find((k) => k.id === yeni[0])!; if (ilk.es === kart.es) { setTimeout(() => { setBulunan((b) => [...b, kart.es]); setAciklar([]); puanEkle((p) => p + 150); }, 450); } else setTimeout(() => setAciklar([]), 800); } }
  return <div className="rounded-3xl border border-toprak/25 bg-white/45 p-5 shadow-motif sm:p-7"><div className="mb-5 flex items-center justify-between"><p className="text-sm text-ceviz-light">Şehir ile türküsünü eşleştir.</p><span className="rounded-full bg-toprak/10 px-3 py-1 text-sm font-semibold text-toprak-dark">{hamle} hamle</span></div><div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">{kartlar.map((kart) => { const gorunur = aciklar.includes(kart.id) || bulunan.includes(kart.es); return <button key={kart.id} onClick={() => ac(kart)} className={`aspect-[3/4] rounded-2xl border p-2 text-center transition duration-300 ${gorunur ? "rotate-0 border-cini/35 bg-parsomen text-ceviz shadow-sm" : "border-kilim/25 bg-gradient-to-br from-kilim to-kilim-dark text-transparent hover:-translate-y-1"}`}><span className="grid h-full place-items-center"><span className="line-clamp-4 text-xs font-semibold sm:text-sm">{gorunur ? kart.yazi : "◇"}</span></span></button>; })}</div>{bulunan.length === 6 && <div className="mt-6 rounded-2xl bg-[#3f7a62]/10 p-5 text-center"><p className="font-serif text-2xl font-semibold text-[#28523f]">Tüm izleri buldun!</p><p className="mt-1 text-sm text-ceviz-light">{hamle} hamlede 900 kültür puanı.</p></div>}</div>;
}
