import "server-only";
import type { Order } from "./orders";
import { formatCurrency } from "./format";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY não configurado — e-mail de confirmação não enviado.");
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.quantity}x ${item.name} (tam. ${item.size}, cor ${item.color}) — ${formatCurrency(item.unitPrice * item.quantity)}</li>`
    )
    .join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "pedidos@varejoplus.com.br",
      to: order.customerEmail,
      subject: `Pedido confirmado #${order.id.slice(0, 8)}`,
      html: `
        <h1>Recebemos seu pedido!</h1>
        <p>Olá, ${order.customerName}. Seu pedido #${order.id.slice(0, 8)} foi confirmado.</p>
        <ul>${itemsHtml}</ul>
        <p>Frete: ${formatCurrency(order.shippingCost)}</p>
        <p><strong>Total: ${formatCurrency(order.total)}</strong></p>
        <p>Você receberá o código de rastreio quando o pedido for expedido.</p>
      `
    })
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[email] falha ao enviar confirmação (${response.status}): ${body}`);
  }
}
