// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { signOrderToken, verifyOrderToken } from "./order-token";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("signOrderToken / verifyOrderToken", () => {
  it("um token assinado verifica certo para o mesmo pedido", () => {
    const token = signOrderToken("order-123");
    expect(verifyOrderToken("order-123", token)).toBe(true);
  });

  it("rejeita token de um pedido diferente", () => {
    const token = signOrderToken("order-123");
    expect(verifyOrderToken("order-456", token)).toBe(false);
  });

  it("rejeita token adulterado", () => {
    const token = signOrderToken("order-123");
    expect(verifyOrderToken("order-123", token.slice(0, -1) + "x")).toBe(false);
  });

  it("rejeita token ausente ou vazio", () => {
    expect(verifyOrderToken("order-123", null)).toBe(false);
    expect(verifyOrderToken("order-123", undefined)).toBe(false);
    expect(verifyOrderToken("order-123", "")).toBe(false);
  });

  it("com ORDER_TOKEN_SECRET fixo, o token é determinístico (mesmo processo)", () => {
    vi.stubEnv("ORDER_TOKEN_SECRET", "segredo-fixo-de-teste");
    const a = signOrderToken("order-789");
    const b = signOrderToken("order-789");
    expect(a).toBe(b);
  });
});
