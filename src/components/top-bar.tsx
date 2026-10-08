import { FREE_SHIPPING_THRESHOLD } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

export function TopBar() {
  return (
    <div className="bg-brand-950 text-center text-xs font-medium text-white sm:text-sm">
      <div className="container-page flex flex-col items-center justify-center gap-1 py-2 sm:flex-row sm:gap-3">
        <span>Frete grátis para todo o Brasil em compras acima de {formatCurrency(FREE_SHIPPING_THRESHOLD)}</span>
        <span className="hidden sm:inline">•</span>
        <span>Primeira troca grátis</span>
      </div>
    </div>
  );
}
