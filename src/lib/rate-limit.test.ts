// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { isRateLimited, resetRateLimitForTests } from "./rate-limit";

afterEach(() => {
  resetRateLimitForTests();
});

describe("isRateLimited", () => {
  it("libera até o limite e bloqueia na próxima", () => {
    const key = "1.2.3.4:teste-limite";
    for (let i = 0; i < 3; i++) {
      expect(isRateLimited(key, 3, 60_000)).toBe(false);
    }
    expect(isRateLimited(key, 3, 60_000)).toBe(true);
  });

  it("chaves diferentes têm contadores independentes", () => {
    expect(isRateLimited("ip-a", 1, 60_000)).toBe(false);
    expect(isRateLimited("ip-b", 1, 60_000)).toBe(false);
    expect(isRateLimited("ip-a", 1, 60_000)).toBe(true);
    expect(isRateLimited("ip-b", 1, 60_000)).toBe(true);
  });

  it("libera de novo depois que a janela expira", async () => {
    const key = "janela-curta";
    expect(isRateLimited(key, 1, 20)).toBe(false);
    expect(isRateLimited(key, 1, 20)).toBe(true);
    await new Promise((r) => setTimeout(r, 30));
    expect(isRateLimited(key, 1, 20)).toBe(false);
  });
});
