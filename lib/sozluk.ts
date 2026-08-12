/**
 * Kültürel sözlük — Türk halk şiiri ve müziğinin sık geçen terimleri.
 *
 * Tanımlar genel, doğrulanabilir kültürel bilgidir; belirli bir türküye ilişkin
 * uydurma iddia içermez. "Bu terimi içeren türküler" listesi, mevcut türkü
 * metinlerinden (sözler + hikâye + özet) TÜRETİLİR.
 */

import { tumTurkuler, ilAdi, ilSlug } from "./data";
import type { Turku } from "./types";
import type { KartTurku } from "@/components/TurkuCard";

export interface SozlukTerimi {
  slug: string;
  terim: string;
  /** Kısa, arama/kart görünümü için özet tanım. */
  kisaTanim: string;
  modernAnlam: string;
  turkuBaglami: string;
  kulturelYorum?: string;
  ilgili?: string[]; // diğer terim slug'ları
  /**
   * Türkü metinlerinde otomatik eşleştirme için kökler (küçük harf, en az 4
   * karakter). Kısa/çok anlamlı terimlerde ("yar") boş bırakılır — yanlış
   * eşleşme üretmemek için.
   */
  desenler?: string[];
}

export const SOZLUK: SozlukTerimi[] = [
  {
    slug: "gurbet",
    terim: "Gurbet",
    kisaTanim: "Kişinin memleketinden uzak kalması; sılaya duyulan özlem.",
    modernAnlam: "Yaşanılan yerden, memleketten uzakta olma durumu.",
    turkuBaglami:
      "Türkülerde gurbet, çoğu zaman ekmek parası için sıladan ayrı düşmenin acısıdır. Yabancılık, yalnızlık ve geride bırakılanların özlemi bu tek sözcükte toplanır.",
    kulturelYorum:
      "Anadolu'nun göç tarihiyle örülüdür; gurbet türküleri hem gidenin hem kalanın belleğini taşır.",
    ilgili: ["sila", "hasret", "turna"],
    desenler: ["gurbet"],
  },
  {
    slug: "sila",
    terim: "Sıla",
    kisaTanim: "Özlenen memleket, doğulan yer; gurbetin karşıtı.",
    modernAnlam: "İnsanın doğup büyüdüğü, özlemini çektiği yer.",
    turkuBaglami:
      "Sıla, gurbetteki kişinin gönlünde büyüyen memlekettir. Türkülerde sılaya varmak, hasretin sona ermesi ve kavuşmanın simgesidir.",
    ilgili: ["gurbet", "hasret"],
    desenler: ["sıla", "sila"],
  },
  {
    slug: "yar",
    terim: "Yâr",
    kisaTanim: "Sevgili; gönül verilen kişi.",
    modernAnlam: "Sevgili, sevilen kişi, dost.",
    turkuBaglami:
      "Yâr, halk şiirinin merkezindeki sevgilidir. Kavuşma, ayrılık ve sitem çoğu zaman yâr üzerinden söylenir; kimi deyişlerde tasavvufi olarak ilahi sevgiliyi de imler.",
    ilgili: ["zuluf", "sevda"],
  },
  {
    slug: "zuluf",
    terim: "Zülüf",
    kisaTanim: "Yüz kenarına düşen saç lülesi; güzellik imgesi.",
    modernAnlam: "Şakaklardan sarkan saç teli, bukle.",
    turkuBaglami:
      "Zülüf, güzellemelerde sevgilinin güzelliğini anlatan klasik imgelerden biridir; çoğu zaman 'zülfü perişan' gibi kalıplarla gönül karışıklığını da çağrıştırır.",
    ilgili: ["yar", "guzelleme"],
    desenler: ["zülüf", "zülf", "zuluf"],
  },
  {
    slug: "turna",
    terim: "Turna",
    kisaTanim: "Göçmen kuş; haber, hasret ve sıla simgesi.",
    modernAnlam: "Uzun boyunlu, sürüler hâlinde göçen bir kuş.",
    turkuBaglami:
      "Turna, türkülerde sıladan haber getiren ve götüren ulaktır. 'Allı turnam' gibi seslenişlerle sevgiliye ve memlekete selam yollanır; katarı, ayrılığı ve yol imgesini taşır.",
    kulturelYorum:
      "Alevi-Bektaşi geleneğinde turna semahı gibi ritüel çağrışımları da vardır.",
    ilgili: ["gurbet", "sila", "semah"],
    desenler: ["turna"],
  },
  {
    slug: "bozlak",
    terim: "Bozlak",
    kisaTanim: "İç Anadolu'nun yüksek perdeli, acılı uzun hava geleneği.",
    modernAnlam: "Serbest ritimli, tiz perdeden okunan bir uzun hava türü.",
    turkuBaglami:
      "Bozlak; özellikle Kırşehir-Avşar yöresinde sevda, gurbet ve ağıt temalarını tok, haykırışa yakın bir söyleyişle işler. Neşet Ertaş ve Muharrem Ertaş bu geleneğin başlıca sesleridir.",
    ilgili: ["uzun-hava", "agit"],
    desenler: ["bozlak"],
  },
  {
    slug: "uzun-hava",
    terim: "Uzun Hava",
    kisaTanim: "Belirli bir usule bağlı olmayan, serbest tavırlı ezgi.",
    modernAnlam: "Ölçüsüz (serbest ritimli), uzun soluklu halk ezgisi.",
    turkuBaglami:
      "Uzun hava, sözün ve nefesin öne çıktığı serbest bir söyleyiştir. Bozlak, maya ve hoyrat gibi türler bu geniş ailenin içindedir; kırık havanın tartımlı yapısının karşıtıdır.",
    ilgili: ["kirik-hava", "bozlak", "maya", "hoyrat"],
  },
  {
    slug: "kirik-hava",
    terim: "Kırık Hava",
    kisaTanim: "Belirli bir usule oturan, tartımlı halk ezgisi.",
    modernAnlam: "Ölçülü (ritmik) yapıya sahip halk ezgisi türü.",
    turkuBaglami:
      "Kırık hava, oyun havalarından oturak ezgilerine kadar tartımlı türkülerin çoğunu kapsar. Uzun havanın serbest tavrının aksine belirgin bir usule yaslanır.",
    ilgili: ["uzun-hava"],
  },
  {
    slug: "deyis",
    terim: "Deyiş",
    kisaTanim: "Alevi-Bektaşi geleneğinde tasavvufi söz-ezgi.",
    modernAnlam: "Ozanların dilinde inanç ve yol öğretisini anlatan ezgili şiir.",
    turkuBaglami:
      "Deyiş; Pir Sultan Abdal, Âşık Veysel gibi ozanların dilinde insan sevgisini, ilahi aşkı ve yol erkânını işler. Cem ve muhabbet meclislerinin temel repertuvarıdır.",
    ilgili: ["semah", "tasavvuf", "yar"],
    desenler: ["deyiş"],
  },
  {
    slug: "semah",
    terim: "Semah",
    kisaTanim: "Cemlerde, deyişler eşliğinde dönülen ritüel hareket.",
    modernAnlam: "Alevi-Bektaşi cem törenlerinde yapılan dinsel devinim.",
    turkuBaglami:
      "Semah, deyiş ve nefeslerle iç içedir; evrenin dönüşünü ve gönlün Hakk'a yönelişini simgeleyen bir ibadet biçimidir. Turna semahı en bilinen örneklerdendir.",
    ilgili: ["deyis", "turna", "tasavvuf"],
    desenler: ["semah"],
  },
  {
    slug: "zeybek",
    terim: "Zeybek",
    kisaTanim: "Ege'nin ağır, mağrur oyun ve ezgi geleneği.",
    modernAnlam: "Batı Anadolu'ya özgü, ölçülü ve ağırbaşlı bir oyun/ezgi türü.",
    turkuBaglami:
      "Zeybek, efelik kültürüyle iç içedir; ağır zeybeklerin duruşu yiğitlik ve vakar taşır. 9 zamanlı usulüyle Ege türkülerinin damgasıdır.",
    ilgili: ["efe", "kirik-hava"],
    desenler: ["zeybek"],
  },
  {
    slug: "efe",
    terim: "Efe",
    kisaTanim: "Batı Anadolu'nun yiğitlik geleneğinin simge figürü.",
    modernAnlam: "Ege yöresinde mertlik ve cesaretle anılan halk kahramanı.",
    turkuBaglami:
      "Efe türküleri; sözünde durmayı, halkın yanında olmayı ve mertliği zeybek ezgileriyle yaşatır. Efe, zeybek oyununun da ruhunu verir.",
    ilgili: ["zeybek"],
  },
  {
    slug: "hoyrat",
    terim: "Hoyrat",
    kisaTanim: "Güneydoğu ve Kerkük çevresinin cinaslı uzun hava türü.",
    modernAnlam: "Genellikle cinaslı mani sözleriyle okunan bir uzun hava.",
    turkuBaglami:
      "Hoyrat, özellikle Kerkük ve Güneydoğu'da sevda, gurbet ve ayrılığı cinaslı dörtlüklerle, keskin bir söyleyişle işler.",
    ilgili: ["uzun-hava", "maya"],
    desenler: ["hoyrat"],
  },
  {
    slug: "maya",
    terim: "Maya",
    kisaTanim: "Doğu Anadolu'da yaygın, içli bir uzun hava türü.",
    modernAnlam: "Serbest tavırlı, dokunaklı bir uzun hava biçimi.",
    turkuBaglami:
      "Maya, özellikle Elazığ-Harput ve Doğu Anadolu'da sevda ve hasreti uzun soluklu, süslü bir söyleyişle dile getirir.",
    ilgili: ["uzun-hava", "hoyrat", "bozlak"],
  },
];

