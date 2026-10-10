import { describe, expect, it } from "vitest";
import { getAvailableColors, getAvailableSizes, products, searchProducts } from "./data";

describe("searchProducts", () => {
  it("filtra por tamanho", () => {
    const result = searchProducts({ size: "12" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.sizes.includes("12"))).toBe(true);
  });

  it("filtra por cor", () => {
    const result = searchProducts({ color: "Branco" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.colors.some((c) => c.name === "Branco"))).toBe(true);
  });

  it("filtra por faixa de preço", () => {
    const result = searchProducts({ minPrice: 100, maxPrice: 150 });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.price >= 100 && p.price <= 150)).toBe(true);
  });

  it("combina tamanho, cor e preço sem resultado quando não há interseção", () => {
    const result = searchProducts({ size: "inexistente" });
    expect(result).toEqual([]);
  });
});

describe("getAvailableSizes / getAvailableColors", () => {
  it("lista todos os tamanhos usados pelo catálogo, sem repetição", () => {
    const sizes = getAvailableSizes();
    expect(new Set(sizes).size).toBe(sizes.length);
    for (const product of products) {
      for (const size of product.sizes) expect(sizes).toContain(size);
    }
  });

  it("lista todas as cores usadas pelo catálogo, sem repetição por nome", () => {
    const colors = getAvailableColors();
    const names = colors.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
