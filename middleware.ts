import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplica el middleware a totes les rutes excepte:
     * - api (les rutes d'API gestionen la seva pròpia autenticació)
     * - _next/static, _next/image (fitxers estàtics)
     * - favicon i imatges
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
