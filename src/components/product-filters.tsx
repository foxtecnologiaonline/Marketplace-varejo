import { categories, getAvailableColors, getAvailableSizes, stores } from "@/lib/data";

interface Props {
  categoria?: string;
  loja?: string;
  ordenar?: string;
  q?: string;
  tamanho?: string;
  cor?: string;
  precoMin?: string;
  precoMax?: string;
}

export function ProductFilters({ categoria, loja, ordenar, q, tamanho, cor, precoMin, precoMax }: Props) {
  const sizes = getAvailableSizes();
  const colors = getAvailableColors();

  return (
    <form className="card sticky top-24 flex flex-col gap-6 p-5" method="get">
      {ordenar && <input type="hidden" name="ordenar" value={ordenar} />}
      {q && <input type="hidden" name="q" value={q} />}

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

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Tamanho</h3>
        <div className="flex flex-col gap-2 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input type="radio" name="tamanho" value="" defaultChecked={!tamanho} />
            Todos
          </label>
          {sizes.map((size) => (
            <label key={size} className="flex items-center gap-2">
              <input type="radio" name="tamanho" value={size} defaultChecked={tamanho === size} />
              {size}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Cor</h3>
        <div className="flex flex-col gap-2 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input type="radio" name="cor" value="" defaultChecked={!cor} />
            Todas
          </label>
          {colors.map((color) => (
            <label key={color.name} className="flex items-center gap-2">
              <input type="radio" name="cor" value={color.name} defaultChecked={cor === color.name} />
              <span
                className="h-3 w-3 rounded-full border border-slate-300"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              />
              {color.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Faixa de preço</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="precoMin"
            min={0}
            placeholder="Mín"
            defaultValue={precoMin}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <span className="text-slate-400">a</span>
          <input
            type="number"
            name="precoMax"
            min={0}
            placeholder="Máx"
            defaultValue={precoMax}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <button type="submit" className="btn-primary">
        Aplicar filtros
      </button>
    </form>
  );
}
