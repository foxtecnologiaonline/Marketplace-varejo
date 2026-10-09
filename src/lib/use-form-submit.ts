"use client";

import { useState } from "react";

type ActionResult = { success: true } | { success: false; error: string };

const NETWORK_ERROR = "Não foi possível enviar agora. Verifique sua conexão e tente novamente.";

/**
 * Estado/fluxo comum dos formulários que chamam uma Server Action: envio,
 * erro, sucesso e reset. Captura a referência do <form> antes do await (o React
 * zera e.currentTarget depois de um ponto assíncrono) e trata falha de rede,
 * que de outra forma deixaria o botão preso em "Enviando…".
 */
export function useFormSubmit(run: (data: FormData) => Promise<ActionResult>) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setError(null);
    setSubmitting(true);

    try {
      const result = await run(new FormData(formEl));
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSent(true);
      formEl.reset();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return { submitting, error, sent, setSent, onSubmit };
}

export function field(data: FormData, name: string): string {
  return String(data.get(name) ?? "");
}
