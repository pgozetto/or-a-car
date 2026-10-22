import Link from "next/link";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";

export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/planos"
              className="hidden text-sm text-muted transition-colors hover:text-foreground sm:block"
            >
              Planos
            </Link>
            <Link
              href="/entrar"
              className="text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              Entrar
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="flex gap-6">
            <Link href="/planos" className="hover:text-foreground">
              Planos
            </Link>
            <Link href="/painel/tutoriais" className="hover:text-foreground">
              Tutoriais
            </Link>
            <Link href="/entrar" className="hover:text-foreground">
              Entrar
            </Link>
          </div>
          <p>© {new Date().getFullYear()} OrçaCar</p>
        </div>
      </footer>
    </div>
  );
}
