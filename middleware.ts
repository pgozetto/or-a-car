import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Só as rotas que usam login; o site público e o webhook ficam de fora.
  matcher: ["/painel/:path*", "/entrar", "/auth/:path*"],
};
