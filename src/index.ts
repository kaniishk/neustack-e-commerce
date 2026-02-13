import express, { Request, Response } from 'express';
import cors from 'cors';
import productsRouter from './routes/products';
import cartRouter from './routes/cart';
import adminRouter from './routes/admin';
import checkoutRouter from './routes/checkout';

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: false,
  }),
);
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/admin', adminRouter);
app.use('/checkout', checkoutRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;

