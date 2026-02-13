import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { getCart, clearCart } from '../store/cartsStore';
import { getProductById } from '../store/productsStore';
import { addOrder } from '../store/ordersStore';
import {
  listDiscountCodes,
  markDiscountCodeUsed,
} from '../store/discountCodesStore';
import { computeDiscount, validateDiscountCode } from '../services/discountService';
import { OrderLineItem, OrderSummary } from '../models/order';

const router = Router();

interface CheckoutBody {
  cartId: string;
  discountCode?: string;
}

export interface OrderComputeResult {
  orderItems: OrderLineItem[];
  subtotalCents: number;
  discountCode?: string;
  discountPercent?: number;
  discountAmountCents: number;
  totalCents: number;
}

function computeOrderFromCart(
  cartId: string,
  discountCode?: string,
): { error: { status: number; body: { error: string } } } | { data: OrderComputeResult } {
  const cart = getCart(cartId);
  if (!cart) return { error: { status: 404, body: { error: 'Cart not found' } } };
  if (cart.items.length === 0) return { error: { status: 400, body: { error: 'Cart is empty' } } };

  const orderItems: OrderLineItem[] = [];
  let subtotalCents = 0;

  for (const cartItem of cart.items) {
    const product = getProductById(cartItem.productId);
    if (!product) {
      return {
        error: { status: 400, body: { error: `Unknown productId: ${cartItem.productId}` } },
      };
    }
    subtotalCents += product.priceCents * cartItem.quantity;
    orderItems.push({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      unitPriceCents: product.priceCents,
    });
  }

  let discountPercent: number | undefined;
  let discountAmountCents = 0;
  let totalCents = subtotalCents;

  if (discountCode) {
    const codes = listDiscountCodes();
    const validation = validateDiscountCode(discountCode, codes);
    if (validation.error || !validation.code) {
      return { error: { status: 400, body: { error: validation.error ?? 'Invalid code' } } };
    }
    const discount = computeDiscount(subtotalCents, validation.code.percent);
    discountPercent = validation.code.percent;
    discountAmountCents = discount.discountAmountCents;
    totalCents = discount.totalCents;
  }

  const data: OrderComputeResult = {
    orderItems,
    subtotalCents,
    discountAmountCents,
    totalCents,
  };
  if (discountCode !== undefined && discountCode !== '') data.discountCode = discountCode;
  if (discountPercent !== undefined) data.discountPercent = discountPercent;

  return { data };
}

router.post(
  '/preview',
  (req: Request<unknown, unknown, CheckoutBody>, res: Response) => {
    const { cartId, discountCode } = req.body;
    if (!cartId) {
      return res.status(400).json({ error: 'cartId is required' });
    }
    const result = computeOrderFromCart(cartId, discountCode);
    if ('error' in result) {
      return res.status(result.error.status).json(result.error.body);
    }
    const { data } = result;
    return res.json({
      items: data.orderItems,
      subtotalCents: data.subtotalCents,
      discountCode: data.discountCode,
      discountPercent: data.discountPercent,
      discountAmountCents: data.discountAmountCents,
      totalCents: data.totalCents,
    });
  },
);

router.post('/', (req: Request<unknown, unknown, CheckoutBody>, res: Response) => {
  const { cartId, discountCode } = req.body;
  if (!cartId) {
    return res.status(400).json({ error: 'cartId is required' });
  }
  const result = computeOrderFromCart(cartId, discountCode);
  if ('error' in result) {
    return res.status(result.error.status).json(result.error.body);
  }
  const { data } = result;

  const orderId = randomUUID();
  const createdAt = new Date();
  const baseOrder: OrderSummary = {
    id: orderId,
    items: data.orderItems,
    subtotalCents: data.subtotalCents,
    discountAmountCents: data.discountAmountCents,
    totalCents: data.totalCents,
    createdAt,
  };
  const order: OrderSummary =
    data.discountCode && data.discountPercent !== undefined
      ? { ...baseOrder, discountCode: data.discountCode, discountPercent: data.discountPercent }
      : baseOrder;

  addOrder(order);
  if (data.discountCode && data.discountAmountCents > 0) {
    markDiscountCodeUsed(data.discountCode, orderId);
  }
  clearCart(cartId);

  return res.status(201).json({
    orderId: order.id,
    items: order.items,
    subtotalCents: order.subtotalCents,
    discountCode: order.discountCode,
    discountPercent: order.discountPercent,
    discountAmountCents: order.discountAmountCents,
    totalCents: order.totalCents,
    createdAt: order.createdAt,
  });
});

export default router;

