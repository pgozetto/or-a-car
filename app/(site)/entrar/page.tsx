import type { Metadata } from "next";
import { Suspense } from "react";
import FormEntrar from "@/components/form-entrar";

export const metadata: Metadata = {
  title: "Entrar | OrçaCar",
};

export default function PaginaEntrar() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-8 px-4 py-12 md:py-20">
      <Suspense>
        <FormEntrar />
      </Suspense>
    </section>
  );
}
