import { Router, Request, Response } from 'express';
import { CartItem } from '../models/cart';
import { getCart, upsertCart } from '../store/cartsStore';

const router = Router();

interface UpsertCartBody {
  cartId?: string;
  items: CartItem[];
}

router.post('/', (req: Request<unknown, unknown, UpsertCartBody>, res: Response) => {
  const { cartId, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }

  const cart = upsertCart(cartId, items);
  return res.status(200).json(cart);
});

router.get('/:cartId', (req: Request<{ cartId: string }>, res: Response) => {
  const { cartId } = req.params;
  const cart = getCart(cartId);

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  return res.json(cart);
});

export default router;

