import "server-only";
import { randomUUID } from "crypto";
import { getSupabaseAdmin, isDatabaseConfigured } from "./supabase-server";

export interface OrderItemInput {
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface ShippingAddress {
  name: string;
  cep: string;
  city: string;
  street: string;
  complement?: string;
}

export interface CreateOrderInput {
  storeSlug?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  shippingCost: number;
  subtotal: number;
  total: number;
  items: OrderItemInput[];
}

export interface Order extends CreateOrderInput {
  id: string;
  status: string;
  paymentStatus: string;
  persisted: boolean;
}

/**
 * Cria o pedido no banco quando o Supabase está configurado. Se não estiver
 * (infra ainda não decidida — ver docs/ESCOPO-FASE2.md), gera um pedido em
 * memória com persisted:false para o checkout seguir funcionando de ponta a
 * ponta mesmo sem banco; o aviso no log deixa isso visível em produção.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!isDatabaseConfigured()) {
    console.warn(
      "[orders] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados — pedido NÃO foi persistido."
    );
    return {
      ...input,
      id: randomUUID(),
      status: "novo",
      paymentStatus: "pendente",
      persisted: false
    };
  }

  const supabase = getSupabaseAdmin();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      origin: "site",
      store_slug: input.storeSlug ?? null,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone ?? null,
      shipping_address: input.shippingAddress,
      shipping_cost: input.shippingCost,
      subtotal: input.subtotal,
      total: input.total
    })
    .select("id, status, payment_status")
    .single();

  if (error || !order) {
    throw new Error(`Falha ao criar pedido: ${error?.message ?? "resposta vazia"}`);
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      name: item.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: item.unitPrice
    }))
  );

  if (itemsError) {
    throw new Error(`Falha ao criar itens do pedido: ${itemsError.message}`);
  }

  return {
    ...input,
    id: order.id,
    status: order.status,
    paymentStatus: order.payment_status,
    persisted: true
  };
}

export async function attachPaymentPreference(orderId: string, preferenceId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const supabase = getSupabaseAdmin();
  await supabase.from("orders").update({ mp_preference_id: preferenceId }).eq("id", orderId);
}

export async function markOrderPaid(params: {
  orderId: string;
  mpPaymentId: string;
  grossAmount: number;
  feeAmount: number;
  raw: unknown;
}): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.warn("[orders] pagamento confirmado mas banco não configurado, nada foi atualizado.", params.orderId);
    return;
  }

  const supabase = getSupabaseAdmin();

  await supabase
    .from("orders")
    .update({ payment_status: "pago", status: "confirmado", mp_payment_id: params.mpPaymentId })
    .eq("id", params.orderId);

  await supabase.from("payments").insert({
    order_id: params.orderId,
    gateway: "mercadopago",
    gross_amount: params.grossAmount,
    fee_amount: params.feeAmount,
    net_amount: params.grossAmount - params.feeAmount,
    status: "pago",
    paid_at: new Date().toISOString(),
    raw: params.raw
  });
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!isDatabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, payment_status, customer_name, customer_email, customer_phone, shipping_address, shipping_cost, subtotal, total, store_slug"
    )
    .eq("id", orderId)
    .single();

  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, name, size, color, quantity, unit_price")
    .eq("order_id", orderId);

  return {
    id: order.id,
    status: order.status,
    paymentStatus: order.payment_status,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone ?? undefined,
    shippingAddress: order.shipping_address,
    shippingCost: order.shipping_cost,
    subtotal: order.subtotal,
    total: order.total,
    storeSlug: order.store_slug ?? undefined,
    persisted: true,
    items: (items ?? []).map((i) => ({
      productId: i.product_id,
      name: i.name,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
      unitPrice: i.unit_price
    }))
  };
}
