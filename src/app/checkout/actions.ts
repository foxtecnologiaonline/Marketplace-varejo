"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { MAX_ITEM_QUANTITY } from "@/lib/config";
import { products } from "@/lib/data";
import { calculateShipping, isValidCep } from "@/lib/shipping";
import { createOrder, attachPaymentPreference, type OrderItemInput } from "@/lib/orders";
import { createPaymentPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { isDatabaseConfigured } from "@/lib/supabase-server";

const cartItemSchema = z.object({
  productId: z.string().max(40),
  size: z.string().min(1).max(10),
  color: z.string().min(1).max(40),
  quantity: z
    .number()
    .int("Quantidade inválida")
    .min(1, "Quantidade inválida")
    .max(MAX_ITEM_QUANTITY, `Máximo de ${MAX_ITEM_QUANTITY} unidades por item`)
});

const checkoutSchema = z.object({
  customerName: z.string().trim().min(3, "Informe o nome completo").max(120, "Nome muito longo"),
  customerEmail: z.string().trim().email("E-mail inválido").max(254, "E-mail muito longo"),
  customerPhone: z.string().trim().max(30, "WhatsApp inválido").optional(),
  cep: z.string().refine(isValidCep, "CEP inválido"),
  city: z.string().trim().min(2, "Informe a cidade").max(100, "Cidade muito longa"),
  street: z.string().trim().min(3, "Informe o endereço").max(200, "Endereço muito longo"),
  complement: z.string().trim().max(100, "Complemento muito longo").optional(),
  items: z.array(cartItemSchema).min(1, "Carrinho vazio").max(50, "Itens demais no carrinho")
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutResult =
  | { success: true; redirectUrl: string }
  | { success: false; error: string };

async function resolveSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NODE_ENV === "production") {
    // Em produção nunca confiamos no header Host (pode ser forjado pelo cliente) para montar
    // back_urls/notification_url do Mercado Pago — exige NEXT_PUBLIC_SITE_URL explícito.
    throw new Error(
      "NEXT_PUBLIC_SITE_URL não configurado em produção. Defina essa variável antes de aceitar pagamentos " +
        "(ver .env.example) — sem ela, as URLs de retorno/notificação do Mercado Pago ficariam baseadas no " +
        "header Host da requisição, que não é confiável."
    );
  }
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

  try {
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
      if (!product.colors.some((c) => c.name === cartItem.color)) {
        return { success: false, error: `Cor indisponível para ${product.name}.` };
      }
      if (cartItem.quantity > product.stock) {
        return {
          success: false,
          error: `Apenas ${product.stock} unidade(s) disponível(is) para ${product.name}.`
        };
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

    // Arredonda para centavos: somas de ponto flutuante (ex.: 69,9 x 3) geram 209,70000000000002.
    const toCents = (value: number) => Math.round(value * 100) / 100;
    const subtotal = toCents(orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
    const shipping = calculateShipping(data.cep, subtotal);
    const total = toCents(subtotal + shipping.cost);

    // Nunca cobrar sem ter onde registrar o pedido: com o gateway ativo e o banco ausente,
    // o webhook confirmaria um pagamento de um pedido que não existe em lugar nenhum.
    if (isMercadoPagoConfigured() && !isDatabaseConfigured()) {
      throw new Error(
        "Mercado Pago configurado sem banco de dados (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY): " +
          "o pedido não seria persistido. Configure o banco antes de aceitar pagamentos."
      );
    }

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

    if (isMercadoPagoConfigured()) {
      // resolveSiteUrl() só é chamada aqui dentro: ela exige NEXT_PUBLIC_SITE_URL em
      // produção, mas essa exigência só faz sentido quando a URL é de fato usada nas
      // back_urls/notification_url do Mercado Pago — sem gateway configurado, o
      // checkout não deve depender dela.
      const siteUrl = await resolveSiteUrl();
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
  } catch (error) {
    // Nunca deixamos uma falha de infraestrutura (config ausente, Supabase ou
    // Mercado Pago fora do ar) virar um erro de Server Component sem mensagem
    // para o cliente — loga o motivo real e devolve algo acionável.
    console.error("[checkout] erro inesperado ao processar pedido", error);
    return {
      success: false,
      error:
        "Não foi possível concluir seu pedido agora. Tente novamente em instantes ou fale com a gente pelo WhatsApp."
    };
  }
}
