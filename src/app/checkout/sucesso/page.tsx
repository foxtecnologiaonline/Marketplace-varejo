import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Pedido realizado com sucesso!</h1>
      <p className="mt-2 max-w-md text-slate-600">
        Você receberá um e-mail com os detalhes do pedido e o código de rastreio em breve.
      </p>
      <Link href="/produtos" className="btn-primary mt-6">
        Continuar comprando
      </Link>
    </div>
  );
}