const SLUG_HARITASI = new Map(SOZLUK.map((t) => [t.slug, t]));

export function terimBul(slug: string): SozlukTerimi | undefined {
  return SLUG_HARITASI.get(slug);
}

export function tumTerimSluglari(): string[] {
  return SOZLUK.map((t) => t.slug);
}

// ── Türkü ↔ terim eşleştirme (metinden türetilir) ───────────────────────────

function turkuMetni(t: Turku): string {
  const sozler = (t.sozler ?? []).flatMap((k) => k.satirlar).join(" ");
  return `${t.baslik} ${t.ozet} ${t.hikaye} ${sozler}`.toLocaleLowerCase("tr");
}

/** Bir terimin metinde geçip geçmediğini, köklerine göre kontrol eder. */
function terimGeciyor(terim: SozlukTerimi, metin: string): boolean {
  const desenler = terim.desenler;
  if (!desenler || desenler.length === 0) return false;
  return desenler.some((kok) => {
    if (kok.length < 4) return false;
    // Kelime başında kök + herhangi bir Türkçe ek: "gurbet", "gurbete", "gurbetin"…
    const re = new RegExp(`(^|[^\\p{L}])${kok}\\p{L}*`, "u");
    return re.test(metin);
  });
}

let _terimTurkuHaritasi: Map<string, KartTurku[]> | null = null;
function terimTurkuHaritasi(): Map<string, KartTurku[]> {
  if (_terimTurkuHaritasi) return _terimTurkuHaritasi;
  const harita = new Map<string, KartTurku[]>();
  for (const terim of SOZLUK) harita.set(terim.slug, []);
  for (const t of tumTurkuler()) {
    const metin = turkuMetni(t);
    for (const terim of SOZLUK) {
      if (terimGeciyor(terim, metin)) {
        harita.get(terim.slug)!.push({
          slug: t.slug,
          baslik: t.baslik,
          yore: t.yore,
          ozet: t.ozet,
          etiketler: t.etiketler,
          ozan: t.ozan,
          sozYazari: t.sozYazari,
        });
      }
    }
  }
  for (const liste of harita.values()) {
    liste.sort((a, b) => a.baslik.localeCompare(b.baslik, "tr"));
  }
  _terimTurkuHaritasi = harita;
  return harita;
}

