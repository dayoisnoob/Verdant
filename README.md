# Verdant 🌿 — Farm Produce E-commerce API

A production-ready REST API for a farm-to-table e-commerce platform. Users can browse fresh produce, manage shopping carts, securely complete payments via Stripe, and receive automated transactional emails.

**Live:** https://shopverdant.store

---

# 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Caching & Queues:** Redis, BullMQ
- **Payments:** Stripe
- **Email:** Resend
- **Validation:** Zod
- **Logging:** Pino
- **Testing:** Vitest

---

# 🏗 Key Technical Decisions

## Refresh Token Rotation with Family Revocation

Every refresh operation rotates the refresh token:

1. The current refresh token is invalidated.
2. A new refresh token is issued within the same database transaction.
3. All refresh tokens generated from a single login session share a `tokenFamilyId`.

If a previously rotated token is ever reused (indicating token theft), the entire token family is immediately revoked. This invalidates both the attacker's session and the legitimate user's session, preventing continued access.

---

## Prices Stored as Integers (Kobo/Pence)

Floating-point arithmetic is unsuitable for financial calculations.

```js
0.1 + 0.2 === 0.30000000000000004;
```

To avoid precision errors:

- Prices are stored as integers in the database.
- Example: **£2.99 → 299**
- Currency formatting is handled exclusively at the presentation layer.

This guarantees accurate calculations for carts, discounts, and orders.

---

## Cart & Order Item Snapshotting

Product details are copied into cart items at the moment they are added:

- Product name
- Unit price
- Product image URL

This ensures that future product updates do not affect items already sitting in a customer's cart.

The same snapshotting strategy is applied when creating order items, ensuring historical orders always reflect exactly what the customer purchased and paid for.

---

## Webhook-Based Order Creation

Orders are created exclusively through Stripe webhooks.

**Order creation occurs inside:**

```text
checkout.session.completed
```

### Why?

Frontend success redirects are:

- Unreliable
- Easily manipulated
- Not proof of payment

Stripe webhooks are:

- Cryptographically signed
- Verified server-side
- Guaranteed payment events

This makes the webhook the authoritative source for order creation.

---

## Resilient Email Queue with BullMQ

Emails are processed asynchronously using BullMQ.

### Flow

1. User registration completes immediately.
2. Verification email is queued.
3. Worker processes the email separately.
4. Failed jobs retry automatically.

### Retry Strategy

- 3 retry attempts
- Exponential backoff
- Persistent jobs stored in Redis

If the email provider becomes unavailable, jobs remain queued and are retried automatically when service is restored.

---

# 📐 Architecture & Routing

The application follows a strict layered architecture:

```text
Request
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Database
   ↓
Response
```

### Responsibilities

#### Controllers

Handle HTTP concerns only:

- Request parsing
- Response formatting
- Status codes

#### Services

Handle business logic only:

- Database queries
- Domain logic
- External service interactions

Neither layer leaks responsibilities into the other.

---

## Project Structure

```text
src/
├── config/        # DB, Redis, Stripe, email, logger, env validation
├── controllers/   # HTTP layer
├── db/schema/     # Drizzle table definitions
├── jobs/          # Scheduled cleanup jobs
├── middleware/    # Auth, validation, caching, rate limiting, errors
├── queues/        # BullMQ queues and workers
├── routes/        # Express routers
├── services/      # Business logic and data access
├── types/         # Interfaces and Express augmentations
├── utils/         # Helpers, JWT, bcrypt, ApiResponse, ApiError
└── validations/   # Zod schemas
```

---

# 💻 Local Setup

## Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- Bun

---

## Installation

```bash
git clone https://github.com/dayoisnoob/Verdant

cd backend

bun install

cp .env.example .env
```

---

## Database Setup

```bash
# Push schema to development database
bun db:push

# Push schema to test database
bun db:push:test
```

---

## Running the Application

### Development

```bash
bun run dev
```

### Production

```bash
bun run build
bun start
```

---

## Testing

```bash
bun test
```

---

# 🚏 API Reference

## Authentication

| Method | Endpoint                    | Auth Required | Description                |
| ------ | --------------------------- | ------------- | -------------------------- |
| POST   | `/api/auth/register`        | No            | Register a new user        |
| GET    | `/api/auth/verify-email`    | No            | Verify email address       |
| POST   | `/api/auth/login`           | No            | Login                      |
| POST   | `/api/auth/logout`          | ✅            | Logout current session     |
| POST   | `/api/auth/logout-all`      | ✅            | Logout from all devices    |
| POST   | `/api/auth/refresh-token`   | No            | Refresh access token       |
| POST   | `/api/auth/forgot-password` | No            | Request password reset     |
| POST   | `/api/auth/reset-password`  | No            | Reset password using token |
| PATCH  | `/api/auth/change-password` | ✅            | Change current password    |

---

## Products

| Method | Endpoint                           | Auth Required | Description                            |
| ------ | ---------------------------------- | ------------- | -------------------------------------- |
| GET    | `/api/products`                    | No            | Paginated product listing with filters |
| GET    | `/api/products/categories`         | No            | Get all categories                     |
| GET    | `/api/products/analytics/trending` | No            | Trending products from the last 3 days |
| GET    | `/api/products/:slug`              | No            | Get a single product                   |
| POST   | `/api/products`                    | Admin         | Create product(s)                      |
| PATCH  | `/api/products/:id`                | Admin         | Update product                         |

---

## Cart

| Method | Endpoint                     | Auth Required | Description                  |
| ------ | ---------------------------- | ------------- | ---------------------------- |
| GET    | `/api/cart`                  | ✅            | Get cart with totals         |
| POST   | `/api/cart/items`            | ✅            | Add item to cart             |
| PATCH  | `/api/cart/items/:productId` | ✅            | Update item quantity         |
| DELETE | `/api/cart/items/:productId` | ✅            | Remove item from cart        |
| POST   | `/api/cart/merge`            | ✅            | Merge guest cart after login |

---

## Payments & Checkout

| Method | Endpoint                                | Auth Required | Description                    |
| ------ | --------------------------------------- | ------------- | ------------------------------ |
| POST   | `/api/payments/create-checkout-session` | ✅            | Create Stripe Checkout Session |
| POST   | `/api/payments/webhook`                 | No            | Stripe webhook listener        |

---

## Additional Resources

Additional CRUD endpoints are available for:

- Orders
- Addresses
- Wishlists
- Coupons

---

# 🚫 Standardized Error Response

All API errors follow a consistent response structure.

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    }
  ]
}
```

---

# ✅ API Design Principles

- RESTful resource design
- Layered architecture
- Type-safe validation with Zod
- Stateless JWT authentication
- Refresh token rotation
- Webhook-driven payment processing
- Event-driven email delivery
- Consistent API response formats
- Financially safe integer-based pricing
- Historical order integrity through snapshotting

---

Built with **Node.js, TypeScript, PostgreSQL, Redis, Stripe, and BullMQ** for reliability, security, and scalability.
