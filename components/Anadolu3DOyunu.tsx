"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OyunTurkusu } from "./OyunMerkezi";

interface TurSorusu {
  turku: OyunTurkusu;
  secenekler: string[];
}

const KONUMLAR: Array<[number, number, number]> = [
  [-2.15, 0.85, 0], [2.15, 0.85, 0], [-2.15, -1.05, 0], [2.15, -1.05, 0],
];

function karistir<T>(dizi: T[]): T[] {
  const sonuc = [...dizi];
  for (let i = sonuc.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sonuc[i], sonuc[j]] = [sonuc[j], sonuc[i]];
  }
  return sonuc;
}

function soruUret(turkuler: OyunTurkusu[]): TurSorusu {
  const turku = turkuler[Math.floor(Math.random() * turkuler.length)];
  const iller = Array.from(new Set(turkuler.map((eser) => eser.il).filter((il) => il !== turku.il)));
  return { turku, secenekler: karistir([turku.il, ...karistir(iller).slice(0, 3)]) };
}

function yaziDokusu(metin: string, vurgu: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 280;
  const ctx = canvas.getContext("2d")!;
  const gradyan = ctx.createLinearGradient(0, 0, 640, 280);
  gradyan.addColorStop(0, "#f4ead8");
  gradyan.addColorStop(1, "#dfc7a4");
  ctx.fillStyle = gradyan;
  ctx.fillRect(0, 0, 640, 280);
  ctx.strokeStyle = vurgu;
  ctx.lineWidth = 12;
  ctx.strokeRect(18, 18, 604, 244);
  ctx.strokeStyle = `${vurgu}55`;
  ctx.lineWidth = 3;
  for (let x = 42; x < 620; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 28); ctx.lineTo(x + 24, 52); ctx.lineTo(x, 76); ctx.lineTo(x - 24, 52); ctx.closePath(); ctx.stroke();
  }
  ctx.fillStyle = "#30241b";
  ctx.font = "700 48px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const yazilar = metin.length > 18 ? [metin.slice(0, 18), metin.slice(18)] : [metin];
  yazilar.forEach((satir, i) => ctx.fillText(satir.trim(), 320, 145 + (i - (yazilar.length - 1) / 2) * 55));
  const doku = new THREE.CanvasTexture(canvas);
  doku.colorSpace = THREE.SRGBColorSpace;
  doku.anisotropy = 4;
  return doku;
}

function SecimTasi({ metin, konum, durum, onSec }: { metin: string; konum: [number, number, number]; durum: "bos" | "dogru" | "yanlis"; onSec: () => void }) {
  const grup = useRef<THREE.Group>(null!);
  const [uzerinde, setUzerinde] = useState(false);
  const renk = durum === "dogru" ? "#39725a" : durum === "yanlis" ? "#a33429" : "#a76238";
  const doku = useMemo(() => yaziDokusu(metin, renk), [metin, renk]);

  useEffect(() => () => doku.dispose(), [doku]);
  useFrame((state, delta) => {
    if (!grup.current) return;
    grup.current.position.y = konum[1] + Math.sin(state.clock.elapsedTime * 1.4 + konum[0]) * 0.08;
    grup.current.rotation.y = THREE.MathUtils.damp(grup.current.rotation.y, uzerinde ? -0.08 : 0, 7, delta);
    const hedef = uzerinde ? 1.06 : 1;
    grup.current.scale.setScalar(THREE.MathUtils.damp(grup.current.scale.x, hedef, 8, delta));
  });

  return (
    <group ref={grup} position={konum} onClick={(olay) => { olay.stopPropagation(); onSec(); }} onPointerOver={(olay) => { olay.stopPropagation(); setUzerinde(true); document.body.style.cursor = "pointer"; }} onPointerOut={() => { setUzerinde(false); document.body.style.cursor = "auto"; }}>
      <mesh castShadow>
        <boxGeometry args={[3.25, 1.15, 0.22]} />
        <meshStandardMaterial color={renk} roughness={0.58} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.121]}>
        <planeGeometry args={[3.02, 0.92]} />
        <meshBasicMaterial map={doku} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Sahne({ soru, secilen, cevapla }: { soru: TurSorusu; secilen: string | null; cevapla: (il: string) => void }) {
  const dunya = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (dunya.current) dunya.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.035;
  });
  return (
    <>
      <color attach="background" args={["#17120f"]} />
      <fog attach="fog" args={["#17120f", 8, 17]} />
      <ambientLight intensity={1.1} />
      <directionalLight castShadow position={[4, 7, 6]} intensity={2.4} color="#ffe0a5" shadow-mapSize={[512, 512]} />
      <pointLight position={[-5, -2, 4]} intensity={18} distance={12} color="#286783" />
      <group ref={dunya}>
        {soru.secenekler.map((il, indeks) => <SecimTasi key={il} metin={il} konum={KONUMLAR[indeks]} durum={!secilen ? "bos" : il === soru.turku.il ? "dogru" : il === secilen ? "yanlis" : "bos"} onSec={() => cevapla(il)} />)}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, -0.3]}><circleGeometry args={[6.7, 64]} /><meshStandardMaterial color="#302419" roughness={0.92} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.83, -0.28]}><ringGeometry args={[3.5, 4.5, 8]} /><meshBasicMaterial color="#9e5b35" transparent opacity={0.22} /></mesh>
      </group>
    </>
  );
}

