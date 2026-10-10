"use server";

import { validateCoupon } from "@/lib/coupons";
import { centsToReais, reaisToCents } from "@/lib/money";
import { checkRateLimit } from "@/lib/rate-limit";

export type CouponPreviewResult =
  | { valid: true; code: string; description: string; discount: number }
  | { valid: false; error: string };

/**
 * Preview do desconto, usado só para feedback imediato na tela do checkout — o
 * desconto final é sempre recalculado de novo dentro de submitCheckout (ver
 * src/app/checkout/actions.ts), que nunca confia no valor devolvido aqui.
 */
export async function previewCoupon(
  rawCode: string,
  subtotal: number,
  shippingCost: number
): Promise<CouponPreviewResult> {
  const limited = await checkRateLimit("coupon-preview", 20, 10 * 60_000);
  if (limited.limited) return { valid: false, error: limited.error };

  const result = validateCoupon(rawCode, reaisToCents(subtotal), reaisToCents(shippingCost));
  if (!result.valid) return { valid: false, error: result.error };

  return {
    valid: true,
    code: result.coupon.code,
    description: result.coupon.description,
    discount: centsToReais(result.discountCents)
  };
}
