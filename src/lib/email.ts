import "server-only";
import type { Order } from "./orders";
import { formatCurrency } from "./format";

const RESEND_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "pedidos@bluemalharia.com.br";
const DEFAULT_SALES = "contato@bluemalharia.com.br";
const EXTERNAL_TIMEOUT_MS = 10_000;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

// Todo texto vindo do usuário (nome, mensagem, itens) passa por aqui antes de
// entrar em HTML: sem isso, qualquer um poderia mandar e-mails com links/HTML
// arbitrários a partir do domínio da loja (para o cliente ou para o comercial).
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  label: string;
}

/**
 * Envio único via Resend. Sem RESEND_API_KEY não falha (só avisa no log), para a
 * indisponibilidade do e-mail nunca travar checkout/formulários. Nunca loga
 * dados pessoais do destinatário.
 */
async function sendEmail({ to, subject, html, replyTo, label }: OutgoingEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY não configurado — "${label}" não foi enviado.`);
    return;
  }

  // E-mail é best-effort: o pedido/formulário já foi registrado, então uma falha aqui
  // (rede, Resend fora do ar) só é logada — jamais deve fazer o cliente ver um erro
  // e tentar de novo, duplicando o pedido.
  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM,
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {})
      }),
      signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS)
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[email] falha ao enviar "${label}" (${response.status}): ${body}`);
    }
  } catch (error) {
    console.error(`[email] erro de rede ao enviar "${label}"`, error);
  }
}

function salesInbox(): string {
  return process.env.SALES_NOTIFICATION_EMAIL ?? DEFAULT_SALES;
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const shortId = order.id.slice(0, 8);
  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.quantity}x ${escapeHtml(item.name)} (tam. ${escapeHtml(item.size)}, cor ${escapeHtml(item.color)}) — ${formatCurrency(item.unitPrice * item.quantity)}</li>`
    )
    .join("");

  await sendEmail({
    to: order.customerEmail,
    subject: `Pedido confirmado #${shortId}`,
    label: "confirmação de pedido",
    html: `
      <h1>Recebemos seu pedido!</h1>
      <p>Olá, ${escapeHtml(order.customerName)}. Seu pedido #${shortId} foi confirmado.</p>
      <ul>${itemsHtml}</ul>
      <p>Frete: ${formatCurrency(order.shippingCost)}</p>
      <p><strong>Total: ${formatCurrency(order.total)}</strong></p>
      <p>Você receberá o código de rastreio quando o pedido for expedido.</p>
    `
  });
}

export interface ContactMessage {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  topic: string;
  message: string;
}

/** Notifica o time comercial/atendimento (cotação, atendimento, newsletter). */
export async function sendContactEmail(contact: ContactMessage): Promise<void> {
  const phone = contact.customerPhone
    ? `<p><strong>WhatsApp:</strong> ${escapeHtml(contact.customerPhone)}</p>`
    : "";

  await sendEmail({
    to: salesInbox(),
    replyTo: contact.customerEmail,
    subject: contact.topic,
    label: contact.topic,
    html: `
      <h1>${escapeHtml(contact.topic)}</h1>
      <p><strong>Nome:</strong> ${escapeHtml(contact.customerName)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(contact.customerEmail)}</p>
      ${phone}
      <p><strong>Mensagem:</strong></p>
      <p>${escapeHtml(contact.message).replace(/\n/g, "<br>")}</p>
    `
  });
}
