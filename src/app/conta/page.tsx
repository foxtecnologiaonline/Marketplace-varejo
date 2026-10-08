import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Minha conta" };

export default function AccountPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
        <form className="card flex flex-col gap-4 p-6">
          <h2 className="text-lg font-bold text-slate-900">Entrar</h2>
          <input required type="email" placeholder="E-mail" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input required type="password" placeholder="Senha" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <button type="submit" className="btn-primary">
            Entrar
          </button>
          <Link href="/conta/pedidos" className="text-center text-sm text-brand-600 hover:underline">
            Ver meus pedidos
          </Link>
        </form>

        <form className="card flex flex-col gap-4 p-6">
          <h2 className="text-lg font-bold text-slate-900">Criar uma conta</h2>
          <input required placeholder="Nome completo" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input required type="email" placeholder="E-mail" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input required type="password" placeholder="Senha" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <button type="submit" className="btn-secondary">
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
