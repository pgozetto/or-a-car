import { Suspense } from "react";
import MinhaConta from "@/components/minha-conta";

export default function PaginaConta() {
  return (
    <Suspense fallback={<p className="text-muted">Carregando...</p>}>
      <MinhaConta />
    </Suspense>
  );
}
