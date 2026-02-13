## Neustack E-commerce

This project is a small e-commerce app with a **Node.js/TypeScript/Express** backend (in-memory storage) and a **React/Vite** frontend. It demonstrates cart, checkout, and a simple discount system (nth-order discount codes).

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Web framework:** Express
- **Testing:** Jest + ts-jest (configured, tests to be added as core logic is implemented)

These choices are documented in more detail in `DECISIONS.md`.

---

## Steps to run the project

### Prerequisites

- **Node.js** (LTS recommended, e.g. 18+)
- **npm**

### 1. Install dependencies

From the project root:

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Run the app

**Option A – Backend and frontend together (recommended)**

```bash
npm run dev:all
```

- Backend: **http://localhost:3000**
- Frontend: **http://localhost:5173** (open in browser)

**Option B – Run separately**

Terminal 1 (backend):

```bash
npm run dev:backend
```

Terminal 2 (frontend):

```bash
npm run dev:frontend
```

### 3. Optional environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Backend server port |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Allowed CORS origin for the frontend |
| `DISCOUNT_NTH_ORDER` | `5` | Generate one discount code every N orders |

---

## Backend details

### Run backend only (development)

```bash
npm run dev
```

Same as `dev:backend`: starts the Express server with `ts-node` and nodemon on port **3000**.

Health check:

- `GET http://localhost:3000/health`

Product listing (from the in-memory catalog):

- `GET http://localhost:3000/products`

Cart operations:

- `POST http://localhost:3000/cart`
  - Body: `{ "items": [{ "productId": "p1", "quantity": 2 }] }`
  - Response: `{ "id": "<cartId>", "items": [...] }`
- `POST http://localhost:3000/cart`
  - Body: `{ "cartId": "<cartId>", "items": [{ "productId": "p2", "quantity": 1 }] }` (adds/merges items)
- `GET http://localhost:3000/cart/<cartId>` – fetch current cart contents

Checkout:

- `POST http://localhost:3000/checkout`
  - Body:
    ```json
    {
      "cartId": "<cartId>",
      "discountCode": "OPTIONAL_CODE"
    }
    ```
  - On success (`201`), returns an order summary:
    ```json
    {
      "orderId": "<id>",
      "items": [
        { "productId": "p1", "quantity": 2, "unitPriceCents": 1999 }
      ],
      "subtotalCents": 3998,
      "discountCode": "OPTIONAL_CODE",
      "discountPercent": 10,
      "discountAmountCents": 400,
      "totalCents": 3598,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
    ```
  - Error responses:
    - `400` if the cart is empty, the payload is invalid, or the discount code is invalid/used.
    - `404` if the cart does not exist.

Admin endpoints (unauthenticated for this exercise, see `DECISIONS.md`):

- `POST http://localhost:3000/admin/discounts/generate`
  - Attempts to generate a new discount code if the nth-order condition is satisfied.
  - On success (`201`), returns:
    ```json
    { "code": "<uuid>", "percent": 10, "createdAt": "..." }
    ```
  - On failure (`400`), returns:
    ```json
    { "error": "Not eligible to generate discount code yet" }
    ```

- `GET http://localhost:3000/admin/stats`
  - Returns aggregate stats derived from in-memory orders and discount codes:
    ```json
    {
      "itemsPurchased": 0,
      "revenueCents": 0,
      "discountCodesIssued": 0,
      "discountCodesUsed": 0,
      "totalDiscountsGivenCents": 0
    }
    ```

### Build and run compiled code

```bash
npm run build
npm start
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` / `npm run dev:backend` | Backend only: Express + ts-node + nodemon (port 3000). |
| `npm run dev:frontend` | Frontend only: Vite dev server (port 5173). |
| `npm run dev:all` | Backend and frontend together (concurrently). |
| `npm run build` | Compile backend TypeScript to `dist/`. |
| `npm start` | Run compiled backend from `dist/`. |
| `npm test` | Run Jest tests. |

