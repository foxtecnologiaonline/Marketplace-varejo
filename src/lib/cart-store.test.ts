import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore, cartTotals } from "./cart-store";
import { MAX_ITEM_QUANTITY } from "./config";
import { products } from "./data";

beforeEach(() => {
  useCartStore.setState({ items: [] });
  localStorage.clear();
});

describe("useCartStore", () => {
  it("adiciona um item novo", () => {
    useCartStore.getState().addItem("p1", "P", "Branco", 2);
    expect(useCartStore.getState().items).toEqual([
      { productId: "p1", size: "P", color: "Branco", quantity: 2 }
    ]);
  });

  it("soma quantidade ao adicionar a mesma combinação tamanho/cor", () => {
    const { addItem } = useCartStore.getState();
    addItem("p1", "P", "Branco", 2);
    addItem("p1", "P", "Branco", 3);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.quantity).toBe(5);
  });

  it("trata tamanho/cor diferentes como linhas separadas do carrinho", () => {
    const { addItem } = useCartStore.getState();
    addItem("p1", "P", "Branco", 1);
    addItem("p1", "M", "Branco", 1);
    addItem("p1", "P", "Azul Marinho", 1);
    expect(useCartStore.getState().items).toHaveLength(3);
  });

  it("nunca deixa a quantidade passar do teto, mesmo somando", () => {
    const { addItem } = useCartStore.getState();
    addItem("p1", "P", "Branco", 15);
    addItem("p1", "P", "Branco", 15);
    expect(useCartStore.getState().items[0]?.quantity).toBe(MAX_ITEM_QUANTITY);
  });

  it("updateQuantity trava entre 1 e o teto", () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem("p1", "P", "Branco", 1);
    updateQuantity("p1", "P", "Branco", 0);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);
    updateQuantity("p1", "P", "Branco", 999);
    expect(useCartStore.getState().items[0]?.quantity).toBe(MAX_ITEM_QUANTITY);
  });

  it("removeItem remove só a linha certa", () => {
    const { addItem, removeItem } = useCartStore.getState();
    addItem("p1", "P", "Branco", 1);
    addItem("p1", "M", "Branco", 1);
    removeItem("p1", "P", "Branco");
    expect(useCartStore.getState().items).toEqual([
      { productId: "p1", size: "M", color: "Branco", quantity: 1 }
    ]);
  });

  it("clear esvazia o carrinho", () => {
    useCartStore.getState().addItem("p1", "P", "Branco", 1);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });
});

describe("cartTotals", () => {
  it("soma subtotal e quantidade a partir do catálogo", () => {
    const product = products[0]!;
    const totals = cartTotals([{ productId: product.id, size: "P", color: "Branco", quantity: 3 }]);
    expect(totals.count).toBe(3);
    expect(totals.subtotal).toBeCloseTo(product.price * 3, 2);
  });

  it("ignora itens de produto que não existe mais no catálogo", () => {
    const totals = cartTotals([{ productId: "nao-existe", size: "P", color: "Branco", quantity: 5 }]);
    expect(totals).toEqual({ subtotal: 0, count: 0 });
  });

  it("carrinho vazio soma zero", () => {
    expect(cartTotals([])).toEqual({ subtotal: 0, count: 0 });
  });
});
