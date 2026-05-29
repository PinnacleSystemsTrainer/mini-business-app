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
  src/
    app.js
    server.js
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
