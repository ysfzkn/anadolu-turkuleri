"use client";

type OlayDegeri = string | number | boolean | null | undefined;
type OlayOzellikleri = Record<string, OlayDegeri>;

const IZIN_ANAHTARI = "anadolu-analitik-izni";
const KIMLIK_ANAHTARI = "anadolu-anonim-oturum";

export type AnalitikIzni = "bekliyor" | "kabul" | "ret";

export function analitikIzni(): AnalitikIzni {
  if (typeof window === "undefined") return "bekliyor";
  const deger = window.localStorage.getItem(IZIN_ANAHTARI);
  return deger === "kabul" || deger === "ret" ? deger : "bekliyor";
}

export function analitikIzniKaydet(izin: Exclude<AnalitikIzni, "bekliyor">) {
  window.localStorage.setItem(IZIN_ANAHTARI, izin);
}

function anonimKimlik(): string {
  const mevcut = window.localStorage.getItem(KIMLIK_ANAHTARI);
  if (mevcut) return mevcut;
  const yeni = crypto.randomUUID();
  window.localStorage.setItem(KIMLIK_ANAHTARI, yeni);
  return yeni;
}

/** Açık izin sonrasında anonim ürün olayları gönderir; kişisel veri içermez. */
export function olayKaydet(olay: string, ozellikler: OlayOzellikleri = {}) {
  if (typeof window === "undefined" || analitikIzni() !== "kabul") return;
  if (navigator.doNotTrack === "1") return;
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return;
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com").replace(/\/$/, "");
  const govde = JSON.stringify({
    api_key: apiKey,
    event: olay,
    properties: {
      distinct_id: anonimKimlik(),
      $current_url: window.location.href,
      $pathname: window.location.pathname,
      ...ozellikler,
    },
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${host}/capture/`, new Blob([govde], { type: "application/json" }));
    } else {
      void fetch(`${host}/capture/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: govde, keepalive: true });
    }
  } catch {
    // Analitik, ana kullanıcı akışını hiçbir zaman kesmemeli.
  }
}
