"use client";

import { useState } from "react";

export function IbanKopyala({ iban, ad }: { iban: string; ad?: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(iban.replace(/\s+/g, ""));
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      /* Pano erişimi yoksa sessizce geç; IBAN zaten seçilebilir. */
    }
  }

  return (
    <div className="mt-6">
      <code className="block select-all break-all rounded-xl border border-toprak/25 bg-parsomen-dark/40 px-3 py-2 text-sm text-ceviz">
        {iban}
      </code>
      {ad && <p className="mt-1 text-xs text-ceviz-light">Alıcı: {ad}</p>}
      <button
        type="button"
        onClick={kopyala}
        className="mt-3 min-h-11 w-full rounded-xl bg-ceviz px-4 font-semibold text-white transition hover:bg-kilim-dark"
      >
        {kopyalandi ? "Kopyalandı ✓" : "IBAN'ı kopyala"}
      </button>
    </div>
  );
}
