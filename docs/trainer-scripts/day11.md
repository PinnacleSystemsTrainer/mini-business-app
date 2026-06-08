# Day 11 Trainer Script - Sales Order Data Model and List Page

Fullstack Training Program  
Mini Business Operations App

---

## Trainer Positioning

Day 11 starts Week 3 of the Fullstack Training Program.

Weeks 1 and 2 created the foundation:

- Express backend
- PostgreSQL database
- Prisma setup
- Product model and API
- Customer model and API
- React frontend
- React Router
- Product and Customer list/create pages
- Shared loading, error, and empty states
- Centralized backend error handling

Day 11 begins the core business workflow of the Mini Business Operations App: sales orders.

Today is not about creating orders yet. That starts on Day 12.

Today is about preparing the data model and the list-page foundation so the project has a clean place for the sales order workflow to grow.

The intern should understand:

- Products and Customers are master data.
- Sales Orders are transaction data.
- A sales order needs a header table and an item table.
- A sales order belongs to a customer.
- A sales order has many line items.
- Each line item refers to a product.
- The backend must expose a sales order list endpoint.
- The frontend must have a Sales Orders page ready, even if there are no orders yet.

---

## Day Goal

By the end of Day 11, interns should be able to:

1. Explain the difference between master data and transaction data.
2. Explain why sales orders need header and line item tables.
3. Add `SalesOrder` and `SalesOrderItem` models to Prisma.
4. Run a Prisma migration for the sales order schema.
5. Create basic backend Sales Order list and detail endpoints.
6. Add a frontend `SalesOrdersPage`.
7. Add navigation for Sales Orders.
8. Display order number, customer, status, total amount, and created date.
9. Show a useful empty state when there are no sales orders.
10. Explain how this prepares the project for Day 12 order creation.

---

## End-of-Day Deliverable

By the end of Day 11, the project should have:

```text
backend/
  prisma/
    schema.prisma
    migrations/
  src/
    controllers/
      salesOrder.controller.js
    routes/
      salesOrder.routes.js
    services/
      salesOrder.service.js

frontend/
  src/
    api/
      salesOrderApi.js
    pages/
      SalesOrdersPage.jsx
    routes/
      AppRoutes.jsx
    components/
      layout/
        AppLayout.jsx
```

The application should support:

```text
GET /api/sales-orders
GET /api/sales-orders/:id
```

The frontend should support:

```text
/sales-orders
```

Suggested commit message:

```bash
git add .
git commit -m "Add sales order schema and list page foundation"
```

---

# Morning Session - 1 Hour

## Suggested Timing

| Time | Topic |
|---|---|
| 0-10 min | Recap Day 10 and Week 2 |
| 10-20 min | Master data vs transaction data |
| 20-35 min | Sales order header and item data model |
| 35-45 min | Prisma schema changes and migration |
| 45-55 min | Backend API and frontend list-page design |
| 55-60 min | Assign hands-on task and success criteria |

---

## 0-10 Minutes - Recap Day 10 and Week 2

### Trainer Script

"Last week, we moved from temporary data to real database-backed flows.

We connected the backend to PostgreSQL using Prisma. We created Product and Customer models. We built Product and Customer APIs. We connected the React pages to backend APIs. We also improved error handling so the backend returns predictable errors and the frontend shows loading, error, and empty states.

Today we start Week 3. Week 3 is where the app becomes a business workflow application.

The main business workflow is:

Product master -> Customer master -> Sales order creation -> Sales order line items -> Backend total calculation -> Stock validation -> Order confirmation -> Stock reduction -> Stock movement tracking."

### Ask the Intern

#### Q1. What did we complete by the end of Week 2?

Expected answer:

"We completed database-backed Product and Customer flows. The backend uses Prisma and PostgreSQL. The frontend can load and create Products and Customers. We also added shared loading, error, and empty states."

#### Q2. What is the main business workflow we are starting now?

Expected answer:

