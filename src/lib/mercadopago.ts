import "server-only";
import type { Order } from "./orders";

const MP_API = "https://api.mercadopago.com";
const EXTERNAL_TIMEOUT_MS = 10_000;

// O id de pagamento do Mercado Pago é sempre numérico. Validar isso antes de
// interpolar na URL da API evita path traversal ("../") vindo de um webhook forjado.
export function isValidMpPaymentId(id: string): boolean {
  return /^\d{1,20}$/.test(id);
}

export function isMercadoPagoConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export interface MercadoPagoPreference {
  id: string;
  initPoint: string;
}

/**
 * Cria a preferência de pagamento (Pix + cartão via Checkout Pro). Se o token
 * não estiver configurado ainda (loja não confirmou a conta — ver
 * docs/ESCOPO-FASE2.md §5), retorna null e o checkout segue em modo simulado:
 * o pedido é criado normalmente, só o pagamento real fica pendente de configurar.
 */
export async function createPaymentPreference(
  order: Order,
  siteUrl: string
): Promise<MercadoPagoPreference | null> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return null;

  const response = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: order.items.map((item) => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: "BRL"
      })),
      shipments: {
        cost: order.shippingCost,
        mode: "not_specified"
      },
      payer: {
        name: order.customerName,
        email: order.customerEmail
      },
      external_reference: order.id,
      back_urls: {
        success: `${siteUrl}/checkout/sucesso?pedido=${order.id}`,
        pending: `${siteUrl}/checkout/sucesso?pedido=${order.id}`,
        failure: `${siteUrl}/checkout?erro=pagamento`
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/webhooks/mercadopago`
    }),
    signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mercado Pago rejeitou a preferência (${response.status}): ${body}`);
  }

  const data = await response.json();
  return { id: data.id, initPoint: data.init_point };
}

export interface MercadoPagoPayment {
  id: string;
  status: string;
  externalReference: string | null;
  transactionAmount: number;
  feeAmount: number;
  raw: unknown;
}

/**
 * Busca o pagamento direto na API do Mercado Pago a partir do id recebido no
 * webhook. Nunca confiamos no valor que vem no corpo da notificação — só no
 * que a API autenticada devolve.
 */
export async function fetchPayment(paymentId: string): Promise<MercadoPagoPayment> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
  }

  if (!isValidMpPaymentId(paymentId)) {
    throw new Error("ID de pagamento inválido.");
  }

  const response = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar pagamento ${paymentId} (${response.status})`);
  }

  const data = await response.json();
  const feeAmount = Array.isArray(data.fee_details)
    ? Math.round(data.fee_details.reduce((sum: number, fee: { amount: number }) => sum + fee.amount, 0) * 100) / 100
    : 0;

  return {
    id: String(data.id),
    status: data.status,
    externalReference: data.external_reference ?? null,
    transactionAmount: data.transaction_amount,
    feeAmount,
    raw: data
  };
}
