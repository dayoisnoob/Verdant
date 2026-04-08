**Verdant — Farm Produce E-commerce API**  
A REST API for a farm-to-table e-commerce platform. Users browse produce, manage a cart, check out via Stripe, and receive order confirmation emails.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OYQ1AABSAwc8mi5wvkwZyCKCAACr4Z7a7BLfMzFYdAQDwF+da3dX+9QQAgNeuB6feBdUJcyS2AAAAAElFTkSuQmCC)  
**Stack**  
Node.js · Express 5 · TypeScript · PostgreSQL · Drizzle ORM · Redis · BullMQ · Stripe · Resend · Zod · Pino · Vitest  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNBCkJfFEIwwIgHRiywEZJWQZeZ2ao9AAD+4lyruzq+ngAA8Nr1AOHsBegrsOrIAAAAAElFTkSuQmCC)  
**Key Technical Decisions**  
**Refresh token rotation with family revocation**  
   
 Every refresh rotates the token — old one is invalidated, new one issued in a transaction. All tokens from one login share a tokenFamilyId. If a rotated token is replayed (theft signal), the entire family is revoked, killing both the attacker's session and the legitimate one.  
**Prices as integers in pence**  
   
 0.1 + 0.2 === 0.30000000000000004 in JavaScript. £2.99 is stored as 299. Conversion to pounds happens at the display layer only.  
**Cart and order item snapshotting**  
   
 Product name, price, and image are copied into cart items at add-time. Price changes don't silently affect open carts. Order items use the same pattern — historical orders always reflect what was actually charged.  
**Webhook-based order creation**  
   
 Orders are created inside the Stripe checkout.session.completed webhook, not on the frontend redirect. The webhook is signed by Stripe and verified server-side. The success redirect is unreliable and carries no authoritative payment signal.  
**Email queue with BullMQ**  
   
 Emails are never sent inline. Registration returns immediately — the verification email is processed async with 3 attempts and exponential backoff. Jobs persist in Redis if the provider is down and retry automatically on recovery.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhZscVjnidKEAGFtgISaugy8zs1RkAAH9xr9VWHV9PAAB47XoAor8EPg1yCpUAAAAASUVORK5CYII=)  
**Architecture**  
Request → Route → Controller → Service → Database → Response  
   
Controllers handle HTTP only. Services handle business logic only. Neither layer leaks into the other's concerns.  
src/  
 ├── config/        # DB, Redis, Stripe, email, logger, env validation  
 ├── controllers/   # HTTP layer  
 ├── db/schema/     # Drizzle table definitions  
 ├── jobs/          # Cron cleanup jobs  
 ├── middleware/    # Auth, validation, caching, rate limiting, error handling  
 ├── queues/        # BullMQ email queue and worker  
 ├── routes/        # Express routers  
 ├── services/      # Business logic and DB queries  
 ├── types/         # Interfaces and Express augmentation  
 ├── utils/         # asyncHandler, ApiResponse, ApiError, JWT, bcrypt, tokens  
 └── validations/   # Zod schemas per domain  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNBCUrfDqrYGVDAgAU2QtIq6DIzW7UHAMBfHGt1V+fXEwAAXrseHCQGBEuErVgAAAAASUVORK5CYII=)  
**Getting Started**  
**Prerequisites**  
Node.js 18+ · PostgreSQL · Redis  
**Installation**  
git clone https://github.com/pushKowalski/verdant  
 cd backend  
 bun install  
 cp .env.example .env  
   
**Database**  
bun db:push        # push schema to dev DB  
 bun db:push:test   # push schema to test DB  
   
**Run**  
bun run dev            # development with hot reload  
 bun run build && bun start  # production  
   
