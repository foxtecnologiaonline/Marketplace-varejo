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
      from: process.env.RESEND_FROM_EMAIL ?? "pedidos@bluemalharia.com.br",
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

export interface QuoteRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  storeName: string;
  message: string;
}

/**
 * Notifica o time comercial sobre um pedido de cotação institucional (§/cotacao).
 * Mesmo padrão de degradação graciosa do resto do checkout: sem RESEND_API_KEY,
 * não falha — só avisa no log, para não travar o formulário do cliente.
 */
export async function sendQuoteRequestEmail(quote: QuoteRequest): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY não configurado — pedido de cotação não foi notificado por e-mail.",
      quote
    );
    return;
  }

  const salesEmail = process.env.SALES_NOTIFICATION_EMAIL ?? "contato@bluemalharia.com.br";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "pedidos@bluemalharia.com.br",
      to: salesEmail,
      reply_to: quote.customerEmail,
      subject: `Nova cotação institucional — ${quote.storeName}`,
      html: `
        <h1>Novo pedido de cotação institucional</h1>
        <p><strong>Nome:</strong> ${quote.customerName}</p>
        <p><strong>E-mail:</strong> ${quote.customerEmail}</p>
        <p><strong>WhatsApp:</strong> ${quote.customerPhone}</p>
        <p><strong>Loja/colégio de interesse:</strong> ${quote.storeName}</p>
        <p><strong>Detalhes:</strong></p>
        <p>${quote.message.replace(/\n/g, "<br>")}</p>
      `
    })
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[email] falha ao notificar cotação (${response.status}): ${body}`);
  }
}
