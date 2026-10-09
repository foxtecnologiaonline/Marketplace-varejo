import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// Antes, quem adivinhasse/visse um UUID de pedido (link compartilhado, histórico do
// navegador, referrer) via a página de sucesso inteira: nome, endereço, itens, total.
// Um token HMAC amarrado ao id do pedido, exigido pra exibir qualquer coisa, fecha isso
// sem precisar de login (que o site ainda não tem — ver LoginForm).
//
// Sem ORDER_TOKEN_SECRET configurado, gera um segredo aleatório uma vez por processo:
// nunca previsível, mas muda a cada reinício/deploy — links de pedido enviados antes
// de um restart param de abrir depois dele. Configure a variável antes de produção.
let warnedMissingSecret = false;

function getSecret(): string {
  const configured = process.env.ORDER_TOKEN_SECRET;
  if (configured) return configured;

  if (!warnedMissingSecret) {
    warnedMissingSecret = true;
    console.warn(
      "[order-token] ORDER_TOKEN_SECRET não configurado — usando um segredo aleatório gerado " +
        "neste processo. Links de pedido enviados antes de um reinício param de funcionar. " +
        "Configure antes de produção (ver .env.example)."
    );
  }
  return processFallbackSecret;
}

const processFallbackSecret = randomBytes(32).toString("hex");

export function signOrderToken(orderId: string): string {
  return createHmac("sha256", getSecret()).update(orderId).digest("base64url");
}

export function verifyOrderToken(orderId: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = signOrderToken(orderId);
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(token);
  if (expectedBuf.length !== actualBuf.length) {
    timingSafeEqual(expectedBuf, Buffer.alloc(expectedBuf.length));
    return false;
  }
  return timingSafeEqual(expectedBuf, actualBuf);
}
