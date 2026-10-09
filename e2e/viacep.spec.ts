import { test, expect } from "@playwright/test";
import { addFirstVariantToCart } from "./helpers";

test("CEP válido preenche cidade/endereço automaticamente via ViaCEP", async ({ page }) => {
  await addFirstVariantToCart(page, "camiseta-manga-curta-marista");
  await page.goto("/checkout");
  await page.fill('input[name="cep"]', "01310-100"); // Av. Paulista, Bela Vista, São Paulo/SP

  await expect(page.locator('input[name="city"]')).toHaveValue("São Paulo", { timeout: 8000 });
  await expect(page.locator('input[name="street"]')).toHaveValue(/Paulista/, { timeout: 8000 });
});

test("autofill nunca sobrescreve o que a pessoa já digitou", async ({ page }) => {
  await addFirstVariantToCart(page, "camiseta-manga-curta-marista");
  await page.goto("/checkout");
  await page.fill('input[name="city"]', "Cidade Digitada Pelo Cliente");
  await page.fill('input[name="cep"]', "01310-100");

  await page.waitForTimeout(2000); // dá tempo da consulta terminar, se for acontecer
  await expect(page.locator('input[name="city"]')).toHaveValue("Cidade Digitada Pelo Cliente");
});

test("CEP inexistente avisa e não trava o formulário", async ({ page }) => {
  await addFirstVariantToCart(page, "camiseta-manga-curta-marista");
  await page.goto("/checkout");
  await page.fill('input[name="cep"]', "99999-999");
  await expect(page.getByText("CEP não encontrado")).toBeVisible({ timeout: 8000 });
});
