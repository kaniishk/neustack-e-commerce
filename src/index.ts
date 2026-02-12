import express, { Request, Response } from 'express';
import productsRouter from './routes/products';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/products', productsRouter);

app.listen(port, () => {
  // Simple startup log; in a larger app we'd use a logger
  console.log(`Server listening on port ${port}`);
});

export default app;

