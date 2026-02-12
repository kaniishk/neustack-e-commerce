## Neustack E-commerce (Backend)

This project is a small e-commerce backend used to demonstrate cart, checkout, and a simple discount system. It is built with **Node.js**, **TypeScript**, and **Express**, using **in-memory storage** (no database).

At this stage, the project includes:
- A basic Express server with a `/health` endpoint.
- An in-memory product catalog with a few seeded products.
- A `/products` endpoint to list the available products.
- An in-memory cart store keyed by `cartId`, with simple cart APIs.

Further phases will add carts, checkout, discounts, admin endpoints, and tests.

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Web framework:** Express
- **Testing:** Jest + ts-jest (configured, tests to be added as core logic is implemented)

These choices are documented in more detail in `DECISIONS.md`.

---

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Install dependencies

```bash
npm install
```

### Run in development mode

Starts the TypeScript server using `ts-node` with automatic reload via `nodemon`:

```bash
npm run dev
```

The server will listen on port `3000` by default.

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

### Build and run compiled code

```bash
npm run build
npm start
```

---

## Scripts

- `npm run dev` – Run the server in development mode with TypeScript.
- `npm run build` – Compile TypeScript to JavaScript (`dist/`).
- `npm start` – Run the compiled server from `dist/`.
- `npm test` – Run Jest tests (will be populated as business logic is implemented).

