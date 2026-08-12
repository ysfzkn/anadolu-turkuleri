import type { Metadata } from "next";
import Link from "next/link";
import { IletisimFormu } from "@/components/IletisimFormu";
import { MotifBorder } from "@/components/Motif";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";
import { iller, tumTurkuler } from "@/lib/data";

export const metadata: Metadata = {
  title: "Hakkımızda ve İletişim",
  description: "Anadolu Türküleri dijital kültür arşivinin amacı, editoryal ilkeleri, özellikleri ve iletişim kanalları.",
  alternates: { canonical: "/hakkinda" },
};

const OZELLIKLER = [
  { isaret: "⌕", baslik: "Kaynaklı türkü arşivi", aciklama: "Türküleri başlık, söz, yöre, ozan ve temaya göre arayın; her kaydın kaynak ve inceleme durumunu görün.", href: "/" },
  { isaret: "⌘", baslik: "Etkileşimli Türkiye haritası", aciklama: "Şehirleri harita üzerinden keşfedin ve her yörenin repertuvarına doğrudan ulaşın.", href: "/" },
  { isaret: "♪", baslik: "Dinleme ve video eşleşmeleri", aciklama: "Spotify albüm kapağı ve önizlemesiyle, tıklayınca açılan en olası YouTube videosunu aynı sayfada kullanın.", href: "/" },
  { isaret: "◇", baslik: "Türkü Soy Ağacı", aciklama: "Eserler arasındaki yöre, ozan, tema ve varyant bağlarını etkileşimli kültür grafiğinde izleyin.", href: "/soy-agaci" },
  { isaret: "✦", baslik: "Anadolu oyunları", aciklama: "Görsel, işitsel ve çok oyunculu oyunlarla halk müziği bilgisini eğlenceli biçimde sınayın.", href: "/quiz" },
  { isaret: "⌁", baslik: "Kültür rotaları", aciklama: "Türküleri tarihî yapılar, şehir belleği, ozanlar ve gezilecek kültür duraklarıyla birlikte keşfedin.", href: "/kultur-rotalari" },
  { isaret: "♬", baslik: "Bağlama ve ney rehberi", aciklama: "Çalım bilgilerine, öğrenme yollarına ve seçilmiş eğitim kaynaklarına erişin.", href: "/kurslar" },
  { isaret: "♡", baslik: "Kişisel listeler", aciklama: "Hesabınızla türkü listeleri oluşturun, paylaşın ve uygun eserleri Spotify çalma listesine aktarın.", href: "/listelerim" },
  { isaret: "▧", baslik: "Kişisel repertuvar", aciklama: "Çalıştığınız türküleri repertuvarınıza ekleyin ve öğrenme arşivinizi düzenleyin.", href: "/repertuvar" },
  { isaret: "+", baslik: "Yaşayan Hafıza katkıları", aciklama: "Ailenizden duyduğunuz anlatıyı, söz varyantını, fotoğrafı veya kaynak bilgisini editörlere iletin.", href: "/katki" },
  { isaret: "↗", baslik: "Paylaşılabilir kültür kartları", aciklama: "Türkü hikâyelerini özenli görsel kartlara dönüştürüp sosyal kanallarda paylaşın.", href: "/" },
  { isaret: "◎", baslik: "Şeffaf görsel ve kaynak politikası", aciklama: "Kayıtların, fotoğrafların ve dış platform bağlantılarının kaynağını ve lisans yaklaşımını inceleyin.", href: "/gorsel-kaynaklari" },
];

