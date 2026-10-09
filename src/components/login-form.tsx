"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

/**
 * Login por link mágico (Supabase Auth, sem senha). Só é renderizado quando
 * isSupabaseAuthConfigured() é true (checado pelo componente pai, server-side) —
 * NUNCA testado contra um projeto Supabase real nesta sessão (não existe um
 * disponível). Validar contra um projeto de verdade antes de depender disto:
 * o e-mail de link mágico precisa do SMTP do Supabase (ou um customizado)
 * configurado no painel, e o domínio precisa estar na allowlist de redirect.
 */
export function LoginForm() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/conta` }
      });
      if (authError) {
        setStatus("error");
        setError(authError.message);
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Não foi possível enviar o link agora. Tente novamente em instantes.");
    }
  }

  async function handleSignOut() {
    await getSupabaseBrowserClient().auth.signOut();
  }

  // undefined = ainda checando a sessão existente; evita piscar o formulário de
  // login antes de saber se a pessoa já está logada.
  if (session === undefined) return null;

  if (session) {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-slate-600">
          Logado como <strong>{session.user.email}</strong>
        </p>
        <button type="button" onClick={handleSignOut} className="btn-secondary">
          Sair
        </button>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-slate-600">
          Enviamos um link de acesso para <strong>{email}</strong>. Abra o e-mail para entrar.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="btn-secondary">
          Usar outro e-mail
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
      <p className="text-sm text-slate-600">Informe seu e-mail e enviaremos um link de acesso, sem senha.</p>
      <input
        type="email"
        required
        maxLength={254}
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button type="submit" disabled={status === "sending"} className="btn-primary">
        {status === "sending" ? "Enviando..." : "Enviar link de acesso"}
      </button>
    </form>
  );
}