"We are starting the Sales Order workflow. It will eventually include order creation, line items, total calculation, stock validation, confirmation, stock reduction, and stock movement tracking."

#### Q3. Should stock reduce today?

Expected answer:

"No. Today is only sales order schema and list page foundation. Stock validation and confirmation come later."

Trainer follow-up:

"Correct. Today we are preparing the structure. Day 12 will create sales orders. Day 13 will handle confirmation and stock movement."

---

## 10-20 Minutes - Master Data vs Transaction Data

### Trainer Script

"Before we design sales orders, we need to understand an important business application concept: master data vs transaction data.

Master data is relatively stable data. It describes the main entities used repeatedly by the business.

In our app:

- Products are master data.
- Customers are master data.

Transaction data records business activity.

In our app:

- Sales orders are transaction data.
- Sales order items are transaction data.
- Stock movements are transaction data.

A product may exist for months or years. A customer may place many orders. Each order is a transaction that happened at a specific time."

### Simple Analogy

"Think of a shop.

The product list is like the shop's catalog. It does not change every minute.

The customer list is like the address book. It changes sometimes, but not for every sale.

A sales order is an actual business event. It records that a customer placed an order on a specific day."

### Whiteboard Table

| Data | Type | Why |
|---|---|---|
| Product | Master data | Reused across many orders |
| Customer | Master data | Reused across many orders |
| Sales Order | Transaction data | Records a business activity |
| Sales Order Item | Transaction data | Records products ordered in one order |
| Stock Movement | Transaction data | Records stock change event |

### Ask the Intern

#### Q1. Is Product master data or transaction data?

Expected answer:

"Master data."

#### Q2. Is Customer master data or transaction data?

Expected answer:

"Master data."

#### Q3. Is Sales Order master data or transaction data?

Expected answer:

"Transaction data."

#### Q4. Why is a Sales Order transaction data?

Expected answer:

"Because it records a business event: a customer placing an order. It has a date, status, total, and line items."

---

## 20-35 Minutes - Sales Order Header and Item Data Model

### Trainer Script

"A sales order is not just one flat record.

A sales order usually has two parts:

1. Header
2. Line items

The header contains information about the whole order.

Examples:

- Order number
- Customer
- Status
- Total amount
- Created date

The line items contain the products inside the order.

Examples:

- Product
- Quantity
- Rate
- Line total

This structure is common in business applications."

### Sales Order Structure

```text
SalesOrder
  id
  orderNo
  customerId
  status
  totalAmount
  createdAt
  updatedAt

SalesOrderItem
  id
  salesOrderId
  productId
  quantity
  rate
  lineTotal
```

### Relationship Diagram

```text
Customer
  -> SalesOrder
      -> SalesOrderItem
          -> Product
```

A clearer relationship view:

```text
Customer 1 -> many SalesOrders
SalesOrder 1 -> many SalesOrderItems
Product 1 -> many SalesOrderItems
```

### Trainer Explanation

"One customer can place many sales orders.

One sales order can have many items.

One product can appear in many sales order items across different orders."

### Example

```text
Customer: ABC Stores

Sales Order: SO-0001
Status: DRAFT
Total: Rs. 160

Items:
1. Notebook - Qty 2 - Rate Rs. 50 - Line Total Rs. 100
2. Pen - Qty 6 - Rate Rs. 10 - Line Total Rs. 60
```

### Ask the Intern

#### Q1. Why not store all ordered products directly inside the SalesOrder table?

Expected answer:

"Because one order can have multiple products. If we store everything in one table, the structure becomes messy and hard to query. A separate SalesOrderItem table allows each product line to be stored clearly."

#### Q2. What belongs in the SalesOrder header?

Expected answer:

"Order number, customer, status, total amount, created date, and updated date."

#### Q3. What belongs in SalesOrderItem?

Expected answer:

"Product, quantity, rate, line total, and reference to the sales order."

#### Q4. What is a foreign key?

Expected answer:

