import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/produtos",
  "/produtos?categoria=camisetas",
  "/busca?q=camiseta",
  "/produtos/camiseta-manga-curta-marista",
  "/lojas",
  "/lojas/colegio-marista",
  "/carrinho",
  "/checkout",
  "/cotacao",
  "/atendimento",
  "/conta",
  "/conta/pedidos",
  "/favoritos",
  "/sobre",
  "/privacidade",
  "/trocas-devolucoes",
  "/regulamento"
];

for (const route of ROUTES) {
  test(`${route} carrega sem erro de página`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(route, { waitUntil: "networkidle" });
    expect(res?.status(), `status de ${route}`).toBeLessThan(400);
    expect(errors, `pageerror em ${route}`).toEqual([]);
  });
}

test("rota inexistente devolve 404", async ({ page }) => {
  const res = await page.goto("/rota-que-nao-existe");
  expect(res?.status()).toBe(404);
});

test("home não pede imagens de otimização a 1920px para logos/thumbs pequenos", async ({ page }) => {
  const widths: number[] = [];
  page.on("request", (r) => {
    const m = r.url().match(/_next\/image\?url=.*&w=(\d+)/);
    if (m) widths.push(Number(m[1]));
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(widths).not.toContain(1920);
});

test("headers de segurança presentes e sem X-Powered-By", async ({ page }) => {
  const res = await page.goto("/");
  const headers = res!.headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["strict-transport-security"]).toContain("max-age");
  expect(headers["content-security-policy"]).toBeTruthy();
  expect(headers["x-powered-by"]).toBeUndefined();
});
