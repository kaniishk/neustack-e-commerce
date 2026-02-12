## Neustack E-commerce Frontend

This is a small React + Vite + TypeScript single-page app that sits in front of the
Neustack e-commerce backend. It provides a minimal, clean UI for both **customers** and
**admins** to exercise the APIs.

---

## Features

- **Role selector**: landing screen lets you continue as **Customer** or **Admin** (no real
  authentication, just UI state).
- **Customer view**:
  - Browse the in-memory product catalog.
  - Add items to a cart (backed by the `/cart` APIs).
  - Optionally enter a discount code.
  - Checkout via `/checkout` and see an order summary.
- **Admin view**:
  - Generate discount codes via `/admin/discounts/generate`.
  - View aggregate stats from `/admin/stats`.

---

## Running the app

From the repo root:

1. **Start the backend** (in another terminal):

   ```bash
   npm run dev
   ```

   By default this listens on `http://localhost:3000`.

2. **Start the frontend dev server**:

   ```bash
   cd frontend
   npm install    # first run only
   npm run dev
   ```

   Open the printed URL (typically `http://localhost:5173`).

The frontend points to the backend via the `VITE_API_BASE_URL` environment variable. If the
backend is not running on `http://localhost:3000`, set it when starting Vite:

```bash
VITE_API_BASE_URL="http://localhost:3001" npm run dev
```

---

## Implementation Notes

- **Tech stack**: React 19, Vite, TypeScript.
- **API client**: `src/lib/api.ts` wraps calls to the backend (`/products`, `/cart`,
  `/checkout`, `/admin/*`).
- **UI structure**:
  - `App.tsx` holds the selected role and switches between views.
  - `components/RoleSelector.tsx` – simple, card-based role selection.
  - `components/customer/CustomerLayout.tsx` – customer browsing, cart, and checkout.
  - `components/admin/AdminLayout.tsx`, `DiscountGenerator.tsx`, `StatsView.tsx` – admin
    console.
- **Styling**: `src/index.css` defines a small design system (cards, buttons, layout) for a
  clean but minimal UX.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
