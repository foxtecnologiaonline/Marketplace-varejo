import { test, expect } from "@playwright/test";

test("clicar numa imagem do produto abre o zoom, e Esc fecha", async ({ page }) => {
  await page.goto("/produtos/camiseta-manga-curta-marista");

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.locator('button[aria-label^="Ampliar imagem"]').first().click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("zoom navega entre as imagens do produto com as flechas e fecha no X", async ({ page }) => {
  await page.goto("/produtos/camiseta-manga-curta-marista");
  await page.locator('button[aria-label^="Ampliar imagem"]').first().click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.click('button[aria-label="Próxima imagem"]');
  await page.click('button[aria-label="Imagem anterior"]');

  await page.click('button[aria-label="Fechar"]');
  await expect(dialog).toHaveCount(0);
});
