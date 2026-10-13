import type { Category, Color, Product, Store } from "./types";

// Camada de dados mock. Em produção, estas funções passam a consultar
// o banco (Prisma/Supabase) mantendo a mesma assinatura, sem tocar nas páginas.

export const stores: Store[] = [
  {
    slug: "colegio-marista",
    name: "Colégio Marista",
    logo: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=200&auto=format&fit=crop",
    description: "Uniformes oficiais do Infantil ao Médio"
  },
  {
    slug: "colegio-positivo",
    name: "Colégio Positivo",
    logo: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=200&auto=format&fit=crop",
    description: "Linha completa de uniforme e educação física"
  },
  {
    slug: "vila-olimpia",
    name: "Vila Olímpia",
    logo: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=200&auto=format&fit=crop",
    description: "Uniformes esportivos e escolares"
  },
  {
    slug: "uniformes-personalizados",
    name: "Personalizados",
    logo: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=200&auto=format&fit=crop",
    description: "Coletes, bandeirões e kits sob encomenda"
  }
];

export const categories: Category[] = [
  {
    slug: "camisetas",
    name: "Camisetas",
    image: "https://images.unsplash.com/photo-1720514496333-2c552e9ee5f2?q=80&w=600&auto=format&fit=crop"
  },
  {
    slug: "calcas",
    name: "Calças",
    image: "https://images.unsplash.com/photo-1789110520164-2389992e5d0f?q=80&w=600&auto=format&fit=crop"
  },
  {
    slug: "bermudas",
    name: "Bermudas",
    image: "https://images.unsplash.com/photo-1789110520350-db58d2271c63?q=80&w=600&auto=format&fit=crop"
  },
  {
    slug: "agasalhos",
    name: "Agasalhos",
    image: "https://images.unsplash.com/photo-1780396508935-94e234affc92?q=80&w=600&auto=format&fit=crop"
  },
  {
    slug: "kit-maternidade",
    name: "Kit Maternidade",
    image: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=600&auto=format&fit=crop"
  }
];

const sizes = ["2", "4", "6", "8", "10", "12", "14", "P", "M", "G", "GG"];

// Antes, todo produto usava as duas mesmas fotos genéricas (só um parâmetro
// "sig" no fim da URL mudava, e o Unsplash ignora esse parâmetro — não é um
// identificador de imagem real, então as 8 camisetas/calças/bermudas etc.
// todas mostravam exatamente a mesma foto). Agora cada produto recebe duas
// fotos de verdade, escolhidas para bater com o item (camiseta polo pra
// camiseta, moletom pra calça de moletom, etc.) — ver "images" em cada
// chamada de makeProduct abaixo.
function makeProduct(
  partial: Omit<Product, "sizes" | "colors" | "highlights" | "tags" | "rating" | "reviewsCount"> & {
    images: [string, string];
  }
): Product {
  return {
    ...partial,
    sizes: sizes.slice(0, 6),
    colors: [
      { name: "Azul Marinho", hex: "#1b3670" },
      { name: "Branco", hex: "#ffffff" },
      { name: "Cinza", hex: "#9ca3af" }
    ],
    highlights: ["Tecido antipilling", "Reforço nas costuras", "Secagem rápida"],
    tags: ["escolar", "uniforme"],
    rating: 4.6,
    reviewsCount: 38
  };
}

