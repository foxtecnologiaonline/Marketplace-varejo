import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente server-only com a service role: nunca importar isto em um client component
// (o pacote "server-only" quebra o build se isso acontecer). Usado só pelas Server
// Actions do checkout e pelo webhook do Mercado Pago, que são os únicos pontos que
// precisam gravar pedidos/pagamentos.

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase não configurado: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY. " +
        "Use isDatabaseConfigured() para checar antes de chamar esta função."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false }
  });
}
