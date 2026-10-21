"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";
import ThemeToggle from "./theme-toggle";

const LINKS = [
  { href: "/painel", rotulo: "Novo" },
  { href: "/painel/orcamentos", rotulo: "Orçamentos" },
  { href: "/painel/oficina", rotulo: "Oficina" },
  { href: "/painel/tutoriais", rotulo: "Tutoriais" },
];

export default function Cabecalho() {
  const caminho = usePathname();

  return (
    <header className="flex flex-col gap-4 print:hidden">
      <div className="flex items-center justify-between">
        <Logo href="/painel" />
        <ThemeToggle />
      </div>
      <nav className="grid grid-cols-4 gap-1 rounded-2xl border border-border bg-surface p-1">
        {LINKS.map((l) => {
          const ativo =
            l.href === "/painel" ? caminho === "/painel" : caminho.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={ativo ? "page" : undefined}
              className={`flex h-11 items-center justify-center rounded-xl text-[13px] font-medium sm:text-sm transition-colors ${
                ativo
                  ? "bg-accent text-accent-foreground sombra-botao"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {l.rotulo}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
