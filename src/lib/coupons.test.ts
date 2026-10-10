import { describe, expect, it } from "vitest";
import { findCoupon, validateCoupon } from "./coupons";

describe("findCoupon", () => {
  it("encontra por código em caixa baixa/com espaços", () => {
    expect(findCoupon("  bemvindo10 ")).toBeTruthy();
    expect(findCoupon("bemvindo10")?.code).toBe("BEMVINDO10");
  });

  it("retorna null para código inexistente", () => {
    expect(findCoupon("NAOEXISTE")).toBeNull();
  });

  it("retorna null para código vazio", () => {
    expect(findCoupon("   ")).toBeNull();
  });
});

describe("validateCoupon", () => {
  it("aplica 10% de desconto com BEMVINDO10", () => {
    const result = validateCoupon("BEMVINDO10", 10_000, 1_990);
    expect(result).toEqual({
      valid: true,
      coupon: expect.objectContaining({ code: "BEMVINDO10" }),
      discountCents: 1_000
    });
  });

  it("FRETEGRATIS zera o frete quando o subtotal atinge o mínimo", () => {
    const result = validateCoupon("FRETEGRATIS", 15_000, 1_990);
    expect(result).toEqual({
      valid: true,
      coupon: expect.objectContaining({ code: "FRETEGRATIS" }),
      discountCents: 1_990
    });
  });

  it("FRETEGRATIS é recusado abaixo do subtotal mínimo", () => {
    const result = validateCoupon("FRETEGRATIS", 10_000, 1_990);
    expect(result.valid).toBe(false);
  });

  it("código inválido é recusado", () => {
    const result = validateCoupon("QUALQUERCOISA", 10_000, 1_990);
    expect(result).toEqual({ valid: false, error: "Cupom inválido ou expirado." });
  });
});
