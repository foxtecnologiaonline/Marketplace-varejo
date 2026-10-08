# Escopo — Fase 2: LP + Checkout, Upload Automático de Fotos, ERP

Complementa [`ESCOPO.md`](./ESCOPO.md). Três entregas tratadas separadamente porque têm
donos, prazos e riscos diferentes — mas a ordem de execução importa (ver §4).

## Sequenciamento recomendado

```
1. MVP LP + checkout  →  gera pedidos reais e caixa
2. Upload automático de fotos  →  desbloqueia catálogo sem depender de dev
3. ERP · Entrada de pedidos  →  reaproveita os pedidos gerados em (1)
4. ERP · Saída para produção
5. ERP · Conciliação financeira  →  reaproveita pagamentos gerados em (1)
```

Rodar em paralelo (1) e (2) é seguro — são independentes. O ERP depende dos dados que (1)
passa a gerar, por isso vem depois.

---

## 1. MVP da LP com produtos e checkout

### Objetivo
Loja única (não o marketplace multi-vendor completo), com catálogo real e checkout funcional,
para validar venda online o mais rápido possível.

### Dentro do escopo
- Reaproveita os componentes já existentes no scaffold (`ProductCard`, `ProductVariantSelector`,
  `Header`/`Footer`) — não é um projeto novo, é a loja atual com persistência e pagamento reais.
- Catálogo em banco (Postgres/Supabase), substituindo `src/lib/data.ts` mock pelas queries —
  esse ponto de troca já foi desenhado para isso (mesma assinatura de função).
- Checkout com pagamento real: **Pix + cartão via Mercado Pago Checkout Pro** (cobre Pix nativo,
  evita lidar com PCI compliance na mão).
- Frete: tabela fixa por faixa de CEP no MVP (sem integração de transportadora ainda).
- E-mail transacional de confirmação de pedido (Resend).
- Pedido persistido com status (`novo` → `pago` → ...) — já no formato que o ERP vai consumir.

### Fora do escopo (adiar)
- Multi-vendor, cupons avançados, busca com relevância, avaliações de produto, recomendação.
- Emissão de Nota Fiscal (entra no ERP/financeiro — ver riscos no §5).

### Critério de pronto
Cliente navega → adiciona ao carrinho → paga via Pix/cartão → recebe e-mail de confirmação →
pedido fica registrado no banco com status `pago`, pronto para o ERP consumir.

### Esforço estimado
**M** — 2 a 3 semanas, 1 dev full-stack.

---

## 2. Mecanismo de inserção de fotos e alocação automática

### Problema
Hoje, colocar fotos de produto no site é manual (editar código por item). Precisamos de um
fluxo em que alguém sobe fotos em lote e o sistema aloca cada imagem ao produto certo, sem
intervenção de dev.

### Abordagem recomendada (MVP simples e barato)
1. **Convenção de nome de arquivo:** `SKU_01.jpg`, `SKU_02.jpg` (ex.: `CAM-MAR-001_01.jpg`).
2. **Tela de upload** no painel admin (drag-and-drop múltiplo, só isso — sem formulário por foto).
3. **Função server-side** ao receber o lote:
   - extrai o SKU do nome do arquivo;
   - valida contra a tabela de produtos;
   - envia para storage (Supabase Storage/S3);
   - gera variantes (thumbnail, zoom, WebP/AVIF) via `sharp`;
   - grava as URLs em `Product.images[]`, ordenadas pelo sufixo numérico do nome do arquivo.
4. **Fila de pendências:** arquivo sem SKU correspondente não falha silenciosamente — cai numa
   lista "não alocado" para alguém resolver manualmente (selecionar o produto certo num dropdown).

