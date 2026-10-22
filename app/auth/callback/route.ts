import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Volta do Google, da confirmação de e-mail e do link de nova senha.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const codigo = searchParams.get("code");
  const next = searchParams.get("next") ?? "/painel";
  // Só aceita caminhos internos para não virar redirecionamento aberto.
  const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/painel";

  if (codigo) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }

  return NextResponse.redirect(`${origin}/entrar?erro=1`);
}
