import { reaisToCents } from "./money";
import { formatCurrency } from "./format";

export interface Coupon {
  code: string;
  description: string;
  type: "percent" | "free-shipping";
  percentOff?: number;
  minSubtotal?: number;
}

// Fonte única de verdade dos cupons: lista fixa em código (sem tabela própria no
// banco ainda — mesmo padrão simples usado antes de uma necessidade real de CRUD
// de cupons pelo time comercial). BEMVINDO10 é a promessa que já aparecia na
// newsletter do rodapé; antes não existia nenhuma validação real por trás dela.
const COUPONS: Coupon[] = [
  { code: "BEMVINDO10", description: "10% de desconto na primeira compra", type: "percent", percentOff: 10 },
  {
    code: "FRETEGRATIS",
    description: "Frete grátis em compras acima de R$ 150",
    type: "free-shipping",
    minSubtotal: 150
  }
];

export function findCoupon(rawCode: string): Coupon | null {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  return COUPONS.find((c) => c.code === code) ?? null;
}

export type CouponValidationResult =
  | { valid: true; coupon: Coupon; discountCents: number }
  | { valid: false; error: string };

/**
 * Valida o cupom e calcula o desconto em centavos. Chamada SEMPRE no servidor
 * (checkout/actions.ts) a partir dos valores recalculados a partir do catálogo —
 * nunca confiamos num desconto que o cliente diga ter calculado.
 */
export function validateCoupon(rawCode: string, subtotalCents: number, shippingCents: number): CouponValidationResult {
  const coupon = findCoupon(rawCode);
  if (!coupon) {
    return { valid: false, error: "Cupom inválido ou expirado." };
  }
  if (coupon.minSubtotal != null && subtotalCents < reaisToCents(coupon.minSubtotal)) {
    return {
      valid: false,
      error: `Esse cupom exige compras a partir de ${formatCurrency(coupon.minSubtotal)}.`
    };
  }

  if (coupon.type === "free-shipping") {
    return { valid: true, coupon, discountCents: shippingCents };
  }

  const discountCents = Math.round((subtotalCents * (coupon.percentOff ?? 0)) / 100);
  return { valid: true, coupon, discountCents };
}
