import type { Metadata } from "next";
import { kartlar } from "@/lib/data";
import { RepertuvarGorunum } from "@/components/RepertuvarGorunum";

export const metadata: Metadata = {
  title: "Repertuvarım",
  description:
    "Bağlamada çaldığın, öğrendiğin ve çalmak istediğin türküler — kişisel repertuvarın.",
};

export default function RepertuvarSayfasi() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ceviz">
          🎸 Repertuvarım
        </h1>
        <p className="mt-2 text-ceviz-light">
          Bağlamada çaldığın, öğrendiğin ve çalmak istediğin türküler.
        </p>
      </header>
      <RepertuvarGorunum turkuler={kartlar()} />
    </div>
  );
}
