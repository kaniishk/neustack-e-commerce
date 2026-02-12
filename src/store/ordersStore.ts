import { OrderSummary } from '../models/order';

const orders: OrderSummary[] = [];

export function addOrder(order: OrderSummary): void {
  orders.push(order);
}

export function listOrders(): OrderSummary[] {
  return orders;
}

export function totalOrdersCompleted(): number {
  return orders.length;
}

