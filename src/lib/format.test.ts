import { describe, expect, it } from "vitest";
import { formatCurrency, formatInstallments } from "./format";

describe("formatCurrency", () => {
  it("formata em real brasileiro com vírgula decimal", () => {
    expect(formatCurrency(69.9)).toBe("R$ 69,90");
  });

  it("formata zero", () => {
    expect(formatCurrency(0)).toBe("R$ 0,00");
  });

  it("formata milhar com separador", () => {
    expect(formatCurrency(1234.5)).toBe("R$ 1.234,50");
  });
});

describe("formatInstallments", () => {
  it("divide o preço pelo número de parcelas", () => {
    expect(formatInstallments(300, 3)).toBe("3x de R$ 100,00 sem juros");
  });

  it("usa 3 parcelas por padrão", () => {
    expect(formatInstallments(90)).toBe("3x de R$ 30,00 sem juros");
  });
});
