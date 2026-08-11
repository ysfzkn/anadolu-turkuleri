import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkında",
  description:
    "Anadolu Türküleri projesinin amacı, kaynak yaklaşımı ve telif duyarlılığı hakkında.",
};

export default function Hakkinda() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-4xl font-semibold text-ceviz">Hakkında</h1>
      <div className="hikaye mt-6 text-[17px] text-ceviz">
        <p>
          Anadolu Türküleri; Anadolu'nun ve Türkiye'nin dört bir yanının türkü
          mirasını hikâyeleri, yöreleri, ozanları ve çalım bilgileriyle bir
          araya getiren, kâr amacı gütmeyen bir kültür arşividir.
        </p>
        <p>
          Amacımız insanları bilgilendirmek, farkındalık oluşturmak ve bu zengin
          sözlü geleneği gelecek kuşaklara aktarmaktır.
        </p>
        <h2 className="font-serif text-2xl font-semibold text-ceviz">
          Kaynak ve telif yaklaşımımız
        </h2>
        <p>
          Yayımladığımız türküler geleneksel/anonim eserlerden derlenir. Her
          kayıt, kaynak atıflarıyla birlikte sunulur ve yayına alınmadan önce
          editör doğrulamasından geçer. Telifli icra kayıtlarını barındırmayız;
          dinleme için yalnızca Spotify ve YouTube gibi platformlara yönlendirme
          bağlantıları veririz.
        </p>
        <p>
          Bir hata fark eder veya katkı sunmak isterseniz bize
          ulaşabilirsiniz.
        </p>
      </div>
    </article>
  );
}
