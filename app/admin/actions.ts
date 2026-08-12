"use server";

import { revalidatePath } from "next/cache";
import { servisSupabase, yoneticiDogrula } from "@/lib/supabase/admin";
import { slugYap as slugify } from "@/lib/slug";

const metin = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function katkiDurumuGuncelle(form: FormData) {
  const yetki = await yoneticiDogrula(); if (!yetki) throw new Error("Yetkisiz işlem");
  const durum = metin(form,"durum");
  if (!["bekliyor","inceleniyor","onaylandi","reddedildi"].includes(durum)) throw new Error("Geçersiz durum");
  const supabase = servisSupabase();
  const { error } = await supabase.from("hafiza_katkilari").update({ durum, editor_notu: metin(form,"editor_notu") || null, inceleyen: yetki.user.id, incelenen_tarih: new Date().toISOString() }).eq("id",metin(form,"id"));
  if (error) throw error; revalidatePath("/admin"); revalidatePath("/katkilarim");
}

export async function kullaniciRoluGuncelle(form: FormData) {
  const yetki = await yoneticiDogrula(false); if (!yetki) throw new Error("Yalnızca admin");
  const rol = metin(form,"rol"); if (!["uye","editor","admin"].includes(rol)) throw new Error("Geçersiz rol");
  if (metin(form,"id") === yetki.user.id && rol !== "admin") throw new Error("Kendi admin yetkinizi kaldıramazsınız");
  const { error } = await servisSupabase().from("profiller").update({ rol }).eq("id",metin(form,"id"));
  if (error) throw error; revalidatePath("/admin");
}

export async function editorTurkusuKaydet(form: FormData) {
  const yetki = await yoneticiDogrula(); if (!yetki) throw new Error("Yetkisiz işlem");
  const baslik = metin(form,"baslik"), yore = metin(form,"yore"), ozet = metin(form,"ozet"), hikaye = metin(form,"hikaye");
  if (!baslik || !yore || ozet.length < 30 || hikaye.length < 80) throw new Error("Türkü alanları eksik");
  const veri = { slug: metin(form,"slug") || slugify(`${baslik}-${yore}`), baslik, yore, ozet, hikaye, ozan: metin(form,"ozan") || null, soz_yazari: metin(form,"soz_yazari") || null, derleyen: metin(form,"derleyen") || null, kaynak_kisi: metin(form,"kaynak_kisi") || null, etiketler: metin(form,"etiketler").split(",").map(x=>x.trim()).filter(Boolean), kaynaklar: metin(form,"kaynak_url") ? [{ baslik: metin(form,"kaynak_baslik") || "Kaynak", url: metin(form,"kaynak_url") }] : [], durum: metin(form,"durum") || "taslak", olusturan: yetki.user.id, guncelleyen: yetki.user.id, guncellenme: new Date().toISOString() };
  const { error } = await servisSupabase().from("editor_turkuler").upsert(veri,{onConflict:"slug"});
  if (error) throw error; revalidatePath("/admin");
}

export async function kulturIcerigiKaydet(form: FormData) {
  const yetki = await yoneticiDogrula(); if (!yetki) throw new Error("Yetkisiz işlem");
  const tur = metin(form,"tur"), baslik = metin(form,"baslik"), ozet = metin(form,"ozet"), icerik = metin(form,"icerik");
  if (!baslik || ozet.length < 20 || icerik.length < 40) throw new Error("İçerik alanları eksik");
  const veri = { tur, slug: metin(form,"slug") || slugify(baslik), baslik, il: metin(form,"il") || null, ozet, icerik, gorsel_url: metin(form,"gorsel_url") || null, dis_url: metin(form,"dis_url") || null, durum: metin(form,"durum") || "taslak", olusturan: yetki.user.id, guncellenme:new Date().toISOString() };
  const { error } = await servisSupabase().from("kultur_icerikleri").upsert(veri,{onConflict:"tur,slug"});
  if (error) throw error; revalidatePath("/admin"); revalidatePath("/kultur-rotalari"); revalidatePath("/kurslar");
}
