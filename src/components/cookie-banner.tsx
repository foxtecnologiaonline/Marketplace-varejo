"use client";

import { useState } from "react";
import Link from "next/link";
import { useHydrated } from "@/lib/use-hydrated";

const STORAGE_KEY = "marketplace-varejo-cookie-consent";

/**
 * Aviso de cookies (LGPD). O site hoje só usa localStorage essencial (carrinho,
 * favoritos, este próprio consentimento) — nada de rastreamento de terceiros
 * ainda —, então o aviso é informativo, não um gerenciador de categorias.
 * Se analytics/pixels forem adicionados depois, eles devem checar este consentimento
 * antes de carregar.
 */
export function CookieBanner() {
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);

  if (!hydrated) return null;
  if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) return null;
  if (dismissed) return null;

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // Sem storage disponível (modo privado etc.): só esconde nesta sessão.
    }
    setDismissed(true);
  }

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-4 backdrop-blur"
    >
      <div className="container-page flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-600">
          Usamos armazenamento local essencial (carrinho e favoritos) para o site funcionar. Saiba mais na{" "}
          <Link href="/privacidade" className="font-medium text-brand-600 hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <button type="button" onClick={accept} className="btn-primary shrink-0">
          Entendi
        </button>
      </div>
    </div>
  );
}
