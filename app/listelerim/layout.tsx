import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Listelerim",
  robots: { index: false, follow: false },
};

export default function ListelerimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
