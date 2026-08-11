/** Türkçe ek uyumu yardımcıları. */

const ARKA_SESLILER = "aıou"; // kalın ünlüler
const SESLILER = "aeıioöuü";
const SERT_UNSUZLER = "fstkçşhp"; // "fıstıkçı şahap" (sert/sessiz ünsüzler)

/** Kelimenin son ünlüsü. */
function sonSesli(s: string): string {
  for (let i = s.length - 1; i >= 0; i--) {
    if (SESLILER.includes(s[i])) return s[i];
  }
  return "e";
}

/**
 * "-de/-da/-te/-ta" bulunma (lokatif) eki — ünlü + ünsüz uyumuna göre.
 * Özel ad için kesme işaretiyle: lokatif("Sivas") → "Sivas'ta".
 */
export function lokatif(ozelAd: string): string {
  const s = ozelAd.toLocaleLowerCase("tr");
  const kalin = ARKA_SESLILER.includes(sonSesli(s));
  const sonHarf = s.replace(/['’\s.]/g, "").slice(-1);
  const sert = SERT_UNSUZLER.includes(sonHarf);
  const ek = (sert ? "t" : "d") + (kalin ? "a" : "e");
  return `${ozelAd}'${ek}`;
}

/**
 * Özel adlarda ilgi (tamlayan) eki: tamlayan("Ankara") → "Ankara'nın".
 */
export function tamlayan(ozelAd: string): string {
  const s = ozelAd.toLocaleLowerCase("tr");
  const son = sonSesli(s);
  const darUnlu = son === "a" || son === "ı"
    ? "ı"
    : son === "e" || son === "i"
      ? "i"
      : son === "o" || son === "u"
        ? "u"
        : "ü";
  const sonHarf = s.replace(/['’\s.]/g, "").slice(-1);
  const kaynastirma = SESLILER.includes(sonHarf) ? "n" : "";
  return `${ozelAd}'${kaynastirma}${darUnlu}n`;
}
