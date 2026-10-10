import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { getOrderById } from "@/lib/orders";
import { formatCurrency } from "@/lib/format";
import { verifyOrderToken } from "@/lib/order-token";

interface Props {
  searchParams: Promise<{ pedido?: string; t?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { pedido, t } = await searchParams;
  // Sem o token assinado (ver src/lib/order-token.ts), qualquer um com o UUID do
  // pedido em mãos — link compartilhado, histórico do navegador — veria nome,
  // endereço, itens e total de outra pessoa. O token é obrigatório para os dois
  // casos (pago e pendente); sem ele, a página se comporta como "pedido" ausente.
  const order = pedido && verifyOrderToken(pedido, t) ? await getOrderById(pedido) : null;
  const isPaid = order?.paymentStatus === "pago";

  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      {isPaid ? (
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      ) : (
        <Clock className="h-16 w-16 text-amber-500" />
      )}

      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        {isPaid ? "Pagamento confirmado!" : "Pedido recebido!"}
      </h1>

      <p className="mt-2 max-w-md text-slate-600">
        {isPaid
          ? "Seu pagamento foi aprovado e o pedido já entrou na fila de produção."
          : "Recebemos seu pedido e você receberá a confirmação do pagamento por e-mail em breve."}
      </p>

      {order && (
        <div className="card mt-6 w-full max-w-md p-5 text-left">
          <p className="mb-2 text-sm font-semibold text-slate-900">
            Pedido #{order.id.slice(0, 8)}
          </p>
          <ul className="space-y-1 text-sm text-slate-600">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.quantity}x {item.name} ({item.size}, {item.color})
              </li>
            ))}
          </ul>
          {!!order.discount && (
            <div className="mt-2 flex justify-between text-sm text-emerald-600">
              <span>Cupom {order.couponCode}</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      )}

      <Link href="/produtos" className="btn-primary mt-6">
        Continuar comprando
      </Link>
    </div>
  );
}
