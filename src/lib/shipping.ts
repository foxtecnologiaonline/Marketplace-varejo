import { FREE_SHIPPING_THRESHOLD } from "./config";

export interface ShippingQuote {
  cost: number;
  label: string;
}

// Tabela fixa por faixa de CEP (dígitos iniciais = região dos Correios).
// Suficiente para o MVP; evolução natural é integrar Melhor Envio (ver docs/ESCOPO-FASE2.md).
const REGIONS: { from: number; to: number; cost: number; label: string }[] = [
  { from: 1000000, to: 19999999, cost: 19.9, label: "São Paulo (capital/interior)" },
  { from: 20000000, to: 28999999, cost: 24.9, label: "Rio de Janeiro" },
  { from: 29000000, to: 29999999, cost: 29.9, label: "Espírito Santo" },
  { from: 30000000, to: 39999999, cost: 24.9, label: "Minas Gerais" },
  { from: 40000000, to: 48999999, cost: 34.9, label: "Bahia/Sergipe" },
  { from: 49000000, to: 56999999, cost: 37.9, label: "Nordeste" },
  { from: 57000000, to: 57999999, cost: 37.9, label: "Alagoas" },
  { from: 58000000, to: 59999999, cost: 37.9, label: "Paraíba/RN" },
  { from: 60000000, to: 65999999, cost: 39.9, label: "Ceará/Piauí/Maranhão" },
  { from: 66000000, to: 68899999, cost: 44.9, label: "Pará/Amapá" },
  { from: 68900000, to: 69999999, cost: 54.9, label: "Norte" },
  { from: 70000000, to: 76799999, cost: 32.9, label: "Centro-Oeste/DF" },
  { from: 76800000, to: 77999999, cost: 44.9, label: "Tocantins" },
  { from: 78000000, to: 78899999, cost: 34.9, label: "Mato Grosso" },
  { from: 79000000, to: 79999999, cost: 32.9, label: "Mato Grosso do Sul" },
  { from: 80000000, to: 87999999, cost: 27.9, label: "Paraná" },
  { from: 88000000, to: 89999999, cost: 27.9, label: "Santa Catarina" },
  { from: 90000000, to: 99999999, cost: 27.9, label: "Rio Grande do Sul" }
];

export function calculateShipping(cep: string, subtotal: number): ShippingQuote {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return { cost: 0, label: "Frete grátis" };
  }

  const digits = cep.replace(/\D/g, "").padEnd(8, "0");
  const cepNumber = Number(digits);

  const region = REGIONS.find((r) => cepNumber >= r.from && cepNumber <= r.to);
  if (!region) {
    return { cost: 29.9, label: "Frete padrão" };
  }
  return { cost: region.cost, label: `Frete para ${region.label}` };
}

export function isValidCep(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep.trim());
}
