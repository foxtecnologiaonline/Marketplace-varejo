"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { products } from "@/lib/data";
import { calculateShipping, isValidCep } from "@/lib/shipping";
import { createOrder, attachPaymentPreference, type OrderItemInput } from "@/lib/orders";
import { createPaymentPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { sendOrderConfirmationEmail } from "@/lib/email";

const cartItemSchema = z.object({
  productId: z.string(),
  size: z.string().min(1),
  color: z.string().min(1),
  quantity: z.number().int().min(1).max(20)
});

const checkoutSchema = z.object({
  customerName: z.string().trim().min(3, "Informe o nome completo"),
  customerEmail: z.string().trim().email("E-mail inválido"),
  customerPhone: z.string().trim().optional(),
  cep: z.string().refine(isValidCep, "CEP inválido"),
  city: z.string().trim().min(2, "Informe a cidade"),
  street: z.string().trim().min(3, "Informe o endereço"),
  complement: z.string().trim().optional(),
  items: z.array(cartItemSchema).min(1, "Carrinho vazio")
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutResult =
  | { success: true; redirectUrl: string }
  | { success: false; error: string };

async function resolveSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function submitCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  // Preço é sempre recalculado a partir do catálogo no servidor — nunca confiamos
  // no valor que o carrinho do cliente possa enviar.
  const orderItems: OrderItemInput[] = [];
  for (const cartItem of data.items) {
    const product = products.find((p) => p.id === cartItem.productId);
    if (!product) {
      return { success: false, error: "Um dos produtos do carrinho não existe mais." };
    }
    if (!product.sizes.includes(cartItem.size)) {
      return { success: false, error: `Tamanho indisponível para ${product.name}.` };
    }
    orderItems.push({
      productId: product.id,
      name: product.name,
      size: cartItem.size,
      color: cartItem.color,
      quantity: cartItem.quantity,
      unitPrice: product.price
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = calculateShipping(data.cep, subtotal);
  const total = subtotal + shipping.cost;

  const order = await createOrder({
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    shippingAddress: {
      name: data.customerName,
      cep: data.cep,
      city: data.city,
      street: data.street,
      complement: data.complement
    },
    shippingCost: shipping.cost,
    subtotal,
    total,
    items: orderItems
  });

  const siteUrl = await resolveSiteUrl();

  if (isMercadoPagoConfigured()) {
    const preference = await createPaymentPreference(order, siteUrl);
    if (preference) {
      await attachPaymentPreference(order.id, preference.id);
      return { success: true, redirectUrl: preference.initPoint };
    }
  }

  // Sem gateway configurado ainda: o pedido é registrado como "pendente" (nunca
  // como pago) e o time é avisado por e-mail; o pagamento é confirmado depois
  // manualmente até o Mercado Pago ser habilitado (ver docs/ESCOPO-FASE2.md §5).
  await sendOrderConfirmationEmail(order);

  return { success: true, redirectUrl: `/checkout/sucesso?pedido=${order.id}` };
}
