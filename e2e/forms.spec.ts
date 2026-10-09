import { test, expect } from "@playwright/test";

test("cotação institucional: valida mensagem curta e envia quando corrigida", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/cotacao");
  await page.fill('input[name="customerName"]', "Escola Exemplo");
  await page.fill('input[name="customerPhone"]', "11999998888");
  await page.fill('input[name="customerEmail"]', "compras@escola.com.br");
  await page.selectOption('select[name="storeSlug"]', "colegio-marista");
  await page.fill('textarea[name="message"]', "curta");
  await page.click('button:has-text("Enviar solicitação")');
  await expect(page.locator('main [role="alert"]')).toBeVisible();
  await expect(page.locator("main form")).toHaveCount(1);

  await page.fill('textarea[name="message"]', "Precisamos de 200 camisetas para o próximo semestre.");
  await page.click('button:has-text("Enviar solicitação")');
  await expect(page.getByText("Solicitação enviada!")).toBeVisible({ timeout: 10_000 });
  expect(errors).toEqual([]);
});

test("central de atendimento envia de verdade (antes era <form> sem action)", async ({ page }) => {
  await page.goto("/atendimento");
  await page.fill('input[name="customerName"]', "Joana");
  await page.fill('input[name="customerEmail"]', "joana@example.com");
  await page.fill('textarea[name="message"]', "Meu pedido ainda não chegou, podem verificar?");
  await page.click('button:has-text("Enviar mensagem")');
  await expect(page.getByText("Mensagem enviada!")).toBeVisible({ timeout: 10_000 });
});

test("newsletter inscreve sem navegar por GET (antes era <form> sem action)", async ({ page }) => {
  await page.goto("/");
  await page.fill('input[name="email"]', "novo@example.com");
  await page.click('button:has-text("Quero receber")');
  await expect(page.getByText("Você vai receber nossas novidades")).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL("/");
});

test("/conta não coleta senha por formulário sem action", async ({ page }) => {
  await page.goto("/conta");
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test("/conta mostra aviso honesto quando o Supabase Auth não está configurado", async ({ page }) => {
  // Nesta instância de teste não há NEXT_PUBLIC_SUPABASE_URL/ANON_KEY: deve cair no
  // aviso "em breve", nunca mostrar um formulário de login que não vai funcionar.
  await page.goto("/conta");
  await expect(page.getByText("Área do cliente em breve")).toBeVisible();
  await expect(page.getByPlaceholder("seu@email.com")).toHaveCount(0);
});
