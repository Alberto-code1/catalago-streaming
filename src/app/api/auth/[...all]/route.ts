import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Todas as páginas de login (/api/auth/...) são atendidas pela biblioteca Better Auth
export const { GET, POST } = toNextJsHandler(auth);
