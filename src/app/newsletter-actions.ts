"use server";

import { z } from "zod";
import { sendContactEmail } from "@/lib/email";

const newsletterSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(254, "E-mail muito longo")
});

export type NewsletterResult = { success: true } | { success: false; error: string };

export async function subscribeNewsletter(input: { email: string }): Promise<NewsletterResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "E-mail inválido" };
  }

  try {
    await sendContactEmail({
      customerName: "Novo inscrito (newsletter)",
      customerEmail: parsed.data.email,
      topic: "Novo cadastro para receber novidades",
      message: `Quer receber novidades e ofertas: ${parsed.data.email}`
    });
    return { success: true };
  } catch (error) {
    console.error("[newsletter] erro inesperado ao registrar inscrição", error);
    return { success: false, error: "Não foi possível concluir agora. Tente novamente em instantes." };
  }
}
