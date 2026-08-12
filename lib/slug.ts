/** Türkçe karakterleri de düzgün ele alan slug üretici (paylaşımlı). */
export function slugYap(metin: string): string {
  const harita: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    Ö: "o",
    Ş: "s",
    Ü: "u",
    â: "a",
    î: "i",
    û: "u",
    Â: "a",
    Î: "i",
    Û: "u",
  };
  return metin
    .split("")
    .map((h) => harita[h] ?? h)
    .join("")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
