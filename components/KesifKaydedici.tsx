"use client";

import { useEffect } from "react";
import { kesfet } from "@/lib/kesif";
import { olayKaydet } from "@/lib/analytics";
import type { KesifTuru } from "@/lib/pasaport";

/**
 * Görünmez keşif kaydedici. Sayfaya belirli bir süre (dwell) kalındığında —
 * yani sayfa gerçekten okunduğunda, hemen sekme kapatılmadığında — keşfi
 * kaydeder. Anlamlı keşif ilkesine uyar: saniyelik bir bounce sayılmaz.
 */
export function KesifKaydedici({
  tur,
  anahtar,
  il,
  gecikmeMs = 5000,
}: {
  tur: KesifTuru;
  anahtar: string;
  il?: string | null;
  gecikmeMs?: number;
}) {
  useEffect(() => {
    const zamanlayici = setTimeout(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      void kesfet(tur, anahtar, il);
      olayKaydet("passport_discovery", { kesif_turu: tur, anahtar });
    }, gecikmeMs);
    return () => clearTimeout(zamanlayici);
  }, [tur, anahtar, il, gecikmeMs]);
  return null;
}
