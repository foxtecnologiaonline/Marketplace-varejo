// Aritmética monetária em centavos inteiros. `69.9 * 3` em JS dá
// 209.70000000000002 (ponto flutuante binário não representa décimos de forma
// exata); inteiros até 2^53 são exatos, então somar/multiplicar em centavos e só
// converter para reais no limite (exibição, gravação no banco, chamada à API de
// pagamento) elimina a classe inteira de erro de arredondamento.

/** Reais (ex.: 69.9) -> centavos inteiros (ex.: 6990). Arredonda no limite. */
export function reaisToCents(reais: number): number {
  return Math.round(reais * 100);
}

/** Centavos inteiros -> reais, só para exibição/gravação/API no limite do sistema. */
export function centsToReais(cents: number): number {
  return cents / 100;
}

/** Preço unitário em reais x quantidade inteira, resultado em centavos (exato). */
export function lineTotalCents(unitPriceReais: number, quantity: number): number {
  return reaisToCents(unitPriceReais) * quantity;
}

export function sumCents(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0);
}
