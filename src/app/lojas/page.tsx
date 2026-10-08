import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { stores } from "@/lib/data";

export const metadata: Metadata = { title: "Lojas parceiras" };

export default function StoresPage() {
  return (
    <div className="container-page py-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Lojas e colégios parceiros</h1>
      <p className="mb-6 text-slate-600">
        Escolha o colégio ou a loja parceira para ver a linha completa de uniformes.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stores.map((store) => (
          <Link
            key={store.slug}
            href={`/lojas/${store.slug}`}
            className="card flex flex-col items-center gap-3 p-6 text-center transition hover:shadow-lg"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-slate-100">
              <Image src={store.logo} alt={store.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{store.name}</p>
              <p className="text-xs text-slate-500">{store.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
