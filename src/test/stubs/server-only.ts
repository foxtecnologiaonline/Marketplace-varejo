// Stub para testes: o pacote real "server-only" lança erro fora do resolve
// condicional "react-server" do Next.js (ver node_modules/server-only/index.js),
// o que inclui rodar sob Vitest/Node puro. Sem isso, nenhum módulo que importa
// "server-only" (orders.ts, email.ts, mercadopago.ts, supabase-server.ts) seria testável.
export {};