"A foreign key connects one table to another. For example, SalesOrder has customerId pointing to Customer. SalesOrderItem has salesOrderId pointing to SalesOrder and productId pointing to Product."

---

## 35-45 Minutes - Prisma Schema Changes and Migration

### Trainer Script

"Now we will translate this business model into Prisma models.

Before today, we already had Product and Customer models.

Today, we add:

- SalesOrder
- SalesOrderItem

We also add relation fields to Customer and Product so Prisma understands the relationship from both sides."

### Prisma Schema Demo

Open:

```text
backend/prisma/schema.prisma
```

Add or update the models as shown below.

```prisma
model Product {
  id        Int      @id @default(autoincrement())
  sku       String   @unique
  name      String
  price     Decimal
  stockQty  Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  salesOrderItems SalesOrderItem[]
}

model Customer {
  id        Int      @id @default(autoincrement())
  code      String   @unique
  name      String
  phone     String?
  email     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  salesOrders SalesOrder[]
}

model SalesOrder {
  id          Int      @id @default(autoincrement())
  orderNo     String   @unique
  customerId  Int
  status      String   @default("DRAFT")
  totalAmount Decimal  @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  customer Customer         @relation(fields: [customerId], references: [id])
  items    SalesOrderItem[]
}

model SalesOrderItem {
  id           Int     @id @default(autoincrement())
  salesOrderId Int
  productId    Int
  quantity     Int
  rate         Decimal
  lineTotal    Decimal

  salesOrder SalesOrder @relation(fields: [salesOrderId], references: [id])
  product    Product    @relation(fields: [productId], references: [id])
}
```

### Trainer Notes

Explain each relation:

```prisma
customer Customer @relation(fields: [customerId], references: [id])
```

This means:

"Each sales order belongs to one customer. The `customerId` field stores the customer's id."

```prisma
salesOrder SalesOrder @relation(fields: [salesOrderId], references: [id])
```

This means:

"Each sales order item belongs to one sales order."

```prisma
product Product @relation(fields: [productId], references: [id])
```

This means:

"Each sales order item refers to one product."

### Migration Command

From the `backend/` folder:

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name add_sales_orders
npx prisma generate
```

### Ask the Intern

#### Q1. Why do we run a migration after changing Prisma schema?

Expected answer:

"Because changing the Prisma schema only changes the model definition in code. The migration applies the corresponding database structure change to PostgreSQL."

#### Q2. Should migration files be committed?

Expected answer:

"Yes. Migration files should be committed so other developers can apply the same database structure."

#### Q3. Are we creating actual sales orders with this migration?

Expected answer:

"No. The migration creates the table structure. Actual sales orders are data and will be created through APIs later."

---

## 45-55 Minutes - Backend API and Frontend List-Page Design

### Trainer Script

"After the database structure exists, we need the backend to expose sales order data.

Today we only need read endpoints:

```text
GET /api/sales-orders
GET /api/sales-orders/:id
```

Order creation starts tomorrow.

The list endpoint should return useful summary information for a list page:

- Order id
- Order number
- Customer name
- Status
- Total amount
- Created date
- Number of items, if useful

The detail endpoint can return the order with customer and item details."

---

# Backend Demo

## 1. Create Sales Order Service

Create:

```text
backend/src/services/salesOrder.service.js
```

```javascript
const prisma = require('../lib/prisma');

async function getSalesOrders() {
  return prisma.salesOrder.findMany({
    orderBy: { id: 'desc' },
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true
        }
      },
      items: {
        select: {
          id: true
        }
      }
    }
  });
}

async function getSalesOrderById(id) {
  return prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
          phone: true,
          email: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true
            }
          }
        },
        orderBy: { id: 'asc' }
      }
    }
  });
}

module.exports = {
  getSalesOrders,
  getSalesOrderById
};
```

### Trainer Explanation

"This service talks to Prisma. It does not know about `req` and `res`.

The list endpoint includes customer information because the frontend should show the customer name without making a second request for every row."

---

## 2. Create Sales Order Controller

Create:

```text
backend/src/controllers/salesOrder.controller.js
```

```javascript
const salesOrderService = require('../services/salesOrder.service');