export function Anadolu3DOyunu({ turkuler, puanEkle }: { turkuler: OyunTurkusu[]; puanEkle: React.Dispatch<React.SetStateAction<number>> }) {
  const [soru, setSoru] = useState(() => soruUret(turkuler));
  const [secilen, setSecilen] = useState<string | null>(null);
  const [puan, setPuan] = useState(0);
  const [seri, setSeri] = useState(0);
  const [sure, setSure] = useState(45);
  const [bitti, setBitti] = useState(false);

  useEffect(() => {
    if (bitti) return;
    const sayac = window.setInterval(() => setSure((deger) => {
      if (deger <= 1) { setBitti(true); return 0; }
      return deger - 1;
    }), 1000);
    return () => window.clearInterval(sayac);
  }, [bitti]);

  function cevapla(il: string) {
    if (secilen || bitti) return;
    setSecilen(il);
    const dogru = il === soru.turku.il;
    if (dogru) {
      const artis = 120 + Math.min(seri, 5) * 20;
      setPuan((deger) => deger + artis);
      puanEkle((deger) => deger + artis);
      setSeri((deger) => deger + 1);
    } else setSeri(0);
    window.setTimeout(() => {
      setSoru(soruUret(turkuler));
      setSecilen(null);
    }, 850);
  }

  function yenidenBasla() {
    setSoru(soruUret(turkuler)); setSecilen(null); setPuan(0); setSeri(0); setSure(45); setBitti(false);
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-toprak/25 bg-[#17120f] shadow-[0_28px_70px_rgba(30,20,14,.28)]">
      <div className="relative h-[600px] min-h-[70vh] sm:h-[680px]">
        <Canvas dpr={[1, 1.5]} shadows camera={{ position: [0, 0.15, 8.1], fov: 44 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <Sahne soru={soru} secilen={secilen} cevapla={cevapla} />
        </Canvas>

        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 via-black/35 to-transparent p-5 text-white sm:p-7">
          <div className="mx-auto flex max-w-4xl items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-toprak-light">Anadolu Atlası · 3B</p><h2 className="mt-2 max-w-2xl font-serif text-2xl font-semibold sm:text-4xl">{soru.turku.baslik}</h2><p className="mt-1 text-sm text-white/60">Türküyü doğru şehir kapısına gönder.</p></div>
            <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 font-mono text-xl font-bold ${sure <= 10 ? "border-kilim bg-kilim/20 text-[#ffb5a9]" : "border-toprak/50 bg-black/30"}`}>{sure}</div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <div className="mx-auto flex max-w-4xl items-center justify-between rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-white backdrop-blur-md"><span><strong className="font-serif text-2xl">{puan}</strong><small className="ml-2 text-white/50">puan</small></span><span className="text-sm text-toprak-light">{seri > 1 ? `${seri} doğru seri · bonus aktif` : "Taşlara dokun veya aşağıdan seç"}</span></div>
        </div>

        {bitti && <div className="absolute inset-0 grid place-items-center bg-black/75 p-5 text-center text-white backdrop-blur-sm"><div className="max-w-md rounded-3xl border border-white/15 bg-ceviz/90 p-8 shadow-2xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-toprak-light">Sefer tamamlandı</p><h3 className="mt-3 font-serif text-4xl font-semibold">{puan} puan</h3><p className="mt-3 text-white/65">Anadolu şehir kapılarında {seri} cevaplık son seriyle yolculuğu tamamladın.</p><button onClick={yenidenBasla} className="mt-6 rounded-xl bg-kilim px-6 py-3 font-semibold text-white">Yeniden oyna</button></div></div>}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/10 bg-[#211914] p-3 sm:grid-cols-4" aria-label="Klavye ve ekran okuyucu için şehir seçenekleri">
        {soru.secenekler.map((il) => <button key={il} onClick={() => cevapla(il)} disabled={Boolean(secilen) || bitti} className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-parsomen transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-toprak-light disabled:opacity-50">{il}</button>)}
      </div>
    </section>
  );
}
