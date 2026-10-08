import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <h1 className="text-3xl font-extrabold text-slate-900">404</h1>
      <p className="mt-2 text-slate-600">Página não encontrada.</p>
      <Link href="/" className="btn-primary mt-6">
        Voltar para a home
      </Link>
    </div>
  );
}
