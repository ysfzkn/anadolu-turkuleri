import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { KullaniciMenusu } from "@/components/KullaniciMenusu";
import { AnaNavigasyon } from "@/components/AnaNavigasyon";
import { YapilandirilmisVeri } from "@/components/YapilandirilmisVeri";
import { AnalitikIzni } from "@/components/AnalitikIzni";

const serif = Lora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://anadoluturkuleri.com"),
  title: {
    default: "Anadolu Türküleri — Hikâyeleriyle Türküler",
    template: "%s · Anadolu Türküleri",
  },
  description:
    "Anadolu türkülerini hikâyeleri, yöreleri, ozanları ve nota/çalım bilgileriyle bir araya getiren dijital arşiv.",
  keywords: ["türküler", "türkü hikâyeleri", "Anadolu türküleri", "türkü sözleri", "yöresel türküler", "halk müziği"],
  authors: [{ name: "Anadolu Türküleri" }],
  creator: "Anadolu Türküleri",
  category: "kültür ve müzik arşivi",
  applicationName: "Anadolu Türküleri",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: "/" },
  icons: { icon: "/icon.png", apple: "/icon.png" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Anadolu Türküleri",
    title: "Anadolu Türküleri — Hikâyeleriyle Türküler",
    description: "Türkü hikâyeleri, yöreler, ozanlar, sözler ve çalım bilgileriyle kaynaklı Anadolu halk müziği arşivi.",
    url: "https://anadoluturkuleri.com",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Anadolu Türküleri dijital arşivi" }],
  },
  twitter: { card: "summary_large_image", title: "Anadolu Türküleri", description: "Türkülerin hikâyelerini, yörelerini ve ozanlarını keşfedin.", images: ["/opengraph-image.png"] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <a href="#ana-icerik" className="sr-only z-[100] rounded-lg bg-ceviz px-4 py-3 text-parsomen focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Ana içeriğe geç</a>
        <YapilandirilmisVeri veri={[
          { "@context": "https://schema.org", "@type": "WebSite", name: "Anadolu Türküleri", url: "https://anadoluturkuleri.com", inLanguage: "tr-TR", description: "Türkü hikâyeleri, yöreler, ozanlar ve halk müziği repertuvarı." },
          { "@context": "https://schema.org", "@type": "Organization", name: "Anadolu Türküleri", url: "https://anadoluturkuleri.com", logo: "https://anadoluturkuleri.com/logo-mark.png" },
        ]} />
        <div className="kilim-strip" />
        <header className="sticky top-0 z-40 border-b border-toprak/20 bg-parsomen/88 shadow-[0_1px_0_rgba(110,72,40,0.04)] backdrop-blur-xl">
          <div className="mx-auto flex min-h-[72px] max-w-6xl items-center justify-between gap-3 px-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo-mark.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
              />
              <span className="hidden font-serif text-xl font-semibold text-ceviz min-[440px]:inline sm:text-2xl">
                Anadolu Türküleri
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <AnaNavigasyon />
              <KullaniciMenusu />
            </div>
          </div>
        </header>

        <main id="ana-icerik" className="flex-1" tabIndex={-1}>{children}</main>

        <footer className="mt-16 bg-ceviz text-parsomen/80">
          <div className="kilim-strip" />
          <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
            <img
              src="/logo-footer.png"
              alt="Anadolu Türküleri"
              className="h-24 w-auto opacity-90"
            />
            <div className="max-w-md text-sm">
              <p className="leading-relaxed">
                Amacımız Anadolu'nun türkü mirasını hikâyeleri ve yöreleriyle
                yaşatmak, tanıtmak ve gelecek kuşaklara aktarmaktır.
              </p>
              <p className="mt-3 text-xs text-parsomen/50">
                Kayıtların kaynakları ve editoryal durumu ilgili türkü
                sayfasında açıkça belirtilir.
              </p>
              <nav aria-label="Alt menü" className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <Link href="/" className="underline decoration-parsomen/25 underline-offset-4 hover:text-white">Türkü arşivi</Link>
                <Link href="/quiz" className="underline decoration-parsomen/25 underline-offset-4 hover:text-white">Anadolu oyunları</Link>
                <Link href="/soy-agaci" className="underline decoration-parsomen/25 underline-offset-4 hover:text-white">Türkü soy ağacı</Link>
                <Link href="/katki" className="underline decoration-parsomen/25 underline-offset-4 hover:text-white">Arşive katkı ver</Link>
                <Link href="/kultur-rotalari" className="underline decoration-parsomen/25 underline-offset-4 hover:text-white">Kültür rotaları</Link>
                <Link href="/kurslar" className="underline decoration-parsomen/25 underline-offset-4 hover:text-white">Bağlama ve ney</Link>
                <Link href="/destek" className="underline decoration-parsomen/25 underline-offset-4 hover:text-white">Arşivi destekle</Link>
                <Link href="/gizlilik" className="underline decoration-parsomen/25 underline-offset-4 hover:text-white">Gizlilik</Link>
                <Link href="/hakkinda" className="underline decoration-parsomen/25 underline-offset-4 hover:text-white">Yöntem ve kaynaklar</Link>
              </nav>
            </div>
          </div>
        </footer>
        <AnalitikIzni />
      </body>
    </html>
  );
}
