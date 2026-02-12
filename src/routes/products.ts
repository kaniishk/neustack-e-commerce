import { Router } from 'express';
import { listProducts } from '../store/productsStore';

const router = Router();

router.get('/', (_req, res) => {
  res.json(listProducts());
});

export default router;

