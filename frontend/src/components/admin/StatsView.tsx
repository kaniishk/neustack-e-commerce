import { useEffect, useState } from 'react';
import type { StatsResponse } from '../../lib/api';
import { getStats } from '../../lib/api';

function centsToCurrency(cents: number): string {
  return (cents / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });
}

function StatsView() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="stack">
      <div className="stack-sm">
        <div className="section-title">Store stats</div>
        <p className="muted">
          Aggregated metrics are computed from in-memory orders and discount codes in the
          backend.
        </p>
        <button
          type="button"
          className="button secondary"
          onClick={loadStats}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
        {error && <div className="error-text">{error}</div>}
      </div>

      {stats && (
        <>
          <div className="grid-two">
            <div className="stack-sm">
              <div className="muted">Orders</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                {stats.orderCount}
              </div>
            </div>
            <div className="stack-sm">
              <div className="muted">Items purchased</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                {stats.itemsPurchased}
              </div>
            </div>
            <div className="stack-sm">
              <div className="muted">Revenue</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                {centsToCurrency(stats.revenueCents)}
              </div>
            </div>
            <div className="stack-sm">
              <div className="muted">Codes issued</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                {stats.discountCodesIssued}
              </div>
            </div>
            <div className="stack-sm">
              <div className="muted">Codes used</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                {stats.discountCodesUsed}
              </div>
            </div>
            <div className="stack-sm">
              <div className="muted">Total discounts given</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                {centsToCurrency(stats.totalDiscountsGivenCents)}
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="stack-sm">
            <div className="section-title">Recent orders</div>
            {stats.orders.length === 0 ? (
              <p className="muted">No orders have been placed yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Total</th>
                    <th>Discount</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.orders
                    .slice()
                    .reverse()
                    .map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{centsToCurrency(order.totalCents)}</td>
                        <td>
                          {order.discountAmountCents > 0
                            ? `${centsToCurrency(order.discountAmountCents)} (${order.discountCode})`
                            : '—'}
                        </td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default StatsView;

