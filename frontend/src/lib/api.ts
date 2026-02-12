const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : undefined;

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data as any).error
        : res.statusText) || 'Request failed';
    throw new Error(message);
  }

  return data as T;
}

export type Product = {
  id: string;
  name: string;
  priceCents: number;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
};

export type OrderItem = {
  productId: string;
  quantity: number;
  unitPriceCents: number;
};

export type OrderResponse = {
  orderId: string;
  items: OrderItem[];
  subtotalCents: number;
  discountCode?: string;
  discountPercent?: number;
  discountAmountCents: number;
  totalCents: number;
  createdAt: string;
};

export type StatsResponse = {
  orderCount: number;
  itemsPurchased: number;
  revenueCents: number;
  discountCodesIssued: number;
  discountCodesUsed: number;
  totalDiscountsGivenCents: number;
  orders: {
    id: string;
    subtotalCents: number;
    discountCode?: string;
    discountPercent?: number;
    discountAmountCents: number;
    totalCents: number;
    createdAt: string;
  }[];
};

export function getProducts() {
  return request<Product[]>('/products');
}

export function createOrUpdateCart(payload: {
  cartId?: string;
  items: CartItem[];
}) {
  return request<Cart>('/cart', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCart(cartId: string) {
  return request<Cart>(`/cart/${cartId}`);
}

export function checkout(payload: { cartId: string; discountCode?: string }) {
  return request<OrderResponse>('/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function generateDiscount(percent?: number) {
  const body = percent ? { percent } : {};
  return request<{ code: string; percent: number; createdAt: string }>(
    '/admin/discounts/generate',
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export function getStats() {
  return request<StatsResponse>('/admin/stats');
}

export type DiscountSummary = {
  code: string;
  percent: number;
  used: boolean;
  usedByOrderId: string | null;
  createdAt: string;
};

export function getDiscounts() {
  return request<DiscountSummary[]>('/admin/discounts');
}

export type CheckoutPreviewResponse = {
  items: OrderItem[];
  subtotalCents: number;
  discountCode?: string;
  discountPercent?: number;
  discountAmountCents: number;
  totalCents: number;
};

export function previewCheckout(payload: {
  cartId: string;
  discountCode?: string;
}) {
  return request<CheckoutPreviewResponse>('/checkout/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

