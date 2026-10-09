// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isValidMpPaymentId } from "./mercadopago";

describe("isValidMpPaymentId", () => {
  it("aceita ids numéricos simples", () => {
    expect(isValidMpPaymentId("123456789")).toBe(true);
  });

  it("rejeita path traversal", () => {
    expect(isValidMpPaymentId("../../etc/passwd")).toBe(false);
  });

  it("rejeita query string injetada", () => {
    expect(isValidMpPaymentId("1?x=1&y=2")).toBe(false);
  });

  it("rejeita vazio e não numérico", () => {
    expect(isValidMpPaymentId("")).toBe(false);
    expect(isValidMpPaymentId("abc")).toBe(false);
  });

  it("rejeita id absurdamente longo (defesa contra payload inflado)", () => {
    expect(isValidMpPaymentId("1".repeat(21))).toBe(false);
    expect(isValidMpPaymentId("1".repeat(20))).toBe(true);
  });
});
