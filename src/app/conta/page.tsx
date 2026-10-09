import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { isSupabaseAuthConfigured } from "@/lib/supabase-browser";

export const metadata: Metadata = { title: "Minha conta" };

// Antes havia formulários com campo de senha sem `action`: o navegador os enviava
// por GET, deixando a senha na URL/histórico. Agora: login real por link mágico
// (Supabase Auth) quando NEXT_PUBLIC_SUPABASE_URL/ANON_KEY estão configurados; sem
// isso, mantém o aviso honesto de antes em vez de mostrar um formulário morto.
export default function AccountPage() {
  if (isSupabaseAuthConfigured()) {
    return (
      <div className="container-page py-12">
        <div className="mx-auto max-w-md">
          <h1 className="mb-4 text-center text-xl font-bold text-slate-900">Minha conta</h1>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="card mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">Área do cliente em breve</h1>
        <p className="text-sm text-slate-600">
          Você não precisa de conta para comprar. O acompanhamento do pedido e o código de rastreio
          são enviados por e-mail. Se precisar de ajuda com uma compra, fale com a gente.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/produtos" className="btn-primary">
            Ver produtos
          </Link>
          <Link href="/atendimento" className="btn-secondary">
            Falar com o atendimento
          </Link>
        </div>
      </div>
    </div>
  );
}
