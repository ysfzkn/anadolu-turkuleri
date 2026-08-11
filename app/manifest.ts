import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anadolu Türküleri",
    short_name: "Türküler",
    description: "Türkü hikâyeleri, yöreler, ozanlar ve halk müziği repertuvarı.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6eddd",
    theme_color: "#9c2b21",
    lang: "tr-TR",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" }],
  };
}
