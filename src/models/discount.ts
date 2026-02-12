export type OrderId = string;

export interface DiscountCode {
  code: string;
  percent: number;
  used: boolean;
  usedByOrderId?: OrderId;
  createdAt: Date;
}

