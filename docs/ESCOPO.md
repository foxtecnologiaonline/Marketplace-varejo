# Escopo — Marketplace Varejo

## 1. Benchmarking

Referências analisadas: **ddamalharia.com.br** e **taconfeccoes.com.br** — ambas lojas de
uniformes escolares/esportivos (WooCommerce). Padrões extraídos e replicados no scaffold:

| Padrão observado | Onde foi aplicado |
|---|---|
| Barra superior com promoção fixa ("frete grátis acima de X", "primeira troca grátis") | `TopBar` |
| Navegação por marca/colégio, não só por categoria de produto | Menu do `Header` + páginas `/lojas` e `/lojas/[slug]` |
| Botão de cotação/WhatsApp para pedidos institucionais (em volume) | `/cotacao` + `WhatsAppButton` flutuante |
| Cards de produto com preço "a partir de", parcelamento e seletor de tamanho/cor já na listagem | `ProductCard`, `ProductVariantSelector` |
| Barra de benefícios (segurança, frete, atendimento, qualidade) | `BenefitsBar` |
| Cupom de primeira compra / newsletter | Seção final da home |
| Rodapé institucional (trocas, privacidade, regulamento) + redes sociais + pagamento | `Footer` |
| Aviso "selecione uma variação" antes de comprar | Validação em `ProductVariantSelector` |

A diferença proposital em relação às referências: aqui a navegação por "colégio" se generaliza
para **loja parceira**, modelando o produto como *marketplace* (múltiplos vendedores), não uma
loja única — alinhado ao nome do projeto (`Marketplace-varejo`).

## 2. Fluxos principais

1. **Compra direta (B2C):** Home → Loja/Categoria → Produto (seleciona tamanho/cor) → Carrinho →
   Checkout (endereço + pagamento) → Confirmação.
2. **Compra institucional/B2B (escola, time, empresa):** Home → "Pedir cotação institucional" →
   formulário → atendimento humano via WhatsApp/e-mail.
3. **Descoberta por loja:** `/lojas` → página da loja com sua vitrine completa (equivalente a
   "comprar pelo colégio" nos sites de referência).

## 3. Arquitetura técnica

- **Next.js 16 (App Router) + TypeScript** — renderização híbrida (SSG para catálogo, client
  components só onde há interatividade: carrinho, seletor de variação, filtros de ordenação).
- **Tailwind CSS** — design tokens em `tailwind.config.ts` (cor de marca + acento), sem CSS extra.
- **Zustand + `persist`** — estado do carrinho no `localStorage`, sem backend nesta etapa.
- **Camada de dados (`src/lib/data.ts`)** — funções (`searchProducts`, `getProductBySlug`, etc.)
  com assinatura estável para trocar o mock por consultas reais (Prisma/Supabase) sem alterar
  páginas ou componentes.
- **next/image** com `remotePatterns` para otimização automática de imagens.

### Por que não full multi-vendor ainda
Implementar onboarding de vendedor, split de pagamento e painel de loja é um salto grande de
escopo. O modelo de dados já isola `Store` como entidade própria (não é apenas um campo de
produto), então a evolução para multi-vendor real é incremental — ver roadmap.

## 4. Modelo de dados (atual, em `src/lib/types.ts`)

```
Store      { slug, name, logo, description }
Category   { slug, name, image }
Product    { id, slug, name, storeSlug, categorySlug, price, compareAtPrice,
             installments, images[], sizes[], colors[], description, highlights[],
             stock, freeShipping, tags[], rating, reviewsCount }
CartItem   { productId, size, color, quantity }
```

## 5. Páginas entregues no MVP

- `/` — home (hero, benefícios, lojas, categorias, lançamentos, newsletter)
- `/produtos` — listagem com filtro por categoria/loja e ordenação por preço
- `/produtos/[slug]` — ficha de produto com galeria, variações, parcelamento, relacionados
- `/busca` — busca textual
- `/lojas`, `/lojas/[slug]` — vitrine por loja/colégio parceiro
- `/carrinho`, `/checkout`, `/checkout/sucesso` — fluxo de compra completo (pagamento mockado)
- `/cotacao` — formulário institucional
- `/conta`, `/conta/pedidos`, `/favoritos` — placeholders de conta (sem auth real ainda)
- Páginas institucionais: `/sobre`, `/privacidade`, `/trocas-devolucoes`, `/regulamento`, `/atendimento`

## 6. Roadmap de evolução

1. **Persistência real:** Postgres via Prisma ou Supabase, substituindo `src/lib/data.ts` por
   queries (mesma assinatura de função, zero mudança nas páginas).
2. **Autenticação:** NextAuth (e-mail/senha + Google) para `/conta`.
3. **Pagamento real:** Pix/cartão via Stripe, Mercado Pago ou Pagar.me no `/checkout`.
4. **Multi-vendor de fato:** painel da loja parceira (cadastro de produto, pedidos, split de
   repasse), fila de aprovação de novas lojas.
5. **Busca e filtros avançados:** filtro por faixa de preço, tamanho e cor na listagem (hoje só
   categoria/loja/ordenação); Algolia ou Meilisearch se o catálogo crescer.
6. **SEO/performance:** sitemap dinâmico, dados estruturados (schema.org Product), analytics.

## 7. Débito técnico assumido conscientemente

- `tailwindcss@3` foi mantido (não migrado para v4) para não introduzir risco de regressão de
  estilo sem validação visual; `npm audit` aponta vulnerabilidades moderadas/altas nas
  dependências internas de watch de arquivos do Tailwind (braces/chokidar/micromatch) — afetam
  apenas o ambiente de desenvolvimento, não o bundle de produção.
- Autenticação, pagamento e persistência são mockados/placeholder nesta entrega — ver roadmap.
