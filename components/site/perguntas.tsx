import { Plus } from "@phosphor-icons/react/dist/ssr";

export default function Perguntas({
  itens,
}: {
  itens: { pergunta: string; resposta: string }[];
}) {
  return (
    <div className="flex flex-col">
      {itens.map((i) => (
        <details key={i.pergunta} className="group border-b border-border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
            {i.pergunta}
            <Plus
              size={20}
              className="shrink-0 text-accent transition-transform duration-200 ease-out group-open:rotate-45"
            />
          </summary>
          <p className="max-w-[60ch] pb-5 text-muted">{i.resposta}</p>
        </details>
      ))}
    </div>
  );
}