**Test**  
bun test  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsSfYxZo/khWsYQLPJrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA4qjBdKlX6OKAAAAAElFTkSuQmCC)  
**API**  
Auth  
| | | | |  
|-|-|-|-|  
| **Method** | **Endpoint** | **Auth** | **Description** |   
| POST | /api/auth/register | — | Register |   
| GET | /api/auth/verify-email | — | Verify email |   
| POST | /api/auth/login | — | Login |   
| POST | /api/auth/logout | ✓ | Logout |   
| POST | /api/auth/logout-all | ✓ | Logout all devices |   
| POST | /api/auth/refresh-token | — | Refresh access token |   
| POST | /api/auth/resend-verification | — | Resend verification email |   
| POST | /api/auth/forgot-password | — | Request password reset |   
| POST | /api/auth/reset-password | — | Reset with token |   
| PATCH | /api/auth/change-password | ✓ | Change password |   
| PATCH | /api/auth/profile | ✓ | Update profile |   
| DELETE | /api/auth/delete | ✓ | Delete account |   
   
Products  
| | | | |  
|-|-|-|-|  
| **Method** | **Endpoint** | **Auth** | **Description** |   
| GET | /api/products | — | Paginated listing with filters |   
| GET | /api/products/categories | — | All categories |   
| GET | /api/products/analytics/best-selling | — | Best sellers |   
| GET | /api/products/analytics/trending | — | Trending (last 3 days) |   
| POST | /api/products/suggested | — | Suggested products |   
| GET | /api/products/related/:slug | — | Related products |   
| GET | /api/products/:slug | — | Single product |   
| POST | /api/products | Admin | Create product(s) |   
| PATCH | /api/products/:id | Admin | Update product |   
| DELETE | /api/products/:id | Admin | Delete product |   
   
Cart  
| | | | |  
|-|-|-|-|  
| **Method** | **Endpoint** | **Auth** | **Description** |   
| GET | /api/cart | ✓ | Get cart with totals |   
| POST | /api/cart/items | ✓ | Add item |   
| PATCH | /api/cart/items/:productId | ✓ | Update quantity |   
| DELETE | /api/cart/items/:productId | ✓ | Remove item |   
| DELETE | /api/cart | ✓ | Clear cart |   
| POST | /api/cart/merge | ✓ | Merge guest cart on login |   
   
Orders, Payments, Addresses, Wishlist, Coupons  
| | | | |  
|-|-|-|-|  
| **Method** | **Endpoint** | **Auth** | **Description** |   
| GET | /api/orders | ✓ | Order history |   
| GET | /api/orders/:id | ✓ | Order detail |   
| GET | /api/orders/session/:sessionId | ✓ | Order by Stripe session |   
| GET | /api/orders/all | Admin | All orders |   
| PATCH | /api/orders/:orderId | Admin | Update status |   
| POST | /api/payments/create-checkout-session | ✓ | Create Stripe session |   
| POST | /api/payments/webhook | — | Stripe webhook |   
| GET | /api/address | ✓ | Get addresses |   
| POST | /api/address | ✓ | Add address |   
| PATCH | /api/address/:id | ✓ | Update address |   
| PATCH | /api/address/:id/set-default | ✓ | Set default |   
| DELETE | /api/address/:id | ✓ | Remove address |   
| GET | /api/wishlist | ✓ | Get wishlist |   
| POST | /api/wishlist/:productId | ✓ | Toggle item |   
| POST | /api/coupons/apply | ✓ | Apply coupon |   
| DELETE | /api/coupons | ✓ | Remove coupon |   
| POST | /api/coupons | Admin | Create coupon(s) |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OYQ1AABSAwY8JoIGqr4Z6Eoiggn9mu0twy8wc1RkAAH9xbdVa7V9PAAB47X4A9C4EIsmYmgsAAAAASUVORK5CYII=)  
**Error Format**  
{  
   "success": false,  
   "message": "Validation failed",  
   "errors": [{ "field": "email", "message": "please enter a valid email" }]  
 }  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhwgJe0PYTKpnRgQU2QtIq6DIze3UGAMBf3Gu1VcfXEwAAXrseaIEEMYtKmi4AAAAASUVORK5CYII=)  
Built by [@pushKowalski](https://github.com/pushKowalski "https://github.com/pushKowalski")  