### Por que não começar direto com IA de visão
90% do caso real é "a loja manda a foto do produto X" — resolvido por convenção de nome mais um
fallback manual, sem custo de API nem risco de classificação errada. IA de visão (Claude com
visão, por exemplo) é um reforço útil quando o nome do arquivo não traz o SKU, mas deve **sugerir**
categoria/cor para confirmação humana, nunca publicar sozinha — por isso fica para a v2, como
enriquecimento opcional, não como caminho crítico.

### Esforço estimado
**S–M** — 1 a 2 semanas.

---

## 3. ERP de gestão

### 3.1 Entrada de pedidos
- Unifica pedidos do checkout (automáticos, vindos de §1) com pedidos manuais/institucionais
  (lançados por um operador a partir de WhatsApp/cotação).
- Fila de pedidos com status: `Novo → Confirmado → Em produção → Produzido → Expedido →
  Entregue → Cancelado`.
- Visão em lista ou Kanban, filtrável por status/loja/data.

### 3.2 Saída para produção
- Ao confirmar um pedido, gera uma **Ordem de Produção (OP)** por item: SKU, tamanho, cor,
  personalização (nome/número), quantidade.
- Ficha de produção exportável (PDF/planilha) por lote do dia, para entregar à costura/fábrica.
- Atualizar o status da OP (iniciada/concluída) reflete automaticamente no status do pedido.

### 3.3 Conciliação financeira
- Lançamento automático de "a receber" na criação do pedido.
- Webhook do gateway (Mercado Pago) marca o pedido como `pago` e grava o valor líquido
  (descontada a taxa do gateway).
- Tela de conciliação: compara pedidos pagos no gateway × pedidos no sistema × repasse
  esperado, sinalizando divergências.
- Exportação para contábil (CSV) compatível com import em ERP financeiro externo (Conta Azul,
  Omie) — evita construir um módulo contábil completo agora.

### Fora do escopo do ERP nesta fase
Estoque de matéria-prima, PCP avançado (sequenciamento de máquinas/linhas), folha de pagamento,
módulo contábil completo (DRE, balanço).

### Modelo de dados adicional
```
Order            { id, origin(site|manual|institucional), storeSlug, status,
                    items[], total, paymentStatus, createdAt }
OrderItem        { orderId, productId, sku, size, color, customization, quantity }
ProductionOrder  { id, orderId, status(pending|in_progress|done), items[], dueDate }
Payment          { orderId, gateway, grossAmount, feeAmount, netAmount, status, paidAt }
```

### Esforço estimado
**L** — 4 a 6 semanas, entregue de forma incremental: entrada de pedidos primeiro (3.1), depois
produção (3.2), depois financeiro (3.3) — cada etapa já é utilizável isoladamente.

---

## 4. Resumo de priorização

| # | Entrega | Esforço | Depende de |
|---|---|---|---|
| 1 | MVP LP + checkout | M (2-3 sem) | — |
| 2 | Upload automático de fotos | S-M (1-2 sem) | — (paralelo ao item 1) |
| 3 | ERP · Entrada de pedidos | M (2 sem) | Item 1 |
| 4 | ERP · Produção | M (2 sem) | Item 3 |
| 5 | ERP · Conciliação financeira | M (2 sem) | Itens 1 e 3 |

## 5. Riscos e decisões que precisam de confirmação do time

- **Gateway de pagamento:** recomendo Mercado Pago (Pix nativo, boa cobertura BR) em vez de
  Stripe/Pagar.me — confirmar se já existe conta/preferência da empresa.
- **Nota Fiscal:** emissão de NF-e é obrigatória para venda no Brasil e não está nesta fase —
  precisa de serviço dedicado (NFE.io, Focus NFe) e definição de quem integra.
- **ERP financeiro externo:** se a empresa já usa um (Conta Azul, Omie, etc.), a conciliação
  deve exportar no formato que ele aceita, em vez de duplicar funcionalidade contábil.
- **Volume esperado de fotos/produtos:** se for alto (>500 SKUs/mês), vale revisitar a
  classificação por IA de visão antes do que o roadmap sugere.
