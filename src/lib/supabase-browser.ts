// Cliente Supabase para o navegador (chave anônima, pública por natureza — nunca
// a service role usada em src/lib/supabase-server.ts). Só para Auth por enquanto
// (login por link mágico em /conta); a sessão fica no localStorage do navegador,
// gerenciada pelo próprio supabase-js — nenhum componente server-side sabe quem
// está logado ainda (isso exigiria @supabase/ssr + proxy.ts para refresh de sessão
// via cookie, deixado para quando /conta/pedidos precisar mostrar pedidos reais
// do cliente logado).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!isSupabaseAuthConfigured()) {
    throw new Error(
      "Supabase Auth não configurado (NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
        "Cheque isSupabaseAuthConfigured() antes de chamar isto."
    );
  }
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }
  return client;
}
