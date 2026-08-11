import type { Config } from "tailwindcss";

/**
 * Anadolu Türküleri tasarım sistemi.
 * Palet Anadolu kilim ve çini geleneğinden ilham alır:
 * - kilim: dokuma kırmızısı (vurgu)
 * - cini: çini/İznik mavisi (ikincil vurgu)
 * - toprak: ochre/altın (detay)
 * - parsomen: eskimiş kâğıt zemin
 * - ceviz: koyu ceviz metin/koyu zemin
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kilim: {
          DEFAULT: "#9c2b21",
          light: "#c14134",
          dark: "#761d16",
        },
        cini: {
          DEFAULT: "#1f5673",
          light: "#2f7695",
          dark: "#143b50",
        },
        toprak: {
          DEFAULT: "#c8873f",
          light: "#e0a55c",
          dark: "#9c6528",
        },
        parsomen: {
          DEFAULT: "#f6efe1",
          dark: "#ece1cc",
        },
        ceviz: {
          DEFAULT: "#2b2118",
          light: "#4a3a2c",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        motif: "0 1px 2px rgba(43,33,24,0.08), 0 8px 24px rgba(43,33,24,0.10)",
      },
      backgroundImage: {
        "kilim-fade":
          "linear-gradient(180deg, rgba(246,239,225,0) 0%, rgba(236,225,204,0.6) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
