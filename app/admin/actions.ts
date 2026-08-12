"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { turkuBul } from "@/lib/data";
import { kulturRotalari } from "@/lib/kultur";
import { servisSupabase, yoneticiDogrula } from "@/lib/supabase/admin";
import { slugYap } from "@/lib/slug";

const KATKI_DURUMLARI = ["bekliyor", "inceleniyor", "onaylandi", "reddedildi"] as const;
const ICERIK_DURUMLARI = ["taslak", "incelemede", "yayinda", "arsivlendi"] as const;
const KULTUR_TURLERI = ["kultur-rotasi", "sehir-tarihi", "kurs", "etkinlik", "sponsor"] as const;
const ROLLER = ["uye", "editor", "admin"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const metin = (form: FormData, anahtar: string, enFazla = 10_000) =>
  String(form.get(anahtar) ?? "").trim().slice(0, enFazla);

function guvenliUrl(deger: string, zorunlu = false): string | null {
  if (!deger && !zorunlu) return null;
  try {
    const url = new URL(deger);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function adminSonucu(tur: "basarili" | "hata", mesaj: string, bolum: string): never {
  const sorgu = new URLSearchParams({ bildirim: tur, mesaj });
  redirect(`/admin?${sorgu.toString()}#${bolum}`);
}

function hataMesaji(hata: unknown) {
  if (hata instanceof Error && hata.message === "YAYIN_IZNI_YOK") {
    return "Yayın izni bulunmayan katkı onaylanamaz. Katkıyı incelemede bırakın veya reddedin.";
  }
  if (hata instanceof Error && hata.message.includes("duplicate")) return "Bu kayıt zaten bulunuyor.";
  return "İşlem tamamlanamadı. Bağlantınızı ve yönetim şeması kurulumunu kontrol edip yeniden deneyin.";
}

export async function katkiDurumuGuncelle(form: FormData): Promise<never> {
  const yetki = await yoneticiDogrula();
  if (!yetki) redirect("/giris?next=/admin");

  const id = metin(form, "id", 36);
  const durum = metin(form, "durum", 20);
  if (!UUID.test(id) || !KATKI_DURUMLARI.includes(durum as typeof KATKI_DURUMLARI[number])) {
    adminSonucu("hata", "Katkı kaydı veya durum seçimi geçersiz.", "katkilar");
  }

  try {
    const db = servisSupabase();
    const { data: katki, error: okumaHatasi } = await db
      .from("hafiza_katkilari")
      .select("id,yayin_izni")
      .eq("id", id)
      .maybeSingle();
    if (okumaHatasi || !katki) throw okumaHatasi ?? new Error("Katkı bulunamadı");
    if (durum === "onaylandi" && !katki.yayin_izni) {
      throw new Error("YAYIN_IZNI_YOK");
    }
    const { data, error } = await db
      .from("hafiza_katkilari")
      .update({
        durum,
        editor_notu: metin(form, "editor_notu", 1500) || null,
        inceleyen: yetki.user.id,
        incelenen_tarih: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error || !data) throw error ?? new Error("Katkı güncellenemedi");
  } catch (hata) {
    adminSonucu("hata", hataMesaji(hata), "katkilar");
  }
  revalidatePath("/admin");
  revalidatePath("/katkilarim");
  adminSonucu("basarili", "Katkı durumu ve editör notu güncellendi.", "katkilar");
}

export async function kullaniciRoluGuncelle(form: FormData): Promise<never> {
  const yetki = await yoneticiDogrula(false);
  if (!yetki) redirect("/giris?next=/admin");
  const id = metin(form, "id", 36);
  const rol = metin(form, "rol", 20);
  if (!UUID.test(id) || !ROLLER.includes(rol as typeof ROLLER[number])) {
    adminSonucu("hata", "Kullanıcı veya rol seçimi geçersiz.", "kullanicilar");
  }
  if (id === yetki.user.id && rol !== "admin") {
    adminSonucu("hata", "Kendi admin yetkinizi kaldıramazsınız.", "kullanicilar");
  }
  try {
    const { data, error } = await servisSupabase()
      .from("profiller")
      .update({ rol })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error || !data) throw error ?? new Error("Kullanıcı bulunamadı");
  } catch (hata) {
    adminSonucu("hata", hataMesaji(hata), "kullanicilar");
  }
  revalidatePath("/admin");
  adminSonucu("basarili", "Kullanıcı rolü güncellendi.", "kullanicilar");
}

export async function editorTurkusuKaydet(form: FormData): Promise<never> {
  const yetki = await yoneticiDogrula();
  if (!yetki) redirect("/giris?next=/admin");
  const baslik = metin(form, "baslik", 180);
  const yore = metin(form, "yore", 120);
  const ozet = metin(form, "ozet", 800);
  const hikaye = metin(form, "hikaye", 15_000);
  const durum = metin(form, "durum", 20) || "taslak";
  const slug = slugYap(metin(form, "slug", 180) || `${baslik}-${yore}`);
  if (!baslik || !yore || ozet.length < 30 || hikaye.length < 80 || !ICERIK_DURUMLARI.includes(durum as typeof ICERIK_DURUMLARI[number])) {
    adminSonucu("hata", "Başlık, yöre, özet, hikâye veya yayın durumu eksik/geçersiz.", "turkuler");
  }
  if (turkuBul(slug)) {
    adminSonucu("hata", "Bu slug dosya tabanlı arşivde kullanılıyor. Mevcut kaydı gölgelememek için farklı bir slug seçin.", "turkuler");
  }
  const kaynakDegeri = metin(form, "kaynak_url", 600);
  const kaynakUrl = guvenliUrl(kaynakDegeri);
  if (kaynakDegeri && !kaynakUrl) adminSonucu("hata", "Kaynak bağlantısı geçerli bir http/https adresi olmalı.", "turkuler");

  try {
    const veri = {
      slug,
      baslik,
      yore,
      ozet,
      hikaye,
      ozan: metin(form, "ozan", 160) || null,
      soz_yazari: metin(form, "soz_yazari", 160) || null,
      derleyen: metin(form, "derleyen", 160) || null,
      kaynak_kisi: metin(form, "kaynak_kisi", 160) || null,
      etiketler: [...new Set(metin(form, "etiketler", 600).split(",").map((x) => x.trim()).filter(Boolean))].slice(0, 12),
      kaynaklar: kaynakUrl ? [{ baslik: metin(form, "kaynak_baslik", 180) || "Kaynak", url: kaynakUrl }] : [],
      durum,
      olusturan: yetki.user.id,
      guncelleyen: yetki.user.id,
      guncellenme: new Date().toISOString(),
    };
    const { error } = await servisSupabase().from("editor_turkuler").upsert(veri, { onConflict: "slug" });
    if (error) throw error;
  } catch (hata) {
    adminSonucu("hata", hataMesaji(hata), "turkuler");
  }
  revalidatePath("/admin");
  revalidatePath(`/turku/${slug}`);
  revalidatePath("/sitemap.xml");
  adminSonucu("basarili", `“${baslik}” kaydedildi.`, "turkuler");
}

export async function kulturIcerigiKaydet(form: FormData): Promise<never> {
  const yetki = await yoneticiDogrula();
  if (!yetki) redirect("/giris?next=/admin");
  const tur = metin(form, "tur", 30);
  const baslik = metin(form, "baslik", 180);
  const ozet = metin(form, "ozet", 800);
  const icerik = metin(form, "icerik", 20_000);
  const durum = metin(form, "durum", 20) || "taslak";
  const slug = slugYap(metin(form, "slug", 180) || baslik);
  if (!KULTUR_TURLERI.includes(tur as typeof KULTUR_TURLERI[number]) || !baslik || ozet.length < 20 || icerik.length < 40 || !ICERIK_DURUMLARI.includes(durum as typeof ICERIK_DURUMLARI[number])) {
    adminSonucu("hata", "İçerik türü, başlık, özet, metin veya yayın durumu eksik/geçersiz.", "kultur");
  }
  if (tur === "kultur-rotasi" && kulturRotalari.some((rota) => rota.slug === slug)) {
    adminSonucu("hata", "Bu slug sabit kültür rotalarında kullanılıyor. Mevcut rotayı gölgelememek için farklı bir slug seçin.", "kultur");
  }
  const gorselDegeri = metin(form, "gorsel_url", 600);
  const disDegeri = metin(form, "dis_url", 600);
  const gorselUrl = guvenliUrl(gorselDegeri);
  const disUrl = guvenliUrl(disDegeri);
  if ((gorselDegeri && !gorselUrl) || (disDegeri && !disUrl)) {
    adminSonucu("hata", "Görsel ve dış bağlantılar geçerli bir http/https adresi olmalı.", "kultur");
  }
  try {
    const veri = {
      tur,
      slug,
      baslik,
      il: metin(form, "il", 100) || null,
      ozet,
      icerik,
      gorsel_url: gorselUrl,
      dis_url: disUrl,
      durum,
      olusturan: yetki.user.id,
      guncellenme: new Date().toISOString(),
    };
    const { error } = await servisSupabase().from("kultur_icerikleri").upsert(veri, { onConflict: "tur,slug" });
    if (error) throw error;
  } catch (hata) {
    adminSonucu("hata", hataMesaji(hata), "kultur");
  }
  revalidatePath("/admin");
  revalidatePath("/kultur-rotalari");
  revalidatePath("/kurslar");
  adminSonucu("basarili", `“${baslik}” içeriği kaydedildi.`, "kultur");
}
