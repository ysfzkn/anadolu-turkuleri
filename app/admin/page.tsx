import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminKaydetButonu } from "@/components/AdminKaydetButonu";
import { sunucuSupabase } from "@/lib/supabase/server";
import { servisSupabase, yoneticiDogrula } from "@/lib/supabase/admin";
import {
  editorTurkusuKaydet,
  katkiDurumuGuncelle,
  kulturIcerigiKaydet,
  kullaniciRoluGuncelle,
} from "./actions";

export const metadata: Metadata = { title: "Editör Masası", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type SayfaProps = { searchParams: Promise<{ bildirim?: string; mesaj?: string }> };

export default async function AdminSayfasi({ searchParams }: SayfaProps) {
  const oturumDb = await sunucuSupabase();
  const { data: { user } } = await oturumDb.auth.getUser();
  if (!user) redirect("/giris?next=/admin");

  const yetki = await yoneticiDogrula();
  if (!yetki) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <section className="rounded-3xl border border-kilim/25 bg-white/55 p-7 text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-kilim">Erişim sınırlandı</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-ceviz">Bu alan editörlere açıktır.</h1>
          <p className="mt-3 leading-7 text-ceviz-light">Hesabınız açık; ancak editör veya admin rolünüz bulunmuyor.</p>
          <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-ceviz px-5 font-semibold text-parsomen">Ana sayfaya dön</Link>
        </section>
      </main>
    );
  }

  const db = servisSupabase();
  const [katkiSonucu, profilSonucu, turkuSonucu, icerikSonucu, authUsers] = await Promise.all([
    db.from("hafiza_katkilari").select("*").order("olusturulma", { ascending: false }).limit(80),
    db.from("profiller").select("id,kullanici_adi,gorunen_ad,rol,olusturulma").order("olusturulma", { ascending: false }).limit(100),
    db.from("editor_turkuler").select("slug,baslik,yore,durum,guncellenme").order("guncellenme", { ascending: false }).limit(100),
    db.from("kultur_icerikleri").select("id,tur,slug,baslik,il,durum,guncellenme").order("guncellenme", { ascending: false }).limit(100),
    yetki.profil.rol === "admin" ? db.auth.admin.listUsers({ page: 1, perPage: 100 }) : Promise.resolve({ data: { users: [] }, error: null }),
  ]);
  const sorguHatasi = [katkiSonucu.error, profilSonucu.error, turkuSonucu.error, icerikSonucu.error, authUsers.error].find(Boolean);
  const katkilar = katkiSonucu.data ?? [];
  const profiller = profilSonucu.data ?? [];
  const turkuler = turkuSonucu.data ?? [];
  const icerikler = icerikSonucu.data ?? [];
  const email = new Map((authUsers.data?.users ?? []).map((kayit) => [kayit.id, kayit.email]));
  const bildirim = await searchParams;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.22em] text-kilim">Güvenli yönetim alanı</p><h1 className="mt-2 font-serif text-4xl font-semibold text-ceviz">Editör Masası</h1><p className="mt-2 text-ceviz-light">Katkıları doğrulayın, kullanıcı rollerini ve yayın akışını yönetin.</p></div>
        <span className="rounded-full bg-ceviz px-4 py-2 text-sm font-semibold text-parsomen">{yetki.profil.rol}</span>
      </header>

      {bildirim.mesaj && <Bildirim tur={bildirim.bildirim === "basarili" ? "basarili" : "hata"}>{bildirim.mesaj}</Bildirim>}
      {sorguHatasi && <Bildirim tur="hata">Yönetim verilerinin bir bölümü alınamadı. Güncel Supabase migration dosyasını SQL Editor’da çalıştırın.</Bildirim>}

      <section className="mt-7 grid gap-3 sm:grid-cols-4">
        {[["Bekleyen katkı", katkilar.filter((katki) => katki.durum === "bekliyor").length], ["Kullanıcı", profiller.length], ["Editör türküsü", turkuler.length], ["Kültür içeriği", icerikler.length]].map(([ad, sayi]) => (
          <div key={ad} className="rounded-2xl border border-toprak/20 bg-white/50 p-4"><strong className="block font-serif text-3xl text-ceviz">{sayi}</strong><span className="text-sm text-ceviz-light">{ad}</span></div>
        ))}
      </section>

      <AdminBaslik id="katkilar" baslik="Katkı kuyruğu" aciklama="Kaynağı, yayın iznini ve ekli materyali kontrol etmeden onaylamayın." />
      <div className="space-y-3">
        {katkilar.length === 0 && <BosDurum>Henüz incelenecek katkı bulunmuyor.</BosDurum>}
        {katkilar.map((katki) => (
          <article key={katki.id} className="rounded-2xl border border-toprak/25 bg-white/55 p-4">
            <div className="flex flex-wrap justify-between gap-2"><div><strong className="text-ceviz">{katki.katki_turu} · {katki.il}</strong><p className="text-xs text-ceviz-light">{katki.turku_slug || "Genel arşiv"} · {new Date(katki.olusturulma).toLocaleDateString("tr-TR")}</p></div><span className="rounded-full bg-toprak/10 px-3 py-1 text-xs">{katki.durum}</span></div>
            <p className="mt-3 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-ceviz-light">{katki.aciklama}</p>
            <p className="mt-2 text-xs">Yayın izni: <b>{katki.yayin_izni ? "Var" : "Yok"}</b> · Kaynak onayı: <b>{katki.kaynak_onayi ? "Var" : "Yok"}</b>{katki.kaynak_kisi ? ` · Kaynak: ${katki.kaynak_kisi}` : ""}</p>
            {katki.dosya_yolu && <a href={`/api/admin/katki-dosyasi/${katki.id}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-cini-dark underline">Ekli materyali güvenli bağlantıyla aç ↗</a>}
            <form action={katkiDurumuGuncelle} className="mt-3 grid gap-2 sm:grid-cols-[180px_1fr_auto]">
              <input type="hidden" name="id" value={katki.id} />
              <select name="durum" defaultValue={katki.durum} className="admin-input"><option value="bekliyor">Bekliyor</option><option value="inceleniyor">İnceleniyor</option><option value="onaylandi" disabled={!katki.yayin_izni}>Onaylandı</option><option value="reddedildi">Reddedildi</option></select>
              <input name="editor_notu" defaultValue={katki.editor_notu ?? ""} placeholder="Editör notu veya gerekçe" className="admin-input" />
              <AdminKaydetButonu>Kaydet</AdminKaydetButonu>
            </form>
          </article>
        ))}
      </div>

      <AdminBaslik id="turkuler" baslik="Türkü ekle veya güncelle" aciklama="Her kayıt için doğrulanabilir kaynak ve özgün bir slug kullanın." />
      <form action={editorTurkusuKaydet} className="admin-form">
        <input name="baslik" required maxLength={180} placeholder="Türkü başlığı" className="admin-input" /><input name="yore" required maxLength={120} placeholder="Yöre" className="admin-input" /><input name="slug" maxLength={180} placeholder="Slug (boşsa otomatik)" className="admin-input" /><DurumSecimi />
        <input name="ozan" placeholder="Ozan" className="admin-input" /><input name="soz_yazari" placeholder="Söz yazarı" className="admin-input" /><input name="derleyen" placeholder="Derleyen" className="admin-input" /><input name="kaynak_kisi" placeholder="Kaynak kişi" className="admin-input" />
        <input name="etiketler" placeholder="Etiketler, virgülle" className="admin-input sm:col-span-2" /><textarea name="ozet" required minLength={30} maxLength={800} placeholder="Özet (en az 30 karakter)" className="admin-input sm:col-span-2" rows={3} /><textarea name="hikaye" required minLength={80} maxLength={15000} placeholder="Kaynaklı hikâye (en az 80 karakter)" className="admin-input sm:col-span-2" rows={6} />
        <input name="kaynak_baslik" placeholder="Kaynak başlığı" className="admin-input" /><input name="kaynak_url" type="url" placeholder="https:// kaynak" className="admin-input" /><div className="sm:col-span-2"><AdminKaydetButonu>Türküyü kaydet</AdminKaydetButonu></div>
      </form>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{turkuler.map((turku) => <div key={turku.slug} className="rounded-xl border border-toprak/20 bg-white/35 p-3 text-sm"><b>{turku.baslik}</b><span className="block text-xs text-ceviz-light">{turku.yore} · {turku.durum}</span>{turku.durum === "yayinda" && <Link href={`/turku/${turku.slug}`} className="mt-2 inline-block text-xs font-semibold text-cini-dark underline">Yayını aç →</Link>}</div>)}</div>

      <AdminBaslik id="kultur" baslik="Kültür, kurs ve gelir içerikleri" aciklama="Rota, şehir tarihi, kurs, etkinlik ve açıkça etiketlenmiş sponsor içeriklerini yönetin." />
      <form action={kulturIcerigiKaydet} className="admin-form">
        <select name="tur" className="admin-input"><option value="kultur-rotasi">Kültür rotası</option><option value="sehir-tarihi">Şehir tarihi</option><option value="kurs">Kurs</option><option value="etkinlik">Etkinlik</option><option value="sponsor">Sponsor</option></select><input name="baslik" required maxLength={180} placeholder="Başlık" className="admin-input" /><input name="il" maxLength={100} placeholder="İl" className="admin-input" /><input name="slug" maxLength={180} placeholder="Slug" className="admin-input" /><DurumSecimi /><input name="dis_url" type="url" placeholder="Kurs/bilet/kurum bağlantısı" className="admin-input" /><input name="gorsel_url" type="url" placeholder="Lisanslı görsel URL" className="admin-input sm:col-span-2" /><textarea name="ozet" required minLength={20} maxLength={800} placeholder="Kısa özet" className="admin-input sm:col-span-2" rows={2} /><textarea name="icerik" required minLength={40} maxLength={20000} placeholder="Doğal, kaynaklı ve profesyonel içerik" className="admin-input sm:col-span-2" rows={6} /><div className="sm:col-span-2"><AdminKaydetButonu>İçeriği kaydet</AdminKaydetButonu></div>
      </form>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{icerikler.map((icerik) => <div key={icerik.id} className="rounded-xl border border-toprak/20 bg-white/35 p-3 text-sm"><b>{icerik.baslik}</b><span className="block text-xs text-ceviz-light">{icerik.tur} · {icerik.il || "Genel"} · {icerik.durum}</span></div>)}</div>

      <AdminBaslik id="kullanicilar" baslik="Kullanıcılar" aciklama="E-posta yalnızca admin rolünde ve sunucu tarafında görüntülenir." />
      <div className="overflow-x-auto rounded-2xl border border-toprak/25"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-ceviz text-parsomen"><tr><th className="p-3">Kullanıcı</th><th>E-posta</th><th>Kayıt</th><th>Rol</th></tr></thead><tbody>{profiller.map((profil) => <tr key={profil.id} className="border-t border-toprak/15"><td className="p-3 font-semibold">@{profil.kullanici_adi}</td><td>{email.get(profil.id) ?? "Yalnızca admin görebilir"}</td><td>{new Date(profil.olusturulma).toLocaleDateString("tr-TR")}</td><td>{yetki.profil.rol === "admin" ? <form action={kullaniciRoluGuncelle} className="flex items-center gap-2"><input type="hidden" name="id" value={profil.id} /><select name="rol" defaultValue={profil.rol} className="rounded-lg border border-toprak/30 bg-parsomen px-2 py-1"><option value="uye">Üye</option><option value="editor">Editör</option><option value="admin">Admin</option></select><AdminKaydetButonu sade>Uygula</AdminKaydetButonu></form> : profil.rol}</td></tr>)}</tbody></table></div>
      <p className="mt-8 text-xs text-ceviz-light">Spotify içeriği, kullanıcı e-postaları ve özel katkı dosyaları gelir/sponsor hedeflemesinde kullanılmaz. <Link href="/gizlilik" className="underline">Gizlilik ilkeleri</Link></p>
    </main>
  );
}

function AdminBaslik({ id, baslik, aciklama }: { id: string; baslik: string; aciklama: string }) { return <header id={id} className="mb-4 mt-12 scroll-mt-28 border-b border-toprak/20 pb-3"><h2 className="font-serif text-2xl font-semibold text-ceviz">{baslik}</h2><p className="mt-1 text-sm text-ceviz-light">{aciklama}</p></header>; }
function DurumSecimi() { return <select name="durum" className="admin-input"><option value="taslak">Taslak</option><option value="incelemede">İncelemede</option><option value="yayinda">Yayında</option><option value="arsivlendi">Arşivlendi</option></select>; }
function Bildirim({ tur, children }: { tur: "basarili" | "hata"; children: React.ReactNode }) { return <div role={tur === "hata" ? "alert" : "status"} className={`mt-6 rounded-2xl border p-4 text-sm font-medium ${tur === "basarili" ? "border-cini/30 bg-cini/10 text-cini-dark" : "border-kilim/30 bg-kilim/10 text-kilim-dark"}`}>{children}</div>; }
function BosDurum({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl border border-dashed border-toprak/30 p-6 text-center text-sm text-ceviz-light">{children}</div>; }
