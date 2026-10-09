"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app error boundary]", error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Algo deu errado</h1>
      <p className="mt-2 max-w-md text-slate-600">
        Não conseguimos carregar esta página agora. Tente novamente ou volte em alguns instantes.
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        Tentar de novo
      </button>
    </div>
  );
}