async function listSalesOrders(req, res, next) {
  try {
    const orders = await salesOrderService.getSalesOrders();

    const response = orders.map(order => ({
      id: order.id,
      orderNo: order.orderNo,
      customer: order.customer,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      itemCount: order.items.length
    }));

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function getSalesOrder(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      const error = new Error('Invalid sales order id');
      error.statusCode = 400;
      throw error;
    }

    const order = await salesOrderService.getSalesOrderById(id);

    if (!order) {
      const error = new Error('Sales order not found');
      error.statusCode = 404;
      throw error;
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listSalesOrders,
  getSalesOrder
};
```

### Trainer Explanation

"The controller handles HTTP request and response.

It also shapes the list response so the frontend gets a clean summary object."

---

## 3. Create Sales Order Routes

Create:

```text
backend/src/routes/salesOrder.routes.js
```

```javascript
const express = require('express');
const salesOrderController = require('../controllers/salesOrder.controller');

const router = express.Router();

router.get('/', salesOrderController.listSalesOrders);
router.get('/:id', salesOrderController.getSalesOrder);

module.exports = router;
```

---

## 4. Mount the Route in app.js

Update:

```text
backend/src/app.js
```

```javascript
const salesOrderRoutes = require('./routes/salesOrder.routes');

app.use('/api/sales-orders', salesOrderRoutes);
```

Example route section:

```javascript
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
```

### Trainer Explanation

"The route mount:

```javascript
app.use('/api/sales-orders', salesOrderRoutes);
```

combined with:

```javascript
router.get('/', salesOrderController.listSalesOrders);
```

creates:

```text
GET /api/sales-orders
```

The route mount and router path are combined."

---

## Backend Test URLs

Use Postman, Thunder Client, REST Client, or browser for GET requests.

```text
GET http://localhost:3000/health
GET http://localhost:3000/api/sales-orders
GET http://localhost:3000/api/sales-orders/1
```

Expected result for list endpoint when no orders exist:

```json
[]
```

Expected result for invalid id:

```text
GET /api/sales-orders/abc
```

```json
{
  "message": "Invalid sales order id"
}
```

Expected result for missing order:

```text
GET /api/sales-orders/999
```

```json
{
  "message": "Sales order not found"
}
```

---

# Frontend Demo

## 1. Create Sales Order API File

Create:

```text
frontend/src/api/salesOrderApi.js
```

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export async function getSalesOrders() {
  const response = await fetch(`${API_BASE_URL}/api/sales-orders`);
  return handleResponse(response);
}

export async function getSalesOrderById(id) {
  const response = await fetch(`${API_BASE_URL}/api/sales-orders/${id}`);
  return handleResponse(response);
}
```

### Trainer Explanation

"This keeps API call logic outside the page component.

The page should focus on UI state and rendering. The API file should focus on calling the backend."

---

## 2. Create SalesOrdersPage

Create:

```text
frontend/src/pages/SalesOrdersPage.jsx
```

```javascript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSalesOrders } from '../api/salesOrderApi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString();
}

function SalesOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSalesOrders() {
    try {
      setLoading(true);
      setError('');

      const data = await getSalesOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSalesOrders();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Sales Orders
          </h2>
          <p className="text-sm text-gray-500">
            View customer orders and track their status.
          </p>
        </div>

        <Button disabled>
          New Sales Order
        </Button>
      </div>

      <Card>
        {loading ? (
          <p className="text-sm text-gray-500">Loading sales orders...</p>
        ) : error ? (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center">
            <h3 className="text-sm font-medium text-gray-900">
              No sales orders yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Sales order creation will be added next. For today, this page is ready to display orders when they exist.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500">
                  <th className="px-3 py-2 font-medium">Order No</th>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Items</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Created</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {order.orderNo}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {order.customer?.name || '-'}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {order.itemCount}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        to={`/sales-orders/${order.id}`}
                        className="text-sm font-medium text-gray-900 underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default SalesOrdersPage;
```

### Trainer Note

The `New Sales Order` button is disabled today because creation is Day 12.

Say:

"We are intentionally showing the future action button as disabled. This helps students see where the feature will go tomorrow without mixing today's scope with tomorrow's task."

---

## 3. Add Route

Update:

```text
frontend/src/routes/AppRoutes.jsx
```

Import:

```javascript
import SalesOrdersPage from '../pages/SalesOrdersPage';
```

Add:

```javascript
<Route path="/sales-orders" element={<SalesOrdersPage />} />
```

If the project does not yet have product/customer form routes exactly as shown, keep the existing routes and only add the sales orders route.

---

## 4. Add Navigation Link

Update:

```text
frontend/src/components/layout/AppLayout.jsx
```

Add a `NavLink` for Sales Orders:

```javascript
<NavLink to="/sales-orders" className={linkClass}>
  Sales Orders
</NavLink>
```

Example navigation section:

```javascript
<nav className="flex items-center gap-2">
  <NavLink to="/" className={linkClass}>
    Dashboard
  </NavLink>

  <NavLink to="/products" className={linkClass}>
    Products
  </NavLink>

  <NavLink to="/customers" className={linkClass}>
    Customers
  </NavLink>

  <NavLink to="/sales-orders" className={linkClass}>
    Sales Orders
  </NavLink>
</nav>
```

---

## 55-60 Minutes - Assign Hands-On Work

### Trainer Script

"Your task today is to prepare the sales order foundation.

You are not creating sales orders today. You are creating the database structure, backend read endpoints, and frontend list page.

The list may be empty today. That is okay. A good empty state is part of professional UI development."

### Hands-On Assignment

Backend:

1. Update Prisma schema.
2. Add `SalesOrder` model.
3. Add `SalesOrderItem` model.
4. Add relation fields to `Customer` and `Product`.
5. Run migration.
6. Create `salesOrder.service.js`.
7. Create `salesOrder.controller.js`.
8. Create `salesOrder.routes.js`.
9. Mount routes in `app.js`.
10. Test `GET /api/sales-orders` and `GET /api/sales-orders/:id`.

Frontend:

1. Create `salesOrderApi.js`.
2. Create `SalesOrdersPage.jsx`.
3. Add `/sales-orders` route.
4. Add Sales Orders navigation link.
5. Show loading state.
6. Show error state.
7. Show empty state.
8. Display table when orders exist.

Git:

```bash
git add .
git commit -m "Add sales order schema and list page foundation"
```

---

# Afternoon Review Session - 1 Hour

## 0-10 Minutes - Intern Demo

Ask the intern to show:

1. Prisma schema changes.
2. Migration file.
3. Backend route file.
4. Backend controller file.
5. Backend service file.
6. `GET /api/sales-orders` response.
7. React Sales Orders page.
8. Empty state when there are no orders.
9. Navigation link for Sales Orders.

---

## 10-25 Minutes - Code Review

### Backend Review Checklist

Check:

- `SalesOrder` model exists.
- `SalesOrderItem` model exists.
- `Customer` has `salesOrders SalesOrder[]`.
- `Product` has `salesOrderItems SalesOrderItem[]`.
- Migration was generated.
- Migration file is committed.
- Sales order service uses Prisma.
- Controller uses `try/catch` and `next(error)`.
- Routes are mounted under `/api/sales-orders`.
- Error format remains consistent.

### Frontend Review Checklist

Check:

- `SalesOrdersPage.jsx` exists.
- API call is inside `salesOrderApi.js`.
- Page uses `useEffect` to load orders.
- Page has loading state.
- Page has error state.
- Page has empty state.
- Page uses `map` to render rows.
- Each row has a stable `key`.
- Navigation includes Sales Orders.
- `New Sales Order` is not implemented yet or is disabled.

---

## 25-40 Minutes - Debugging and Common Issues

### Common Issue 1: Prisma Relation Error

Possible cause:

Only one side of the relation was added.

Fix:

Make sure `Customer`, `Product`, `SalesOrder`, and `SalesOrderItem` have matching relation fields.

### Common Issue 2: Migration Fails

Possible causes:

- Prisma schema syntax error
- Missing relation field
- Wrong model name
- Database connection issue
- Old Prisma Client not regenerated

Fix:

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name add_sales_orders
npx prisma generate
```

### Common Issue 3: `Cannot read properties of undefined`

Possible cause:

Frontend expects `order.customer.name`, but `customer` is missing.

Fix:

```javascript
order.customer?.name || '-'
```

Also check that backend includes customer.

### Common Issue 4: API URL Is Wrong

Wrong:

```text
/api/salesOrders
/api/sales_order
/api/salesorders
```

Correct:

```text
/api/sales-orders
```

### Common Issue 5: Route Mount Creates Duplicate Path

Wrong:

```javascript
app.use('/api/sales-orders', salesOrderRoutes);
router.get('/sales-orders', salesOrderController.listSalesOrders);
```

This creates:

```text
GET /api/sales-orders/sales-orders
```

Correct:

```javascript
app.use('/api/sales-orders', salesOrderRoutes);
router.get('/', salesOrderController.listSalesOrders);
```

This creates:

```text
GET /api/sales-orders
```

### Common Issue 6: No Orders Exist, Student Thinks It Is Broken

Trainer guidance:

"If `GET /api/sales-orders` returns `[]`, that is okay today. We have not built order creation yet. The frontend should handle the empty array cleanly with an empty state."

---

## 40-55 Minutes - Review Questions with Expected Answers

### 1. What is master data?

Expected answer:

"Master data is stable business data used repeatedly, such as Products and Customers."

### 2. What is transaction data?

Expected answer:

"Transaction data records business events, such as Sales Orders, Sales Order Items, and Stock Movements."

### 3. Why does a sales order need a header table and an item table?

Expected answer:

"A sales order has information about the whole order, such as order number, customer, status, and total. It also has multiple line items. A separate item table allows one order to contain many products."

### 4. What data belongs in the sales order header?

Expected answer:

"Order number, customer id, status, total amount, created date, and updated date."

### 5. What data belongs in sales order items?

Expected answer:

"Sales order id, product id, quantity, rate, and line total."

### 6. What is a foreign key?

Expected answer:

"A foreign key connects one table to another. For example, `SalesOrder.customerId` connects a sales order to a customer."

### 7. Why is order status important?

Expected answer:

"Status tells us where the order is in the workflow. For example, DRAFT means the order is created but not confirmed. Later, CONFIRMED will mean stock has been validated and reduced."

### 8. Should stock reduce when a sales order is only created?

Expected answer:

"No. Stock should reduce only when the order is confirmed, because a draft order may still be edited or cancelled."

### 9. What should a sales order list page show?

Expected answer:

"Order number, customer, status, total amount, created date, and possibly item count."

### 10. Why should a page handle an empty state?

Expected answer:

"Because it is normal for a new system to have no records. A good empty state tells the user what is happening instead of showing a blank page."

### 11. Why should the API file be separate from the React page?

Expected answer:

"To keep API logic separate from UI rendering. This makes the page easier to read and the API calls easier to reuse."

### 12. What will we build tomorrow?

Expected answer:

"Sales order creation API and React order form, including customer selection, product line items, quantity, rate, and backend total calculation."

---

## 55-60 Minutes - Next-Day Readiness

### Trainer Closing Script

"Today we created the foundation for sales orders.

The important learning is that business transactions often need multiple related tables. A sales order is not just one record. It has a header and many items. It connects customers and products.

Tomorrow we will use this structure to create actual sales orders.

The key rule to remember is:

The frontend may help the user enter and preview data, but the backend will calculate and validate the real business values."
