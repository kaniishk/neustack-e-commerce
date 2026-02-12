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

router.post(
  '/preview',
  (req: Request<unknown, unknown, CheckoutBody>, res: Response) => {
    const { cartId, discountCode } = req.body;

    if (!cartId) {
      return res.status(400).json({ error: 'cartId is required' });
    }

    const cart = getCart(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orderItems: OrderLineItem[] = [];
    let subtotalCents = 0;

    for (const cartItem of cart.items) {
      const product = getProductById(cartItem.productId);
      if (!product) {
        return res
          .status(400)
          .json({ error: `Unknown productId: ${cartItem.productId}` });
      }

      const lineSubtotal = product.priceCents * cartItem.quantity;
      subtotalCents += lineSubtotal;

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
        return res.status(400).json({ error: validation.error });
      }

      const appliedCode = validation.code;
      const discount = computeDiscount(subtotalCents, appliedCode.percent);
      discountPercent = appliedCode.percent;
      discountAmountCents = discount.discountAmountCents;
      totalCents = discount.totalCents;
    }

    return res.json({
      items: orderItems,
      subtotalCents,
      discountCode: discountCode || undefined,
      discountPercent,
      discountAmountCents,
      totalCents,
    });
  },
);

router.post('/', (req: Request<unknown, unknown, CheckoutBody>, res: Response) => {
  const { cartId, discountCode } = req.body;

  if (!cartId) {
    return res.status(400).json({ error: 'cartId is required' });
  }

  const cart = getCart(cartId);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  if (cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const orderItems: OrderLineItem[] = [];
  let subtotalCents = 0;

  for (const cartItem of cart.items) {
    const product = getProductById(cartItem.productId);
    if (!product) {
      return res
        .status(400)
        .json({ error: `Unknown productId: ${cartItem.productId}` });
    }

    const lineSubtotal = product.priceCents * cartItem.quantity;
    subtotalCents += lineSubtotal;

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
      return res.status(400).json({ error: validation.error });
    }

    const appliedCode = validation.code;
    const discount = computeDiscount(subtotalCents, appliedCode.percent);
    discountPercent = appliedCode.percent;
    discountAmountCents = discount.discountAmountCents;
    totalCents = discount.totalCents;
  }

  const orderId = randomUUID();
  const createdAt = new Date();

  const baseOrder: OrderSummary = {
    id: orderId,
    items: orderItems,
    subtotalCents,
    discountAmountCents,
    totalCents,
    createdAt,
  };

  const order: OrderSummary =
    discountCode && discountPercent !== undefined
      ? { ...baseOrder, discountCode, discountPercent }
      : baseOrder;

  addOrder(order);

  if (discountCode && discountAmountCents > 0) {
    markDiscountCodeUsed(discountCode, orderId);
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

