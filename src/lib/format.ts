export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatInstallments(price: number, count = 3): string {
  const value = price / count;
  return `${count}x de ${formatCurrency(value)} sem juros`;
}
