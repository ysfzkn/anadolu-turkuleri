import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anadolu Kültür Pasaportu",
  description:
    "Keşfettiğin şehirleri, türküleri, ozanları ve rozetlerini takip et. Anadolu kültür yolculuğunun kişisel haritası.",
  robots: { index: false, follow: false },
};

export default function PasaportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
