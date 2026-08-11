import type { KaynakAdaptoru } from "./types";
import { wikipediaAdaptoru } from "./wikipedia";

/** Kayıtlı kaynak adaptörleri. Yeni kaynaklar buraya eklenir. */
export const adaptorler: Record<string, KaynakAdaptoru> = {
  wikipedia: wikipediaAdaptoru,
};

export function adaptorSec(ad?: string): KaynakAdaptoru[] {
  if (!ad || ad === "all") return Object.values(adaptorler);
  const a = adaptorler[ad];
  if (!a) {
    throw new Error(
      `Bilinmeyen kaynak: "${ad}". Seçenekler: ${Object.keys(adaptorler).join(", ")}, all`,
    );
  }
  return [a];
}
