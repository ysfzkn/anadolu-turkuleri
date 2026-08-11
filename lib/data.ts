import fs from "node:fs";
import path from "node:path";
import { turkuSchema, type Turku } from "./schema";
import { slugYap } from "./slug";

/**
 * Türkü verisini content/turkuler/*.json dosyalarından yükler.
 *
 * Sunucu tarafında (build/SSG) çalışır. Her dosya zod şemasıyla doğrulanır;
 * geçersiz bir kayıt build'i açık bir hatayla durdurur (sessiz bozulma yok).
 *
 * Yayın filtresi: NEXT_PUBLIC_SADECE_DOGRULANMIS=1 ise yalnızca
 * `dogrulama: "dogrulandi"` kayıtlar gösterilir (canlı yayın için). Aksi
 * halde tüm kayıtlar (taslak dahil) gösterilir — geliştirme/önizleme için.
 */

const ICERIK_DIZINI = path.join(process.cwd(), "content", "turkuler");
const SADECE_DOGRULANMIS = process.env.NEXT_PUBLIC_SADECE_DOGRULANMIS === "1";

function tumKayitlariYukle(): Turku[] {
  if (!fs.existsSync(ICERIK_DIZINI)) return [];
  const dosyalar = fs
    .readdirSync(ICERIK_DIZINI)
    .filter((f) => f.endsWith(".json"));

  const turkuler = dosyalar.map((dosya) => {
    const tamYol = path.join(ICERIK_DIZINI, dosya);
    const ham = JSON.parse(fs.readFileSync(tamYol, "utf-8"));
    const sonuc = turkuSchema.safeParse(ham);
    if (!sonuc.success) {
      throw new Error(
        `Geçersiz türkü verisi: ${dosya}\n${JSON.stringify(sonuc.error.format(), null, 2)}`,
      );
    }
    if (sonuc.data.slug !== path.basename(dosya, ".json")) {
      throw new Error(
        `Slug uyuşmuyor: ${dosya} içindeki slug "${sonuc.data.slug}" dosya adıyla eşleşmiyor.`,
      );
    }
    return sonuc.data;
  });

  // Başlığa göre alfabetik, tutarlı sıralama
  turkuler.sort((a, b) => a.baslik.localeCompare(b.baslik, "tr"));
  return turkuler;
}

const TUM_KAYITLAR = tumKayitlariYukle();

function gorunur(t: Turku): boolean {
  return SADECE_DOGRULANMIS ? t.dogrulama === "dogrulandi" : true;
}

export function tumTurkuler(): Turku[] {
  return TUM_KAYITLAR.filter(gorunur);
}

export function turkuBul(slug: string): Turku | undefined {
  const t = TUM_KAYITLAR.find((x) => x.slug === slug);
  return t && gorunur(t) ? t : undefined;
}

export function tumSluglar(): string[] {
  return tumTurkuler().map((t) => t.slug);
}

/** "Muğla (Bodrum)" / "Çanakkale (Biga)" → "Muğla". İl adını ayıklar. */
export function ilAdi(yore: string): string {
  return yore.split(/[(/]/)[0].trim();
}

/** İl adının URL slug'ı, örn. "muğla" → "mugla". */
export function ilSlug(yore: string): string {
  return slugYap(ilAdi(yore));
}

export interface IlOzeti {
  ad: string;
  slug: string;
  adet: number;
}

/** Yayındaki türküleri barındıran illerin özeti (haritada işaretlenecekler). */
export function iller(): IlOzeti[] {
  const harita = new Map<string, IlOzeti>();
  for (const t of tumTurkuler()) {
    const ad = ilAdi(t.yore);
    const slug = slugYap(ad);
    const mevcut = harita.get(slug);
    if (mevcut) mevcut.adet++;
    else harita.set(slug, { ad, slug, adet: 1 });
  }
  return Array.from(harita.values()).sort((a, b) =>
    a.ad.localeCompare(b.ad, "tr"),
  );
}

/** Bir ile ait yayındaki türküler (il slug'ına göre). */
export function ilTurkuleri(ilSlugu: string): Turku[] {
  return tumTurkuler().filter((t) => ilSlug(t.yore) === ilSlugu);
}

/** Kart/liste görünümleri için hafif alt küme (hikâye/sözler taşımaz). */
export function kartlar() {
  return tumTurkuler().map((t) => ({
    slug: t.slug,
    baslik: t.baslik,
    yore: t.yore,
    ozet: t.ozet,
    etiketler: t.etiketler,
  }));
}

/** Tüm etiketleri (tema) sıklığa göre azalan sırada döndürür. */
export function tumEtiketler(): { etiket: string; adet: number }[] {
  const sayac = new Map<string, number>();
  for (const t of tumTurkuler()) {
    for (const e of t.etiketler ?? []) {
      sayac.set(e, (sayac.get(e) ?? 0) + 1);
    }
  }
  return Array.from(sayac.entries())
    .map(([etiket, adet]) => ({ etiket, adet }))
    .sort((a, b) => b.adet - a.adet);
}
