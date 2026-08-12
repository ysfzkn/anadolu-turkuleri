"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { OnizlemeCalar } from "@/components/OnizlemeCalar";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <div className="grid h-[620px] place-items-center"><div className="text-center"><span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-toprak/25 border-t-kilim" /><p className="mt-3 text-sm text-ceviz-light">İlişki haritası kuruluyor…</p></div></div>,
});

export interface SoyAgaciTurkusu { slug: string; baslik: string; yore: string; ozan: string | null; digerAdlar: string[]; etiketler: string[] }
type BagTuru = "varyant" | "ozan" | "yore" | "tema";
type Bag = { turku: SoyAgaciTurkusu; puan: number; nedenler: string[]; turler: BagTuru[] };
type Dugum = SoyAgaciTurkusu & { id: string; merkez: boolean; puan: number; turler: BagTuru[]; x?: number; y?: number };
type GrafikBagi = { source: string | Dugum; target: string | Dugum; puan: number; tur: BagTuru; nedenler: string[]; curve: number; ikincil: boolean };

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
  const [kesifRotasi, setKesifRotasi] = useState<SoyAgaciTurkusu[]>([ilk]);
  const [toplamKesif, setToplamKesif] = useState(1);
  const [boyut, setBoyut] = useState({ width: 900, height: 620 });
  const alan = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!alan.current) return;
    const gozlemci = new ResizeObserver(([girdi]) => setBoyut({ width: Math.max(320, girdi.contentRect.width), height: window.innerWidth < 640 ? 500 : 620 }));
    gozlemci.observe(alan.current);
    return () => gozlemci.disconnect();
  }, []);

  useEffect(() => {
    try {
      const onceki = JSON.parse(localStorage.getItem("anadolu-ezgi-kesifleri") ?? "[]") as string[];
      const guncel = Array.from(new Set([...onceki, secili.slug]));
      localStorage.setItem("anadolu-ezgi-kesifleri", JSON.stringify(guncel));
      setToplamKesif(guncel.length);
    } catch { setToplamKesif((sayi) => Math.max(1, sayi)); }
  }, [secili.slug]);

  const tumBaglar = useMemo(() => baglariBul(secili, turkuler), [secili, turkuler]);
  const baglar = useMemo(() => tumBaglar.filter((b) => b.turler.some((t) => filtreler.includes(t))).slice(0, 24), [tumBaglar, filtreler]);
  const oneCikanlar = useMemo(() => new Set(baglar.slice(0, 6).map((b) => b.turku.slug)), [baglar]);
  const filtreSayilari = useMemo(() => Object.fromEntries((Object.keys(ETIKET) as BagTuru[]).map((tur) => [tur, tumBaglar.filter((b) => b.turler.includes(tur)).length])) as Record<BagTuru, number>, [tumBaglar]);
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
    const anaBaglar: GrafikBagi[] = baglar.map((b, i) => ({ source: secili.slug, target: b.turku.slug, puan: b.puan, tur: b.turler[0], nedenler: b.nedenler, curve: (i % 2 ? 1 : -1) * (0.035 + (i % 4) * 0.012), ikincil: false }));
    const ikincilBaglar: GrafikBagi[] = [];
    for (let i = 0; i < baglar.length && ikincilBaglar.length < 14; i += 1) for (let j = i + 1; j < baglar.length && ikincilBaglar.length < 14; j += 1) {
      const a = baglar[i].turku; const b = baglar[j].turku;
      const ayniOzan = Boolean(a.ozan && a.ozan === b.ozan);
      const ayniYore = il(a.yore) === il(b.yore);
      const ortakTema = a.etiketler.filter((x) => b.etiketler.includes(x) && yalniz(x) !== yalniz(il(a.yore))).length;
      if (!ayniOzan && !ayniYore && ortakTema < 2) continue;
      const tur: BagTuru = ayniOzan ? "ozan" : ayniYore ? "yore" : "tema";
      ikincilBaglar.push({ source: a.slug, target: b.slug, puan: ayniOzan ? 7 : ayniYore ? 4 : 3, tur, nedenler: [ayniOzan ? "aynı ozan" : ayniYore ? "aynı yöre" : "ortak temalar"], curve: (ikincilBaglar.length % 2 ? 1 : -1) * .16, ikincil: true });
    }
    return { nodes, links: [...anaBaglar, ...ikincilBaglar] };
  }, [secili, baglar, boyut.width]);

  function filtreDegistir(tur: BagTuru) { setFiltreler((f) => f.includes(tur) ? (f.length === 1 ? f : f.filter((x) => x !== tur)) : [...f, tur]); }
  function merkezSec(turku: SoyAgaciTurkusu) { setSecili(turku); setKesifRotasi((rota) => [...rota.filter((x) => x.slug !== turku.slug), turku].slice(-5)); }
  function rastgeleKesfet() { const adaylar = baglar.length ? baglar.map((b) => b.turku) : turkuler; const sonraki = adaylar[Math.floor(Math.random() * adaylar.length)]; if (sonraki) merkezSec(sonraki); }
  function dugumCiz(dugumHam: object, ctx: CanvasRenderingContext2D, olcek: number) {
    const dugum = dugumHam as Dugum; const aktif = hover === dugum.id || dugum.merkez; const oneCikan = oneCikanlar.has(dugum.id); const yaricap = dugum.merkez ? 22 : Math.max(7.5, Math.min(12, 6 + dugum.puan / 2));
    const anaTur = dugum.turler[0] ?? "tema"; const renk = dugum.merkez ? RENK.merkez : RENK[anaTur];
    const x = dugum.x ?? 0; const y = dugum.y ?? 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillStyle = `${renk}22`; ctx.strokeStyle = `${renk}88`; ctx.lineWidth = 1; ctx.fillRect(-yaricap - 5, -yaricap - 5, (yaricap + 5) * 2, (yaricap + 5) * 2); ctx.strokeRect(-yaricap - 5, -yaricap - 5, (yaricap + 5) * 2, (yaricap + 5) * 2); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, yaricap, 0, Math.PI * 2); ctx.fillStyle = renk; ctx.shadowColor = "rgba(54,38,29,.28)"; ctx.shadowBlur = aktif ? 16 : 7; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = dugum.merkez ? 3 : 1.8; ctx.strokeStyle = dugum.merkez ? "#d39b5b" : "#fff8eb"; ctx.stroke();
    if (dugum.merkez) { ctx.beginPath(); ctx.arc(x, y, yaricap - 6, 0, Math.PI * 2); ctx.setLineDash([2, 2]); ctx.strokeStyle = "#d39b5b"; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]); }
    ctx.fillStyle = "#fff"; ctx.font = `700 ${dugum.merkez ? 8 : 5}px Inter, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(dugum.baslik.charAt(0).toLocaleUpperCase("tr-TR"), x, y);
    if (aktif || oneCikan || olcek > 2.1) { const metin = kisalt(dugum.baslik, dugum.merkez ? 30 : aktif ? 28 : 20); ctx.font = `${dugum.merkez ? "700 6" : "600 4.5"}px Inter, sans-serif`; const genislik = Math.min(92, ctx.measureText(metin).width + 10); const etiketY = y + yaricap + (dugum.merkez ? 12 : 9); ctx.fillStyle = aktif ? "rgba(54,38,29,.96)" : "rgba(255,250,240,.96)"; ctx.beginPath(); ctx.roundRect(x - genislik / 2, etiketY - 6, genislik, 12, 5); ctx.fill(); ctx.strokeStyle = aktif ? "#d39b5b" : `${renk}55`; ctx.lineWidth = .7; ctx.stroke(); ctx.fillStyle = aktif ? "#fffaf0" : "#36261d"; ctx.fillText(metin, x, etiketY); }
  }

  return <div className="overflow-hidden rounded-[2rem] border border-toprak/25 bg-[#fbf6eb] shadow-[0_24px_70px_rgba(54,38,29,.13)]">
    <header className="relative overflow-hidden border-b border-toprak/20 bg-gradient-to-r from-[#fffaf0] via-[#f8efdf] to-[#eef2ed] p-5 sm:p-7"><div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-cini/5" aria-hidden /><div className="relative grid gap-5 lg:grid-cols-[1fr_380px] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.24em] text-kilim">Anadolu’nun ezgi ağı</p><h1 className="mt-2 font-serif text-4xl font-semibold text-ceviz sm:text-5xl">Türkü Soy Ağacı</h1><p className="mt-3 max-w-xl text-sm leading-6 text-ceviz-light">Bir eseri merkeze al; varyantlarını, ozan bağlarını, yöresini ve ortak temalarını canlı bir kültür grafiğinde keşfet.</p></div><div className="relative"><label htmlFor="soy-arama" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ceviz-light">Merkez eseri değiştir</label><input id="soy-arama" value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Türkü, yöre veya ozan ara…" className="min-h-12 w-full rounded-2xl border border-toprak/30 bg-white/80 px-4 text-sm shadow-sm outline-none focus:border-kilim focus:ring-2 focus:ring-kilim/15" />{sonuclar.length > 0 && <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-toprak/25 bg-parsomen shadow-2xl">{sonuclar.map((t) => <button key={t.slug} onClick={() => { merkezSec(t); setArama(""); }} className="block min-h-12 w-full border-b border-toprak/10 px-4 py-2 text-left last:border-0 hover:bg-toprak/10"><strong className="block truncate text-sm text-ceviz">{t.baslik}</strong><span className="text-xs text-ceviz-light">{t.yore}{t.ozan ? ` · ${t.ozan}` : ""}</span></button>)}</div>}</div></div></header>
    <div className="grid xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0 border-b border-toprak/20 xl:border-b-0 xl:border-r"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-toprak/15 bg-white/55 px-4 py-3"><div className="flex flex-wrap gap-2">{(Object.keys(ETIKET) as BagTuru[]).map((tur) => <button key={tur} onClick={() => filtreDegistir(tur)} aria-pressed={filtreler.includes(tur)} className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 ${filtreler.includes(tur) ? "border-transparent bg-ceviz text-white" : "border-toprak/25 bg-white/70 text-ceviz-light"}`}><span className="h-2.5 w-2.5 rounded-full ring-2 ring-white/20" style={{ background: RENK[tur] }} />{ETIKET[tur]}<span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${filtreler.includes(tur) ? "bg-white/12 text-white/75" : "bg-toprak/10 text-ceviz-light"}`}>{filtreSayilari[tur]}</span></button>)}</div><button onClick={rastgeleKesfet} className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-toprak/25 bg-white/80 px-4 text-xs font-semibold text-ceviz shadow-sm transition hover:-translate-y-0.5 hover:border-kilim/40 hover:text-kilim"><span className="text-base transition group-hover:rotate-180">✦</span> Rastgele keşfet</button></div>
        <div ref={alan} className="relative overflow-hidden bg-[radial-gradient(circle_at_center,rgba(211,155,91,.22),transparent_47%),linear-gradient(rgba(49,95,112,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(49,95,112,.04)_1px,transparent_1px)] bg-[size:auto,28px_28px,28px_28px]"><div className="pointer-events-none absolute left-4 top-4 z-10 rounded-2xl border border-toprak/15 bg-parsomen/80 px-3 py-2 text-[11px] leading-4 text-ceviz-light shadow-sm backdrop-blur"><strong className="block text-ceviz">Dokunan türküler</strong>Kalın iplik, daha güçlü bağı gösterir.</div><ForceGraph2D width={boyut.width} height={boyut.height} graphData={graphData} backgroundColor="rgba(0,0,0,0)" nodeRelSize={6} nodeCanvasObject={dugumCiz} nodePointerAreaPaint={(node: object, color: string, ctx: CanvasRenderingContext2D) => { const n = node as Dugum; const alan = n.merkez ? 32 : oneCikanlar.has(n.id) ? 24 : 16; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(n.x ?? 0, n.y ?? 0, alan, 0, Math.PI * 2); ctx.fill(); }} linkColor={(link: object) => { const bag = link as GrafikBagi; return `${RENK[bag.tur]}${bag.ikincil ? "42" : "aa"}`; }} linkWidth={(link: object) => { const bag = link as GrafikBagi; return bag.ikincil ? 0.7 : Math.min(4.2, 0.8 + bag.puan / 6); }} linkCurvature={(link: object) => (link as GrafikBagi).curve} linkDirectionalParticles={(link: object) => { const bag = link as GrafikBagi; const hedef = typeof bag.target === "string" ? bag.target : bag.target.id; return bag.ikincil ? 0 : hover === hedef ? 3 : 1; }} linkDirectionalParticleWidth={() => hover ? 2.8 : 1.6} linkDirectionalParticleSpeed={0.0025} cooldownTicks={0} warmupTicks={0} onNodeHover={(n: object | null) => setHover((n as Dugum | null)?.id ?? null)} onNodeClick={(n: object) => merkezSec(n as Dugum)} nodeLabel={(n: object) => { const d = n as Dugum; const bag = baglar.find((b) => b.turku.slug === d.id); return `${d.baslik} — ${d.yore}${d.ozan ? ` · ${d.ozan}` : ""}${bag ? ` · ${bag.nedenler.join(" · ")}` : ""}`; }} enableNodeDrag enableZoomInteraction enablePanInteraction /></div>
        <div className="border-t border-toprak/15 bg-white/55 px-4 py-3"><div className="flex items-center justify-between gap-4 text-xs text-ceviz-light"><span>{baglar.length} güçlü ilişki · {graphData.links.filter((x) => x.ikincil).length} komşu bağı</span><span className="hidden sm:inline">Sürükle · tekerlekle yakınlaş · düğüme tıkla</span></div><div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Keşif rotası"><span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-kilim">Keşif rotan</span>{kesifRotasi.map((turku, i) => <button key={turku.slug} onClick={() => merkezSec(turku)} className="inline-flex min-h-8 shrink-0 items-center gap-2 rounded-full border border-toprak/20 bg-parsomen px-3 text-[11px] font-medium text-ceviz transition hover:border-kilim/40"><span className="text-toprak">{i + 1}</span>{kisalt(turku.baslik, 22)}</button>)}</div></div>
      </section>
      <aside className="relative min-w-0 overflow-hidden bg-ceviz p-4 text-parsomen sm:p-5"><div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rotate-45 border border-toprak/20" /><div className="relative min-w-0"><div className="mb-5 grid h-16 w-16 rotate-45 place-items-center rounded-2xl border border-toprak/40 bg-toprak/10 shadow-inner"><span className="-rotate-45 font-serif text-2xl font-bold text-toprak-light">{secili.baslik.charAt(0)}</span></div><p className="text-xs font-semibold uppercase tracking-[.2em] text-toprak-light">Merkez eser</p><h2 className="mt-3 font-serif text-3xl font-semibold leading-tight">{secili.baslik}</h2><p className="mt-2 text-sm text-parsomen/60">{secili.yore}{secili.ozan ? ` · ${secili.ozan}` : ""}</p><div className="mt-5 flex flex-wrap gap-2">{secili.etiketler.slice(0, 4).map((x) => <span key={x} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-parsomen/70">{x}</span>)}</div><div className="mt-5 min-w-0 overflow-hidden rounded-2xl border border-toprak/25 bg-parsomen p-3 text-ceviz shadow-xl"><div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-kilim">Düğüm önizlemesi</p><p className="mt-1 text-sm font-semibold">30 saniyelik kaydı dinle</p></div><span className="grid h-9 w-9 place-items-center rounded-full bg-spotify/10 text-lg text-spotify">♪</span></div><OnizlemeCalar key={secili.slug} sorgu={`${secili.baslik} ${secili.ozan ?? "türkü"}`} baslik={secili.baslik} yore={secili.yore} ozan={secili.ozan ?? undefined} kompakt /></div><div className="mt-5 rounded-2xl border border-toprak/20 bg-white/5 p-4"><div className="flex items-center justify-between text-xs"><strong className="text-parsomen">Günün keşif görevi</strong><span className="text-toprak-light">{Math.min(toplamKesif, 5)}/5</span></div><p className="mt-1 text-[11px] leading-4 text-parsomen/50">Beş farklı ezginin izini sür ve motifini tamamla.</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-toprak to-kilim transition-all duration-700" style={{ width: `${Math.min(100, toplamKesif * 20)}%` }} /></div></div><Link href={`/turku/${secili.slug}`} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-parsomen px-4 text-sm font-semibold text-ceviz shadow-lg transition hover:-translate-y-0.5 hover:bg-white">Türkü sayfasını aç →</Link><div className="mt-7 border-t border-white/10 pt-6"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">En güçlü bağlar</h3><span className="text-xs text-parsomen/40">bağ gücü</span></div><ol className="mt-3 space-y-1">{baglar.slice(0, 7).map((b) => <li key={b.turku.slug}><button onClick={() => merkezSec(b.turku)} className="group flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left transition hover:translate-x-1 hover:bg-white/5"><span className="grid h-9 w-9 shrink-0 rotate-45 place-items-center rounded-lg border border-white/10 text-xs font-bold text-white" style={{ background: RENK[b.turler[0] ?? "tema"] }}><span className="-rotate-45">{b.turku.baslik.charAt(0)}</span></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-white/90">{b.turku.baslik}</span><span className="block truncate text-[11px] text-parsomen/45">{b.nedenler.join(" · ")}</span></span><span className="rounded-full bg-white/5 px-2 py-1 text-xs font-semibold text-toprak-light">{b.puan}</span></button></li>)}</ol></div></div></aside>
    </div>
    <footer className="border-t border-toprak/20 bg-parsomen-dark/30 px-5 py-3 text-xs leading-5 text-ceviz-light">İlişkiler arşivdeki yöre, ozan, alternatif ad ve tema alanlarından hesaplanır. Grafik keşif aracıdır; tek başına müzikolojik akrabalık kanıtı sayılmaz.</footer>
  </div>;
}
