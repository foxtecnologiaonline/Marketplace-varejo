import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export interface VerifySignatureParams {
  /** Header x-signature, formato "ts=...,v1=...". */
  xSignature: string | null;
  /** Header x-request-id. */
  xRequestId: string | null;
  /** O data.id do pagamento — o Mercado Pago manda como query string (?data.id=...)
   *  na notification_url, não no corpo; é esse valor que entra no manifest assinado. */
  dataId: string | null;
  secret: string;
}

/**
 * Verifica a assinatura HMAC-SHA256 do webhook do Mercado Pago.
 *
 * Implementado a partir da documentação pública do Mercado Pago (manifest
 * "id:{data.id};request-id:{x-request-id};ts:{ts};", HMAC-SHA256 com o secret
 * configurado no painel de webhooks, comparado ao campo v1 do header x-signature).
 * Nunca testado contra uma notificação real — ESTE É O ÚNICO PONTO DESTA REVISÃO
 * QUE SÓ TEM TESTE INTERNO (verifica que a própria função é consistente consigo
 * mesma), não contra o Mercado Pago de verdade. Antes de depender disto em
 * produção, confirme o formato exato do manifest no painel/documentação atual do
 * Mercado Pago com uma notificação real de sandbox.
 */
export function verifyMercadoPagoSignature(params: VerifySignatureParams): boolean {
  const { xSignature, xRequestId, dataId, secret } = params;
  if (!xSignature || !dataId) return false;

  const parts: Record<string, string> = {};
  for (const pair of xSignature.split(",")) {
    const [key, value] = pair.split("=");
    if (key && value) parts[key.trim()] = value.trim();
  }

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};${xRequestId ? `request-id:${xRequestId};` : ""}ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(v1, "utf8");
  // Tamanhos diferentes: compara com um buffer dummy do mesmo tamanho do esperado só
  // para manter o tempo constante (timingSafeEqual exige buffers de mesmo tamanho).
  if (expectedBuf.length !== actualBuf.length) {
    timingSafeEqual(expectedBuf, Buffer.alloc(expectedBuf.length));
    return false;
  }
  return timingSafeEqual(expectedBuf, actualBuf);
}
