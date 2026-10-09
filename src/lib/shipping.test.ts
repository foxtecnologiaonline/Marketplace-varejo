import { describe, expect, it } from "vitest";
import { calculateShipping, isValidCep } from "./shipping";
import { FREE_SHIPPING_THRESHOLD } from "./config";

describe("isValidCep", () => {
  it("aceita CEP com e sem hífen", () => {
    expect(isValidCep("01310-100")).toBe(true);
    expect(isValidCep("01310100")).toBe(true);
  });

  it("rejeita CEP incompleto ou com letras", () => {
    expect(isValidCep("123")).toBe(false);
    expect(isValidCep("abcde-123")).toBe(false);
    expect(isValidCep("")).toBe(false);
  });
});

describe("calculateShipping", () => {
  it("é grátis quando o subtotal atinge o teto", () => {
    const quote = calculateShipping("01310-100", FREE_SHIPPING_THRESHOLD);
    expect(quote.cost).toBe(0);
  });

  it("calcula frete de São Paulo abaixo do teto", () => {
    const quote = calculateShipping("01310-100", 50);
    expect(quote.cost).toBeGreaterThan(0);
    expect(quote.label).toContain("São Paulo");
  });

  it("calcula frete do Rio Grande do Sul (faixa alta de CEP)", () => {
    const quote = calculateShipping("90000-000", 50);
    expect(quote.cost).toBeGreaterThan(0);
    expect(quote.label).toContain("Rio Grande do Sul");
  });

  it("usa frete padrão para CEP fora de todas as faixas conhecidas", () => {
    const quote = calculateShipping("00000-000", 50);
    expect(quote.label).toBe("Frete padrão");
  });

  it("tolera CEP sem hífen e com espaços", () => {
    const a = calculateShipping("01310100", 50);
    const b = calculateShipping(" 01310-100 ", 50);
    expect(a.cost).toBe(b.cost);
  });
});
