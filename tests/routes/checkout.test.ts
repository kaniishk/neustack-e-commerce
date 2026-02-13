import request from 'supertest';
import app from '../../src/index';

describe('Checkout API', () => {
  describe('POST /checkout/preview', () => {
    it('returns 400 when cartId is missing', async () => {
      const res = await request(app)
        .post('/checkout/preview')
        .send({})
        .expect(400);
      expect(res.body.error).toBe('cartId is required');
    });

    it('returns 404 when cart does not exist', async () => {
      const res = await request(app)
        .post('/checkout/preview')
        .send({ cartId: 'non-existent-cart-id' })
        .expect(404);
      expect(res.body.error).toBe('Cart not found');
    });

    it('returns preview with items and totals for valid cart', async () => {
      const createRes = await request(app)
        .post('/cart')
        .send({ items: [{ productId: 'p1', quantity: 2 }] })
        .expect(200);
      const cartId = (createRes.body as { id: string }).id;

      const res = await request(app)
        .post('/checkout/preview')
        .send({ cartId })
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0]).toMatchObject({
        productId: 'p1',
        quantity: 2,
        unitPriceCents: 1999,
      });
      expect(res.body.subtotalCents).toBe(3998);
      expect(res.body.totalCents).toBe(3998);
      expect(res.body.discountAmountCents).toBe(0);
    });
  });
});
