"use client";

import { useEffect, useMemo, useState } from "react";
import type { RealtimeChannel, User } from "@supabase/supabase-js";
import { tarayiciSupabase } from "@/lib/supabase/client";
import type { OyunTurkusu } from "@/components/OyunMerkezi";

interface CanliSoru { soru: string; cevap: string; secenekler: string[] }
interface Oda { id: string; kod: string; kurucu_id: string; rakip_id: string | null; durum: "bekliyor" | "oyunda" | "bitti"; eslesme_tipi?: "davet" | "rastgele"; sorular: CanliSoru[]; kurucu_skor: number; rakip_skor: number; kurucu_tur: number; rakip_tur: number }

function karistir<T>(dizi: T[]): T[] { return [...dizi].sort(() => Math.random() - 0.5); }
function kodUret(): string { return Math.random().toString(36).slice(2, 8).toLocaleUpperCase("tr-TR"); }
function soruSeti(turkuler: OyunTurkusu[]): CanliSoru[] { const iller = Array.from(new Set(turkuler.map((t) => t.il))); return karistir(turkuler).slice(0, 8).map((t) => ({ soru: `${t.baslik} hangi yöreye aittir?`, cevap: t.il, secenekler: karistir([t.il, ...karistir(iller.filter((x) => x !== t.il)).slice(0, 3)]) })); }

