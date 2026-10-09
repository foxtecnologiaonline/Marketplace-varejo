"use server";

import { z } from "zod";
import { getStoreBySlug } from "@/lib/data";
import { sendQuoteRequestEmail } from "@/lib/email";

const quoteSchema = z.object({
  customerName: z.string().trim().min(3, "Informe o nome completo"),
  customerEmail: z.string().trim().email("E-mail inválido"),
  customerPhone: z.string().trim().min(8, "Informe um WhatsApp válido"),
  storeSlug: z.string().min(1, "Selecione a loja/colégio de interesse"),
  message: z.string().trim().min(10, "Descreva quantidade estimada e detalhes do pedido")
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

  try {
    await sendQuoteRequestEmail({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      storeName: store.name,
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
