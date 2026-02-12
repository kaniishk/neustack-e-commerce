import { useState } from 'react';
import RoleSelector from './components/RoleSelector';
import CustomerLayout from './components/customer/CustomerLayout';
import AdminLayout from './components/admin/AdminLayout';

type Role = 'customer' | 'admin' | null;

function App() {
  const [role, setRole] = useState<Role>(null);

  const handleReset = () => setRole(null);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="app-title">Neustack Store</div>
          <div className="muted">Minimal demo storefront &amp; admin console</div>
        </div>
        <div className="header-actions">
          {role && (
            <span className="pill-secondary">
              Role: {role === 'customer' ? 'Customer' : 'Admin'}
            </span>
          )}
          {role && (
            <button type="button" className="link-button" onClick={handleReset}>
              Switch role
            </button>
          )}
        </div>
      </header>

      {!role && <RoleSelector onSelectRole={setRole} />}
      {role === 'customer' && <CustomerLayout />}
      {role === 'admin' && <AdminLayout />}
    </div>
  );
}

export default App;
