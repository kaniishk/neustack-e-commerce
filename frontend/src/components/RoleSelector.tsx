type Props = {
  onSelectRole: (role: 'customer' | 'admin') => void;
};

function RoleSelector({ onSelectRole }: Props) {
  return (
    <main className="card">
      <div className="stack">
        <div>
          <div className="pill">Start here</div>
          <h2 style={{ margin: '0.75rem 0 0.25rem' }}>Choose how you want to explore</h2>
          <p className="muted">
            Pick <strong>Customer</strong> to shop and checkout, or <strong>Admin</strong> to
            manage discounts and view store stats.
          </p>
        </div>

        <div className="role-grid">
          <section className="role-card">
            <div>
              <div className="role-card-header">
                <div className="role-card-title">Customer</div>
                <span className="role-chip">Storefront</span>
              </div>
              <ul className="muted" style={{ paddingLeft: '1.1rem', margin: 0 }}>
                <li>Browse the product catalog</li>
                <li>Add items to a cart</li>
                <li>Apply a discount code at checkout</li>
              </ul>
            </div>
            <button
              type="button"
              className="button full-width"
              onClick={() => onSelectRole('customer')}
            >
              Continue as customer
            </button>
          </section>

          <section className="role-card">
            <div>
              <div className="role-card-header">
                <div className="role-card-title">Admin</div>
                <span className="role-chip">Back office</span>
              </div>
              <ul className="muted" style={{ paddingLeft: '1.1rem', margin: 0 }}>
                <li>Generate nth-order discount codes</li>
                <li>Inspect items purchased &amp; revenue</li>
                <li>See how much discount was given</li>
              </ul>
            </div>
            <button
              type="button"
              className="button secondary full-width"
              onClick={() => onSelectRole('admin')}
            >
              Continue as admin
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

export default RoleSelector;

