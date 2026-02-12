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
  config: DiscountConfig,
  overridePercent?: number,
): { code?: DiscountCode; error?: string } {
  const codesGenerated = existingCodes.length;

  if (!canGenerateDiscountCode(totalOrdersCompleted, codesGenerated, config.n)) {
    return { error: 'Not eligible to generate discount code yet' };
  }

  const percent = overridePercent ?? config.xPercent;

  const code: DiscountCode = {
    code: generateFriendlyCode(existingCodes),
    percent,
    used: false,
    createdAt: new Date(),
  };

  return { code };
}

function generateFriendlyCode(existingCodes: DiscountCode[]): string {
  // Omit easily confusable characters
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
  const existing = new Set(existingCodes.map((c) => c.code));

  // Keep it short but reasonably unique
  // e.g. 8 characters, like "K9F7X2PQ"
  let attempt = '';
  do {
    let value = '';
    for (let i = 0; i < 8; i += 1) {
      const index = Math.floor(Math.random() * alphabet.length);
      value += alphabet[index];
    }
    attempt = value;
  } while (existing.has(attempt));

  return attempt;
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

