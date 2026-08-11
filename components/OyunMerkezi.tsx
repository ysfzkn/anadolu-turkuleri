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
  const [ipucu, setIpucu] = useState(0);

  function cevapla(deger: string) {
    if (secilen) return;
    setSecilen(deger);
    if (deger === soru.cevap) { const artis = Math.max(40, 100 + seri * 15 - ipucu * 20); setPuan((p) => p + artis); puanEkle((p) => p + artis); setSeri((s) => s + 1); } else setSeri(0);
  }
  function sonraki() { setIndeks((i) => i + 1); setSoru(soruOlustur(uygun, mod)); setSecilen(null); setIpucu(0); }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="oyun-sahne-giris relative overflow-hidden rounded-3xl border border-toprak/25 bg-white/55 p-5 shadow-motif sm:p-7">
        <div className="mb-5 flex items-center justify-between text-sm"><span className="rounded-full bg-toprak/10 px-3 py-1 font-semibold text-toprak-dark">Soru {indeks + 1}</span><span className="font-semibold text-kilim">{seri > 1 ? `${seri} seri · ` : ""}{puan} puan</span></div>
        <SoruSahnesi mod={mod} soru={soru} ipucu={ipucu} ipucuAc={() => setIpucu((i) => Math.min(3, i + 1))} />
        <div className={`mt-7 grid gap-3 ${mod === "ozan" ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-2"}`}>{soru.secenekler.map((secenek, secenekIndeksi) => { const cevaplandi = secilen !== null; const dogru = secenek === soru.cevap; const yanlis = secenek === secilen && !dogru; return <button key={secenek} disabled={cevaplandi} onClick={() => cevapla(secenek)} className={`oyun-secenek relative min-h-14 overflow-hidden rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${mod === "ozan" ? "pt-12 text-center" : ""} ${mod === "soz" ? "font-serif text-base italic" : ""} ${cevaplandi && dogru ? "oyun-dogru border-[#3f7a62] bg-[#3f7a62]/10 text-[#28523f]" : yanlis ? "oyun-yanlis border-kilim bg-kilim/10 text-kilim-dark" : "border-toprak/25 bg-parsomen/60 text-ceviz hover:-translate-y-1 hover:border-cini/40 hover:bg-white hover:shadow-md"}`}><SecenekIsareti mod={mod} metin={secenek} indeks={secenekIndeksi} />{secenek}{cevaplandi && dogru ? "  ✓" : yanlis ? "  ×" : ""}</button>; })}</div>
        {secilen && <div className={`oyun-sonuc mt-6 flex items-center justify-between gap-4 rounded-2xl p-4 ${secilen === soru.cevap ? "bg-[#3f7a62]/10" : "bg-kilim/10"}`}><span className="oyun-puan-pariltisi" aria-hidden>{secilen === soru.cevap ? "+" : "×"}</span><p className="text-sm text-ceviz-light">{secilen === soru.cevap ? `Harika! ${Math.max(40, 100 + seri * 15 - ipucu * 20)} kültür puanı.` : `Doğru cevap: ${soru.cevap}`}</p><button onClick={sonraki} className="shrink-0 rounded-xl bg-kilim px-4 py-2 text-sm font-semibold text-white">Sonraki →</button></div>}
      </div>
      <aside className="rounded-3xl border border-toprak/25 bg-parsomen-dark/45 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-ceviz-light">Oyun ilerlemesi</p><div className="mt-4 grid grid-cols-5 gap-1.5">{Array.from({ length: 10 }, (_, i) => <span key={i} className={`h-2 rounded-full ${i < indeks ? "bg-cini" : i === indeks ? "bg-kilim" : "bg-toprak/15"}`} />)}</div><p className="mt-6 font-serif text-3xl font-semibold text-ceviz">{puan}</p><p className="text-sm text-ceviz-light">kültür puanı</p><div className="mt-6 rounded-2xl border border-toprak/20 bg-white/35 p-4 text-sm leading-6 text-ceviz-light">Her doğru cevap 100 puan. Seri yaptıkça hız bonusun artar.</div></aside>
    </div>
  );
}

type SoruVerisi = ReturnType<typeof soruOlustur>;