export function CanliMeydan({ turkuler }: { turkuler: OyunTurkusu[] }) {
  const [user, setUser] = useState<User | null>(null); const [oda, setOda] = useState<Oda | null>(null); const [kod, setKod] = useState(""); const [mesaj, setMesaj] = useState("Oturum kontrol ediliyor…"); const [secilen, setSecilen] = useState<string | null>(null); const [liderler, setLiderler] = useState<Array<{ ad: string; puan: number }>>([]); const [eslesiyor, setEslesiyor] = useState(false);
  const supabase = useMemo(() => { try { return tarayiciSupabase(); } catch { return null; } }, []);

  useEffect(() => { if (!supabase) { setMesaj("Canlı oyun için Supabase kurulumu gerekiyor."); return; } void supabase.auth.getUser().then(({ data }) => { setUser(data.user); setMesaj(data.user ? "Davet kodu oluştur veya bir arkadaşının kodunu gir." : "Canlı yarışmak için önce giriş yapmalısın."); }); void supabase.from("oyun_skorlari").select("puan, profiller(kullanici_adi)").order("puan", { ascending: false }).limit(8).then(({ data }) => { setLiderler((data ?? []).map((x: any) => ({ ad: x.profiller?.kullanici_adi ?? "anonim", puan: x.puan }))); }); }, [supabase]);

  useEffect(() => { if (!supabase || !oda) return; let kanal: RealtimeChannel | null = supabase.channel(`oyun-${oda.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "oyun_odalari", filter: `id=eq.${oda.id}` }, (payload) => { setOda(payload.new as Oda); setSecilen(null); }).subscribe(); return () => { if (kanal) void supabase.removeChannel(kanal); }; }, [supabase, oda?.id]);

  useEffect(() => {
    if (!supabase || !user || !oda || oda.durum !== "bitti") return;
    const kurucu = oda.kurucu_id === user.id;
    const puan = kurucu ? oda.kurucu_skor : oda.rakip_skor;
    void supabase.from("oyun_skorlari").upsert(
      { oda_id: oda.id, kullanici_id: user.id, oyun: "canli-meydan", puan },
      { onConflict: "oda_id,kullanici_id", ignoreDuplicates: true },
    );
  }, [supabase, user, oda]);

  async function olustur() { if (!supabase || !user) return; const yeniKod = kodUret(); const { data, error } = await supabase.from("oyun_odalari").insert({ kod: yeniKod, kurucu_id: user.id, eslesme_tipi: "davet", sorular: soruSeti(turkuler) }).select().single(); if (error) { setMesaj("Canlı oyun şu anda hazırlanıyor. Lütfen biraz sonra yeniden dene."); return; } setOda(data as Oda); setMesaj("Kod hazır. Arkadaşın katıldığında yarışma başlayacak."); }
  async function katil() { if (!supabase || !user || !kod.trim()) return; const { data } = await supabase.from("oyun_odalari").select("*").eq("kod", kod.trim().toUpperCase()).eq("durum", "bekliyor").maybeSingle(); if (!data) { setMesaj("Bu kodla bekleyen bir oda bulunamadı."); return; } if (data.kurucu_id === user.id) { setOda(data as Oda); return; } const { data: guncel, error } = await supabase.from("oyun_odalari").update({ rakip_id: user.id, durum: "oyunda" }).eq("id", data.id).is("rakip_id", null).select().single(); if (error) { setMesaj("Odaya katılınamadı; başka bir oyuncu senden önce davranmış olabilir."); return; } setOda(guncel as Oda); }

  async function rastgeleKatil() {
    if (!supabase || !user || eslesiyor) return;
    setEslesiyor(true); setMesaj("Sana uygun bir rakip aranıyor…");
    const onDakikaOnce = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: bekleyenler } = await supabase.from("oyun_odalari").select("*").eq("durum", "bekliyor").eq("eslesme_tipi", "rastgele").neq("kurucu_id", user.id).gte("olusturulma", onDakikaOnce).order("olusturulma", { ascending: true }).limit(1);
    const bekleyen = bekleyenler?.[0] as Oda | undefined;
    if (bekleyen) {
      const { data: eslesen, error } = await supabase.from("oyun_odalari").update({ rakip_id: user.id, durum: "oyunda" }).eq("id", bekleyen.id).is("rakip_id", null).eq("durum", "bekliyor").select().maybeSingle();
      if (!error && eslesen) { setOda(eslesen as Oda); setEslesiyor(false); return; }
    }
    const { data, error } = await supabase.from("oyun_odalari").insert({ kod: kodUret(), kurucu_id: user.id, eslesme_tipi: "rastgele", sorular: soruSeti(turkuler) }).select().single();
    setEslesiyor(false);
    if (error) { setMesaj("Rastgele eşleşme şu anda kullanılamıyor. Lütfen biraz sonra yeniden dene."); return; }
    setOda(data as Oda); setMesaj("Kuyruktasın; bir rakip geldiğinde oyun otomatik başlayacak.");
  }

  async function beklemeyiIptalEt() { if (!supabase || !oda || oda.durum !== "bekliyor") return; await supabase.from("oyun_odalari").delete().eq("id", oda.id); setOda(null); setMesaj("Eşleşme iptal edildi."); }

  async function cevapla(cevap: string) { if (!supabase || !user || !oda || secilen) return; setSecilen(cevap); const kurucu = oda.kurucu_id === user.id; const tur = kurucu ? oda.kurucu_tur : oda.rakip_tur; const dogru = cevap === oda.sorular[tur]?.cevap; const yeniTur = tur + 1; const alanlar = kurucu ? { kurucu_tur: yeniTur, kurucu_skor: oda.kurucu_skor + (dogru ? 100 : 0) } : { rakip_tur: yeniTur, rakip_skor: oda.rakip_skor + (dogru ? 100 : 0) }; const bitti = yeniTur >= oda.sorular.length && (kurucu ? oda.rakip_tur : oda.kurucu_tur) >= oda.sorular.length; await supabase.from("oyun_odalari").update({ ...alanlar, ...(bitti ? { durum: "bitti" } : {}) }).eq("id", oda.id); }

  if (!oda) return <div className="grid gap-5 lg:grid-cols-[1fr_320px]"><section className="overflow-hidden rounded-3xl border border-toprak/25 bg-white/50 shadow-motif"><div className="relative bg-gradient-to-br from-cini-dark to-ceviz p-6 text-white"><span className="oyun-radar absolute right-8 top-7 h-20 w-20 rounded-full border border-white/20" aria-hidden /><p className="text-xs font-semibold uppercase tracking-[.18em] text-toprak-light">Canlı eşleşme</p><h2 className="mt-1 font-serif text-3xl font-semibold">Meydana nasıl çıkacaksın?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Rastgele bir kültür meraklısıyla hemen eşleş veya arkadaşına özel bir meydan kur.</p></div><div className="grid gap-3 p-5 sm:grid-cols-2"><button onClick={rastgeleKatil} disabled={!user || eslesiyor} className="group relative min-h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-kilim to-kilim-dark p-5 text-left text-white shadow-sm transition hover:-translate-y-1 disabled:opacity-40"><span className="text-3xl" aria-hidden>⚡</span><span className="mt-3 block font-serif text-xl font-semibold">{eslesiyor ? "Rakip aranıyor…" : "Rastgele oyuna katıl"}</span><span className="mt-1 block text-xs text-white/70">Bekleyen ilk oyuncuyla eşleş</span></button><button onClick={olustur} disabled={!user} className="group min-h-32 rounded-2xl border border-toprak/25 bg-parsomen p-5 text-left transition hover:-translate-y-1 hover:border-cini/40 disabled:opacity-40"><span className="text-3xl" aria-hidden>⌘</span><span className="mt-3 block font-serif text-xl font-semibold text-ceviz">Davet kodu oluştur</span><span className="mt-1 block text-xs text-ceviz-light">Arkadaşına özel altı haneli kod</span></button><div className="flex min-h-14 rounded-2xl border border-toprak/30 bg-parsomen p-1 sm:col-span-2"><input value={kod} onChange={(e) => setKod(e.target.value.toUpperCase())} maxLength={6} placeholder="Arkadaşının 6 haneli kodu" className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold uppercase outline-none" /><button onClick={katil} disabled={!user} className="rounded-xl bg-cini px-5 text-sm font-semibold text-white disabled:opacity-40">Koda katıl</button></div><p className="rounded-xl bg-parsomen-dark/50 p-3 text-sm text-ceviz-light sm:col-span-2">{mesaj}</p></div></section><Liderlik liderler={liderler} /></div>;

  const kurucu = user?.id === oda.kurucu_id; const tur = kurucu ? oda.kurucu_tur : oda.rakip_tur; const benimSkor = kurucu ? oda.kurucu_skor : oda.rakip_skor; const rakipSkor = kurucu ? oda.rakip_skor : oda.kurucu_skor; const soru = oda.sorular[tur];
  if (oda.durum === "bekliyor") return <div className="relative overflow-hidden rounded-3xl border border-toprak/25 bg-gradient-to-br from-ceviz to-cini-dark p-8 text-center text-white shadow-motif"><div className="oyun-eslesme-dalga mx-auto grid h-36 w-36 place-items-center rounded-full border border-white/25"><span className="grid h-20 w-20 place-items-center rounded-full bg-white/10 text-4xl">⚔</span></div><p className="mt-6 text-xs font-semibold uppercase tracking-[.2em] text-toprak-light">{oda.eslesme_tipi === "rastgele" ? "Rastgele rakip aranıyor" : "Davet kodun"}</p>{oda.eslesme_tipi !== "rastgele" && <p className="my-4 font-mono text-5xl font-bold tracking-[.18em]">{oda.kod}</p>}<p className="mt-2 text-white/70">Rakip geldiğinde oyun otomatik başlayacak. Bu sayfayı açık tut.</p><button onClick={beklemeyiIptalEt} className="mt-6 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10">Beklemeyi iptal et</button></div>;
  if (oda.durum === "bitti" || !soru) return <div className="rounded-3xl border border-toprak/25 bg-white/55 p-8 text-center shadow-motif"><p className="text-xs font-semibold uppercase tracking-wider text-ceviz-light">Meydan sonucu</p><h2 className="mt-3 font-serif text-4xl font-semibold text-ceviz">{benimSkor > rakipSkor ? "Meydan senin!" : benimSkor === rakipSkor ? "Dostça beraberlik" : "Rövanşa hazır ol"}</h2><div className="mx-auto mt-7 flex max-w-sm items-center justify-center gap-7"><Skor ad="Sen" puan={benimSkor} /><span className="text-ceviz-light">—</span><Skor ad="Rakip" puan={rakipSkor} /></div><button onClick={() => setOda(null)} className="mt-8 rounded-xl bg-kilim px-6 py-3 font-semibold text-white">Yeni meydan</button></div>;
  return <div className="rounded-3xl border border-toprak/25 bg-white/55 p-5 shadow-motif sm:p-7"><div className="flex items-center justify-between"><Skor ad="Sen" puan={benimSkor} /><div className="text-center"><p className="text-xs text-ceviz-light">Soru</p><p className="font-serif text-xl font-semibold">{Math.min(tur + 1, oda.sorular.length)}/{oda.sorular.length}</p></div><Skor ad="Rakip" puan={rakipSkor} /></div><div className="my-6 h-2 overflow-hidden rounded-full bg-toprak/15"><div className="h-full bg-gradient-to-r from-kilim to-toprak transition-all" style={{ width: `${(tur / oda.sorular.length) * 100}%` }} /></div><h2 className="font-serif text-2xl font-semibold text-ceviz">{soru.soru}</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{soru.secenekler.map((s) => <button key={s} onClick={() => cevapla(s)} disabled={Boolean(secilen)} className={`min-h-14 rounded-2xl border px-4 text-left font-semibold transition ${secilen === s ? s === soru.cevap ? "border-[#3f7a62] bg-[#3f7a62]/10" : "border-kilim bg-kilim/10" : "border-toprak/25 bg-parsomen hover:border-cini/40"}`}>{s}</button>)}</div></div>;
}

function Skor({ ad, puan }: { ad: string; puan: number }) { return <div className="text-center"><p className="font-serif text-3xl font-semibold text-ceviz">{puan}</p><p className="text-xs text-ceviz-light">{ad}</p></div>; }
function Liderlik({ liderler }: { liderler: Array<{ ad: string; puan: number }> }) { return <aside className="rounded-3xl border border-toprak/25 bg-ceviz p-5 text-parsomen shadow-motif"><p className="text-xs font-semibold uppercase tracking-[.18em] text-toprak-light">Liderlik tablosu</p><h3 className="mt-1 font-serif text-2xl font-semibold">Meydanın ustaları</h3><ol className="mt-5 space-y-2">{liderler.length ? liderler.map((l, i) => <li key={`${l.ad}-${i}`} className="flex items-center gap-3 rounded-xl bg-white/7 px-3 py-2.5"><span className="grid h-7 w-7 place-items-center rounded-full bg-toprak/20 text-xs font-bold">{i + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold">@{l.ad}</span><span className="text-sm text-toprak-light">{l.puan}</span></li>) : <li className="rounded-xl border border-white/10 p-4 text-sm text-parsomen/60">İlk meydanı sen kazan.</li>}</ol></aside>; }
