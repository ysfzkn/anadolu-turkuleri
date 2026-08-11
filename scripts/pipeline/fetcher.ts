/**
 * Nazik (polite) HTTP getirici.
 *
 * - robots.txt kurallarına saygı gösterir (User-agent: * Disallow).
 * - Aynı sunucuya istekler arasında asgari gecikme uygular (hız sınırı).
 * - Kendini tanıtan bir User-Agent gönderir (Wikipedia gibi API'ler bunu ister).
 *
 * Amaç: yalnızca izin verilen, kamuya açık uç noktalardan veri toplamak.
 */

// HTTP başlık değerleri Latin-1 (ByteString) olmalı; ASCII tutuyoruz.
const KULLANICI_AJANI =
  "AnadoluTurkuleriBot/0.1 (+https://anadoluturkuleri.com; contact: ozkan.development@gmail.com) cultural-archive research";

const ASGARI_GECIKME_MS = 1500;

const sonIstekZamani = new Map<string, number>();
const robotsOnbellek = new Map<string, RobotKurallari>();

interface RobotKurallari {
  yasakli: string[];
}

async function bekle(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function hizSinirla(host: string): Promise<void> {
  const son = sonIstekZamani.get(host) ?? 0;
  const gecen = Date.now() - son;
  if (gecen < ASGARI_GECIKME_MS) {
    await bekle(ASGARI_GECIKME_MS - gecen);
  }
  sonIstekZamani.set(host, Date.now());
}

function robotsAyristir(metin: string): RobotKurallari {
  const yasakli: string[] = [];
  let geceriliBolum = false;
  for (const satirHam of metin.split("\n")) {
    const satir = satirHam.trim();
    if (!satir || satir.startsWith("#")) continue;
    const [anahtarHam, ...rest] = satir.split(":");
    const anahtar = anahtarHam.trim().toLowerCase();
    const deger = rest.join(":").trim();
    if (anahtar === "user-agent") {
      geceriliBolum = deger === "*";
    } else if (geceriliBolum && anahtar === "disallow" && deger) {
      yasakli.push(deger);
    }
  }
  return { yasakli };
}

async function robotsGetir(origin: string): Promise<RobotKurallari> {
  if (robotsOnbellek.has(origin)) return robotsOnbellek.get(origin)!;
  let kurallar: RobotKurallari = { yasakli: [] };
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": KULLANICI_AJANI },
    });
    if (res.ok) kurallar = robotsAyristir(await res.text());
  } catch {
    // robots.txt yoksa/erişilemezse boş kural kümesi ile devam
  }
  robotsOnbellek.set(origin, kurallar);
  return kurallar;
}

function izinliMi(kurallar: RobotKurallari, yol: string): boolean {
  return !kurallar.yasakli.some((k) => k !== "" && yol.startsWith(k));
}

/** robots.txt'e saygılı, hız sınırlı GET. İzin yoksa hata fırlatır. */
export async function nazikGetir(url: string): Promise<Response> {
  const u = new URL(url);
  const kurallar = await robotsGetir(u.origin);
  if (!izinliMi(kurallar, u.pathname)) {
    throw new Error(`robots.txt bu yolu yasaklıyor: ${url}`);
  }
  await hizSinirla(u.host);
  const res = await fetch(url, {
    headers: { "User-Agent": KULLANICI_AJANI },
  });
  if (!res.ok) {
    throw new Error(`İstek başarısız (${res.status}): ${url}`);
  }
  return res;
}

export async function nazikGetirJson<T = unknown>(url: string): Promise<T> {
  const res = await nazikGetir(url);
  return (await res.json()) as T;
}
