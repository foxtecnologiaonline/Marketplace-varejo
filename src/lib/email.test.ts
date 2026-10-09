// @vitest-environment node
// escapeHtml não toca o DOM; roda em node puro porque email.ts importa "server-only",
// que lança erro no ambiente jsdom (simula "Client Component").
import { describe, expect, it } from "vitest";
import { escapeHtml } from "./email";

describe("escapeHtml", () => {
  it("escapa os cinco caracteres perigosos", () => {
    expect(escapeHtml(`<script>alert('"&"')</script>`)).toBe(
      "&lt;script&gt;alert(&#39;&quot;&amp;&quot;&#39;)&lt;/script&gt;"
    );
  });

  it("texto normal passa intacto", () => {
    expect(escapeHtml("Maria da Silva")).toBe("Maria da Silva");
  });

  it("neutraliza uma tentativa de injeção de link/html em nome de cliente", () => {
    const malicious = `Cliente<img src=x onerror=alert(1)>`;
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain("<img");
    expect(escaped).toContain("&lt;img");
  });
});
