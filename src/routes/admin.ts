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

  const rawPercent = req.body?.percent as number | undefined;
  let overridePercent: number | undefined;
  if (rawPercent !== undefined) {
    const p = Number(rawPercent);
    if (Number.isNaN(p) || p < 5 || p > 75 || p % 5 !== 0) {
      return res
        .status(400)
        .json({ error: 'percent must be between 5 and 75 in multiples of 5 (e.g. 5, 10, 15)' });
    }
    overridePercent = Math.floor(p);
  }

  const { code, error } = generateDiscountCodeIfEligible(
    orders.length,
    codes,
    discountConfig,
    overridePercent,
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

router.get('/discounts', (_req: Request, res: Response) => {
  const codes = listDiscountCodes();
  return res.json(
    codes.map((c) => ({
      code: c.code,
      percent: c.percent,
      used: c.used,
      usedByOrderId: c.usedByOrderId ?? null,
      createdAt: c.createdAt,
    })),
  );
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
    orderCount: orders.length,
    itemsPurchased,
    revenueCents,
    discountCodesIssued,
    discountCodesUsed,
    totalDiscountsGivenCents,
    orders,
  });
});

export default router;

