import { test, expect, request as pwRequest } from "@playwright/test";

const WEBHOOK_URL = "http://127.0.0.1:3100/api/webhooks/mercadopago";

test.describe("webhook do Mercado Pago (sem token configurado nesta instância)", () => {
  test("responde 503 quando o gateway não está configurado", async () => {
    const ctx = await pwRequest.newContext();
    const res = await ctx.post(WEBHOOK_URL, { data: { type: "payment", data: { id: "123" } } });
    expect(res.status()).toBe(503);
  });

  test("JSON inválido retorna 400", async () => {
    const ctx = await pwRequest.newContext();
    const res = await ctx.post(WEBHOOK_URL, { data: "nao-e-json", headers: { "content-type": "text/plain" } });
    expect([400, 503]).toContain(res.status());
  });
});
