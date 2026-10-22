"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Campo, estiloBotaoPrincipal } from "@/components/campos";

export default function PaginaNovaSenha() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setCarregando(true);
    const { error } = await createClient().auth.updateUser({ password: senha });
    if (error) {
      setErro(
        error.code === "weak_password"
          ? "Senha muito fraca. Use pelo menos 8 letras e números."
          : "Não foi possível trocar a senha. Peça um link novo.",
      );
      setCarregando(false);
      return;
    }
    router.replace("/painel");
  }

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Criar senha nova</h1>
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <Campo
          rotulo="Nova senha (mínimo 8 caracteres)"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        {erro && (
          <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">
            {erro}
          </p>
        )}
        <button type="submit" disabled={carregando} className={estiloBotaoPrincipal}>
          Salvar senha
        </button>
      </form>
    </>
  );
}
