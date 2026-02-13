import { DiscountConfig } from '../services/discountService';

// Every nth completed order unlocks a new discount code. Configurable via env.
const envN = process.env.DISCOUNT_NTH_ORDER;
const n = (envN !== undefined && !Number.isNaN(Number(envN)) && Number(envN) >= 1)
  ? Math.floor(Number(envN))
  : 5;

// Simple in-memory configuration for the discount system.
// Default xPercent; when generating, override percent is limited to 5–75 in steps of 5.
export const discountConfig: DiscountConfig = {
  n,
  xPercent: 10,
};

