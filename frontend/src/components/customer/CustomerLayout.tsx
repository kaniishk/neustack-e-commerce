import { useEffect, useMemo, useState } from 'react';
import type {
  Cart,
  CheckoutPreviewResponse,
  OrderResponse,
  Product,
} from '../../lib/api';
import {
  checkout,
  createOrUpdateCart,
  getCart,
  getProducts,
  previewCheckout,
} from '../../lib/api';

function centsToCurrency(cents: number): string {
  return (cents / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });
}

function CustomerLayout() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<OrderResponse | null>(null);
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProducts(true);
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load products.');
      } finally {
        setLoadingProducts(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (!cartId) return;

    const loadCart = async () => {
      try {
        const existing = await getCart(cartId);
        setCart(existing);
      } catch (err) {
        console.error(err);
      }
    };

    void loadCart();
  }, [cartId]);

  const subtotalCents = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return total;
      return total + product.priceCents * item.quantity;
    }, 0);
  }, [cart, products]);

  const handleChangeQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] ?? 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [productId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handleAddToCart = async (productId: string) => {
    const quantity = quantities[productId] ?? 1;
    if (quantity <= 0) return;

    setError(null);
    setPreview(null);
    try {
      const updated = await createOrUpdateCart({
        cartId: cartId ?? undefined,
        items: [{ productId, quantity }],
      });
      setCart(updated);
      if (!cartId) {
        setCartId(updated.id);
      }
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));
    } catch (err) {
      console.error(err);
      setError('Failed to update cart.');
    }
  };

  const handleCheckout = async () => {
    if (!cartId) return;
    setSubmitting(true);
    setError(null);
    setPreview(null);
    try {
      const order = await checkout({
        cartId,
        discountCode: discountCodeInput || undefined,
      });
      setLastOrder(order);
      setCartId(null);
      setCart(null);
      setDiscountCodeInput('');
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Checkout failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = async () => {
    if (!cartId) return;
    setPreviewing(true);
    setError(null);
    try {
      const response = await previewCheckout({
        cartId,
        discountCode: discountCodeInput || undefined,
      });
      setPreview(response);
    } catch (err) {
      console.error(err);
      setPreview(null);
      setError(
        err instanceof Error ? err.message : 'Could not preview total. Please try again.',
      );
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <div className="grid-two">
      <section className="card">
        <div className="stack">
          <header>
            <div className="section-title">Catalog</div>
            <p className="muted">
              Choose products and quantities, then add them to your cart.
            </p>
          </header>

          {loadingProducts ? (
            <p className="muted">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="muted">No products available.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th style={{ width: '170px' }}>Quantity</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{centsToCurrency(product.priceCents)}</td>
                    <td>
                      <div className="input-row">
                        <button
                          type="button"
                          className="button secondary"
                          style={{ paddingInline: '0.6rem' }}
                          onClick={() => handleChangeQuantity(product.id, -1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          className="input-inline"
                          value={quantities[product.id] ?? 1}
                          onChange={(e) =>
                            handleChangeQuantity(
                              product.id,
                              Number(e.target.value || 1) -
                                (quantities[product.id] ?? 1),
                            )
                          }
                        />
                        <button
                          type="button"
                          className="button secondary"
                          style={{ paddingInline: '0.6rem' }}
                          onClick={() => handleChangeQuantity(product.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        Add to cart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="card">
        <div className="stack">
          <header>
            <div className="section-title">Cart &amp; Checkout</div>
            <p className="muted">
              You can also paste a discount code generated from the admin view.
            </p>
          </header>

          <div className="stack-sm">
            <div className="badge">
              Cart ID:{' '}
              {cartId ? <span>{cartId}</span> : <span className="muted">Not created yet</span>}
            </div>
            {cart && cart.items.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    const lineTotal = product.priceCents * item.quantity;
                    return (
                      <tr key={item.productId}>
                        <td>{product.name}</td>
                        <td>{item.quantity}</td>
                        <td>{centsToCurrency(lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="muted">Cart is empty. Add some items to get started.</p>
            )}

            <div className="divider" />

            <div className="stack-sm">
              <div className="input-row">
                <input
                  className="input"
                  placeholder="Discount code (optional)"
                  value={discountCodeInput}
                  onChange={(e) => setDiscountCodeInput(e.target.value)}
                />
                <button
                  type="button"
                  className="button secondary"
                  disabled={!cart || cart.items.length === 0 || previewing}
                  onClick={handlePreview}
                >
                  {previewing ? 'Checking…' : 'Preview total'}
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={!cart || cart.items.length === 0 || submitting}
                  onClick={handleCheckout}
                >
                  {submitting ? 'Placing order…' : 'Place order'}
                </button>
              </div>
              <div className="muted">
                Subtotal:{' '}
                <strong>{subtotalCents ? centsToCurrency(subtotalCents) : '—'}</strong>
              </div>
              {preview && (
                <div className="muted">
                  Preview total:{' '}
                  <strong>{centsToCurrency(preview.totalCents)}</strong>
                  {preview.discountAmountCents > 0 && preview.discountCode && (
                    <>
                      {' '}
                      (saving {centsToCurrency(preview.discountAmountCents)} with{' '}
                      {preview.discountCode})
                    </>
                  )}
                </div>
              )}
            </div>

            {error && <div className="error-text">{error}</div>}
            {lastOrder && !error && (
              <div className="stack-sm">
                <div className="success-text">Order placed successfully.</div>
                <div className="chip-row">
                  <span className="chip">Order ID: {lastOrder.orderId}</span>
                  <span className="chip">
                    Total: {centsToCurrency(lastOrder.totalCents)}
                  </span>
                  {lastOrder.discountAmountCents > 0 && (
                    <span className="chip">
                      Saved {centsToCurrency(lastOrder.discountAmountCents)} with code{' '}
                      {lastOrder.discountCode}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default CustomerLayout;

