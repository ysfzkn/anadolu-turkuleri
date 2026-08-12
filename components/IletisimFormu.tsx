"use client";

import { FormEvent, useState } from "react";

const HATA: Record<string, string> = {
  "alanlar-eksik": "Bilgileri kontrol edin. Mesajınız en az 20 karakter olmalı ve iletişim izni seçilmelidir.",
  "cok-sik": "Mesajınız henüz işleniyor olabilir. Bir dakika bekleyip yeniden deneyin.",
  "servis-hazir-degil": "İletişim kanalı henüz etkinleştirilmedi. Lütfen doğrudan e-posta adresimizi kullanın.",
  gonderilemedi: "Mesaj gönderilemedi. Bağlantınızı kontrol edip yeniden deneyin.",
  "gecersiz-istek": "İstek doğrulanamadı. Sayfayı yenileyip yeniden deneyin.",
};

export function IletisimFormu({ epostaAdresi }: { epostaAdresi: string }) {
  const [durum, setDurum] = useState<"hazir" | "gonderiliyor" | "basarili" | "hata">("hazir");
  const [mesaj, setMesaj] = useState("");

  async function gonder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDurum("gonderiliyor");
    setMesaj("");
    const form = event.currentTarget;
    const veri = new FormData(form);
    const cevap = await fetch("/api/iletisim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ad: veri.get("ad"), eposta: veri.get("eposta"), konu: veri.get("konu"), mesaj: veri.get("mesaj"),
        website: veri.get("website"), izin: veri.get("izin") === "on",
      }),
    }).catch(() => null);
    const sonuc = cevap ? await cevap.json().catch(() => ({})) : {};
    if (cevap?.ok && sonuc.basarili) {
      form.reset();
      setDurum("basarili");
      setMesaj("Mesajınız bize ulaştı. Gerekli olduğunda verdiğiniz e-posta adresinden dönüş yapacağız.");
    } else {
      setDurum("hata");
      setMesaj(HATA[sonuc.hata] ?? "Mesaj gönderilemedi. Lütfen daha sonra yeniden deneyin.");
    }
  }

  return (
    <form onSubmit={gonder} className="rounded-[28px] border border-toprak/25 bg-white/60 p-5 shadow-motif sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-ceviz">Adınız
          <input name="ad" required minLength={2} maxLength={80} autoComplete="name" className="admin-input mt-2" placeholder="Size nasıl hitap edelim?" />
        </label>
        <label className="text-sm font-semibold text-ceviz">E-posta adresiniz
          <input name="eposta" required type="email" maxLength={160} autoComplete="email" className="admin-input mt-2" placeholder="ornek@eposta.com" />
        </label>
      </div>
      <label className="mt-5 block text-sm font-semibold text-ceviz">Mesajınızın konusu
        <select name="konu" required defaultValue="oneri" className="admin-input mt-2">
          <option value="oneri">Öneri ve fikir</option><option value="duzeltme">Bilgi düzeltme</option><option value="teknik">Teknik sorun</option><option value="isbirligi">İş birliği</option><option value="diger">Diğer</option>
        </select>
      </label>
      <label className="mt-5 block text-sm font-semibold text-ceviz">Mesajınız
        <textarea name="mesaj" required minLength={20} maxLength={4000} rows={7} className="admin-input mt-2 resize-y" placeholder="Önerinizi, fark ettiğiniz hatayı veya konuşmak istediğiniz konuyu ayrıntılarıyla yazın." />
      </label>
      <label className="sr-only" aria-hidden="true">Web sitesi<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-ceviz-light">
        <input name="izin" type="checkbox" required className="mt-1 h-4 w-4 accent-kilim" />
        <span>Bilgilerimin bu mesaja yanıt vermek amacıyla işlenmesini kabul ediyorum. Ayrıntılar <a href="/gizlilik" className="font-semibold text-cini-dark underline underline-offset-2">gizlilik sayfasında</a>.</span>
      </label>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button disabled={durum === "gonderiliyor"} className="inline-flex min-h-12 items-center rounded-xl bg-kilim px-6 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-kilim-dark disabled:cursor-wait disabled:opacity-60">{durum === "gonderiliyor" ? "Mesaj gönderiliyor…" : "Mesajı gönder"}</button>
        <span className="text-xs text-ceviz-light">Genellikle yalnızca yanıt gerektiren iletilere dönüş yapılır.</span>
      </div>
      {mesaj && <div role={durum === "hata" ? "alert" : "status"} className={`mt-5 rounded-2xl border p-4 text-sm font-medium ${durum === "basarili" ? "border-cini/30 bg-cini/10 text-cini-dark" : "border-kilim/30 bg-kilim/10 text-kilim-dark"}`}>{mesaj}{durum === "hata" && epostaAdresi && <> Doğrudan <a className="underline" href={`mailto:${epostaAdresi}`}>{epostaAdresi}</a> adresine de yazabilirsiniz.</>}</div>}
    </form>
  );
}
