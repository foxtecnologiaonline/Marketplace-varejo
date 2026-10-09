import "server-only";
import { headers } from "next/headers";

// Limitador em memória, por processo. Funciona bem numa instância única (um
// `node server.js`); num deploy multi-instância cada instância tem seu próprio
// contador, então o limite efetivo vira (limite x nº de instâncias) — upgrade
// natural é Upstash Ratelimit (Redis) quando isso passar a importar.
const buckets = new Map<string, number[]>();
const MAX_TRACKED_KEYS = 5000;

export async function getClientKey(): Promise<string> {
  const h = await headers();
  // x-forwarded-for pode ter uma lista "cliente, proxy1, proxy2" — o primeiro é o cliente.
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}

/**
 * true se `key` já estourou `limit` chamadas na janela `windowMs`. Cada chamada
 * que não estoura conta como uma tentativa a mais na janela.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = buckets.get(key) ?? [];
  const recent = existing.filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    pruneIfNeeded(now, windowMs);
    return true;
  }

  recent.push(now);
  buckets.set(key, recent);
  pruneIfNeeded(now, windowMs);
  return false;
}

// Evita crescimento ilimitado do Map num processo de vida longa: só varre quando
// o número de chaves rastreadas passa de um teto, e só então paga o custo de
// remover entradas totalmente expiradas.
function pruneIfNeeded(now: number, windowMs: number) {
  if (buckets.size <= MAX_TRACKED_KEYS) return;
  for (const [key, timestamps] of buckets) {
    if (timestamps.every((t) => now - t >= windowMs)) buckets.delete(key);
  }
}

export function resetRateLimitForTests(): void {
  buckets.clear();
}

export const RATE_LIMIT_MESSAGE = "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";

/** Checa e já conta a tentativa; devolve a mensagem de erro pronta se estourou o limite. */
export async function checkRateLimit(
  scope: string,
  limit: number,
  windowMs: number
): Promise<{ limited: true; error: string } | { limited: false }> {
  const key = `${scope}:${await getClientKey()}`;
  if (isRateLimited(key, limit, windowMs)) {
    return { limited: true, error: RATE_LIMIT_MESSAGE };
  }
  return { limited: false };
}
