const KAMU_MALI_OZANLAR = new Set([
  "dadaloğlu",
  "karacaoğlan",
  "köroğlu",
  "muhyiddin abdal",
  "pir sultan abdal",
  "yunus emre",
]);

function adNormallestir(ad?: string) {
  return ad?.trim().toLocaleLowerCase("tr-TR");
}

export function sozDurumu(sozYazari?: string, ozan?: string) {
  const sahip = adNormallestir(sozYazari ?? ozan);
  if (!sahip || sahip === "anonim" || sahip === "bilinmiyor") return "acik" as const;
  if (KAMU_MALI_OZANLAR.has(sahip)) return "kamu-mali" as const;
  return "izin-gerekli" as const;
}
