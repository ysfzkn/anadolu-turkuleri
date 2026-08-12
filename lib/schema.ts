import { z } from "zod";

/**
 * Türkü veri modelinin ÇALIŞMA ZAMANI şeması (zod).
 *
 * Bu dosya modelin TEK doğruluk kaynağıdır: hem crawl edilen ham veriyi
 * doğrulamak (scripts/) hem de yayına giren içeriği build sırasında
 * doğrulamak (lib/data.ts) için kullanılır. TypeScript tipleri buradan
 * türetilir (bkz. lib/types.ts).
 */

export const dogrulamaDurumuSchema = z.enum([
  "taslak", // otomatik toplandı, henüz kontrol edilmedi
  "incelemede", // bir editör bakıyor
  "dogrulandi", // yayına hazır
]);

export const kaynakSchema = z.object({
  baslik: z.string().min(1),
  url: z.string().url().optional(),
  tur: z.enum(["derleme", "arsiv", "akademik", "kurum", "diger"]).optional(),
  erisimTarihi: z.string().optional(),
});

export const platformBaglantisiSchema = z.object({
  platform: z.enum(["youtube", "spotify", "apple-music", "diger"]),
  url: z.string().url(),
  icra: z.string().optional(),
  dogrulandi: z.boolean().optional(),
});

export const calimBilgisiSchema = z.object({
  duzen: z.string().optional(),
  ayak: z.string().optional(),
  usul: z.string().optional(),
  notlar: z.string().optional(),
  akorlar: z.array(z.string()).optional(),
});

export const kitaSchema = z.object({
  tur: z.enum(["kita", "nakarat"]).optional(),
  satirlar: z.array(z.string().min(1)).min(1),
});

/**
 * Editör tarafından belirlenebilen kaynak güveni (opsiyonel override).
 * Verilmezse durum, mevcut doğrulama + kaynaklardan ŞEFFAFÇA türetilir
 * (bkz. lib/kaynak-guveni.ts). Otomatik olarak "sözlü gelenek"/"rivayet"
 * ATANMAZ — bunlar yalnızca editör bilgisiyle işaretlenir.
 */
export const kaynakGuveniSchema = z.enum([
  "belgelenmis",
  "birden-fazla-kaynak",
  "sozlu-gelenek",
  "rivayet",
  "dogrulanmamis",
  "editoryal-inceleme",
]);

/** Bir türkünün bilinen bir varyantı (editör tarafından doldurulur). */
export const varyantSchema = z.object({
  baslik: z.string().optional(),
  yore: z.string().optional(),
  kaynakKisi: z.string().optional(),
  derleyen: z.string().optional(),
  kayit: z.string().url().optional(),
  farklar: z.string().optional(),
  notlar: z.string().optional(),
});

export const turkuSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug yalnızca küçük harf, rakam ve tire içermeli"),
  baslik: z.string().min(1),
  digerAdlar: z.array(z.string()).optional(),
  yore: z.string().min(1),
  kaynakKisi: z.string().optional(),
  derleyen: z.string().optional(),
  ozan: z.string().optional(),
  sozYazari: z.string().optional(),
  besteci: z.string().optional(),
  hikaye: z.string().min(1),
  ozet: z.string().min(1),
  sozler: z.array(kitaSchema),
  calim: calimBilgisiSchema.optional(),
  baglantilar: z.array(platformBaglantisiSchema),
  kaynaklar: z.array(kaynakSchema),
  dogrulama: dogrulamaDurumuSchema,
  etiketler: z.array(z.string()).optional(),
  kaynakGuveni: kaynakGuveniSchema.optional(),
  varyantlar: z.array(varyantSchema).optional(),
});

export type Turku = z.infer<typeof turkuSchema>;
export type Kaynak = z.infer<typeof kaynakSchema>;
export type PlatformBaglantisi = z.infer<typeof platformBaglantisiSchema>;
export type CalimBilgisi = z.infer<typeof calimBilgisiSchema>;
export type Kita = z.infer<typeof kitaSchema>;
export type DogrulamaDurumu = z.infer<typeof dogrulamaDurumuSchema>;
export type KaynakGuveni = z.infer<typeof kaynakGuveniSchema>;
export type Varyant = z.infer<typeof varyantSchema>;
