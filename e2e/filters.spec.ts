import { test, expect } from "@playwright/test";

test("filtro de preço reduz a lista de produtos e mantém o filtro na URL", async ({ page }) => {
  await page.goto("/produtos");
  const totalCount = await page.locator("a.card").count();
  expect(totalCount).toBeGreaterThan(0);

  await page.fill('input[name="precoMin"]', "100");
  await page.fill('input[name="precoMax"]', "150");
  await page.click('button:has-text("Aplicar filtros")');

  await expect(page).toHaveURL(/precoMin=100/);
  await expect(page).toHaveURL(/precoMax=150/);
  const filteredCount = await page.locator("a.card").count();
  expect(filteredCount).toBeGreaterThan(0);
  expect(filteredCount).toBeLessThan(totalCount);
});

test("filtro de tamanho aparece pré-selecionado quando vem pela URL", async ({ page }) => {
  await page.goto("/produtos?tamanho=12");
  // O form de ordenação também carrega um <input type="hidden" name="tamanho">
  // pra preservar o filtro ao reordenar — por isso o seletor exige o radio.
  await expect(page.locator('input[type="radio"][name="tamanho"][value="12"]')).toBeChecked();
});

test("filtro de cor aparece pré-selecionado quando vem pela URL", async ({ page }) => {
  await page.goto("/produtos?cor=Branco");
  await expect(page.locator('input[type="radio"][name="cor"][value="Branco"]')).toBeChecked();
});

test("faixa de preço sem produtos mostra aviso de nenhum resultado", async ({ page }) => {
  await page.goto("/produtos?precoMin=99999");
  await expect(page.getByText("Nenhum produto encontrado com esses filtros.")).toBeVisible();
});