export interface TerimDetay extends SozlukTerimi {
  turkuler: KartTurku[];
  yoreler: { ad: string; slug: string; adet: number }[];
  ilgiliTerimler: SozlukTerimi[];
}

export function terimDetay(slug: string): TerimDetay | null {
  const terim = terimBul(slug);
  if (!terim) return null;
  const turkuler = terimTurkuHaritasi().get(slug) ?? [];
  const yoreSayac = new Map<string, { ad: string; slug: string; adet: number }>();
  for (const t of turkuler) {
    const ad = ilAdi(t.yore);
    const yslug = ilSlug(t.yore);
    const mevcut = yoreSayac.get(yslug);
    if (mevcut) mevcut.adet++;
    else yoreSayac.set(yslug, { ad, slug: yslug, adet: 1 });
  }
  return {
    ...terim,
    turkuler,
    yoreler: Array.from(yoreSayac.values()).sort((a, b) => b.adet - a.adet).slice(0, 12),
    ilgiliTerimler: (terim.ilgili ?? [])
      .map((s) => terimBul(s))
      .filter((x): x is SozlukTerimi => Boolean(x)),
  };
}

/** Bir türküde geçen sözlük terimleri (türkü sayfasında çip satırı için). */
export function turkudeGecenTerimler(t: Turku): SozlukTerimi[] {
  const metin = turkuMetni(t);
  return SOZLUK.filter((terim) => terimGeciyor(terim, metin));
}

/** İndeks/kart görünümü için terim özetleri (eşleşen türkü sayısıyla). */
export function terimOzetleri(): (SozlukTerimi & { adet: number })[] {
  const harita = terimTurkuHaritasi();
  return SOZLUK.map((t) => ({ ...t, adet: harita.get(t.slug)?.length ?? 0 }));
}
