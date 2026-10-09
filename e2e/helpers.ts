import { Page } from "@playwright/test";

export const SIZE_BUTTON = /^(2|4|6|8|10|12|14|P|M|G|GG)$/;

export async function addFirstVariantToCart(page: Page, productSlug: string) {
  await page.goto(`/produtos/${productSlug}`);
  await page.locator("button", { hasText: SIZE_BUTTON }).first().click();
  await page.click('button:has-text("Adicionar ao carrinho")');
  await page.waitForSelector("text=Produto adicionado ao carrinho!");
}

export async function fillCheckoutAddress(
  page: Page,
  overrides: Partial<{ name: string; email: string; cep: string; city: string; street: string }> = {}
) {
  await page.fill('input[name="customerName"]', overrides.name ?? "Maria Teste");
  await page.fill('input[name="customerEmail"]', overrides.email ?? "maria@example.com");
  await page.fill('input[name="cep"]', overrides.cep ?? "01310-100");
  await page.fill('input[name="city"]', overrides.city ?? "São Paulo");
  await page.fill('input[name="street"]', overrides.street ?? "Av. Paulista, 1000");
}
