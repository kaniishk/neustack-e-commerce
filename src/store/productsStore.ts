import { Product } from '../models/product';

// Simple in-memory product catalog. In a real system this would live in a database.
const products: Product[] = [
  { id: 'p1', name: 'T-Shirt', priceCents: 1999 },
  { id: 'p2', name: 'Jeans', priceCents: 4999 },
  { id: 'p3', name: 'Sneakers', priceCents: 7999 },
  { id: 'p4', name: 'Socks (Pack)', priceCents: 999 },
];

export function listProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

