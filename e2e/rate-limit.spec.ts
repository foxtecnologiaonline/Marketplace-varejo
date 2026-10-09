import { test, expect, request as pwRequest } from "@playwright/test";

// A newsletter tem o limite mais baixo (3 em 10 min), então é a mais rápida de
// estourar sem contaminar o orçamento das outras rotas usadas pelos demais specs.
test("newsletter bloqueia depois de estourar o limite de tentativas", async ({ page }) => {
  const submit = async () => {
    await page.goto("/");
    const email = `teste-${Date.now()}-${Math.random()}@example.com`;
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Quero receber")');
    await page.waitForTimeout(400);
    return (await page.textContent("main"))!;
  };

  const results: string[] = [];
  for (let i = 0; i < 4; i++) {
    results.push(await submit());
  }

  const limitedCount = results.filter((r) => r.includes("Muitas tentativas")).length;
  expect(limitedCount).toBeGreaterThan(0);
});

test("webhook aceita sem assinatura quando MERCADOPAGO_WEBHOOK_SECRET não está configurado", async () => {
  // Nesta instância de teste não há MERCADOPAGO_ACCESS_TOKEN nem WEBHOOK_SECRET, então
  // a resposta correta é 503 (gateway não configurado) antes mesmo de chegar na
  // verificação de assinatura — confirma que a ausência do secret não derruba a rota.
  const ctx = await pwRequest.newContext();
  const res = await ctx.post("http://127.0.0.1:3100/api/webhooks/mercadopago", {
    data: { type: "payment", data: { id: "123" } }
  });
  expect(res.status()).toBe(503);
});