export default function Hakkinda() {
  const turkuSayisi = tumTurkuler().length;
  const ilSayisi = iller().length;
  const eposta = process.env.ILETISIM_ALICI_EMAIL?.trim() || "iletisim@anadoluturkuleri.com";

  return (
    <main>
      <YapilandirilmisVeri veri={{ "@context": "https://schema.org", "@type": "ContactPage", name: "Anadolu Türküleri Hakkımızda ve İletişim", url: "https://anadoluturkuleri.com/hakkinda", mainEntity: { "@type": "Organization", name: "Anadolu Türküleri", email: eposta } }} />

      <section className="relative overflow-hidden border-b border-toprak/20 bg-gradient-to-br from-[#f8f0df] via-parsomen to-[#edf3ed]">
        <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rotate-45 rounded-[80px] border border-kilim/10" />
        <div className="pointer-events-none absolute -bottom-32 left-[8%] h-72 w-72 rounded-full border border-cini/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="grid items-end gap-10 lg:grid-cols-[1.25fr_.75fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.24em] text-kilim">Anadolu’nun yaşayan ses arşivi</p>
              <h1 className="mt-4 max-w-4xl font-serif text-4xl font-semibold leading-[1.12] text-ceviz sm:text-6xl">Bir türkünün yalnızca sesini değil, izini de koruyoruz.</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-ceviz-light">Anadolu Türküleri; eserleri hikâyeleri, yöreleri, ozanları, sözleri, çalım bilgileri ve kültürel çevresiyle bir araya getiren bağımsız bir dijital kültür girişimidir.</p>
              <div className="mt-8 flex flex-wrap gap-3"><Link href="/" className="inline-flex min-h-12 items-center rounded-xl bg-ceviz px-5 font-semibold text-white shadow-sm hover:bg-kilim-dark">Arşivi keşfet</Link><a href="#iletisim" className="inline-flex min-h-12 items-center rounded-xl border border-toprak/35 bg-white/60 px-5 font-semibold text-ceviz hover:bg-white">Bize ulaşın</a></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-toprak/20 bg-white/55 p-5 backdrop-blur"><strong className="font-serif text-4xl text-ceviz">{turkuSayisi.toLocaleString("tr-TR")}+</strong><span className="mt-1 block text-sm text-ceviz-light">arşiv kaydı</span></div>
              <div className="rounded-3xl border border-toprak/20 bg-white/55 p-5 backdrop-blur"><strong className="font-serif text-4xl text-ceviz">{ilSayisi}</strong><span className="mt-1 block text-sm text-ceviz-light">şehir ve yöre</span></div>
              <div className="col-span-2 rounded-3xl bg-ceviz p-5 text-parsomen"><p className="text-xs font-bold uppercase tracking-[.18em] text-toprak-light">Temel ilkemiz</p><p className="mt-2 font-serif text-xl leading-7">Kaynağı göster, belirsizliği saklama, yaşayan hafızaya saygı duy.</p></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14">
        <section className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-kilim">Neden buradayız?</p><h2 className="mt-3 font-serif text-3xl font-semibold text-ceviz">Sözlü kültürü bağlamından koparmadan erişilebilir kılmak.</h2></div>
          <div className="space-y-5 text-[17px] leading-8 text-ceviz-light"><p>Bir türkü; yalnızca söz ve ezgiden oluşmaz. Yörenin dili, tarihî olaylar, göçler, ustalar, kaynak kişiler ve farklı icra biçimleri eserin hafızasını birlikte kurar. Arşivimizi bu ilişkileri görünür kılacak biçimde geliştiriyoruz.</p><p>Temel katalog kayıtları eserin adını, yöresini ve açık arşiv izini erişilebilir kılar. Hikâye, derleme, ozan ve çalım bilgileri güvenilir kaynaklarla karşılaştırıldıkça kayıtlar ayrıntılandırılır. İnceleme tamamlanmamış bilgi kesin gerçek gibi sunulmaz.</p></div>
        </section>

        <MotifBorder className="my-12 opacity-70" />

        <section>
          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-kilim">Sitede neler yapabilirsiniz?</p><h2 className="mt-3 font-serif text-4xl font-semibold text-ceviz">Arşivden etkileşimli kültür deneyimine</h2><p className="mt-4 text-lg leading-8 text-ceviz-light">Araştırma, dinleme, öğrenme, oyun ve topluluk katkısı aynı kültür atlasının parçalarıdır.</p></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{OZELLIKLER.map((ozellik) => <Link key={ozellik.baslik} href={ozellik.href} className="group rounded-3xl border border-toprak/25 bg-white/55 p-5 transition hover:-translate-y-1 hover:border-kilim/35 hover:bg-white hover:shadow-motif"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-toprak/10 font-serif text-xl font-bold text-kilim transition group-hover:bg-kilim group-hover:text-white">{ozellik.isaret}</span><h3 className="mt-5 font-serif text-xl font-semibold text-ceviz">{ozellik.baslik}</h3><p className="mt-2 text-sm leading-6 text-ceviz-light">{ozellik.aciklama}</p><span className="mt-4 inline-flex text-sm font-semibold text-cini-dark">İncele →</span></Link>)}</div>
        </section>

        <section className="mt-14 grid gap-5 md:grid-cols-3">
          {[{ baslik: "Kaynak ve doğrulama", metin: "Her kayıt kaynakları ve editoryal durumuyla birlikte sunulur. Rivayet, tarihsel olgu ve tartışmalı atıf birbirinden ayrılır." }, { baslik: "Telif duyarlılığı", metin: "Telifli ses kayıtlarını barındırmayız. Platform içerikleri resmi oynatıcı veya bağlantılarla sunulur; sözler yalnızca uygun hak durumunda yayımlanır." }, { baslik: "Topluluk ve düzeltme", metin: "Yerel bilgi değerlidir; ancak katkılar otomatik yayımlanmaz. Kaynak, izin, kişisel veri ve arşiv bütünlüğü açısından editoryal incelemeden geçer." }].map((ilke) => <article key={ilke.baslik} className="rounded-3xl bg-parsomen-dark/55 p-6"><h2 className="font-serif text-2xl font-semibold text-ceviz">{ilke.baslik}</h2><p className="mt-3 text-sm leading-7 text-ceviz-light">{ilke.metin}</p></article>)}
        </section>

        <section className="mt-14">
          <div className="overflow-hidden rounded-3xl border border-toprak/25 bg-gradient-to-br from-white/70 to-parsomen-dark/45 p-7 sm:p-9">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-kilim">Projeyi geliştiren</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-ceviz">Yusuf Özkan</h2>
                <p className="mt-3 max-w-2xl leading-7 text-ceviz-light">Anadolu Türküleri; halk müziği mirasını çağdaş bir dijital deneyime dönüştürmek amacıyla Yusuf Özkan tarafından tasarlanıp geliştirildi. Yeni fikirler, iş birlikleri veya yazılım projeleri için doğrudan ulaşabilirsiniz.</p>
              </div>
              <a href="https://ozkanyusuf.com" target="_blank" rel="noopener" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ceviz px-6 font-semibold text-parsomen transition hover:bg-kilim-dark">
                ozkanyusuf.com ↗
              </a>
            </div>
          </div>
        </section>

        <section id="iletisim" className="scroll-mt-28 pt-16">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
            <div><p className="text-xs font-bold uppercase tracking-[.2em] text-kilim">Bize ulaşın</p><h2 className="mt-3 font-serif text-4xl font-semibold text-ceviz">Önerinizi dinliyoruz.</h2><p className="mt-4 leading-7 text-ceviz-light">Bir özellik fikri, bilgi düzeltmesi, teknik sorun veya iş birliği önerisi paylaşabilirsiniz. Türküye özel belge, fotoğraf ya da anlatılar için <Link href="/katki" className="font-semibold text-cini-dark underline underline-offset-2">Yaşayan Hafıza katkı formunu</Link> kullanın.</p><div className="mt-6 rounded-2xl border border-toprak/25 bg-toprak/8 p-4 text-sm leading-6 text-ceviz-light"><strong className="text-ceviz">Doğrudan e-posta</strong><br /><a href={`mailto:${eposta}`} className="text-cini-dark underline underline-offset-2">{eposta}</a></div><p className="mt-5 text-xs leading-5 text-ceviz-light">Form mesajları yalnızca iletişim ve talep takibi amacıyla kullanılır; pazarlama listesine eklenmez.</p></div>
            <IletisimFormu epostaAdresi={eposta} />
          </div>
        </section>
      </div>
    </main>
  );
}
