"use client";

import { useRouter } from "next/navigation";

/** Rastgele bir türküye götürür — hafif bir keşif/oyunlaştırma dokunuşu. */
export function RastgeleButon({ sluglar }: { sluglar: string[] }) {
  const router = useRouter();

  function git() {
    if (!sluglar.length) return;
    const i = Math.floor(Math.random() * sluglar.length);
    router.push(`/turku/${sluglar[i]}`);
  }

  return (
    <button
      onClick={git}
      className="inline-flex items-center gap-1.5 rounded-full border border-cini/40 bg-cini/5 px-3 py-1 text-sm font-medium text-cini-dark transition-colors hover:bg-cini hover:text-parsomen"
    >
      🎲 Rastgele türkü
    </button>
  );
}
