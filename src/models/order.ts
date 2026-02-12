import type { OrderId } from './discount';

export interface OrderLineItem {
  productId: string;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderSummary {
  id: OrderId;
  items: OrderLineItem[];
  subtotalCents: number;
  discountCode?: string;
  discountPercent?: number;
  discountAmountCents: number;
  totalCents: number;
  createdAt: Date;
}

