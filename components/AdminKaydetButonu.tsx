"use client";

import { useFormStatus } from "react-dom";

export function AdminKaydetButonu({ children, sade = false }: { children: React.ReactNode; sade?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={sade ? "min-h-10 font-semibold text-kilim underline disabled:opacity-50" : "admin-button"}
    >
      {pending ? "Kaydediliyor…" : children}
    </button>
  );
}
