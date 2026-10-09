import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupCep } from "./viacep";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("lookupCep", () => {
  it("retorna null sem bater na rede quando o CEP está incompleto", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as typeof fetch;
    expect(await lookupCep("123")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("retorna o endereço em caso de sucesso", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        cep: "01310-100",
        logradouro: "Avenida Paulista",
        bairro: "Bela Vista",
        localidade: "São Paulo",
        uf: "SP"
      })
    }) as typeof fetch;

    const address = await lookupCep("01310-100");
    expect(address?.localidade).toBe("São Paulo");
    expect(address?.uf).toBe("SP");
  });

  it("retorna null quando o ViaCEP sinaliza CEP inexistente", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ erro: true })
    }) as typeof fetch;

    expect(await lookupCep("00000-000")).toBeNull();
  });

  it("retorna null em erro de rede, sem lançar exceção", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down")) as typeof fetch;
    expect(await lookupCep("01310-100")).toBeNull();
  });

  it("retorna null quando a resposta HTTP não é ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false }) as typeof fetch;
    expect(await lookupCep("01310-100")).toBeNull();
  });
});
