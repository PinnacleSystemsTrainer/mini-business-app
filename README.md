# Mini Business Operations App

## Project Overview

Mini Business Operations App is a training project for a small business workflow. Week 1 establishes the Express backend, React frontend, Tailwind CSS styling, and basic routing foundation.

Planned modules include product management, customer management, sales order creation, sales order line items, backend total calculation, stock validation, order confirmation, and stock movement tracking.

## Tech Stack

- React
- React Router
- Tailwind CSS
- Node.js
- Express.js
- PostgreSQL and Prisma ORM planned for Week 2

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
    controllers/
      product.controller.js
    services/
      product.service.js

frontend/
  src/
    api/
      productApi.js
    components/
      layout/
        AppLayout.jsx
      ui/
        Button.jsx
        Card.jsx
    pages/
      DashboardPage.jsx
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
