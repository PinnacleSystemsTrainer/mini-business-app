# Mini Business Operations App

## Project Overview

Mini Business Operations App is a training project for a small business workflow. It includes an Express backend, React frontend, Tailwind CSS styling, PostgreSQL persistence through Prisma, and a sales order workflow.

Current modules include product management, customer management, sales order creation, sales order line items, backend total calculation, stock validation, order confirmation, stock reduction, and stock movement tracking.

## Tech Stack

- React
- React Router
- Tailwind CSS
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM

## Project Structure

```txt
backend/
  prisma/
    schema.prisma
    migrations/
  src/
    app.js
    server.js
    lib/
      prisma.js
    routes/
      product.routes.js
      customer.routes.js
      salesOrder.routes.js
    controllers/
      product.controller.js
      customer.controller.js
      salesOrder.controller.js
    services/
      product.service.js
      customer.service.js
      salesOrder.service.js
    utils/
      appError.js
      salesOrderCalculations.js

frontend/
  src/
    api/
      httpClient.js
      productApi.js
      customerApi.js
      salesOrderApi.js
    components/
      layout/
        AppLayout.jsx
      ui/
        Button.jsx
        Card.jsx
        EmptyState.jsx
        ErrorMessage.jsx
        LoadingMessage.jsx
    pages/
      CustomersPage.jsx
      DashboardPage.jsx
      SalesOrderCreatePage.jsx
      SalesOrderDetailPage.jsx
      SalesOrdersPage.jsx
      ProductsPage.jsx
    routes/
      AppRoutes.jsx
    App.jsx
    main.jsx
```

## Backend Setup

```bash
cd backend
npm install
```

## Frontend Setup

```bash
cd frontend
npm install
```

## Running the Backend

```bash
cd backend
npm run dev
```

The backend runs on `http://localhost:3000` by default and currently supports:

```txt
GET /health
GET /api/products
GET /api/products/:id
POST /api/products
PATCH /api/products/:id
DELETE /api/products/:id
GET /api/customers
GET /api/customers/:id
POST /api/customers
PATCH /api/customers/:id
DELETE /api/customers/:id
GET /api/sales-orders
GET /api/sales-orders/:id
POST /api/sales-orders
POST /api/sales-orders/:id/confirm
```

## Running the Frontend

```bash
cd frontend
npm run dev
```

The frontend runs on the Vite development server, usually `http://localhost:5173`.

## Database Setup

This project uses PostgreSQL for persistent business data.

Local database name:

```txt
mini_business_app
```

Basic setup:

1. Install PostgreSQL.
2. Open pgAdmin or psql.
3. Create a database named `mini_business_app`.
4. Verify the connection using:

```sql
SELECT version();
```

Day 6 practice table:

```sql
CREATE TABLE products_demo (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Sample Day 6 product records:

```sql
INSERT INTO products_demo (sku, name, price, stock_qty)
VALUES
  ('P001', 'Notebook', 50.00, 100),
  ('P002', 'Pen', 10.00, 500);
```

Use `SELECT * FROM products_demo;` to confirm the records were inserted.

Do not commit real database passwords. Use `.env` for local secrets and `.env.example` for placeholder values.

## Prisma Setup

This project uses Prisma ORM with PostgreSQL.

Prisma files:

- `backend/prisma/schema.prisma` defines database models.
- `backend/prisma.config.ts` configures Prisma CLI behavior and reads `DATABASE_URL`.
- `backend/prisma/migrations/` stores database structure changes.
- `backend/src/lib/prisma.js` creates the reusable Prisma Client instance.

Local setup:

1. Create PostgreSQL database `mini_business_app`.
2. Copy `backend/.env.example` to `backend/.env`.
3. Set the correct local `DATABASE_URL` in `backend/.env`.
4. Run:

```powershell
cd backend
npx prisma migrate dev --name init_product
npx prisma generate
```

Do not commit real database passwords.

## Tailwind CSS Usage

Tailwind CSS is used for layout, spacing, typography, cards, buttons, tables, and active navigation styles. The app imports Tailwind from `frontend/src/index.css`.

## Week 1 Status

- Express backend created with health and product API routes
- Product API refactored into route, controller, and service files
- React frontend created with Dashboard and Products pages
- React Router configured for `/` and `/products`
- Shared layout, card, and button components added
- Tailwind CSS styling applied across the frontend
- Mock products displayed on the Products page

## Day 6 Status

- PostgreSQL database setup documented
- Local database name documented as `mini_business_app`
- Practice `products_demo` table SQL documented
- Sample product insert SQL documented
- Password safety reminder added

## Day 7 Status

- Prisma packages installed in the backend
- Prisma schema and config files added
- Product model defined in `backend/prisma/schema.prisma`
- Initial Product migration SQL added
- Reusable Prisma client file added
- Safe `.env.example` placeholder added
- Prisma setup documented

## Current Project Status

- Product and customer master data flows are implemented.
- Sales orders can be created with customer and line item details.
- Backend services validate inputs and calculate line totals and order totals.
- Draft sales orders can be confirmed.
- Confirmation validates stock, reduces product stock, and creates stock movement records.
- Shared frontend loading, error, empty state, and API response helpers are available.
- Backend unit and API integration tests cover the sales order business workflow.
- Frontend tests cover user-visible product page behavior.

## Running Tests

### Backend unit tests

```bash
cd backend
npm test
```

Unit tests cover the sales order service: order creation, order read functions, stock validation, and confirmation logic. These tests use mocked Prisma and do not require a database connection.

### Backend API/integration tests

```bash
cd backend
npm test
```

Integration tests are in `backend/tests/integration/` and run as part of the same `npm test` command via Vitest. These tests call real Express endpoints against the local database and cover:

- Health endpoint
- Product creation
- Customer creation
- Draft sales order creation
- Sales order confirmation
- Stock reduction after confirmation
- Stock movement record creation
- Double confirmation rejection
- Insufficient stock rejection
- Order without items rejection

A running PostgreSQL database and a valid `backend/.env` with `DATABASE_URL` are required.

## Manual UI Test Scenario

### Sales order confirmation flow

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Open the app in a browser.
4. Go to **Products** and create a product with a known stock quantity (e.g. 10 units).
5. Go to **Customers** and create a customer.
6. Go to **Sales Orders** and click **New Order**.
7. Select the customer and add a line item for the product with quantity 2.
8. Submit the form. Confirm the order appears in the list with status **DRAFT**.
9. Click the order to open the detail page.
10. Click **Confirm Order**. Verify the status changes to **CONFIRMED** and the confirm button disappears.
11. Go back to the product on the Products page. Verify stock has reduced by 2 (e.g. 10 → 8).
12. Return to the order detail page and attempt to confirm again. Verify the confirm button is no longer shown.

**Expected results:**
- Order status changes from DRAFT to CONFIRMED after step 10.
- Product stock reduces correctly after confirmation.
- A confirmed order cannot be confirmed a second time.
