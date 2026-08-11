"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <div className="grid h-[620px] place-items-center"><div className="text-center"><span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-toprak/25 border-t-kilim" /><p className="mt-3 text-sm text-ceviz-light">İlişki haritası kuruluyor…</p></div></div>,
});

export interface SoyAgaciTurkusu { slug: string; baslik: string; yore: string; ozan: string | null; digerAdlar: string[]; etiketler: string[] }
type BagTuru = "varyant" | "ozan" | "yore" | "tema";
type Bag = { turku: SoyAgaciTurkusu; puan: number; nedenler: string[]; turler: BagTuru[] };
type Dugum = SoyAgaciTurkusu & { id: string; merkez: boolean; puan: number; turler: BagTuru[]; x?: number; y?: number };

const RENK: Record<BagTuru | "merkez", string> = { merkez: "#3b291e", varyant: "#a72e24", ozan: "#7f3651", yore: "#315f70", tema: "#b67a3d" };
const ETIKET: Record<BagTuru, string> = { varyant: "Eser varyantı", ozan: "Aynı ozan", yore: "Aynı yöre", tema: "Ortak tema" };

function yalniz(metin: string) { return metin.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9çğıöşü]+/g, " ").trim(); }
function il(yore: string) { return yore.split(/[(/]/)[0].trim(); }
function kisalt(metin: string, uzunluk = 27) { return metin.length > uzunluk ? `${metin.slice(0, uzunluk - 1)}…` : metin; }

function baglariBul(merkez: SoyAgaciTurkusu, tumu: SoyAgaciTurkusu[]): Bag[] {
  const merkezAdlari = [merkez.baslik, ...merkez.digerAdlar].map(yalniz);
  return tumu.filter((x) => x.slug !== merkez.slug).map((turku) => {
    let puan = 0; const nedenler: string[] = []; const turler: BagTuru[] = [];
    if (il(turku.yore) === il(merkez.yore)) { puan += 4; nedenler.push("aynı yöre"); turler.push("yore"); }
    if (merkez.ozan && turku.ozan === merkez.ozan) { puan += 8; nedenler.push("aynı ozan"); turler.push("ozan"); }
    const ortak = turku.etiketler.filter((x) => merkez.etiketler.includes(x) && yalniz(x) !== yalniz(il(merkez.yore)));
    if (ortak.length) { puan += Math.min(6, ortak.length * 2); nedenler.push(`ortak tema: ${ortak.slice(0, 2).join(", ")}`); turler.push("tema"); }
    const adayAdlari = [turku.baslik, ...turku.digerAdlar].map(yalniz);
    if (merkezAdlari.some((a) => adayAdlari.includes(a))) { puan += 12; nedenler.push("aynı eser adı/varyant"); turler.push("varyant"); }
    else {
      const kelimeler = new Set(yalniz(merkez.baslik).split(" ").filter((x) => x.length > 3));
      const ortakKelime = yalniz(turku.baslik).split(" ").filter((x) => kelimeler.has(x)).length;
      if (ortakKelime >= 2) { puan += ortakKelime * 2; nedenler.push("benzer başlık"); turler.push("varyant"); }
    }
    return { turku, puan, nedenler, turler: Array.from(new Set(turler)) };
  }).filter((x) => x.puan >= 4).sort((a, b) => b.puan - a.puan || a.turku.baslik.localeCompare(b.turku.baslik, "tr")).slice(0, 34);
}

export function TurkuSoyAgaci({ turkuler }: { turkuler: SoyAgaciTurkusu[] }) {
  const params = useSearchParams();
  const ilk = turkuler.find((x) => x.slug === params.get("turku")) ?? turkuler[0];
  const [secili, setSecili] = useState(ilk);
  const [arama, setArama] = useState("");
  const [filtreler, setFiltreler] = useState<BagTuru[]>(["varyant", "ozan", "yore", "tema"]);
  const [hover, setHover] = useState<string | null>(null);
  const [boyut, setBoyut] = useState({ width: 900, height: 620 });
  const alan = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!alan.current) return;
    const gozlemci = new ResizeObserver(([girdi]) => setBoyut({ width: Math.max(320, girdi.contentRect.width), height: window.innerWidth < 640 ? 500 : 620 }));
    gozlemci.observe(alan.current);
    return () => gozlemci.disconnect();
  }, []);

  const tumBaglar = useMemo(() => baglariBul(secili, turkuler), [secili, turkuler]);
  const baglar = useMemo(() => tumBaglar.filter((b) => b.turler.some((t) => filtreler.includes(t))).slice(0, 24), [tumBaglar, filtreler]);
  const sonuclar = useMemo(() => arama.trim().length < 2 ? [] : turkuler.filter((x) => yalniz(`${x.baslik} ${x.yore} ${x.ozan ?? ""}`).includes(yalniz(arama))).slice(0, 8), [arama, turkuler]);
  const graphData = useMemo(() => {
    const ilkHalka = Math.min(10, baglar.length);
    const ikinciHalka = Math.max(1, baglar.length - ilkHalka);
    const disYaricap = Math.min(230, Math.max(132, boyut.width * 0.42));
    const icYaricap = disYaricap * 0.56;
    const nodes: Dugum[] = [
      { ...secili, id: secili.slug, merkez: true, puan: 20, turler: [], x: 0, y: 0 },
      ...baglar.map((b, i) => {
        const icte = i < ilkHalka;
        const halkaSirasi = icte ? i : i - ilkHalka;
        const halkaAdedi = icte ? ilkHalka : ikinciHalka;
        const aci = -Math.PI / 2 + (halkaSirasi / Math.max(1, halkaAdedi)) * Math.PI * 2 + (icte ? 0 : Math.PI / ikinciHalka);
        const yaricap = icte ? icYaricap : disYaricap;
        return { ...b.turku, id: b.turku.slug, merkez: false, puan: b.puan, turler: b.turler, x: Math.cos(aci) * yaricap, y: Math.sin(aci) * yaricap };
      }),
    ];
    return { nodes, links: baglar.map((b) => ({ source: secili.slug, target: b.turku.slug, puan: b.puan, tur: b.turler[0], nedenler: b.nedenler })) };
  }, [secili, baglar, boyut.width]);

  function filtreDegistir(tur: BagTuru) { setFiltreler((f) => f.includes(tur) ? (f.length === 1 ? f : f.filter((x) => x !== tur)) : [...f, tur]); }
  function dugumCiz(dugumHam: object, ctx: CanvasRenderingContext2D, olcek: number) {
    const dugum = dugumHam as Dugum; const aktif = hover === dugum.id || dugum.merkez; const yaricap = dugum.merkez ? 15 : Math.max(6.5, Math.min(11, 5 + dugum.puan / 2));
    const anaTur = dugum.turler[0] ?? "tema"; const renk = dugum.merkez ? RENK.merkez : RENK[anaTur];
    ctx.beginPath(); ctx.arc(dugum.x ?? 0, dugum.y ?? 0, yaricap, 0, Math.PI * 2); ctx.fillStyle = renk; ctx.shadowColor = "rgba(54,38,29,.25)"; ctx.shadowBlur = aktif ? 12 : 5; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = dugum.merkez ? 2.5 : 1.4; ctx.strokeStyle = dugum.merkez ? "#d39b5b" : "#fff8eb"; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = `${dugum.merkez ? 6 : 4.5}px Inter, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(dugum.baslik.charAt(0).toLocaleUpperCase("tr-TR"), dugum.x ?? 0, dugum.y ?? 0);
    if (aktif || olcek > 2.1) { const metin = kisalt(dugum.baslik, aktif ? 36 : 24); ctx.font = `${aktif ? 5.2 : 4.2}px Inter, sans-serif`; const genislik = ctx.measureText(metin).width + 5; const x = dugum.x ?? 0; const y = (dugum.y ?? 0) + yaricap + 7; ctx.fillStyle = "rgba(255,250,240,.94)"; ctx.fillRect(x - genislik / 2, y - 4, genislik, 8); ctx.fillStyle = "#36261d"; ctx.fillText(metin, x, y); }
  }

  return <div className="overflow-hidden rounded-[2rem] border border-toprak/25 bg-[#fbf6eb] shadow-[0_24px_70px_rgba(54,38,29,.13)]">
    <header className="relative overflow-hidden border-b border-toprak/20 bg-gradient-to-r from-[#fffaf0] via-[#f8efdf] to-[#eef2ed] p-5 sm:p-7"><div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-cini/5" aria-hidden /><div className="relative grid gap-5 lg:grid-cols-[1fr_380px] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.24em] text-kilim">Anadolu’nun ezgi ağı</p><h1 className="mt-2 font-serif text-4xl font-semibold text-ceviz sm:text-5xl">Türkü Soy Ağacı</h1><p className="mt-3 max-w-xl text-sm leading-6 text-ceviz-light">Bir eseri merkeze al; varyantlarını, ozan bağlarını, yöresini ve ortak temalarını canlı bir kültür grafiğinde keşfet.</p></div><div className="relative"><label htmlFor="soy-arama" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ceviz-light">Merkez eseri değiştir</label><input id="soy-arama" value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Türkü, yöre veya ozan ara…" className="min-h-12 w-full rounded-2xl border border-toprak/30 bg-white/80 px-4 text-sm shadow-sm outline-none focus:border-kilim focus:ring-2 focus:ring-kilim/15" />{sonuclar.length > 0 && <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-toprak/25 bg-parsomen shadow-2xl">{sonuclar.map((t) => <button key={t.slug} onClick={() => { setSecili(t); setArama(""); }} className="block min-h-12 w-full border-b border-toprak/10 px-4 py-2 text-left last:border-0 hover:bg-toprak/10"><strong className="block truncate text-sm text-ceviz">{t.baslik}</strong><span className="text-xs text-ceviz-light">{t.yore}{t.ozan ? ` · ${t.ozan}` : ""}</span></button>)}</div>}</div></div></header>
    <div className="grid xl:grid-cols-[minmax(0,1fr)_330px]">
      <section className="min-w-0 border-b border-toprak/20 xl:border-b-0 xl:border-r"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-toprak/15 bg-white/35 px-4 py-3"><div className="flex flex-wrap gap-2">{(Object.keys(ETIKET) as BagTuru[]).map((tur) => <button key={tur} onClick={() => filtreDegistir(tur)} aria-pressed={filtreler.includes(tur)} className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition ${filtreler.includes(tur) ? "border-transparent bg-ceviz text-white" : "border-toprak/25 bg-white/50 text-ceviz-light"}`}><span className="h-2.5 w-2.5 rounded-full" style={{ background: RENK[tur] }} />{ETIKET[tur]}</button>)}</div><span className="hidden rounded-full border border-toprak/20 bg-white/60 px-3 py-2 text-[11px] font-medium text-ceviz-light sm:inline">Sürükle · yakınlaştır · keşfet</span></div>
        <div ref={alan} className="relative overflow-hidden bg-[radial-gradient(circle_at_center,rgba(211,155,91,.18),transparent_55%),linear-gradient(rgba(49,95,112,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(49,95,112,.035)_1px,transparent_1px)] bg-[size:auto,28px_28px,28px_28px]"><ForceGraph2D width={boyut.width} height={boyut.height} graphData={graphData} backgroundColor="rgba(0,0,0,0)" nodeRelSize={6} nodeCanvasObject={dugumCiz} nodePointerAreaPaint={(node: object, color: string, ctx: CanvasRenderingContext2D) => { const n = node as Dugum; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(n.x ?? 0, n.y ?? 0, n.merkez ? 19 : 14, 0, Math.PI * 2); ctx.fill(); }} linkColor={(link: any) => RENK[link.tur as BagTuru]} linkWidth={(link: any) => Math.min(3.5, 0.6 + link.puan / 7)} linkDirectionalParticles={1} linkDirectionalParticleWidth={1.8} linkDirectionalParticleSpeed={0.003} cooldownTicks={0} warmupTicks={0} onNodeHover={(n: object | null) => setHover((n as Dugum | null)?.id ?? null)} onNodeClick={(n: object) => setSecili(n as Dugum)} nodeLabel={(n: object) => { const d = n as Dugum; const bag = baglar.find((b) => b.turku.slug === d.id); return `${d.baslik} — ${d.yore}${d.ozan ? ` · ${d.ozan}` : ""}${bag ? ` · ${bag.nedenler.join(" · ")}` : ""}`; }} enableNodeDrag enableZoomInteraction enablePanInteraction /></div>
        <div className="flex items-center justify-between gap-4 border-t border-toprak/15 bg-white/35 px-4 py-3 text-xs text-ceviz-light"><span>{baglar.length} güçlü ilişki gösteriliyor</span><span className="hidden sm:inline">Sürükle · tekerlekle yakınlaş · düğüme tıkla</span></div>
      </section>
      <aside className="bg-ceviz p-5 text-parsomen sm:p-6"><p className="text-xs font-semibold uppercase tracking-[.2em] text-toprak-light">Merkez eser</p><h2 className="mt-3 font-serif text-3xl font-semibold leading-tight">{secili.baslik}</h2><p className="mt-2 text-sm text-parsomen/60">{secili.yore}{secili.ozan ? ` · ${secili.ozan}` : ""}</p><div className="mt-5 flex flex-wrap gap-2">{secili.etiketler.slice(0, 4).map((x) => <span key={x} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-parsomen/70">{x}</span>)}</div><Link href={`/turku/${secili.slug}`} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-parsomen px-4 text-sm font-semibold text-ceviz transition hover:bg-white">Türkü sayfasını aç →</Link><div className="mt-7 border-t border-white/10 pt-6"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">En güçlü bağlar</h3><span className="text-xs text-parsomen/40">puan</span></div><ol className="mt-3 space-y-1">{baglar.slice(0, 7).map((b) => <li key={b.turku.slug}><button onClick={() => setSecili(b.turku)} className="group flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left hover:bg-white/5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: RENK[b.turler[0] ?? "tema"] }}>{b.turku.baslik.charAt(0)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-white/90">{b.turku.baslik}</span><span className="block truncate text-[11px] text-parsomen/45">{b.nedenler.join(" · ")}</span></span><span className="text-xs font-semibold text-toprak-light">{b.puan}</span></button></li>)}</ol></div></aside>
    </div>
    <footer className="border-t border-toprak/20 bg-parsomen-dark/30 px-5 py-3 text-xs leading-5 text-ceviz-light">İlişkiler arşivdeki yöre, ozan, alternatif ad ve tema alanlarından hesaplanır. Grafik keşif aracıdır; tek başına müzikolojik akrabalık kanıtı sayılmaz.</footer>
  </div>;
}
