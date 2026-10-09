"use server";

import { z } from "zod";
import { getStoreBySlug } from "@/lib/data";
import { sendContactEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

const quoteSchema = z.object({
  customerName: z.string().trim().min(3, "Informe o nome completo").max(120, "Nome muito longo"),
  customerEmail: z.string().trim().email("E-mail inválido").max(254, "E-mail muito longo"),
  customerPhone: z.string().trim().min(8, "Informe um WhatsApp válido").max(30, "WhatsApp inválido"),
  storeSlug: z.string().min(1, "Selecione a loja/colégio de interesse").max(80),
  message: z
    .string()
    .trim()
    .min(10, "Descreva quantidade estimada e detalhes do pedido")
    .max(2000, "Mensagem muito longa (máx. 2000 caracteres)")
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type QuoteResult = { success: true } | { success: false; error: string };

export async function submitQuoteRequest(input: QuoteInput): Promise<QuoteResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  const store = getStoreBySlug(data.storeSlug);
  if (!store) {
    return { success: false, error: "Loja/colégio inválido." };
  }

  const limited = await checkRateLimit("cotacao", 5, 10 * 60_000);
  if (limited.limited) return { success: false, error: limited.error };

  try {
    await sendContactEmail({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      topic: `Nova cotação institucional — ${store.name}`,
      message: data.message
    });
    return { success: true };
  } catch (error) {
    console.error("[cotacao] erro inesperado ao enviar solicitação", error);
    return {
      success: false,
      error: "Não foi possível enviar sua solicitação agora. Tente novamente em instantes."
    };
  }
}
