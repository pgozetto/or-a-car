import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          resposta = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            resposta.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([chave, valor]) =>
            resposta.headers.set(chave, valor),
          );
        },
      },
    },
  );

  // Não colocar código entre createServerClient e getClaims (renova a sessão).
  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims);

  if (!logado && request.nextUrl.pathname.startsWith("/painel")) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    // Guarda também a query (ex.: plano escolhido na página de planos).
    url.search = `?voltar=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  return resposta;
}
