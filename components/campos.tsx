import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const estiloCampo =
  "h-12 w-full rounded-xl border border-border bg-surface px-3 text-base text-foreground outline-none transition-colors focus:border-accent";

export function Campo({
  rotulo,
  ...props
}: { rotulo: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted">
      {rotulo}
      <input {...props} className={estiloCampo} />
    </label>
  );
}

export function Selecao({
  rotulo,
  children,
  ...props
}: { rotulo: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted">
      {rotulo}
      <select {...props} className={estiloCampo}>
        {children}
      </select>
    </label>
  );
}

export function Etapa({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-3 text-lg font-semibold">
        <span className="flex size-7 items-center justify-center rounded-full bg-accent text-sm text-accent-foreground">
          {numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export const estiloBotaoPrincipal =
  "flex h-14 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl bg-accent px-6 font-semibold text-accent-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-accent-hover active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";
