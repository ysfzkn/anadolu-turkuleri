export const runtime = "nodejs";

const sonGonderimler = new Map<string, number>();
const BEKLEME_MS = 60_000;

function temizMetin(deger: unknown, enFazla: number): string {
  return typeof deger === "string" ? deger.trim().slice(0, enFazla) : "";
}

function htmlKacir(metin: string): string {
  return metin.replace(/[&<>"']/g, (karakter) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[karakter] ?? karakter);
}

function epostaGecerli(eposta: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta) && eposta.length <= 160;
}

function ayniKaynak(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const beklenenHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
    return new URL(origin).host === beklenenHost;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!ayniKaynak(request)) return Response.json({ hata: "gecersiz-istek" }, { status: 403 });

  const ip = (request.headers.get("x-forwarded-for") ?? "bilinmiyor").split(",")[0].trim();
  const son = sonGonderimler.get(ip) ?? 0;
  if (Date.now() - son < BEKLEME_MS) {
    return Response.json({ hata: "cok-sik" }, { status: 429 });
  }

  let govde: Record<string, unknown>;
  try {
    govde = await request.json();
  } catch {
    return Response.json({ hata: "gecersiz-istek" }, { status: 400 });
  }

  // Normal ziyaretçiler bu alanı görmez. Dolduran otomatik botlara başarılı
  // yanıt vererek form uç noktasını gereksiz iletilerden koruruz.
  if (temizMetin(govde.website, 200)) return Response.json({ basarili: true });

  const ad = temizMetin(govde.ad, 80);
  const eposta = temizMetin(govde.eposta, 160).toLocaleLowerCase("tr-TR");
  const konu = temizMetin(govde.konu, 60);
  const mesaj = temizMetin(govde.mesaj, 4000);
  const izin = govde.izin === true;
  const konuBasliklari: Record<string, string> = {
    oneri: "Öneri ve fikir",
    duzeltme: "Bilgi düzeltme",
    teknik: "Teknik sorun",
    isbirligi: "İş birliği",
    diger: "Diğer",
  };

  if (ad.length < 2 || !epostaGecerli(eposta) || !konuBasliklari[konu] || mesaj.length < 20 || !izin) {
    return Response.json({ hata: "alanlar-eksik" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const alici = process.env.ILETISIM_ALICI_EMAIL?.trim();
  const gonderen = process.env.ILETISIM_GONDEREN_EMAIL?.trim();
  if (!apiKey || !alici || !gonderen) {
    console.error("İletişim formu ortam değişkenleri eksik.");
    return Response.json({ hata: "servis-hazir-degil" }, { status: 503 });
  }

  const metin = [
    `Yeni iletişim formu mesajı`,
    `Konu: ${konuBasliklari[konu]}`,
    `Ad: ${ad}`,
    `E-posta: ${eposta}`,
    "",
    mesaj,
  ].join("\n");

  const cevap = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: gonderen,
      to: [alici],
      reply_to: eposta,
      subject: `[Anadolu Türküleri] ${konuBasliklari[konu]}`,
      text: metin,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;color:#35261d"><p style="color:#a93226;font-weight:700;letter-spacing:.08em">ANADOLU TÜRKÜLERİ</p><h1 style="font-size:24px">Yeni iletişim mesajı</h1><table style="border-collapse:collapse;width:100%;margin:20px 0"><tr><td style="padding:8px;border-bottom:1px solid #eadfce"><b>Konu</b></td><td style="padding:8px;border-bottom:1px solid #eadfce">${htmlKacir(konuBasliklari[konu])}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #eadfce"><b>Gönderen</b></td><td style="padding:8px;border-bottom:1px solid #eadfce">${htmlKacir(ad)} · ${htmlKacir(eposta)}</td></tr></table><div style="white-space:pre-wrap;line-height:1.7;background:#faf5ea;padding:18px;border-radius:12px">${htmlKacir(mesaj)}</div></div>`,
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!cevap?.ok) {
    console.error("İletişim e-postası gönderilemedi.", cevap?.status ?? "ağ-hatası");
    return Response.json({ hata: "gonderilemedi" }, { status: 502 });
  }

  sonGonderimler.set(ip, Date.now());
  if (sonGonderimler.size > 1000) {
    const sinir = Date.now() - BEKLEME_MS;
    for (const [anahtar, zaman] of sonGonderimler) if (zaman < sinir) sonGonderimler.delete(anahtar);
  }
  return Response.json({ basarili: true });
}