function SoruSahnesi({ mod, soru, ipucu, ipucuAc }: { mod: Exclude<OyunKodu, "hafiza" | "canli">; soru: SoruVerisi; ipucu: number; ipucuAc: () => void }) {
  if (mod === "yore") return <div className="oyun-harita-sahne relative mt-2 min-h-64 overflow-hidden rounded-3xl border border-kilim/20 bg-gradient-to-br from-parsomen-dark to-white/70 p-6"><div className="oyun-harita-iz absolute inset-0 opacity-30" aria-hidden /><span className="oyun-konum-nabiz absolute left-[18%] top-[58%] h-5 w-5 rounded-full bg-kilim" /><span className="oyun-konum-nabiz absolute right-[20%] top-[28%] h-4 w-4 rounded-full bg-cini [animation-delay:.5s]" /><div className="relative mx-auto grid min-h-52 max-w-lg place-items-center text-center"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-kilim">{soru.ust}</p><h2 className="mt-3 font-serif text-3xl font-semibold text-ceviz sm:text-4xl">{soru.soru}</h2><p className="mt-3 text-sm text-ceviz-light">Doğru durağı seç ve türküyü evine ulaştır.</p></div></div></div>;

  if (mod === "hikaye") { const kelimeler = soru.soru.split(" "); const gorunen = kelimeler.slice(0, Math.min(kelimeler.length, 10 + ipucu * 10)).join(" "); return <div className="relative mt-2 overflow-hidden rounded-3xl bg-[#eadfc9] p-6 shadow-inner sm:p-8"><span className="absolute right-5 top-5 rotate-6 rounded border-2 border-kilim/35 px-3 py-1 font-mono text-xs font-bold uppercase text-kilim/60">Arşiv dosyası</span><div className="absolute inset-y-0 left-7 border-l border-dashed border-toprak/35" /><div className="relative pl-7"><p className="font-mono text-xs uppercase tracking-[.18em] text-ceviz-light">Vaka no. {String(gorunen.length).padStart(3, "0")}</p><h2 className="mt-5 font-serif text-2xl font-semibold leading-relaxed text-ceviz">“{gorunen}{gorunen.length < soru.soru.length ? "…" : ""}”</h2>{gorunen.length < soru.soru.length && <button onClick={ipucuAc} className="mt-5 rounded-full border border-toprak/30 bg-white/40 px-4 py-2 text-xs font-semibold text-toprak-dark hover:bg-white/70">Yeni ipucu aç · −20 puan</button>}</div></div>; }

  if (mod === "ozan") return <div className="oyun-ozan-sahne relative mt-2 grid min-h-72 place-items-end overflow-hidden rounded-3xl bg-gradient-to-b from-[#15110e] to-ceviz p-7 text-center text-white"><div className="oyun-spot-isigi absolute left-1/2 top-0 h-60 w-72 -translate-x-1/2 bg-gradient-to-b from-toprak/40 to-transparent [clip-path:polygon(42%_0,58%_0,95%_100%,5%_100%)]" /><div className="oyun-ozan-siluet absolute bottom-20 left-1/2 h-28 w-24 -translate-x-1/2 rounded-t-full bg-black/55" aria-hidden><span className="absolute -right-12 top-12 h-2 w-24 -rotate-12 rounded-full bg-black/55" /></div><div className="relative"><p className="text-xs font-semibold uppercase tracking-[.2em] text-toprak-light">Sahnedeki eserin izini sür</p><h2 className="mt-2 font-serif text-3xl font-semibold">{soru.soru}</h2><p className="mt-2 text-sm text-white/55">Ozan portrelerinden doğru sesi seç.</p></div></div>;

  if (mod === "soz") return <div className="relative mt-2 overflow-hidden rounded-3xl border border-[#6e4b7c]/20 bg-gradient-to-br from-[#f2e8d7] to-white p-7 text-center"><span className="absolute -left-5 top-5 rotate-[-18deg] text-8xl text-[#6e4b7c]/10" aria-hidden>“</span><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#6e4b7c]">Dizeyi tamamla</p><h2 className="mt-6 font-serif text-2xl italic leading-relaxed text-ceviz">{soru.soru}</h2><div className="mx-auto mt-5 h-12 max-w-md border-b-2 border-dashed border-[#6e4b7c]/35"><span className="text-sm text-ceviz-light">Eksik dize buraya gelecek</span></div></div>;

  const izler = soru.soru.split(" · "); return <div className="relative mt-2 min-h-72 overflow-hidden rounded-3xl bg-gradient-to-br from-[#e7eee8] to-white p-6"><div className="oyun-pusula absolute -right-12 -top-12 grid h-52 w-52 place-items-center rounded-full border-2 border-[#3f7a62]/20"><span className="h-32 w-1 rotate-45 bg-gradient-to-b from-kilim to-cini" /></div><div className="relative max-w-md"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#3f7a62]">Kültür pusulası</p><h2 className="mt-3 font-serif text-3xl font-semibold text-ceviz">İzleri takip et</h2><div className="mt-6 flex flex-wrap gap-3">{izler.map((iz, i) => <span key={iz} className="oyun-iz-etiketi rounded-full border border-[#3f7a62]/25 bg-white/65 px-4 py-2 text-sm font-semibold text-[#28523f]" style={{ animationDelay: `${i * 140}ms` }}>{iz}</span>)}</div>{soru.detay && <button onClick={ipucuAc} disabled={ipucu > 0} className="mt-7 rounded-full bg-[#3f7a62] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{ipucu ? `Eser izi: ${soru.detay}` : "Eser izini göster · −20 puan"}</button>}</div></div>;
}

function SecenekIsareti({ mod, metin, indeks }: { mod: Exclude<OyunKodu, "hafiza" | "canli">; metin: string; indeks: number }) {
  if (mod === "ozan") return <span className="absolute inset-x-0 top-2 mx-auto grid h-8 w-8 place-items-center rounded-full bg-toprak/15 font-serif text-sm not-italic text-toprak-dark">{metin.charAt(0)}</span>;
  if (mod === "yore") return <span className="mr-2 text-kilim" aria-hidden>⌖</span>;
  if (mod === "soz") return <span className="mr-2 font-sans text-xs not-italic text-[#6e4b7c]">{String.fromCharCode(65 + indeks)}.</span>;
  if (mod === "hikaye") return <span className="mr-2 text-cini" aria-hidden>▤</span>;
  return <span className="mr-2 text-[#3f7a62]" aria-hidden>✦</span>;
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
