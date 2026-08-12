/**
 * Kaynak güveni — şeffaf provenance (köken) durumu.
 *
 * Bu, tarihsel DOĞRULUK iddiası DEĞİLDİR; yalnızca bir kaydın hangi kaynaklara
 * dayandığını ve editör doğrulama durumunu dürüstçe özetler. Seviye, editör bir
 * override (turku.kaynakGuveni) belirlemişse ondan; aksi halde mevcut
 * doğrulama + kaynaklardan TÜRETİLİR. "Sözlü gelenek"/"rivayet" otomatik
 * atanmaz — bunlar yalnızca editör bilgisiyle işaretlenir.
 */

import type { Turku, KaynakGuveni } from "./types";

export type GuvenTonu = "guclu" | "orta" | "notr" | "zayif";

export interface KaynakDurumu {
  seviye: KaynakGuveni;
  etiket: string;
  aciklama: string;
  ton: GuvenTonu;
}

const ETIKET: Record<KaynakGuveni, string> = {
  belgelenmis: "Belgelenmiş",
  "birden-fazla-kaynak": "Birden Fazla Kaynak",
  "sozlu-gelenek": "Sözlü Gelenek",
  rivayet: "Rivayet",
  dogrulanmamis: "Doğrulanmamış",
  "editoryal-inceleme": "Editoryal İncelemede",
};

const TON: Record<KaynakGuveni, GuvenTonu> = {
  belgelenmis: "guclu",
  "birden-fazla-kaynak": "orta",
  "sozlu-gelenek": "notr",
  rivayet: "notr",
  dogrulanmamis: "zayif",
  "editoryal-inceleme": "orta",
};

/** Editör override etiketleri için açıklama metinleri. */
const OVERRIDE_ACIKLAMA: Record<KaynakGuveni, string> = {
  belgelenmis:
    "Bu kayıt editör incelemesinden geçmiş ve belgeli kaynaklara dayanmaktadır.",
  "birden-fazla-kaynak":
    "Bu kayıt birden fazla kaynakta aktarılmaktadır.",
  "sozlu-gelenek":
    "Bu anlatı sözlü gelenekte aktarılmaktadır; tarihsel ayrıntıları kesin olarak belgelenememiştir.",
  rivayet:
    "Bu anlatı bir rivayet olarak aktarılır; doğruluğu kesin değildir, farklı anlatımları olabilir.",
  dogrulanmamis:
    "Bu kaydın kaynağı henüz doğrulanmamıştır.",
  "editoryal-inceleme":
    "Bu kayıt şu anda editoryal inceleme sürecindedir.",
};

function kurumsalKaynakVar(t: Turku): boolean {
  return (t.kaynaklar ?? []).some((k) => k.tur === "akademik" || k.tur === "kurum");
}

/**
 * Bir türkünün kaynak durumunu döndürür. Editör override varsa onu kullanır;
 * yoksa doğrulama + kaynaklardan türetir.
 */
export function kaynakDurumu(t: Turku): KaynakDurumu {
  if (t.kaynakGuveni) {
    return {
      seviye: t.kaynakGuveni,
      etiket: ETIKET[t.kaynakGuveni],
      aciklama: OVERRIDE_ACIKLAMA[t.kaynakGuveni],
      ton: TON[t.kaynakGuveni],
    };
  }

  const kaynakSayisi = (t.kaynaklar ?? []).length;

  // Editör doğrulamasından geçmiş kayıtlar.
  if (t.dogrulama === "dogrulandi") {
    const seviye: KaynakGuveni = kaynakSayisi >= 2 ? "birden-fazla-kaynak" : "belgelenmis";
    return {
      seviye,
      etiket: ETIKET[seviye],
      aciklama:
        kaynakSayisi >= 2
          ? "Editör doğrulamasından geçmiş; birden fazla kaynağa dayanan kayıt."
          : "Editör doğrulamasından geçmiş, kaynaklı kayıt.",
      ton: TON[seviye],
    };
  }

  // Editör aktif olarak inceliyor.
  if (t.dogrulama === "incelemede") {
    return {
      seviye: "editoryal-inceleme",
      etiket: ETIKET["editoryal-inceleme"],
      aciklama:
        "Bu kayıt editoryal inceleme sürecindedir; kaynakları gözden geçiriliyor.",
      ton: "orta",
    };
  }

  // taslak: otomatik toplanmış, editör doğrulaması yapılmamış.
  if (kaynakSayisi >= 2 || kurumsalKaynakVar(t)) {
    return {
      seviye: "birden-fazla-kaynak",
      etiket: "Kaynaklı (Doğrulama Bekliyor)",
      aciklama:
        "Bu kayıt kurumsal ya da birden fazla kaynağa dayanıyor; ancak henüz editör doğrulamasından geçmedi.",
      ton: "orta",
    };
  }

  return {
    seviye: "dogrulanmamis",
    etiket: "Otomatik Derleme",
    aciklama:
      "Bu kayıt açık arşivlerden otomatik olarak derlenmiştir ve henüz editör doğrulamasından geçmemiştir. Güvenilir bir kaynağınız varsa arşive katkı olarak gönderebilirsiniz.",
    ton: "zayif",
  };
}
