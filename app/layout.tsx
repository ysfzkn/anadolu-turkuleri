import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { StarMotif } from "@/components/Motif";
import { KullaniciMenusu } from "@/components/KullaniciMenusu";

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
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Anadolu Türküleri",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <div className="kilim-strip" />
        <header className="border-b border-toprak/30 bg-parsomen/80 backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-kilim group-hover:text-kilim-dark transition-colors">
                <StarMotif size={34} />
              </span>
              <span className="font-serif text-xl sm:text-2xl font-semibold text-ceviz">
                Anadolu Türküleri
              </span>
            </Link>
            <div className="flex items-center gap-4 sm:gap-6">
              <nav className="flex items-center gap-4 text-sm font-medium text-ceviz-light sm:gap-6">
                <Link href="/" className="hover:text-kilim transition-colors">
                  Türküler
                </Link>
                <Link href="/quiz" className="hover:text-kilim transition-colors">
                  Oyun
                </Link>
                <Link
                  href="/hakkinda"
                  className="hidden hover:text-kilim transition-colors sm:inline"
                >
                  Hakkında
                </Link>
              </nav>
              <KullaniciMenusu />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-16 border-t border-toprak/30 bg-parsomen-dark/60">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-ceviz-light">
            <p className="font-serif text-base text-ceviz mb-1">Anadolu Türküleri</p>
            <p>
              Amacımız Anadolu'nun türkü mirasını hikâyeleri ve yöreleriyle
              yaşatmak, tanıtmak ve gelecek kuşaklara aktarmaktır.
            </p>
            <p className="mt-3 text-xs text-ceviz-light/80">
              İçerikler geleneksel/anonim türkülerden derlenmiştir; kaynak
              atıfları her türkü sayfasında belirtilir.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
