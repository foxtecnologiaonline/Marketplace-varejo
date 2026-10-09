"use server";

import { z } from "zod";
import { sendContactEmail } from "@/lib/email";

const supportSchema = z.object({
  customerName: z.string().trim().min(2, "Informe seu nome").max(120, "Nome muito longo"),
  customerEmail: z.string().trim().email("E-mail inválido").max(254, "E-mail muito longo"),
  message: z
    .string()
    .trim()
    .min(10, "Conte um pouco mais sobre como podemos ajudar")
    .max(2000, "Mensagem muito longa (máx. 2000 caracteres)")
});

export type SupportInput = z.infer<typeof supportSchema>;
export type SupportResult = { success: true } | { success: false; error: string };

export async function submitSupportRequest(input: SupportInput): Promise<SupportResult> {
  const parsed = supportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await sendContactEmail({ ...parsed.data, topic: "Novo contato — Central de Atendimento" });
    return { success: true };
  } catch (error) {
    console.error("[atendimento] erro inesperado ao enviar mensagem", error);
    return { success: false, error: "Não foi possível enviar sua mensagem agora. Tente novamente em instantes." };
  }
}
