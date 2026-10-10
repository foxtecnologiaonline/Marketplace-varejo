import { test, expect } from "@playwright/test";

test("favoritar no card reflete em /favoritos e some ao desfavoritar", async ({ page }) => {
  await page.goto("/produtos");
  const firstCard = page.locator("a.card").first();
  await firstCard.locator('button[aria-label="Adicionar aos favoritos"]').click();

  await page.goto("/favoritos");
  await expect(page.getByText("Você ainda não adicionou")).toHaveCount(0);
  await expect(page.locator("a.card")).toHaveCount(1);

  await page.locator('button[aria-label="Remover dos favoritos"]').click();
  await expect(page.getByText("Você ainda não adicionou produtos à sua lista de desejos.")).toBeVisible();
});

test("/favoritos mostra aviso quando a lista está vazia", async ({ page }) => {
  await page.goto("/favoritos");
  await expect(page.getByText("Você ainda não adicionou produtos à sua lista de desejos.")).toBeVisible();
});

test("favoritar na página do produto não navega para outra rota", async ({ page }) => {
  await page.goto("/produtos/camiseta-manga-curta-marista");
  // .first() = botão da própria página do produto; os demais são dos cards de
  // "Você também pode gostar", mais abaixo na mesma página.
  await page.locator('button[aria-label="Adicionar aos favoritos"]').first().click();
  await expect(page).toHaveURL(/\/produtos\/camiseta-manga-curta-marista$/);
  await expect(page.locator('button[aria-label="Remover dos favoritos"]').first()).toBeVisible();
});
