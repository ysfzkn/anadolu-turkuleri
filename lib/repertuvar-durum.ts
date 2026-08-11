/** Repertuvar durumları — bağlamada bir türküyle ilişki. */
export const REPERTUVAR_DURUMLARI = [
  { deger: "calabiliyorum", etiket: "Çalabiliyorum", ikon: "🎵" },
  { deger: "ogreniyorum", etiket: "Öğreniyorum", ikon: "📖" },
  { deger: "calmak-istiyorum", etiket: "Çalmak istiyorum", ikon: "⭐" },
] as const;

export type RepertuvarDurum =
  (typeof REPERTUVAR_DURUMLARI)[number]["deger"];

export function durumBilgi(deger: string) {
  return REPERTUVAR_DURUMLARI.find((d) => d.deger === deger);
}
