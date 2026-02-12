import { DiscountCode } from '../models/discount';

const discountCodes: DiscountCode[] = [];

export function addDiscountCode(code: DiscountCode): void {
  discountCodes.push(code);
}

export function listDiscountCodes(): DiscountCode[] {
  return discountCodes;
}

export function findDiscountCode(codeValue: string): DiscountCode | undefined {
  return discountCodes.find((c) => c.code === codeValue);
}

export function markDiscountCodeUsed(codeValue: string, orderId: string): void {
  const existing = findDiscountCode(codeValue);
  if (!existing) return;
  existing.used = true;
  existing.usedByOrderId = orderId;
}

