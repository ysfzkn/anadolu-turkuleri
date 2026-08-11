"use client";

import { useEffect, useMemo, useState } from "react";
import { CanliMeydan } from "@/components/CanliMeydan";
import type { OzanGorseli } from "@/lib/ozan-gorselleri";

export interface OyunTurkusu {
  slug: string;
  baslik: string;
  il: string;
  ozet: string;
  ozan: string | null;
  etiketler: string[];
  sozler: string[];
  ozanGorseli: OzanGorseli | null;
}

type OyunKodu = "yore" | "hikaye" | "ozan" | "soz" | "iz" | "hafiza" | "dokuma" | "canli";

const OYUNLAR: Array<{ kod: OyunKodu; ad: string; aciklama: string; ikon: string; renk: string; rozet: string }> = [
  { kod: "yore", ad: "Yöre Avı", aciklama: "Türküyü doğru şehre bağla.", ikon: "⌖", renk: "from-kilim to-kilim-dark", rozet: "Hız + coğrafya" },
  { kod: "hikaye", ad: "Hikâye Dedektifi", aciklama: "Anlatının ait olduğu türküyü bul.", ikon: "⌕", renk: "from-cini to-cini-dark", rozet: "Kültür + hafıza" },
  { kod: "ozan", ad: "Ozanı Tanı", aciklama: "Eseri ozanı veya söz sahibiyle eşleştir.", ikon: "♬", renk: "from-toprak to-toprak-dark", rozet: "Ozan geleneği" },
  { kod: "soz", ad: "Sözün Devamı", aciklama: "Eksik kalan anonim dizeyi tamamla.", ikon: "“", renk: "from-[#6e4b7c] to-[#40304c]", rozet: "Dikkat + dil" },
  { kod: "iz", ad: "Anadolu İzleri", aciklama: "Tema ve ipuçlarından şehri keşfet.", ikon: "✦", renk: "from-[#3f7a62] to-[#244d3d]", rozet: "İpuçları" },
  { kod: "hafiza", ad: "Motif Hafızası", aciklama: "Şehir ve motif çiftlerini en az hamlede aç.", ikon: "◇", renk: "from-[#ad6540] to-[#713c29]", rozet: "Görsel hafıza" },
  { kod: "dokuma", ad: "Dize Dokuma", aciklama: "Dağılan dizeleri seçerek türkünün kıtasını yeniden kur.", ikon: "⌁", renk: "from-[#8b3150] to-[#4d2438]", rozet: "Sıralama + söz" },
  { kod: "canli", ad: "Canlı Meydan Okuma", aciklama: "Davet koduyla bir arkadaşına karşı yarış.", ikon: "⚔", renk: "from-[#234f67] to-[#173142]", rozet: "2 oyuncu · canlı" },
];

const PUAN_ANAHTARI = "anadolu-oyunlari-toplam-puan";
const GUN_ANAHTARI = "anadolu-oyunlari-son-gun";
const GUN_SERISI_ANAHTARI = "anadolu-oyunlari-gun-serisi";

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

function aramaMetni(metin: string): string {
  return metin
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9çğıöşü]+/g, " ")
    .trim();
}

/** Şehir adını doğrudan ya da ek almış biçimiyle ele veren etiketleri gizler. */
function sehirdenBagimsizIzler(t: OyunTurkusu): string[] {
  const il = aramaMetni(t.il);
  const ilKoku = il.length > 5 ? il.slice(0, -2) : il;
  return t.etiketler
    .filter((etiket) => {
      const aday = aramaMetni(etiket);
      return aday && aday !== il && !aday.includes(il) && !il.includes(aday) && !aday.startsWith(ilKoku);
    })
    .slice(0, 3);
}

