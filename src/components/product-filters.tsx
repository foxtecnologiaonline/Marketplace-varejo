import { categories, stores } from "@/lib/data";

interface Props {
  categoria?: string;
  loja?: string;
  ordenar?: string;
}

export function ProductFilters({ categoria, loja, ordenar }: Props) {
  return (
    <form className="card sticky top-24 flex flex-col gap-6 p-5" method="get">
      {ordenar && <input type="hidden" name="ordenar" value={ordenar} />}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Categoria</h3>
        <div className="flex flex-col gap-2 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input type="radio" name="categoria" value="" defaultChecked={!categoria} />
            Todas
          </label>
          {categories.map((c) => (
            <label key={c.slug} className="flex items-center gap-2">
              <input type="radio" name="categoria" value={c.slug} defaultChecked={categoria === c.slug} />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Loja / Colégio</h3>
        <div className="flex flex-col gap-2 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input type="radio" name="loja" value="" defaultChecked={!loja} />
            Todas
          </label>
          {stores.map((s) => (
            <label key={s.slug} className="flex items-center gap-2">
              <input type="radio" name="loja" value={s.slug} defaultChecked={loja === s.slug} />
              {s.name}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary">
        Aplicar filtros
      </button>
    </form>
  );
}
