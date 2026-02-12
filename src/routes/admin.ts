import { Router, Request, Response } from 'express';
import { listOrders } from '../store/ordersStore';
import {
  addDiscountCode,
  listDiscountCodes,
} from '../store/discountCodesStore';
import { discountConfig } from '../config/discountConfig';
import { generateDiscountCodeIfEligible } from '../services/discountService';

const router = Router();

router.post('/discounts/generate', (req: Request, res: Response) => {
  const orders = listOrders();
  const codes = listDiscountCodes();

  const { code, error } = generateDiscountCodeIfEligible(
    orders.length,
    codes,
    discountConfig,
  );

  if (error || !code) {
    return res.status(400).json({ error });
  }

  addDiscountCode(code);
  return res.status(201).json({
    code: code.code,
    percent: code.percent,
    createdAt: code.createdAt,
  });
});

router.get('/stats', (_req: Request, res: Response) => {
  const orders = listOrders();
  const codes = listDiscountCodes();

  let itemsPurchased = 0;
  let revenueCents = 0;
  let totalDiscountsGivenCents = 0;

  for (const order of orders) {
    revenueCents += order.totalCents;
    totalDiscountsGivenCents += order.discountAmountCents;
    for (const item of order.items) {
      itemsPurchased += item.quantity;
    }
  }

  const discountCodesIssued = codes.length;
  const discountCodesUsed = codes.filter((c) => c.used).length;

  return res.json({
    itemsPurchased,
    revenueCents,
    discountCodesIssued,
    discountCodesUsed,
    totalDiscountsGivenCents,
  });
});

export default router;

