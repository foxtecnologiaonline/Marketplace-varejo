// @vitest-environment node
//
// Só testa o caminho mock (sem Supabase configurado) — é o único verificável neste
// ambiente. O caminho com banco (RPC create_order_with_items) precisa ser validado
// contra um projeto Supabase real antes de ir para produção (ver supabase/migrations/
// 0002_catalog_and_stock.sql e o comentário em createOrderWithStockCheck).
import { describe, expect, it } from "vitest";
import { createOrderWithStockCheck, getProductByIdFromCatalog } from "./catalog";
import { products } from "./data";

describe("getProductByIdFromCatalog (modo mock)", () => {
  it("encontra um produto existente", async () => {
    const product = await getProductByIdFromCatalog("p1");
    expect(product?.name).toBe(products[0]!.name);
  });

  it("retorna null para produto inexistente", async () => {
    expect(await getProductByIdFromCatalog("nao-existe")).toBeNull();
  });
});

describe("createOrderWithStockCheck (modo mock)", () => {
  it("cria o pedido sem decrementar estoque (catálogo mock é estático)", async () => {
    const result = await createOrderWithStockCheck({
      customerName: "Maria Teste",
      customerEmail: "maria@example.com",
      shippingAddress: { name: "Maria Teste", cep: "01310-100", city: "São Paulo", street: "Rua X" },
      shippingCost: 19.9,
      subtotal: 69.9,
      total: 89.8,
      items: [{ productId: "p1", name: "Camiseta", size: "P", color: "Branco", quantity: 1, unitPrice: 69.9 }]
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.order.persisted).toBe(false);
      expect(result.order.id).toBeTruthy();
    }
  });
});
