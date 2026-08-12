"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { olayKaydet } from "@/lib/analytics";

/**
 * Keşif bağlantısı — tıklandığında (izin verilmişse) anonim bir ürün olayı
 * gönderir. Analitik, gezinmeyi hiçbir zaman engellemez.
 */
export function KesifLink({
  href,
  olay,
  ozellikler,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  olay: string;
  ozellikler?: Record<string, string | number | boolean | null | undefined>;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={className}
      onClick={() => olayKaydet(olay, ozellikler)}
    >
      {children}
    </Link>
  );
}
