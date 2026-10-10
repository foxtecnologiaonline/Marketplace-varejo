import { test, expect } from "@playwright/test";
import { addFirstVariantToCart, fillCheckoutAddress } from "./helpers";

test("cupom BEMVINDO10 aplica 10% de desconto e aparece no resumo e na página de sucesso", async ({ page }) => {
  await addFirstVariantToCart(page, "camiseta-manga-curta-marista");
  await page.goto("/checkout");
  await fillCheckoutAddress(page);

  await page.fill('input[placeholder="Cupom de desconto"]', "bemvindo10");
  await page.click('button:has-text("Aplicar")');
  await expect(page.getByText("Cupom BEMVINDO10")).toBeVisible();

  await page.click('button:has-text("Ir para o pagamento")');
  await expect(page).toHaveURL(/\/checkout\/sucesso\?pedido=.+&t=.+/, { timeout: 15_000 });
});

test("cupom inválido mostra erro e não é aplicado", async ({ page }) => {
  await addFirstVariantToCart(page, "calca-moletom-positivo");
  await page.goto("/checkout");
  await fillCheckoutAddress(page);

  await page.fill('input[placeholder="Cupom de desconto"]', "NAOEXISTE");
  await page.click('button:has-text("Aplicar")');
  await expect(page.getByText("Cupom inválido ou expirado.")).toBeVisible();
  await expect(page.getByText(/^Cupom BEMVINDO10|^Cupom NAOEXISTE/)).toHaveCount(0);
});

test("remover cupom aplicado volta o total ao valor sem desconto", async ({ page }) => {
  await addFirstVariantToCart(page, "camiseta-manga-curta-marista");
  await page.goto("/checkout");
  await fillCheckoutAddress(page);

  const totalBefore = (await page.locator("aside").textContent())!.replace(/\s+/g, " ");

  await page.fill('input[placeholder="Cupom de desconto"]', "BEMVINDO10");
  await page.click('button:has-text("Aplicar")');
  await expect(page.getByText("Cupom BEMVINDO10")).toBeVisible();

  await page.click('button:has-text("Remover")');
  await expect(page.getByText("Cupom BEMVINDO10")).toHaveCount(0);
  const totalAfter = (await page.locator("aside").textContent())!.replace(/\s+/g, " ");
  expect(totalAfter).toBe(totalBefore);
});
