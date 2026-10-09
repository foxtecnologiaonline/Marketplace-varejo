import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Este ambiente de desenvolvimento traz um Chromium pré-instalado numa revisão própria
// (fora da gerenciada pelo @playwright/test), em /opt/pw-browsers/chromium. Usamos esse
// binário quando ele existe, para não baixar ~300MB a cada setup; em outro ambiente (CI,
// outra máquina), onde ele não existe, cai no comportamento padrão do Playwright (que
// exige rodar `npx playwright install chromium` uma vez).
const localChromium = "/opt/pw-browsers/chromium";
const executablePath = existsSync(localChromium) ? localChromium : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } } }
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
});
