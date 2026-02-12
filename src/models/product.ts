export interface Product {
  id: string;
  name: string;
  /**
   * Price stored in minor units (cents) to avoid floating point errors.
   */
  priceCents: number;
}

