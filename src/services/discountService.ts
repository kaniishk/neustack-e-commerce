import { randomUUID } from 'crypto';
import type { DiscountCode } from '../models/discount';

export interface DiscountConfig {
  n: number; // every nth order
  xPercent: number; // discount percentage
}

export function canGenerateDiscountCode(
  totalOrdersCompleted: number,
  codesGenerated: number,
  n: number
): boolean {
  if (n <= 0) return false;
  return codesGenerated < Math.floor(totalOrdersCompleted / n);
}

export function generateDiscountCodeIfEligible(
  totalOrdersCompleted: number,
  existingCodes: DiscountCode[],
  config: DiscountConfig
): { code?: DiscountCode; error?: string } {
  const codesGenerated = existingCodes.length;

  if (!canGenerateDiscountCode(totalOrdersCompleted, codesGenerated, config.n)) {
    return { error: 'Not eligible to generate discount code yet' };
  }

  const code: DiscountCode = {
    code: randomUUID(),
    percent: config.xPercent,
    used: false,
    createdAt: new Date(),
  };

  return { code };
}

export function validateDiscountCode(
  codeValue: string,
  codes: DiscountCode[]
): { code?: DiscountCode; error?: string } {
  const found = codes.find((c) => c.code === codeValue);
  if (!found) {
    return { error: 'Discount code not found' };
  }
  if (found.used) {
    return { error: 'Discount code has already been used' };
  }
  return { code: found };
}

export function computeDiscount(
  subtotalCents: number,
  percent: number
): { discountAmountCents: number; totalCents: number } {
  if (subtotalCents <= 0 || percent <= 0) {
    return { discountAmountCents: 0, totalCents: subtotalCents };
  }

  const discountAmountCents = Math.floor((subtotalCents * percent) / 100);
  const totalCents = subtotalCents - discountAmountCents;
  return { discountAmountCents, totalCents };
}

