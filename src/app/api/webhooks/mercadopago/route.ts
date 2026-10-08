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

  let body: { type?: string; data?: { id?: string }; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const paymentId = body.data?.id;
  const isPaymentEvent = body.type === "payment" || body.action?.startsWith("payment.");

  if (!isPaymentEvent || !paymentId) {
    // Outros tipos de evento (merchant_order, etc.) são ignorados sem erro.
    return NextResponse.json({ ok: true });
  }

  try {
    const payment = await fetchPayment(paymentId);

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true, status: payment.status });
    }

    if (!payment.externalReference) {
      return NextResponse.json({ error: "pagamento sem external_reference" }, { status: 422 });
    }

    await markOrderPaid({
      orderId: payment.externalReference,
      mpPaymentId: payment.id,
      grossAmount: payment.transactionAmount,
      feeAmount: payment.feeAmount,
      raw: payment.raw
    });

    const order = await getOrderById(payment.externalReference);
    if (order) {
      await sendOrderConfirmationEmail(order);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[webhook mercadopago] erro ao processar pagamento", error);
    return NextResponse.json({ error: "falha ao processar" }, { status: 500 });
  }
}
