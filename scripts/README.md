# İçerik toplama pipeline'ı

Bu klasör, türkü verisini **toplayan → doğrulayan → yayına alan** araçları içerir.
Amaç: içeriği hızla zenginleştirmek ama **hiçbir doğrulanmamış veya telif riski
taşıyan içeriğin otomatik olarak yayına girmemesini** sağlamak.

## Akış

```
kaynaklar (Wikipedia, açık arşivler…)
      │  npm run ingest
      ▼
content/_staging/*.json   ← şema-geçerli TASLAK (dogrulama: "taslak")
      │  İNSAN: hikâyeyi özgün yaz, sözleri ekle/doğrula, alanları düzelt,
      │         dogrulama'yı "dogrulandi" yap
      │  npm run review -- --promote=<slug>
      ▼
content/turkuler/*.json   ← YAYIN (siteye yalnızca burası okunur)
```

Site (`lib/data.ts`) **yalnızca** `content/turkuler/` dizinini okur. `_staging/`
hiçbir zaman ziyaretçiye gösterilmez.

## Komutlar

```bash
npm run ingest                       # scripts/turku-listesi.txt'i kullanır
npm run ingest -- --source=wikipedia --terms="Gesi Bağları,Çökertme zeybeği"
npm run review                       # staging durumunu listeler
npm run review -- --show=<slug>      # bir taslağı yazdırır
npm run review -- --promote=<slug>   # koşulları geçerse yayına alır
npm run validate                     # tüm kayıtları şemaya göre doğrular (CI)
```

## Güvenlik / telif kuralları (pipeline'a gömülü)

- **Sözler asla otomatik doldurulmaz.** `normalize` sözleri boş bırakır; editör
  yalnızca açıkça geleneksel/kamuya açık kıtaları elle ekler.
- **Kaynak metni birebir yayımlanamaz.** Toplanan özet, hikâye alanına
  `[ÖZGÜN METİNLE YENİDEN YAZILMALI]` işaretiyle konur. `review --promote` bu
  işaret kalktıysa (yani editör özgün metin yazdıysa) yayına izin verir.
- **Her kayıt kaynak atıfı taşır** (`kaynaklar[]`, URL + erişim tarihi).
- **robots.txt + hız sınırı**: `pipeline/fetcher.ts` her isteği robots.txt'e göre
  kontrol eder, sunucu başına asgari gecikme uygular ve kendini tanıtan bir
  User-Agent gönderir.

## Yeni kaynak eklemek

`pipeline/sources/` altında `KaynakAdaptoru` arayüzünü uygulayan bir dosya yazın
ve `pipeline/sources/index.ts` kaydına ekleyin. Adaptör yalnızca **ham veri**
(`HamKayit`) döndürür; normalleştirme ve doğrulama pipeline'da yapılır.
