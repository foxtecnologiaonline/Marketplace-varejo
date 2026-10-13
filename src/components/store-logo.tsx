import Image from "next/image";
import type { Store } from "@/lib/types";

function initials(name: string): string {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

/**
 * Antes, toda loja sem logo de verdade caía numa foto aleatória do Unsplash
 * (pessoas numa biblioteca, roupas numa cama) recortada em círculo — nada a
 * ver com a marca. Sem um logo de verdade pra cada loja parceira, um
 * monograma com as iniciais é mais honesto do que uma foto fingindo ser logo.
 * `store.logo` continua existindo pra quando uma loja tiver logo real (upload
 * próprio): aí sim mostra a imagem.
 */
export function StoreLogo({ store, className = "" }: { store: Store; className?: string }) {
  if (store.logo) {
    return (
      <div className={`relative overflow-hidden rounded-full bg-slate-100 ${className}`}>
        <Image src={store.logo} alt={store.name} fill sizes="80px" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-900 text-xl font-bold text-white ${className}`}
      aria-hidden="true"
    >
      {initials(store.name)}
    </div>
  );
}
