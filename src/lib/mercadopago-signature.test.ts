// @vitest-environment node
import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyMercadoPagoSignature } from "./mercadopago-signature";

// Testa que a função é consistente consigo mesma (gera a mesma assinatura que ela
// própria verifica). Não é uma prova de conformidade com o Mercado Pago real — ver
// o comentário em mercadopago-signature.ts.
function sign(manifest: string, secret: string): string {
  return createHmac("sha256", secret).update(manifest).digest("hex");
}

describe("verifyMercadoPagoSignature", () => {
  const secret = "test-secret";
  const dataId = "123456789";
  const requestId = "req-abc";
  const ts = "1700000000";

  it("aceita uma assinatura válida", () => {
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const v1 = sign(manifest, secret);
    expect(
      verifyMercadoPagoSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: requestId, dataId, secret })
    ).toBe(true);
  });

  it("rejeita quando o secret está errado", () => {
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const v1 = sign(manifest, "secret-errado");
    expect(
      verifyMercadoPagoSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: requestId, dataId, secret })
    ).toBe(false);
  });

  it("rejeita quando o dataId foi adulterado depois de assinado", () => {
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const v1 = sign(manifest, secret);
    expect(
      verifyMercadoPagoSignature({
        xSignature: `ts=${ts},v1=${v1}`,
        xRequestId: requestId,
        dataId: "999999999",
        secret
      })
    ).toBe(false);
  });

  it("rejeita quando o ts foi adulterado", () => {
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const v1 = sign(manifest, secret);
    expect(
      verifyMercadoPagoSignature({ xSignature: `ts=9999999999,v1=${v1}`, xRequestId: requestId, dataId, secret })
    ).toBe(false);
  });

  it("rejeita header x-signature ausente ou malformado", () => {
    expect(verifyMercadoPagoSignature({ xSignature: null, xRequestId: requestId, dataId, secret })).toBe(false);
    expect(
      verifyMercadoPagoSignature({ xSignature: "lixo-sem-formato", xRequestId: requestId, dataId, secret })
    ).toBe(false);
  });

  it("rejeita quando dataId está ausente", () => {
    expect(
      verifyMercadoPagoSignature({ xSignature: `ts=${ts},v1=abc`, xRequestId: requestId, dataId: null, secret })
    ).toBe(false);
  });

  it("funciona sem x-request-id (nem todo evento o envia)", () => {
    const manifest = `id:${dataId};ts:${ts};`;
    const v1 = sign(manifest, secret);
    expect(
      verifyMercadoPagoSignature({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: null, dataId, secret })
    ).toBe(true);
  });
});
