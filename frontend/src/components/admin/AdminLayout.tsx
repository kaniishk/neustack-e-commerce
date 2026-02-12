import { useState } from 'react';
import DiscountGenerator from './DiscountGenerator';
import StatsView from './StatsView';

type Tab = 'discounts' | 'stats';

function AdminLayout() {
  const [tab, setTab] = useState<Tab>('discounts');

  return (
    <main className="card">
      <div className="stack">
        <header className="stack-sm">
          <div className="section-title">Admin console</div>
          <p className="muted">
            Generate nth-order discount codes and inspect store performance in one place.
          </p>
          <div className="chip-row">
            <button
              type="button"
              className="button secondary"
              style={{ paddingInline: '1rem' }}
              onClick={() => setTab('discounts')}
            >
              Discounts
            </button>
            <button
              type="button"
              className="button secondary"
              style={{ paddingInline: '1rem' }}
              onClick={() => setTab('stats')}
            >
              Stats
            </button>
          </div>
        </header>

        {tab === 'discounts' && <DiscountGenerator />}
        {tab === 'stats' && <StatsView />}
      </div>
    </main>
  );
}

export default AdminLayout;