export const products: Product[] = [
  makeProduct({
    id: "p1",
    slug: "camiseta-manga-curta-marista",
    name: "Camiseta Manga Curta Marista",
    storeSlug: "colegio-marista",
    categorySlug: "camisetas",
    images: [
      "https://images.unsplash.com/photo-1720514496333-2c552e9ee5f2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1720514496505-d6756368b0b3?q=80&w=800&auto=format&fit=crop"
    ],
    price: 69.9,
    compareAtPrice: 84.9,
    installments: { count: 3, value: 23.3, interestFree: true },
    description: "Camiseta oficial em malha fria, com logotipo bordado e gola careca reforçada.",
    stock: 42,
    freeShipping: true
  }),
  makeProduct({
    id: "p2",
    slug: "calca-moletom-positivo",
    name: "Calça Moletom Positivo",
    storeSlug: "colegio-positivo",
    categorySlug: "calcas",
    images: [
      "https://images.unsplash.com/photo-1789110520164-2389992e5d0f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1789110853719-2920fe512117?q=80&w=800&auto=format&fit=crop"
    ],
    price: 99.9,
    installments: { count: 4, value: 24.98, interestFree: true },
    description: "Calça de moletom flanelado com punho e cordão de ajuste na cintura.",
    stock: 25,
    freeShipping: true
  }),
  makeProduct({
    id: "p3",
    slug: "bermuda-esportiva-vila-olimpia",
    name: "Bermuda Esportiva Vila Olímpia",
    storeSlug: "vila-olimpia",
    categorySlug: "bermudas",
    images: [
      "https://images.unsplash.com/photo-1789110520350-db58d2271c63?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1789110853613-4ace8d4041e3?q=80&w=800&auto=format&fit=crop"
    ],
    price: 59.9,
    installments: { count: 2, value: 29.95, interestFree: true },
    description: "Bermuda em tactel com elástico e bolso lateral, ideal para educação física.",
    stock: 60,
    freeShipping: false
  }),
  makeProduct({
    id: "p4",
    slug: "agasalho-conjunto-marista",
    name: "Conjunto Agasalho Marista",
    storeSlug: "colegio-marista",
    categorySlug: "agasalhos",
    images: [
      "https://images.unsplash.com/photo-1780396508935-94e234affc92?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1592741159459-5f0549acad47?q=80&w=800&auto=format&fit=crop"
    ],
    price: 148.9,
    compareAtPrice: 169.9,
    installments: { count: 6, value: 24.82, interestFree: true },
    description: "Conjunto blusão e calça em moletom com forro, gola alta e zíper frontal.",
    stock: 18,
    freeShipping: true
  }),
  makeProduct({
    id: "p5",
    slug: "colete-personalizado-time",
    name: "Colete Personalizado para Time",
    storeSlug: "uniformes-personalizados",
    categorySlug: "camisetas",
    images: [
      "https://images.unsplash.com/photo-1693683224122-0a8e206f248d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1720514496194-6544164b4043?q=80&w=800&auto=format&fit=crop"
    ],
    price: 45.9,
    installments: { count: 2, value: 22.95, interestFree: true },
    description: "Colete esportivo em dry-fit, personalização de número e nome sob consulta.",
    stock: 100,
    freeShipping: false
  }),
  makeProduct({
    id: "p6",
    slug: "body-kit-maternidade",
    name: "Kit Body Maternidade (3 peças)",
    storeSlug: "uniformes-personalizados",
    categorySlug: "kit-maternidade",
    images: [
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1627859846191-39012f247980?q=80&w=800&auto=format&fit=crop"
    ],
    price: 89.9,
    installments: { count: 3, value: 29.97, interestFree: true },
    description: "Kit com 3 bodies em algodão egípcio, gola de abertura total e etiqueta sem costura.",
    stock: 30,
    freeShipping: true
  }),
  makeProduct({
    id: "p7",
    slug: "camiseta-manga-longa-positivo",
    name: "Camiseta Manga Longa Positivo",
    storeSlug: "colegio-positivo",
    categorySlug: "camisetas",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691551-44de113f0164?q=80&w=800&auto=format&fit=crop"
    ],
    price: 74.9,
    installments: { count: 3, value: 24.97, interestFree: true },
    description: "Camiseta manga longa em malha peletizada, ideal para o inverno.",
    stock: 33,
    freeShipping: true
  }),
  makeProduct({
    id: "p8",
    slug: "calca-sarja-vila-olimpia",
    name: "Calça Sarja Vila Olímpia",
    storeSlug: "vila-olimpia",
    categorySlug: "calcas",
    images: [
      "https://images.unsplash.com/photo-1626354796188-5e5e293fe168?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1694447814836-c93ab70f7398?q=80&w=800&auto=format&fit=crop"
    ],
    price: 109.9,
    installments: { count: 4, value: 27.48, interestFree: true },
    description: "Calça em sarja com elastano, cintura ajustável e bolsos reforçados.",
    stock: 20,
    freeShipping: false
  })
];

export function getStoreBySlug(slug: string): Store | undefined {
  return stores.find((s) => s.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(limit = 8): Product[] {
  return products.slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && (p.categorySlug === product.categorySlug || p.storeSlug === product.storeSlug))
    .slice(0, limit);
}

export interface ProductFilters {
  category?: string;
  store?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  sort?: "relevance" | "price-asc" | "price-desc";
}

export function searchProducts(filters: ProductFilters): Product[] {
  let result = [...products];

  if (filters.category) {
    result = result.filter((p) => p.categorySlug === filters.category);
  }
  if (filters.store) {
    result = result.filter((p) => p.storeSlug === filters.store);
  }
  if (filters.size) {
    result = result.filter((p) => p.sizes.includes(filters.size!));
  }
  if (filters.color) {
    result = result.filter((p) => p.colors.some((c) => c.name === filters.color));
  }
  if (typeof filters.minPrice === "number") {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (typeof filters.maxPrice === "number") {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters.sort === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sort === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
}

export function getAvailableSizes(): string[] {
  const all = new Set<string>();
  for (const p of products) for (const s of p.sizes) all.add(s);
  return Array.from(all);
}

export function getAvailableColors(): Color[] {
  const seen = new Map<string, Color>();
  for (const p of products) for (const c of p.colors) seen.set(c.name, c);
  return Array.from(seen.values());
}
