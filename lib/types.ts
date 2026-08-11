/**
 * Türkü veri modelinin TypeScript tipleri.
 *
 * Tek doğruluk kaynağı lib/schema.ts'tir (zod). Tipler oradan türetilir;
 * bu dosya geriye dönük uyumluluk için yeniden dışa aktarır.
 */
export type {
  Turku,
  Kaynak,
  PlatformBaglantisi,
  CalimBilgisi,
  Kita,
  DogrulamaDurumu,
} from "./schema";
