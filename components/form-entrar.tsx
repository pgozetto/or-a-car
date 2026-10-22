"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleLogo } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Campo, estiloBotaoPrincipal, estiloBotaoSecundario } from "./campos";

type Modo = "entrar" | "criar" | "esqueci";

const TITULOS: Record<Modo, string> = {
  entrar: "Entrar na sua conta",
  criar: "Criar conta grátis",
  esqueci: "Recuperar senha",
};

// Mensagens do Supabase Auth traduzidas para o dono da oficina.
function traduzirErro(codigo?: string, mensagem?: string) {
  switch (codigo) {
    case "invalid_credentials":
      return "E-mail ou senha errados. Confira e tente de novo.";
    case "user_already_exists":
    case "email_exists":
      return "Já existe uma conta com esse e-mail. Toque em Entrar.";
    case "weak_password":
      return "Senha muito fraca. Use pelo menos 8 letras e números.";
    case "email_not_confirmed":
      return "Falta confirmar o e-mail. Abra o link que enviamos para você.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Muitas tentativas. Espere alguns minutos e tente de novo.";
    default:
      return mensagem ?? "Algo deu errado. Tente de novo.";
  }
}

export default function FormEntrar() {
  const router = useRouter();
  const parametros = useSearchParams();
  // Só caminhos internos, para o link de login não virar redirecionamento aberto.
  const pedido = parametros.get("voltar") ?? "";
  const voltar = pedido.startsWith("/") && !pedido.startsWith("//") ? pedido : "/painel";
  const [modo, setModo] = useState<Modo>(
    parametros.get("modo") === "criar" ? "criar" : "entrar",
  );
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(
    parametros.get("erro") ? "Não foi possível entrar. Tente de novo." : "",
  );
  const [aviso, setAviso] = useState("");

  const supabase = createClient();
  const urlRetorno = (destino: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(destino)}`;

  function trocarModo(novo: Modo) {
    setModo(novo);
    setErro("");
    setAviso("");
  }

  async function entrarComGoogle() {
    setCarregando(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: urlRetorno(voltar) },
    });
    if (error) {
      setErro(traduzirErro(error.code, error.message));
      setCarregando(false);
    }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    setAviso("");

    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) setErro(traduzirErro(error.code, error.message));
      else {
        router.replace(voltar);
        router.refresh();
        return;
      }
    } else if (modo === "criar") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: urlRetorno("/painel") },
      });
      if (error) setErro(traduzirErro(error.code, error.message));
      else if (data.session) {
        router.replace("/painel");
        router.refresh();
        return;
      } else {
        setAviso(`Pronto! Enviamos um link para ${email}. Abra o e-mail para confirmar a conta.`);
      }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: urlRetorno("/painel/nova-senha"),
      });
      if (error) setErro(traduzirErro(error.code, error.message));
      else setAviso(`Se existir uma conta com ${email}, você vai receber um link para criar uma senha nova.`);
    }
    setCarregando(false);
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{TITULOS[modo]}</h1>
        {modo === "criar" && (
          <p className="mt-2 text-muted">3 orçamentos grátis para testar. Sem cartão.</p>
        )}
      </div>

      {modo !== "esqueci" && (
        <>
          <button
            type="button"
            onClick={entrarComGoogle}
            disabled={carregando}
            className={`${estiloBotaoSecundario} gap-3`}
          >
            <GoogleLogo size={22} weight="bold" />
            Continuar com Google
          </button>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="h-px flex-1 bg-border" />
            ou com e-mail
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Campo
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {modo !== "esqueci" && (
          <Campo
            rotulo={modo === "criar" ? "Crie uma senha (mínimo 8 caracteres)" : "Senha"}
            type="password"
            autoComplete={modo === "criar" ? "new-password" : "current-password"}
            minLength={modo === "criar" ? 8 : undefined}
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        )}

        {erro && (
          <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">
            {erro}
          </p>
        )}
        {aviso && (
          <p role="status" className="rounded-xl bg-accent/10 p-3 text-sm text-foreground">
            {aviso}
          </p>
        )}

        <button type="submit" disabled={carregando} className={estiloBotaoPrincipal}>
          {carregando
            ? "Aguarde..."
            : modo === "entrar"
              ? "Entrar"
              : modo === "criar"
                ? "Criar conta"
                : "Enviar link"}
        </button>
      </form>

      <div className="flex flex-col items-center gap-3 text-center">
        {modo === "entrar" && (
          <>
            <button type="button" onClick={() => trocarModo("esqueci")} className="text-accent">
              Esqueci minha senha
            </button>
            <p className="text-muted">
              Ainda não tem conta?{" "}
              <button type="button" onClick={() => trocarModo("criar")} className="font-semibold text-accent">
                Criar conta grátis
              </button>
            </p>
          </>
        )}
        {modo !== "entrar" && (
          <p className="text-muted">
            Já tem conta?{" "}
            <button type="button" onClick={() => trocarModo("entrar")} className="font-semibold text-accent">
              Entrar
            </button>
          </p>
        )}
      </div>
    </>
  );
}
