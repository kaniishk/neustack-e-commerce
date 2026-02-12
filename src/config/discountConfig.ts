import { DiscountConfig } from '../services/discountService';

// Simple in-memory configuration for the discount system.
// Every `n`th completed order unlocks a new discount code worth `xPercent` off.
export const discountConfig: DiscountConfig = {
  n: 5,
  xPercent: 10,
};