export function OyunMerkezi({ turkuler }: { turkuler: OyunTurkusu[] }) {
  const [aktif, setAktif] = useState<OyunKodu | null>(null);
  const [toplamPuan, setToplamPuan] = useState(0);
  const [gunSerisi, setGunSerisi] = useState(1);
  const [puanYuklendi, setPuanYuklendi] = useState(false);

  useEffect(() => {
    const bugun = new Date().toISOString().slice(0, 10);
    const sonGun = window.localStorage.getItem(GUN_ANAHTARI);
    const kayitliSeri = Number(window.localStorage.getItem(GUN_SERISI_ANAHTARI) ?? "0");
    const dun = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const yeniSeri = sonGun === bugun ? Math.max(1, kayitliSeri) : sonGun === dun ? kayitliSeri + 1 : 1;
    setToplamPuan(Number(window.localStorage.getItem(PUAN_ANAHTARI) ?? "0") || 0);
    setGunSerisi(yeniSeri);
    window.localStorage.setItem(GUN_ANAHTARI, bugun);
    window.localStorage.setItem(GUN_SERISI_ANAHTARI, String(yeniSeri));
    setPuanYuklendi(true);
  }, []);

  useEffect(() => {
    if (puanYuklendi) window.localStorage.setItem(PUAN_ANAHTARI, String(toplamPuan));
  }, [toplamPuan, puanYuklendi]);

  const seviye = Math.floor(toplamPuan / 1000) + 1;
  const seviyeIlerlemesi = toplamPuan % 1000;

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
        {aktif === "hafiza" ? <HafizaOyunu turkuler={turkuler} puanEkle={setToplamPuan} /> : aktif === "dokuma" ? <DizeDokuma turkuler={turkuler} puanEkle={setToplamPuan} /> : aktif === "canli" ? <CanliMeydan turkuler={turkuler} /> : <SoruOyunu turkuler={turkuler} mod={aktif} puanEkle={setToplamPuan} />}
      </div>
    );
  }

  return (
    <div>
      <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-toprak/25 bg-gradient-to-br from-ceviz to-[#493322] p-7 text-parsomen shadow-[0_24px_60px_rgba(43,33,24,.2)] sm:p-10">
        <div className="absolute -right-10 -top-16 h-56 w-56 rotate-12 border-[18px] border-toprak/20 [clip-path:polygon(50%_0,61%_35%,100%_50%,61%_65%,50%_100%,39%_65%,0_50%,39%_35%)]" aria-hidden />
        <div className="relative max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-toprak-light">Anadolu Oyunları</p><h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Dinle, keşfet, meydan oku.</h1><p className="mt-4 max-w-xl text-base leading-7 text-parsomen/75">Türküleri ezberlemekten fazlası: hikâyeleri, şehirleri, ozanları ve kültürel izleri oyunla öğren.</p></div>
        <div className="relative mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
          <OyunOzeti deger={`Seviye ${seviye}`} etiket={`${1000 - seviyeIlerlemesi} puan sonra yüksel`} />
          <OyunOzeti deger={`${gunSerisi} gün`} etiket="keşif serisi" />
          <OyunOzeti deger={String(toplamPuan)} etiket="toplam kültür puanı" />
        </div>
        <div className="relative mt-4 h-1.5 max-w-2xl overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-gradient-to-r from-toprak-light to-parsomen transition-all" style={{ width: `${seviyeIlerlemesi / 10}%` }} /></div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OYUNLAR.map((oyun, i) => (
          <button key={oyun.kod} onClick={() => setAktif(oyun.kod)} className="group relative min-h-56 overflow-hidden rounded-3xl border border-toprak/25 bg-white/45 p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-toprak/45 hover:shadow-motif focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kilim">
            <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${oyun.renk}`} />
            <span className="absolute -bottom-12 -right-10 h-36 w-36 rotate-45 border-[12px] border-toprak/5 transition-transform duration-500 group-hover:rotate-[55deg] group-hover:scale-110" aria-hidden />
            <div className="flex items-start justify-between"><span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${oyun.renk} text-3xl text-white shadow-md`}>{oyun.ikon}</span><span className="rounded-full border border-toprak/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ceviz-light">{String(i + 1).padStart(2, "0")}</span></div>
            <h2 className="mt-6 font-serif text-2xl font-semibold text-ceviz">{oyun.ad}</h2><p className="mt-2 text-sm leading-6 text-ceviz-light">{oyun.aciklama}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-kilim transition group-hover:gap-3">Oyuna gir <span>→</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}

function OyunOzeti({ deger, etiket }: { deger: string; etiket: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm"><strong className="block font-serif text-xl text-white">{deger}</strong><span className="text-xs text-parsomen/60">{etiket}</span></div>;
}

function SoruOyunu({ turkuler, mod, puanEkle }: { turkuler: OyunTurkusu[]; mod: Exclude<OyunKodu, "hafiza" | "dokuma" | "canli">; puanEkle: React.Dispatch<React.SetStateAction<number>> }) {
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
        <div className={`mt-7 grid gap-3 ${mod === "ozan" ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-2"}`}>{soru.secenekler.map((secenek, secenekIndeksi) => { const cevaplandi = secilen !== null; const dogru = secenek === soru.cevap; const yanlis = secenek === secilen && !dogru; return <button key={secenek} disabled={cevaplandi} onClick={() => cevapla(secenek)} className={`oyun-secenek relative min-h-14 overflow-hidden rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${mod === "ozan" ? "pt-14 text-center" : ""} ${mod === "soz" ? "font-serif text-base italic" : ""} ${cevaplandi && dogru ? "oyun-dogru border-[#3f7a62] bg-[#3f7a62]/10 text-[#28523f]" : yanlis ? "oyun-yanlis border-kilim bg-kilim/10 text-kilim-dark" : "border-toprak/25 bg-parsomen/60 text-ceviz hover:-translate-y-1 hover:border-cini/40 hover:bg-white hover:shadow-md"}`}><SecenekIsareti mod={mod} metin={secenek} indeks={secenekIndeksi} turkuler={turkuler} />{secenek}{cevaplandi && dogru ? "  ✓" : yanlis ? "  ×" : ""}</button>; })}</div>
        {secilen && <div className={`oyun-sonuc mt-6 flex items-center justify-between gap-4 rounded-2xl p-4 ${secilen === soru.cevap ? "bg-[#3f7a62]/10" : "bg-kilim/10"}`}><span className="oyun-puan-pariltisi" aria-hidden>{secilen === soru.cevap ? "+" : "×"}</span><p className="text-sm text-ceviz-light">{secilen === soru.cevap ? `Harika! ${Math.max(40, 100 + seri * 15 - ipucu * 20)} kültür puanı.` : `Doğru cevap: ${soru.cevap}`}</p><button onClick={sonraki} className="shrink-0 rounded-xl bg-kilim px-4 py-2 text-sm font-semibold text-white">Sonraki →</button></div>}
      </div>
      <aside className="rounded-3xl border border-toprak/25 bg-parsomen-dark/45 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-ceviz-light">Oyun ilerlemesi</p><div className="mt-4 grid grid-cols-5 gap-1.5">{Array.from({ length: 10 }, (_, i) => <span key={i} className={`h-2 rounded-full ${i < indeks ? "bg-cini" : i === indeks ? "bg-kilim" : "bg-toprak/15"}`} />)}</div><p className="mt-6 font-serif text-3xl font-semibold text-ceviz">{puan}</p><p className="text-sm text-ceviz-light">kültür puanı</p><div className="mt-6 rounded-2xl border border-toprak/20 bg-white/35 p-4 text-sm leading-6 text-ceviz-light">Her doğru cevap 100 puan. Seri yaptıkça hız bonusun artar.</div></aside>
    </div>
  );
}

type SoruVerisi = ReturnType<typeof soruOlustur>;

function SoruSahnesi({ mod, soru, ipucu, ipucuAc }: { mod: Exclude<OyunKodu, "hafiza" | "dokuma" | "canli">; soru: SoruVerisi; ipucu: number; ipucuAc: () => void }) {
  if (mod === "yore") return <div className="oyun-harita-sahne relative mt-2 min-h-64 overflow-hidden rounded-3xl border border-kilim/20 bg-gradient-to-br from-parsomen-dark to-white/70 p-6"><div className="oyun-harita-iz absolute inset-0 opacity-30" aria-hidden /><span className="oyun-konum-nabiz absolute left-[18%] top-[58%] h-5 w-5 rounded-full bg-kilim" /><span className="oyun-konum-nabiz absolute right-[20%] top-[28%] h-4 w-4 rounded-full bg-cini [animation-delay:.5s]" /><div className="relative mx-auto grid min-h-52 max-w-lg place-items-center text-center"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-kilim">{soru.ust}</p><h2 className="mt-3 font-serif text-3xl font-semibold text-ceviz sm:text-4xl">{soru.soru}</h2><p className="mt-3 text-sm text-ceviz-light">Doğru durağı seç ve türküyü evine ulaştır.</p></div></div></div>;

  if (mod === "hikaye") { const kelimeler = soru.soru.split(" "); const gorunen = kelimeler.slice(0, Math.min(kelimeler.length, 10 + ipucu * 10)).join(" "); return <div className="relative mt-2 overflow-hidden rounded-3xl bg-[#eadfc9] p-6 shadow-inner sm:p-8"><span className="absolute right-5 top-5 rotate-6 rounded border-2 border-kilim/35 px-3 py-1 font-mono text-xs font-bold uppercase text-kilim/60">Arşiv dosyası</span><div className="absolute inset-y-0 left-7 border-l border-dashed border-toprak/35" /><div className="relative pl-7"><p className="font-mono text-xs uppercase tracking-[.18em] text-ceviz-light">Vaka no. {String(gorunen.length).padStart(3, "0")}</p><h2 className="mt-5 font-serif text-2xl font-semibold leading-relaxed text-ceviz">“{gorunen}{gorunen.length < soru.soru.length ? "…" : ""}”</h2>{gorunen.length < soru.soru.length && <button onClick={ipucuAc} className="mt-5 rounded-full border border-toprak/30 bg-white/40 px-4 py-2 text-xs font-semibold text-toprak-dark hover:bg-white/70">Yeni ipucu aç · −20 puan</button>}</div></div>; }

  if (mod === "ozan") return <div className="oyun-ozan-sahne relative mt-2 grid min-h-72 place-items-end overflow-hidden rounded-3xl bg-gradient-to-b from-[#15110e] to-ceviz p-7 text-center text-white"><div className="oyun-spot-isigi absolute left-1/2 top-0 h-60 w-72 -translate-x-1/2 bg-gradient-to-b from-toprak/40 to-transparent [clip-path:polygon(42%_0,58%_0,95%_100%,5%_100%)]" /><div className="oyun-ozan-siluet absolute bottom-20 left-1/2 h-28 w-24 -translate-x-1/2 rounded-t-full bg-black/55" aria-hidden><span className="absolute -right-12 top-12 h-2 w-24 -rotate-12 rounded-full bg-black/55" /></div><div className="relative"><p className="text-xs font-semibold uppercase tracking-[.2em] text-toprak-light">Sahnedeki eserin izini sür</p><h2 className="mt-2 font-serif text-3xl font-semibold">{soru.soru}</h2><p className="mt-2 text-sm text-white/55">Ozan portrelerinden doğru sesi seç.</p></div></div>;

  if (mod === "soz") return <div className="relative mt-2 overflow-hidden rounded-3xl border border-[#6e4b7c]/20 bg-gradient-to-br from-[#f2e8d7] to-white p-7 text-center"><span className="absolute -left-5 top-5 rotate-[-18deg] text-8xl text-[#6e4b7c]/10" aria-hidden>“</span><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#6e4b7c]">Dizeyi tamamla</p><h2 className="mt-6 font-serif text-2xl italic leading-relaxed text-ceviz">{soru.soru}</h2><div className="mx-auto mt-5 h-12 max-w-md border-b-2 border-dashed border-[#6e4b7c]/35"><span className="text-sm text-ceviz-light">Eksik dize buraya gelecek</span></div></div>;

  const izler = soru.soru.split(" · "); return <div className="relative mt-2 min-h-72 overflow-hidden rounded-3xl bg-gradient-to-br from-[#e7eee8] to-white p-6"><div className="oyun-pusula absolute -right-12 -top-12 grid h-52 w-52 place-items-center rounded-full border-2 border-[#3f7a62]/20"><span className="h-32 w-1 rotate-45 bg-gradient-to-b from-kilim to-cini" /></div><div className="relative max-w-md"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#3f7a62]">Kültür pusulası</p><h2 className="mt-3 font-serif text-3xl font-semibold text-ceviz">İzleri takip et</h2><div className="mt-6 flex flex-wrap gap-3">{izler.map((iz, i) => <span key={iz} className="oyun-iz-etiketi rounded-full border border-[#3f7a62]/25 bg-white/65 px-4 py-2 text-sm font-semibold text-[#28523f]" style={{ animationDelay: `${i * 140}ms` }}>{iz}</span>)}</div>{soru.detay && <button onClick={ipucuAc} disabled={ipucu > 0} className="mt-7 rounded-full bg-[#3f7a62] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{ipucu ? `Eser izi: ${soru.detay}` : "Eser izini göster · −20 puan"}</button>}</div></div>;
}

function SecenekIsareti({ mod, metin, indeks, turkuler }: { mod: Exclude<OyunKodu, "hafiza" | "dokuma" | "canli">; metin: string; indeks: number; turkuler: OyunTurkusu[] }) {
  if (mod === "ozan") {
    const gorsel = turkuler.find((t) => t.ozan === metin)?.ozanGorseli;
    return gorsel ? <span className="absolute inset-x-0 top-2 mx-auto h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm"><img src={gorsel.src} alt="" className="h-full w-full object-cover" /></span> : <span className="absolute inset-x-0 top-2 mx-auto grid h-10 w-10 place-items-center rounded-full bg-toprak/15 font-serif text-sm not-italic text-toprak-dark">{metin.charAt(0)}</span>;
  }
  if (mod === "yore") return <span className="mr-2 text-kilim" aria-hidden>⌖</span>;
  if (mod === "soz") return <span className="mr-2 font-sans text-xs not-italic text-[#6e4b7c]">{String.fromCharCode(65 + indeks)}.</span>;
  if (mod === "hikaye") return <span className="mr-2 text-cini" aria-hidden>▤</span>;
  return <span className="mr-2 text-[#3f7a62]" aria-hidden>✦</span>;
}

function soruOlustur(turkuler: OyunTurkusu[], mod: Exclude<OyunKodu, "hafiza" | "dokuma" | "canli">) {
  const t = turkuler[Math.floor(Math.random() * turkuler.length)];
  if (mod === "yore") return { ust: "Bu türkü hangi yöreye ait?", soru: t.baslik, detay: null, cevap: t.il, secenekler: farkliSecenekler(turkuler.map((x) => x.il), t.il) };
  if (mod === "hikaye") return { ust: "Bu hikâye hangi türküye ait?", soru: t.ozet, detay: null, cevap: t.baslik, secenekler: farkliSecenekler(turkuler.map((x) => x.baslik), t.baslik) };
  if (mod === "ozan") return { ust: "Bu eserin ozanı veya söz sahibi kim?", soru: t.baslik, detay: t.ozet, cevap: t.ozan!, secenekler: farkliSecenekler(turkuler.map((x) => x.ozan ?? "").filter(Boolean), t.ozan!) };
  if (mod === "soz") return { ust: "İkinci dizeyi tamamla", soru: `“${t.sozler[0]}”`, detay: null, cevap: t.sozler[1], secenekler: farkliSecenekler(turkuler.flatMap((x) => x.sozler.slice(1, 3)), t.sozler[1]) };
  const izler = sehirdenBagimsizIzler(t);
  return {
    ust: "İpuçlarının ait olduğu şehri bul",
    soru: (izler.length ? izler : ["halk müziği", "sözlü gelenek"]).join(" · "),
    detay: t.baslik,
    cevap: t.il,
    secenekler: farkliSecenekler(turkuler.map((x) => x.il), t.il),
  };
}

function HafizaOyunu({ turkuler, puanEkle }: { turkuler: OyunTurkusu[]; puanEkle: React.Dispatch<React.SetStateAction<number>> }) {
  const [kartlar, setKartlar] = useState(() => { const secilen = karistir(turkuler).slice(0, 6); return karistir(secilen.flatMap((t) => [{ id: `${t.slug}-a`, es: t.slug, yazi: t.il, tip: "il" }, { id: `${t.slug}-b`, es: t.slug, yazi: t.baslik, tip: "turku" }])); });
  const [aciklar, setAciklar] = useState<string[]>([]); const [bulunan, setBulunan] = useState<string[]>([]); const [hamle, setHamle] = useState(0);
  function ac(kart: (typeof kartlar)[number]) { if (aciklar.length === 2 || aciklar.includes(kart.id) || bulunan.includes(kart.es)) return; const yeni = [...aciklar, kart.id]; setAciklar(yeni); if (yeni.length === 2) { setHamle((h) => h + 1); const ilk = kartlar.find((k) => k.id === yeni[0])!; if (ilk.es === kart.es) { setTimeout(() => { setBulunan((b) => [...b, kart.es]); setAciklar([]); puanEkle((p) => p + 150); }, 450); } else setTimeout(() => setAciklar([]), 800); } }
  return <div className="rounded-3xl border border-toprak/25 bg-white/45 p-5 shadow-motif sm:p-7"><div className="mb-5 flex items-center justify-between"><p className="text-sm text-ceviz-light">Şehir ile türküsünü eşleştir.</p><span className="rounded-full bg-toprak/10 px-3 py-1 text-sm font-semibold text-toprak-dark">{hamle} hamle</span></div><div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">{kartlar.map((kart) => { const gorunur = aciklar.includes(kart.id) || bulunan.includes(kart.es); return <button key={kart.id} onClick={() => ac(kart)} className={`aspect-[3/4] rounded-2xl border p-2 text-center transition duration-300 ${gorunur ? "rotate-0 border-cini/35 bg-parsomen text-ceviz shadow-sm" : "border-kilim/25 bg-gradient-to-br from-kilim to-kilim-dark text-transparent hover:-translate-y-1"}`}><span className="grid h-full place-items-center"><span className="line-clamp-4 text-xs font-semibold sm:text-sm">{gorunur ? kart.yazi : "◇"}</span></span></button>; })}</div>{bulunan.length === 6 && <div className="mt-6 rounded-2xl bg-[#3f7a62]/10 p-5 text-center"><p className="font-serif text-2xl font-semibold text-[#28523f]">Tüm izleri buldun!</p><p className="mt-1 text-sm text-ceviz-light">{hamle} hamlede 900 kültür puanı.</p></div>}</div>;
}

function dizeTuruSec(turkuler: OyunTurkusu[]) {
  const uygun = turkuler.filter((turku) => turku.sozler.length >= 4);
  const turku = uygun[Math.floor(Math.random() * uygun.length)];
  const dogru = turku.sozler.slice(0, 4);
  return { turku, dogru, karisik: karistir(dogru.map((metin, indeks) => ({ id: indeks, metin }))) };
}

function DizeDokuma({ turkuler, puanEkle }: { turkuler: OyunTurkusu[]; puanEkle: React.Dispatch<React.SetStateAction<number>> }) {
  const [tur, setTur] = useState(() => dizeTuruSec(turkuler));
  const [secilenler, setSecilenler] = useState<Array<{ id: number; metin: string }>>([]);
  const [sonuc, setSonuc] = useState<"dogru" | "yanlis" | null>(null);

  const kalanlar = tur.karisik.filter((dize) => !secilenler.some((secilen) => secilen.id === dize.id));

  function dizeEkle(dize: { id: number; metin: string }) {
    if (sonuc) return;
    const yeni = [...secilenler, dize];
    setSecilenler(yeni);
    if (yeni.length === tur.dogru.length) {
      const dogruMu = yeni.every((satir, indeks) => satir.metin === tur.dogru[indeks]);
      setSonuc(dogruMu ? "dogru" : "yanlis");
      if (dogruMu) puanEkle((puan) => puan + 250);
    }
  }

  function geriAl() {
    if (sonuc) return;
    setSecilenler((liste) => liste.slice(0, -1));
  }

  function yeniDoku() {
    setTur(dizeTuruSec(turkuler));
    setSecilenler([]);
    setSonuc(null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <section className="relative overflow-hidden rounded-3xl border border-[#8b3150]/20 bg-gradient-to-br from-[#f5eadb] to-white p-5 shadow-motif sm:p-8">
        <div className="absolute inset-y-0 left-0 w-3 bg-[repeating-linear-gradient(0deg,#8b3150_0_12px,#d49a55_12px_24px,#315f70_24px_36px)] opacity-75" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#8b3150]">Söz tezgâhı</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-ceviz">Kıtayı yeniden doku</h2>
        <p className="mt-2 text-sm leading-6 text-ceviz-light">Dizelere doğru sırayla dokun. Seçtiğin her satır dokumanın bir sırasını oluşturur.</p>

        <div className="mt-7 min-h-64 rounded-3xl border border-toprak/20 bg-parsomen/75 p-4 shadow-inner">
          <div className="grid gap-2">
            {Array.from({ length: 4 }, (_, indeks) => {
              const dize = secilenler[indeks];
              return <button key={indeks} type="button" onClick={indeks === secilenler.length - 1 ? geriAl : undefined} className={`min-h-12 rounded-xl border px-4 text-left font-serif text-base transition ${dize ? "oyun-dokuma-satiri border-[#8b3150]/30 bg-white text-ceviz shadow-sm" : "border-dashed border-toprak/25 text-ceviz-light/40"}`}>{dize ? <><span className="mr-3 font-sans text-xs text-[#8b3150]">{indeks + 1}</span>{dize.metin}</> : `${indeks + 1}. dize`}</button>;
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {kalanlar.map((dize) => <button key={dize.id} type="button" onClick={() => dizeEkle(dize)} className="rounded-2xl border border-toprak/25 bg-white/65 px-4 py-3 text-left text-sm font-semibold leading-5 text-ceviz transition hover:-translate-y-0.5 hover:border-[#8b3150]/40 hover:shadow-sm">{dize.metin}</button>)}
        </div>

        {sonuc && <div className={`oyun-sonuc mt-6 rounded-2xl p-5 ${sonuc === "dogru" ? "bg-[#3f7a62]/10 text-[#28523f]" : "bg-kilim/10 text-kilim-dark"}`}><p className="font-serif text-xl font-semibold">{sonuc === "dogru" ? "Dokuma tamamlandı!" : "Dizelerin sırası karıştı."}</p><p className="mt-1 text-sm opacity-75">{sonuc === "dogru" ? "Kıtayı doğru kurdun ve 250 kültür puanı kazandın." : "Doğru sırayı görmek için yeniden deneyebilirsin."}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => { setSecilenler([]); setSonuc(null); }} className="rounded-xl border border-current/20 px-4 py-2 text-sm font-semibold">Yeniden dene</button><button onClick={yeniDoku} className="rounded-xl bg-[#8b3150] px-4 py-2 text-sm font-semibold text-white">Yeni kıta →</button></div></div>}
      </section>

      <aside className="overflow-hidden rounded-3xl border border-toprak/25 bg-ceviz text-parsomen shadow-motif">
        <div className="relative h-36 bg-gradient-to-br from-[#8b3150] to-[#31202a] p-5"><span className="absolute -right-5 -top-6 text-9xl text-white/10" aria-hidden>⌁</span><p className="relative text-xs font-semibold uppercase tracking-[.18em] text-toprak-light">Dokunan eser</p><p className="relative mt-3 font-serif text-2xl font-semibold leading-tight">{tur.turku.baslik}</p></div>
        <div className="p-5"><p className="text-sm text-parsomen/60">{tur.turku.il} yöresi</p><div className="mt-5 flex items-center gap-2">{Array.from({ length: 4 }, (_, i) => <span key={i} className={`h-2 flex-1 rounded-full transition ${i < secilenler.length ? "bg-toprak-light" : "bg-white/10"}`} />)}</div><p className="mt-3 text-xs text-parsomen/50">{secilenler.length}/4 dize yerleştirildi</p></div>
      </aside>
    </div>
  );
}
