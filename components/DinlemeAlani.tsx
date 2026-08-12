"use client";

import type { PlatformBaglantisi } from "@/lib/types";
import { PlatformLinks } from "./PlatformLinks";
import { kesfet } from "@/lib/kesif";
import { olayKaydet } from "@/lib/analytics";

/**
 * Platform bağlantılarını sarar; kullanıcı bir dinleme bağlantısına
 * (YouTube/Spotify) tıkladığında pasaporta "dinleme" keşfi işler.
 */
export function DinlemeAlani({
  baglantilar,
  turkuSlug,
  il,
}: {
  baglantilar: PlatformBaglantisi[];
  turkuSlug: string;
  il?: string | null;
}) {
  return (
    <div
      onClick={(e) => {
        const a = (e.target as HTMLElement).closest("a");
        if (!a) return;
        void kesfet("dinleme", turkuSlug, il);
        olayKaydet("listen_click", { turku_slug: turkuSlug });
      }}
    >
      <PlatformLinks baglantilar={baglantilar} />
    </div>
  );
}
