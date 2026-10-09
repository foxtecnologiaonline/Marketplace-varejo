import { test, expect } from "@playwright/test";
import { addFirstVariantToCart, fillCheckoutAddress, SIZE_BUTTON } from "./helpers";

test("checkout feliz: produto -> carrinho -> frete por CEP -> pedido criado", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await addFirstVariantToCart(page, "camiseta-manga-curta-marista");
  await page.goto("/carrinho");
  await page.click('a:has-text("Finalizar compra")');
  await expect(page).toHaveURL(/\/checkout$/);

  await fillCheckoutAddress(page);
  const summary = (await page.textContent("aside"))!.replace(/\s+/g, " ");
  expect(summary).toContain("19,90"); // frete São Paulo
  expect(summary).toContain("89,80"); // 69,90 + 19,90

  await page.click('button:has-text("Ir para o pagamento")');
  await expect(page).toHaveURL(/\/checkout\/sucesso\?pedido=/, { timeout: 15_000 });
  expect(errors).toEqual([]);
});

test("carrinho vazio: /checkout mostra aviso e não deixa prosseguir", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByText("Carrinho vazio")).toBeVisible();
});

test("CEP inválido é recusado pelo servidor, sem criar pedido", async ({ page }) => {
  await addFirstVariantToCart(page, "calca-moletom-positivo");
  await page.goto("/checkout");
  await fillCheckoutAddress(page, { cep: "123" });
  await page.click('button:has-text("Ir para o pagamento")');
  await expect(page.getByText("CEP inválido")).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
});

test("quantidade acima do estoque é bloqueada no checkout", async ({ page }) => {
  // "Conjunto Agasalho Marista" tem stock: 18; o seletor trava em MAX_ITEM_QUANTITY (20).
  await page.goto("/produtos/agasalho-conjunto-marista");
  await page.locator("button", { hasText: SIZE_BUTTON }).first().click();
  const increase = page.locator('button[aria-label="Aumentar quantidade"]');
  for (let i = 0; i < 25; i++) {
    if (await increase.isDisabled()) break;
    await increase.click();
  }
  await expect(page.locator("span.w-10")).toHaveText("20");

  await page.click('button:has-text("Adicionar ao carrinho")');
  await page.goto("/checkout");
  await fillCheckoutAddress(page, { name: "Teste Estoque", email: "estoque@example.com" });
  await page.click('button:has-text("Ir para o pagamento")');
  await expect(page.getByText("Apenas 18 unidade(s)")).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
});

test("carrinho nunca passa do teto de quantidade mesmo somando duas adições", async ({ page }) => {
  await page.goto("/produtos/colete-personalizado-time");
  await page.locator("button", { hasText: SIZE_BUTTON }).first().click();
  const increase = page.locator('button[aria-label="Aumentar quantidade"]');
  for (let i = 0; i < 14; i++) await increase.click();
  await page.click('button:has-text("Adicionar ao carrinho")');
  await page.click('button:has-text("Adicionar ao carrinho")'); // 15 + 15 -> deve travar em 20

  await page.goto("/carrinho");
  await expect(page.locator("main")).toContainText("20");
});
