import Cabecalho from "@/components/cabecalho";

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-4 py-8">
      <Cabecalho />
      {children}
    </main>
  );
}
