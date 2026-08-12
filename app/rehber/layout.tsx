import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anadolu Rehberi: Türkü ve Kültür Keşif Asistanı",
  description:
    "Anadolu Türküleri arşivinde soru sor, sana en uygun türküleri, ozanları, temaları ve yöreleri keşfet. Kaynaklı, site verisine dayalı bir keşif rehberi.",
  alternates: { canonical: "/rehber" },
  keywords: ["türkü asistanı", "anadolu rehberi", "türkü öner", "halk müziği keşif"],
  openGraph: { type: "website", url: "/rehber", title: "Anadolu Rehberi", description: "Sorunu sor, türküleri keşfet.", images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Anadolu Rehberi" }] },
};

export default function RehberLayout({ children }: { children: React.ReactNode }) {
  return children;
}
