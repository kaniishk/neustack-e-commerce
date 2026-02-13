import {
  canGenerateDiscountCode,
  computeDiscount,
  generateDiscountCodeIfEligible,
  validateDiscountCode,
  type DiscountConfig,
} from '../../src/services/discountService';
import type { DiscountCode } from '../../src/models/discount';

describe('canGenerateDiscountCode', () => {
  it('returns false when n <= 0', () => {
    expect(canGenerateDiscountCode(10, 0, 0)).toBe(false);
    expect(canGenerateDiscountCode(10, 0, -1)).toBe(false);
  });

  it('returns false when no new code is allowed yet', () => {
    expect(canGenerateDiscountCode(0, 0, 5)).toBe(false); // 0 orders -> 0 slots
    expect(canGenerateDiscountCode(4, 0, 5)).toBe(false); // 4 orders -> 0 slots
    expect(canGenerateDiscountCode(5, 1, 5)).toBe(false); // 1 code already for 5 orders
    expect(canGenerateDiscountCode(9, 1, 5)).toBe(false);
  });

  it('returns true when a new code is allowed', () => {
    expect(canGenerateDiscountCode(5, 0, 5)).toBe(true); // 5 orders, 0 codes -> 1 slot
    expect(canGenerateDiscountCode(10, 1, 5)).toBe(true); // 10 orders, 1 code -> 2 slots
    expect(canGenerateDiscountCode(15, 2, 5)).toBe(true);
  });
});

describe('validateDiscountCode', () => {
  const unusedCode: DiscountCode = {
    code: 'ABC12345',
    percent: 10,
    used: false,
    createdAt: new Date(),
  };
  const usedCode: DiscountCode = {
    ...unusedCode,
    code: 'USED9999',
    used: true,
    usedByOrderId: 'ord-1',
  };

  it('returns error when code not found', () => {
    const result = validateDiscountCode('MISSING', [unusedCode]);
    expect(result.error).toBe('Discount code not found');
    expect(result.code).toBeUndefined();
  });

  it('returns error when code already used', () => {
    const result = validateDiscountCode('USED9999', [unusedCode, usedCode]);
    expect(result.error).toBe('Discount code has already been used');
    expect(result.code).toBeUndefined();
  });

  it('returns code when valid and unused', () => {
    const result = validateDiscountCode('ABC12345', [unusedCode, usedCode]);
    expect(result.error).toBeUndefined();
    expect(result.code).toEqual(unusedCode);
  });
});

describe('computeDiscount', () => {
  it('returns no discount when subtotal <= 0 or percent <= 0', () => {
    expect(computeDiscount(0, 10)).toEqual({ discountAmountCents: 0, totalCents: 0 });
    expect(computeDiscount(-100, 10)).toEqual({ discountAmountCents: 0, totalCents: -100 });
    expect(computeDiscount(1000, 0)).toEqual({ discountAmountCents: 0, totalCents: 1000 });
  });

  it('computes discount and total correctly', () => {
    expect(computeDiscount(1000, 10)).toEqual({
      discountAmountCents: 100,
      totalCents: 900,
    });
    expect(computeDiscount(5000, 20)).toEqual({
      discountAmountCents: 1000,
      totalCents: 4000,
    });
  });

  it('floors discount amount (no fractional cents)', () => {
    expect(computeDiscount(999, 10)).toEqual({
      discountAmountCents: 99,
      totalCents: 900,
    });
  });
});

describe('generateDiscountCodeIfEligible', () => {
  const config: DiscountConfig = { n: 5, xPercent: 10 };

  it('returns error when not eligible', () => {
    const result = generateDiscountCodeIfEligible(3, [], config);
    expect(result.error).toBe('Not eligible to generate discount code yet');
    expect(result.code).toBeUndefined();
  });

  it('returns a code with config percent when eligible and no override', () => {
    const result = generateDiscountCodeIfEligible(5, [], config);
    expect(result.error).toBeUndefined();
    expect(result.code).toBeDefined();
    expect(result.code!.percent).toBe(10);
    expect(result.code!.used).toBe(false);
    expect(result.code!.code).toMatch(/^[A-Z0-9]{8}$/);
    expect(result.code!.createdAt).toBeInstanceOf(Date);
  });

  it('returns a code with override percent when provided', () => {
    const result = generateDiscountCodeIfEligible(5, [], config, 25);
    expect(result.error).toBeUndefined();
    expect(result.code!.percent).toBe(25);
  });

  it('generates a code not in existing list', () => {
    const existing: DiscountCode[] = [
      { code: 'XXXXXXXX', percent: 10, used: false, createdAt: new Date() },
    ];
    // 10 orders, 1 code -> 2 slots, so we can generate another
    const result = generateDiscountCodeIfEligible(10, existing, config);
    expect(result.code).toBeDefined();
    expect(result.code!.code).not.toBe('XXXXXXXX');
  });
});
