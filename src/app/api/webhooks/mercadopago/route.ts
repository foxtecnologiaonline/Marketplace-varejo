import { NextRequest, NextResponse } from "next/server";
import { fetchPayment, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { getOrderById, markOrderPaid } from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Webhook do Mercado Pago (Checkout Pro). Não confiamos em nada do corpo da
// notificação além do id do pagamento — o status e os valores são sempre
// buscados de volta na API autenticada do Mercado Pago.
export async function POST(request: NextRequest) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 503 });
  }

  let body: { type?: unknown; action?: unknown; data?: { id?: unknown } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  // O Mercado Pago envia o id ora como número, ora como string.
  const rawId = body?.data?.id;
  const paymentId = typeof rawId === "string" || typeof rawId === "number" ? String(rawId) : null;
  const isPaymentEvent =
    body?.type === "payment" || (typeof body?.action === "string" && body.action.startsWith("payment."));

  if (!isPaymentEvent || !paymentId) {
    // Outros tipos de evento (merchant_order, etc.) são ignorados sem erro.
    return NextResponse.json({ ok: true });
  }

  if (!/^\d{1,20}$/.test(paymentId)) {
    return NextResponse.json({ error: "id de pagamento inválido" }, { status: 400 });
  }

  try {
    const payment = await fetchPayment(paymentId);

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true, status: payment.status });
    }

    if (!payment.externalReference) {
      return NextResponse.json({ error: "pagamento sem external_reference" }, { status: 422 });
    }

    const order = await getOrderById(payment.externalReference);
    if (!order) {
      return NextResponse.json({ error: "pedido não encontrado" }, { status: 404 });
    }

    if (order.paymentStatus === "pago") {
      return NextResponse.json({ ok: true, status: "already_processed" });
    }

    // Nunca confiamos apenas no status "approved": o valor pago precisa corresponder ao
    // total do pedido calculado no servidor, senão um pagamento de valor menor (feito por
    // qualquer meio que gere um pagamento válido com esse external_reference) marcaria o
    // pedido inteiro como pago.
    if (Math.abs(payment.transactionAmount - order.total) > 0.01) {
      console.error(
        `[webhook mercadopago] valor pago (${payment.transactionAmount}) diverge do total do pedido ${order.id} (${order.total})`
      );
      return NextResponse.json({ error: "valor pago não corresponde ao total do pedido" }, { status: 422 });
    }

    // markOrderPaid é atômico: só quem faz a transição "pendente" -> "pago" recebe true,
    // então notificações repetidas ou simultâneas não duplicam pagamento nem e-mail.
    const transitioned = await markOrderPaid({
      orderId: order.id,
      mpPaymentId: payment.id,
      grossAmount: payment.transactionAmount,
      feeAmount: payment.feeAmount,
      raw: payment.raw
    });

    if (!transitioned) {
      return NextResponse.json({ ok: true, status: "already_processed" });
    }

    await sendOrderConfirmationEmail({ ...order, paymentStatus: "pago", status: "confirmado" });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[webhook mercadopago] erro ao processar pagamento", error);
    return NextResponse.json({ error: "falha ao processar" }, { status: 500 });
  }
}
