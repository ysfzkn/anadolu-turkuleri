"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tarayiciSupabase } from "@/lib/supabase/client";

const TURLER = [
  ["hikaye", "Türkünün hikâyesi"], ["soz-varyanti", "Yöresel söz varyantı"],
  ["kaynak-bilgisi", "Kaynak kişi veya derleme bilgisi"], ["fotograf", "Eski fotoğraf veya belge"],
  ["ses-kaydi", "Sesli anlatı veya yerel söyleyiş"], ["duzeltme", "Mevcut kayda düzeltme"],
] as const;

export function HafizaKatkiFormu({ turkuSlug, varsayilanIl = "" }: { turkuSlug?: string; varsayilanIl?: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [tur, setTur] = useState("hikaye");
  const [il, setIl] = useState(varsayilanIl.split(/[(/]/)[0].trim());
  const [yer, setYer] = useState("");
  const [kaynakKisi, setKaynakKisi] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [dosya, setDosya] = useState<File | null>(null);
  const [yayinIzni, setYayinIzni] = useState(false);
  const [kaynakOnayi, setKaynakOnayi] = useState(false);
  const [atifAdi, setAtifAdi] = useState("");
  const [sonuc, setSonuc] = useState<{ tur: "basari" | "hata"; metin: string } | null>(null);

  useEffect(() => {
    try {
      void tarayiciSupabase().auth.getUser().then(({ data }) => { setUserId(data.user?.id ?? null); setYukleniyor(false); });
    } catch { setYukleniyor(false); }
  }, []);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || aciklama.trim().length < 40 || !il.trim() || !yayinIzni) return;
    setGonderiliyor(true); setSonuc(null);
    const supabase = tarayiciSupabase();
    let dosyaYolu: string | null = null;
    try {
      if (dosya) {
        const uzanti = dosya.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
        dosyaYolu = `${userId}/${crypto.randomUUID()}.${uzanti}`;
        const { error } = await supabase.storage.from("hafiza-katkilari").upload(dosyaYolu, dosya, { contentType: dosya.type, upsert: false });
        if (error) throw error;
      }
      const { error } = await supabase.from("hafiza_katkilari").insert({
        kullanici_id: userId, turku_slug: turkuSlug ?? null, katki_turu: tur,
        il: il.trim(), ilce_koy: yer.trim() || null, kaynak_kisi: kaynakKisi.trim() || null,
        aciklama: aciklama.trim(), dosya_yolu: dosyaYolu, yayin_izni: yayinIzni,
        kaynak_onayi: kaynakOnayi, atif_adi: atifAdi.trim() || null,
      });
      if (error) throw error;
      setAciklama(""); setYer(""); setKaynakKisi(""); setDosya(null);
      setSonuc({ tur: "basari", metin: "Katkın inceleme kuyruğuna alındı. Kaynağı doğrulandıktan sonra arşivde yayımlanacak." });
    } catch {
      if (dosyaYolu) await supabase.storage.from("hafiza-katkilari").remove([dosyaYolu]);
      setSonuc({ tur: "hata", metin: "Katkı gönderilemedi. Veritabanı migration’ının çalıştığını ve dosyanın 10 MB’tan küçük olduğunu kontrol et." });
    } finally { setGonderiliyor(false); }
  }

  if (yukleniyor) return <div className="h-48 animate-pulse rounded-3xl bg-toprak/10" aria-hidden />;
  if (!userId) return <div className="rounded-3xl border border-toprak/25 bg-white/45 p-6 text-center"><h2 className="font-serif text-2xl font-semibold text-ceviz">Hafızaya katkı ver</h2><p className="mt-2 text-sm text-ceviz-light">Kaynak güvenliği ve katkını takip edebilmen için giriş yapmalısın.</p><Link href="/giris" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-kilim px-5 font-semibold text-white">Giriş yap</Link></div>;

  return <form onSubmit={gonder} className="rounded-3xl border border-toprak/25 bg-white/55 p-5 shadow-motif sm:p-7">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold text-ceviz">Katkı türü<select value={tur} onChange={(e) => setTur(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-toprak/30 bg-parsomen px-3 font-normal"><>{TURLER.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</></select></label>
      <label className="text-sm font-semibold text-ceviz">İl<input required value={il} onChange={(e) => setIl(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-toprak/30 bg-parsomen px-3 font-normal" placeholder="Sivas" /></label>
      <label className="text-sm font-semibold text-ceviz">İlçe, köy veya mahalle <span className="font-normal text-ceviz-light">(isteğe bağlı)</span><input value={yer} onChange={(e) => setYer(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-toprak/30 bg-parsomen px-3 font-normal" /></label>
      <label className="text-sm font-semibold text-ceviz">Kaynak kişi <span className="font-normal text-ceviz-light">(isteğe bağlı)</span><input value={kaynakKisi} onChange={(e) => setKaynakKisi(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-toprak/30 bg-parsomen px-3 font-normal" placeholder="Anlatan kişinin adı ve yakınlığı" /></label>
    </div>
    <label className="mt-4 block text-sm font-semibold text-ceviz">Anlatı veya açıklama<textarea required minLength={40} maxLength={5000} value={aciklama} onChange={(e) => setAciklama(e.target.value)} rows={7} className="mt-2 w-full rounded-2xl border border-toprak/30 bg-parsomen p-4 font-normal leading-6" placeholder="Bildiğin hikâyeyi, söz farkını veya düzeltmenin dayanağını mümkün olduğunca ayrıntılı anlat…" /><span className="mt-1 block text-right text-xs font-normal text-ceviz-light">{aciklama.length}/5000 · en az 40 karakter</span></label>
    <label className="mt-4 block rounded-2xl border border-dashed border-toprak/40 bg-parsomen-dark/35 p-4 text-sm font-semibold text-ceviz">Fotoğraf, belge veya ses kaydı <span className="font-normal text-ceviz-light">(isteğe bağlı, en çok 10 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/mp4,audio/webm,audio/wav" onChange={(e) => setDosya(e.target.files?.[0] ?? null)} className="mt-3 block w-full text-xs font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-ceviz file:px-3 file:py-2 file:text-white" /></label>
    <div className="mt-4 rounded-2xl border border-toprak/25 bg-white/45 p-4"><label className="block text-sm font-semibold text-ceviz">Yayında nasıl anılmak istersin?<input value={atifAdi} onChange={(e)=>setAtifAdi(e.target.value)} placeholder="Adın, kullanıcı adın veya ‘Anonim katkıcı’" className="mt-2 min-h-11 w-full rounded-xl border border-toprak/30 bg-parsomen px-3 font-normal"/></label><label className="mt-4 flex gap-3 text-sm leading-6 text-ceviz"><input type="checkbox" checked={kaynakOnayi} onChange={(e)=>setKaynakOnayi(e.target.checked)} className="mt-1 h-5 w-5 accent-kilim"/><span>Adını verdiğim kaynak kişinin bu anlatının kaynağı olduğunu ve bilgiyi doğru aktardığımı beyan ederim.</span></label><label className="mt-3 flex gap-3 text-sm leading-6 text-ceviz"><input required type="checkbox" checked={yayinIzni} onChange={(e)=>setYayinIzni(e.target.checked)} className="mt-1 h-5 w-5 accent-kilim"/><span>Gönderdiğim materyalin editoryal inceleme, arşivleme ve kaynak gösterilerek yayımlanmasına izin veriyorum. Başkasına ait telifli kayıt yüklemediğimi kabul ediyorum. <Link href="/katki-kosullari" target="_blank" className="text-cini-dark underline">Katkı koşulları</Link></span></label></div>
    {sonuc && <div role={sonuc.tur === "hata" ? "alert" : "status"} className={`mt-4 rounded-xl border p-3 text-sm ${sonuc.tur === "basari" ? "border-[#3f7a62]/25 bg-[#3f7a62]/10 text-[#28523f]" : "border-kilim/25 bg-kilim/5 text-kilim-dark"}`}>{sonuc.metin}</div>}
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-lg text-xs leading-5 text-ceviz-light">Katkın otomatik yayımlanmaz; kaynak ve hak kontrolünden geçer. Durumunu “Katkılarım” sayfasından izleyebilirsin.</p><button disabled={gonderiliyor || aciklama.trim().length < 40 || !il.trim() || !yayinIzni} className="min-h-12 shrink-0 rounded-xl bg-kilim px-6 font-semibold text-white disabled:opacity-50">{gonderiliyor ? "Gönderiliyor…" : "Katkıyı gönder"}</button></div>
  </form>;
}
