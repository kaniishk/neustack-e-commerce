import { randomUUID } from 'crypto';
import { Cart, CartItem } from '../models/cart';

const carts = new Map<string, Cart>();

export function createCart(initialItems: CartItem[]): Cart {
  const id = randomUUID();
  const cart: Cart = {
    id,
    items: normalizeItems(initialItems),
  };
  carts.set(id, cart);
  return cart;
}

export function getCart(cartId: string): Cart | undefined {
  return carts.get(cartId);
}

/**
 * Create a new cart if cartId is undefined, or merge the provided items into
 * an existing cart if it exists. If a non-existing cartId is provided, a new
 * cart with that id is created.
 */
export function upsertCart(cartId: string | undefined, itemsToAdd: CartItem[]): Cart {
  if (!cartId) {
    return createCart(itemsToAdd);
  }

  const existing = carts.get(cartId);
  if (!existing) {
    const newCart: Cart = {
      id: cartId,
      items: normalizeItems(itemsToAdd),
    };
    carts.set(cartId, newCart);
    return newCart;
  }

  const mergedItems = mergeItems(existing.items, itemsToAdd);
  const updated: Cart = { ...existing, items: mergedItems };
  carts.set(cartId, updated);
  return updated;
}

function normalizeItems(items: CartItem[]): CartItem[] {
  return mergeItems([], items);
}

function mergeItems(base: CartItem[], additions: CartItem[]): CartItem[] {
  const quantities = new Map<string, number>();

  for (const item of base) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  for (const item of additions) {
    if (item.quantity <= 0) continue;
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(quantities.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

