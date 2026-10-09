import { describe, expect, it } from "vitest";
import { centsToReais, lineTotalCents, reaisToCents, sumCents } from "./money";

describe("reaisToCents / centsToReais", () => {
  it("converte ida e volta sem perda", () => {
    expect(reaisToCents(69.9)).toBe(6990);
    expect(centsToReais(6990)).toBe(69.9);
  });

  it("arredonda para o centavo mais próximo", () => {
    expect(reaisToCents(10.005)).toBe(1001); // 10.005 banker's-safe via Math.round
  });
});

describe("lineTotalCents", () => {
  it("69,90 x 3 dá exatamente 209,70 em centavos (209.70000000000002 com float puro)", () => {
    expect(lineTotalCents(69.9, 3)).toBe(20970);
    // prova que o float puro de fato quebraria, se não fosse pela conversão a centavos:
    expect(69.9 * 3).not.toBe(209.7);
  });

  it("24,97 x 3 (caso real do catálogo) soma certinho", () => {
    expect(lineTotalCents(24.97, 3)).toBe(7491);
  });
});

describe("sumCents", () => {
  it("soma várias linhas sem drift, mesmo em grande quantidade", () => {
    const lines = Array.from({ length: 20 }, () => lineTotalCents(69.9, 1));
    expect(centsToReais(sumCents(lines))).toBe(1398);
  });

  it("lista vazia soma zero", () => {
    expect(sumCents([])).toBe(0);
  });
});
