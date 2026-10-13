export interface Color {
  name: string;
  hex: string;
}

export interface Store {
  slug: string;
  name: string;
  // Sem logo de verdade cadastrado, a UI mostra um monograma (ver StoreLogo)
  // em vez de uma foto aleatória fingindo ser logo.
  logo?: string;
  description: string;
}

export interface Category {
  slug: string;
  name: string;
  image: string;
}

export interface Installments {
  count: number;
  value: number;
  interestFree: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  storeSlug: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  installments: Installments;
  images: string[];
  sizes: string[];
  colors: Color[];
  description: string;
  highlights: string[];
  stock: number;
  freeShipping: boolean;
  tags: string[];
  rating: number;
  reviewsCount: number;
}

export interface CartItem {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}
