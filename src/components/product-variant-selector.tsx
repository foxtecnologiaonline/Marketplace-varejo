"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { MAX_ITEM_QUANTITY } from "@/lib/config";

export function ProductVariantSelector({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(product.colors[0]?.name ?? null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart() {
    if (!size) {
      setError("Por favor, selecione um tamanho.");
      return;
    }
    setError(null);
    addItem(product.id, size, color ?? "", quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900">
          Tamanho {size ? `— ${size}` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`min-w-10 rounded-md border px-3 py-2 text-sm font-medium transition ${
                size === s
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 text-slate-700 hover:border-brand-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900">
          Cor {color ? `— ${color}` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              aria-label={c.name}
              onClick={() => setColor(c.name)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                color === c.name ? "border-brand-600" : "border-slate-200"
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {color === c.name && (
                <Check className={`h-4 w-4 ${c.hex === "#ffffff" ? "text-slate-900" : "text-white"}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-slate-900">Quantidade</p>
        <div className="flex items-center rounded-md border border-slate-300">
          <button
            type="button"
            className="px-3 py-1.5 text-lg"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="w-10 text-center text-sm">{quantity}</span>
          <button
            type="button"
            className="px-3 py-1.5 text-lg"
            disabled={quantity >= MAX_ITEM_QUANTITY}
            onClick={() => setQuantity((q) => Math.min(MAX_ITEM_QUANTITY, q + 1))}
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {added && <p className="text-sm font-medium text-emerald-600">Produto adicionado ao carrinho!</p>}

      <button type="button" onClick={handleAddToCart} className="btn-primary w-full sm:w-auto">
        Adicionar ao carrinho
      </button>
    </div>
  );
}
