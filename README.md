# Marketplace Varejo

Marketplace de uniformes escolares, esportivos e personalizados, inspirado nos fluxos e no
layout de lojas como [ddamalharia.com.br](https://ddamalharia.com.br/) e
[taconfeccoes.com.br](https://www.taconfeccoes.com.br/). O escopo completo (benchmarking,
decisões de arquitetura e roadmap) está em [`docs/ESCOPO.md`](./docs/ESCOPO.md). O escopo da
próxima fase (LP com checkout, upload automático de fotos e ERP) está em
[`docs/ESCOPO-FASE2.md`](./docs/ESCOPO-FASE2.md).

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Zustand (estado do carrinho, persistido em `localStorage`)
- `src/lib/data.ts` como camada de dados mock, pronta para ser substituída por Prisma/Supabase

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — serve o build de produção
- `npm run typecheck` — checagem de tipos
- `npm run lint` — ESLint (flat config; o `next lint` foi removido no Next 16)
- `npm test` — testes unitários (Vitest)
- `npm run test:e2e` — testes de ponta a ponta (Playwright, sobe o build de produção)
- `npm run package` — compila e gera `dist/marketplace-varejo-build.tar.gz` (servidor
  standalone pronto para rodar com `node server.js`, sem `npm install`) e
  `dist/marketplace-varejo-source.tar.gz` (código-fonte), com `SHA256SUMS`

## Estrutura

```
src/
  app/            rotas (App Router)
  components/     componentes de UI reutilizáveis
  lib/            tipos, dados mock, formatação, store do carrinho
docs/ESCOPO.md    escopo detalhado do produto
```
