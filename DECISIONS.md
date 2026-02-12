## Decision: Node.js + TypeScript + Express

**Context:** I needed to pick a backend stack that is easy to develop and test quickly for this exercise.

**Options Considered:**
- Option A: Node.js with TypeScript and Express
- Option B: Python (FastAPI) or another non-JS stack

**Choice:** Node.js with TypeScript and Express.

**Why:** This aligns with the recommended stack in the brief, has great tooling (ts-node, Jest, ts-jest), and keeps the language consistent with typical frontend stacks. Express is lightweight and well-known, which keeps focus on the business logic rather than framework complexity.

---

## Decision: In-memory product catalog

**Context:** The assignment allows in-memory storage and I needed a way to represent products for cart and checkout.

**Options Considered:**
- Option A: In-memory array of products defined in code
- Option B: Pluggable repository abstraction with a fake in-memory implementation

**Choice:** A simple in-memory array of products defined in code.

**Why:** A plain array keeps the early implementation straightforward while still being easy to refactor behind a repository interface later if needed. It matches the assignment guidance of not requiring a real database for this exercise.

---

## Decision: Represent prices in cents (integers)

**Context:** I needed to store product prices in a way that is safe for arithmetic during checkout and discounts.

**Options Considered:**
- Option A: Store prices as `number` in major units (e.g. 19.99)
- Option B: Store prices as integer cents (e.g. 1999)

**Choice:** Store prices as integer cents in the `priceCents` field.

**Why:** Using integer minor units avoids floating point rounding issues when summing line items and applying percentage discounts. It is a common practice in payment systems and keeps calculations deterministic and testable.

---

## Decision: Seed a fixed set of demo products

**Context:** I needed some concrete products to exercise cart and checkout behavior and to have something to return from the `/products` endpoint.

**Options Considered:**
- Option A: Seed a small, fixed set of products in code
- Option B: Allow arbitrary product creation via an API before using the cart

**Choice:** Seed a small, fixed set of products directly in the in-memory store.

**Why:** A fixed seed lets the API be usable immediately without extra setup. It keeps the focus on cart, checkout, and discounts rather than building product-management endpoints that are out of scope for this assignment.

---

## Decision: TypeScript configuration targeting CommonJS

**Context:** TypeScript needed to be configured so the project can compile cleanly and run under Node.

**Options Considered:**
- Option A: Use `module: "nodenext"` with ESM-style configuration
- Option B: Use `module: "commonjs"` with `esModuleInterop` enabled

**Choice:** Use `module: "commonjs"` with `esModuleInterop: true`.

**Why:** This works smoothly with Jest and the existing Node toolchain, and allows idiomatic default imports for Express. It avoids the additional configuration overhead of full ESM for this small project.

---

## Decision: Anonymous carts identified by cartId

**Context:** I needed a way for clients to add items to a cart and later check out without implementing a full user/auth system.

**Options Considered:**
- Option A: Anonymous carts identified by a server-generated `cartId` returned from the API
- Option B: User-based carts tied to a `userId` (e.g. via auth or explicit user identifier)

**Choice:** Anonymous carts identified by a server-generated `cartId`.

**Why:** This keeps the API simple and easy to exercise from tools like Postman: the client only needs to remember the `cartId`. It avoids building authentication and user management, which are out of scope for this exercise, while still reflecting a realistic pattern (cart-as-session) that can later be mapped to authenticated users if needed.

---

## Decision: Nth-order, one-time percentage discount codes

**Context:** I needed to formalize how “every nth order gets a coupon code for x% discount” should work in code and data structures.

**Options Considered:**
- Option A: Per-customer counters and flat-amount coupons (e.g. $5 off)
- Option B: Global order counter where at most `floor(totalOrdersCompleted / n)` discount codes are generated, each code giving an x% discount once

**Choice:** Global nth-order counter with one-time percentage discount codes.

**Why:** A global counter with `floor(totalOrdersCompleted / n)` allowed codes is simple to reason about and aligns directly with the problem statement. Using percentage discounts keeps the logic flexible across different basket sizes, and enforcing one-time usage per code prevents abuse while remaining easy to track in-memory via a `used` flag and `usedByOrderId` reference.

---

## Decision: Centralized discount configuration

**Context:** The discount behavior (every nth order, x% off) needs to be easy to find and adjust without editing multiple files.

**Options Considered:**
- Option A: Hardcode `n` and `xPercent` directly wherever discounts are used
- Option B: Keep a single `discountConfig` object and import it where needed

**Choice:** Centralize discount configuration in a single `discountConfig` module.

**Why:** One source of truth for discount parameters avoids subtle bugs where different parts of the code use different values. It also allows quick experimentation with discount rules and makes it obvious where to look when changing business behavior.

---

## Decision: Unauthenticated admin APIs for the exercise

**Context:** The admin APIs (`/admin/discounts/generate`, `/admin/stats`) would normally require authentication and authorization, but the assignment does not specify auth requirements.

**Options Considered:**
- Option A: Implement API key or basic auth middleware for `/admin/*`
- Option B: Leave admin endpoints unauthenticated and document that this is for local/demo use only

**Choice:** Leave admin endpoints unauthenticated for now.

**Why:** Implementing a full auth layer would add significant boilerplate and distract from the core exercise (cart, checkout, discounts, and reporting). For a self-contained coding assignment that runs locally, it is acceptable to keep these routes open while clearly documenting that in a real system they would be protected behind proper auth and role checks.

---

## Decision: Clear cart after successful checkout

**Context:** After a customer checks out, I needed to decide whether the cart should remain with its items or be cleared.

**Options Considered:**
- Option A: Keep the cart and leave items in it after checkout
- Option B: Clear the cart once an order is successfully created

**Choice:** Clear the cart after successful checkout.

**Why:** Clearing the cart matches common e-commerce behavior and avoids accidental double-purchase if `/checkout` is called again with the same `cartId`. It also simplifies reasoning about state: a cart is either active (not yet checked out) or removed, while orders become the source of truth for completed purchases.

