import { test, expect } from "@playwright/test";

test("sitemap.xml lista produtos e lojas", async ({ page }) => {
  const res = await page.goto("/sitemap.xml");
  expect(res?.status()).toBe(200);
  const body = await res!.text();
  expect(body).toContain("/produtos/camiseta-manga-curta-marista");
  expect(body).toContain("/lojas/colegio-marista");
});

test("robots.txt aponta para o sitemap e bloqueia rotas privadas", async ({ page }) => {
  const res = await page.goto("/robots.txt");
  const body = await res!.text();
  expect(body).toContain("Sitemap:");
  expect(body).toContain("Disallow: /checkout");
  expect(body).toContain("Disallow: /conta");
});

test("home traz JSON-LD de Organization", async ({ page }) => {
  await page.goto("/");
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(jsonLd!);
  expect(data["@type"]).toBe("Organization");
  expect(data.name).toBe("Blue Malharia");
});

test("página de produto traz JSON-LD de Product com preço", async ({ page }) => {
  await page.goto("/produtos/camiseta-manga-curta-marista");
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const product = scripts.map((s) => JSON.parse(s)).find((d) => d["@type"] === "Product");
  expect(product).toBeTruthy();
  expect(product.offers.priceCurrency).toBe("BRL");
  expect(product.offers.price).toBe("69.90");
});

test("banner de cookies aparece na primeira visita e some após aceitar", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByRole("region", { name: "Aviso de cookies" });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Entendi" }).click();
  await expect(banner).toBeHidden();

  await page.reload();
  await expect(page.getByRole("region", { name: "Aviso de cookies" })).toBeHidden();
});
