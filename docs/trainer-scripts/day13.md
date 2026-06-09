# Day 13 Trainer Script — Stock Validation, Confirmation API, and Sales Order Detail Page

Fullstack Training Program

## Trainer Positioning

Day 13 is one of the most important business-logic days in the program.

Until now, interns have built:

* Master data screens and APIs
* Product and customer flows
* Sales order schema
* Sales order list page
* Sales order creation API
* Sales order create form

Today they move from simple order creation to a true business transaction.

The key message for the day:

> Creating an order is not the same as confirming an order.

A draft order records intent. A confirmed order changes business inventory.

The intern must understand that stock should not reduce when a draft order is created. Stock should reduce only when the order is confirmed, and that confirmation must be safe, validated, and auditable.

---

## Day Goal

By the end of Day 13, interns should be able to:

1. Explain why confirmation is a business action.
2. Explain why draft orders do not reduce stock.
3. Add a `StockMovement` model.
4. Run a Prisma migration.
5. Implement `POST /api/sales-orders/:id/confirm`.
6. Validate that the order is still in `DRAFT` status.
7. Validate stock before reducing stock.
8. Use a Prisma transaction.
9. Reduce product stock.
10. Create stock movement records.
11. Prevent double confirmation.
12. Build a React sales order detail page.
13. Add a Confirm Order button for draft orders.
14. Display confirmation success and failure messages.

---

## End-of-Day Deliverable

A working sales order confirmation flow:

* Backend supports `POST /api/sales-orders/:id/confirm`
* Confirmation checks stock
* Confirmation reduces product stock
* Confirmation creates stock movements
* Confirmation changes order status to `CONFIRMED`
* Confirmation is protected by a Prisma transaction
* Confirming twice is blocked
* Insufficient stock is blocked
* React detail page displays order header and items
* React detail page allows confirming draft orders
* Frontend displays useful success and error messages

Suggested commit message:

```bash
Add sales order confirmation and stock validation
```

---

# Morning Session — 1 Hour

## Suggested Timing

| Time      | Topic                                           |
| --------- | ----------------------------------------------- |
| 0–10 min  | Recap Day 12                                    |
| 10–20 min | Business meaning of order confirmation          |
| 20–30 min | Stock validation and stock movement audit trail |
| 30–40 min | Prisma transaction concept                      |
| 40–55 min | Trainer demo: backend confirmation API          |
| 55–60 min | Assign hands-on task and success criteria       |

---

## 0–10 Minutes — Recap Day 12

### Trainer Script

“Yesterday we built the sales order creation flow.

The user can select a customer, add products as line items, enter quantities and rates, and submit the order. The backend creates the order and calculates totals.

Today we are going to add the next business step: confirmation.

This is where the system decides whether the order can actually be accepted based on available stock.”

### Ask the Intern

**Q1. What did we build yesterday?**

Expected answer:

“We built sales order creation. The backend accepts customer and item details, validates them, calculates totals, and creates a draft order. The frontend has a form to create the order.”

Trainer follow-up:

“Correct. The important word is draft. Yesterday’s order was created, but not confirmed.”

---

**Q2. Why should the backend calculate totals instead of trusting the frontend?**

Expected answer:

“The frontend can be manipulated. The backend must be the source of truth for business calculations.”

Trainer follow-up:

“Correct. Today we will apply the same principle to stock. The frontend may display stock or totals, but the backend must make the final decision.”

---

**Q3. When we create a sales order, should stock reduce immediately?**

Expected answer:

“No. Stock should reduce only when the order is confirmed.”

Trainer follow-up:

“Exactly. This is the main rule for today.”

---

## 10–20 Minutes — Business Meaning of Order Confirmation

### Trainer Script

“Let us separate two actions clearly.

Creating a sales order means:

A customer wants to buy certain products.

Confirming a sales order means:

The business accepts the order and commits stock to that order.

These are not the same.

A draft order can still be changed. It may be incomplete. It may be cancelled. So the system should not reduce stock immediately when the draft is created.

Stock should reduce only when the order is confirmed.”

### Whiteboard Flow

```text
Create order
  ↓
Status = DRAFT
  ↓
No stock reduction yet
  ↓
User reviews order
  ↓
Confirm order
  ↓
Validate stock
  ↓
Reduce stock
  ↓
Create stock movement records
  ↓
Status = CONFIRMED
```

### Ask the Intern

**Q1. Why is confirmation different from creation?**

Expected answer:

“Creation records the order as a draft. Confirmation finalizes the business transaction and affects stock.”

Better answer:

“Confirmation is a business action because it triggers stock validation, stock reduction, stock movement records, and status change.”

---

**Q2. Why should draft orders not reduce stock?**

Expected answer:

“Because draft orders may still be edited or cancelled. Reducing stock before confirmation can create inaccurate inventory.”

---

**Q3. What should happen if there is not enough stock?**

Expected answer:

“The confirmation should fail. The order should remain draft, stock should not reduce, and no stock movement should be created.”

Trainer follow-up:

“Correct. Partial confirmation is not part of today’s scope. If any item fails stock validation, the whole confirmation should fail.”

---

## 20–30 Minutes — Stock Validation and Stock Movement Audit Trail

### Trainer Script

“When stock changes, the final stock number alone is not enough.

Suppose product stock changed from 100 to 98.

A user may ask:

Why did it reduce?
Which order caused it?
When did it happen?
How many units moved?

That is why we create stock movement records.”

### Explain Stock Movement

A stock movement is a history record for inventory changes.

Example:

```text
Product: Notebook
Movement Type: OUT
Quantity: 2
Reference Type: SALES_ORDER
Reference ID: 1
```

This means:

“Notebook stock reduced by 2 because Sales Order 1 was confirmed.”

### Stock Movement Types

For today, keep it simple:

| Movement Type | Meaning         |
| ------------- | --------------- |
| OUT           | Stock reduced   |
| IN            | Stock increased |

Today’s confirmation flow uses `OUT`.

### Ask the Intern

**Q1. Why do we record stock movements?**

Expected answer:

“To keep an audit trail of why stock changed.”

Better answer:

“Stock movements help us trace product stock changes back to a business event, such as sales order confirmation.”

---

**Q2. If product stock is already updated, why do we still need movement records?**

Expected answer:

“The current stock only tells the final quantity. Movement records explain the history and reason for the change.”

---

## 30–40 Minutes — Prisma Transaction Concept

### Trainer Script

“Confirmation updates multiple tables.

When we confirm an order, we need to:

1. Check the order.
2. Check product stock.
3. Reduce product stock.
4. Create stock movements.
5. Update order status.

These steps must succeed together.

If product stock reduces but order status does not change, the database becomes inconsistent.

If order status changes but stock does not reduce, the database is also wrong.

So we use a transaction.”

### Simple Explanation

“A transaction means all or nothing.

If every step succeeds, the database saves the changes.

If any step fails, the database rolls everything back.”

### Prisma Transaction Example

```js
await prisma.$transaction(async (tx) => {
  // Step 1
  // Step 2
  // Step 3
});
```

### Ask the Intern

**Q1. Why use a database transaction during confirmation?**

Expected answer:

“Because confirmation updates multiple records. A transaction ensures all changes succeed together or none are saved.”

---

**Q2. What could go wrong if we do not use a transaction?**

Expected answer:

“Stock may reduce without order status changing, or order status may change without stock reducing. This creates inconsistent business data.”

---

## 40–55 Minutes — Trainer Demo: Backend Confirmation API

### Part A — Prisma Schema Update

Open:

`backend/prisma/schema.prisma`

Add:

```prisma
model StockMovement {
  id            Int      @id @default(autoincrement())
  productId     Int
  product       Product  @relation(fields: [productId], references: [id])
  movementType  String
  quantity      Int
  referenceType String?
  referenceId   Int?
  createdAt     DateTime @default(now())
}
```

Update `Product` if needed:

```prisma
model Product {
  id              Int              @id @default(autoincrement())
  sku             String           @unique
  name            String
  price           Decimal
  stockQty        Int              @default(0)
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  salesOrderItems SalesOrderItem[]
  stockMovements  StockMovement[]
}
```

### Trainer Explanation

“Product already stores the current stock quantity.

StockMovement stores the reason behind stock changes.

The two are related through `productId`.”

### Ask

**Q. Is StockMovement master data or transaction data?**

Expected answer:

“Transaction data, because it records an inventory event.”

---

### Part B — Run Migration

From `backend`:

```bash
npx prisma migrate dev --name add_stock_movements
```

Then:

```bash
npx prisma generate
```

### Trainer Explanation

“This migration changes the database structure by adding the stock movement table.”

---

### Part C — Service Function

Open:

`backend/src/services/salesOrder.service.js`

Add:

```js
async function confirmSalesOrder(id) {
  const orderId = Number(id);

  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      const error = new Error('Sales order not found');
      error.statusCode = 404;
      throw error;
    }

    if (order.status !== 'DRAFT') {
      const error = new Error('Only draft orders can be confirmed');
      error.statusCode = 400;
      throw error;
    }

    if (!order.items || order.items.length === 0) {
      const error = new Error('Cannot confirm an order without items');
      error.statusCode = 400;
      throw error;
    }

    for (const item of order.items) {
      if (item.quantity <= 0) {
        const error = new Error('Order item quantity must be greater than zero');
        error.statusCode = 400;
        throw error;
      }

      if (!item.product) {
        const error = new Error('Order item product not found');
        error.statusCode = 400;
        throw error;
      }

      if (item.product.stockQty < item.quantity) {
        const error = new Error(
          `Insufficient stock for product ${item.product.name}`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQty: {
            decrement: item.quantity
          }
        }
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          movementType: 'OUT',
          quantity: item.quantity,
          referenceType: 'SALES_ORDER',
          referenceId: order.id
        }
      });
    }

    const confirmedOrder = await tx.salesOrder.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED'
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return confirmedOrder;
  });
}
```

Export it:

```js
module.exports = {
  // existing exports
  confirmSalesOrder
};
```

### Explain the Flow

Walk through line by line:

1. Convert route parameter to number.
2. Start transaction.
3. Find the order with items and products.
4. Reject invalid order ID.
5. Reject non-draft order.
6. Reject order without items.
7. Validate stock for every item.
8. Reduce stock for every item.
9. Create stock movement for every item.
10. Update order status to confirmed.
11. Return updated order.

### Ask

**Q. Why do we check stock before reducing stock?**

Expected answer:

“Because if any item has insufficient stock, confirmation should fail before changing anything.”

---

**Q. Why do we check all items first instead of reducing stock one by one immediately?**

Expected answer:

“To avoid partially reducing stock before discovering another item has insufficient stock.”

Trainer note:

“The transaction also protects us, but validating first makes the business flow clearer.”

---

### Part D — Controller Update

Open:

`backend/src/controllers/salesOrder.controller.js`

Add:

```js
async function confirmSalesOrder(req, res, next) {
  try {
    const order = await salesOrderService.confirmSalesOrder(req.params.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
}
```

Export it:

```js
module.exports = {
  // existing exports
  confirmSalesOrder
};
```

### Ask

**Q. Why does the controller use try/catch?**

Expected answer:

“Because the service may throw validation errors, and the controller should pass them to the error handler using `next(error)`.”

---

### Part E — Route Update

Open:

`backend/src/routes/salesOrder.routes.js`

Add:

```js
router.post('/:id/confirm', salesOrderController.confirmSalesOrder);
```

Full example:

```js
const express = require('express');
const salesOrderController = require('../controllers/salesOrder.controller');

const router = express.Router();

router.get('/', salesOrderController.listSalesOrders);
router.get('/:id', salesOrderController.getSalesOrder);
router.post('/', salesOrderController.createSalesOrder);
router.post('/:id/confirm', salesOrderController.confirmSalesOrder);

module.exports = router;
```

### Ask

**Q. Why is `/confirm` acceptable here? Is it RESTful?**

Expected answer:

“Yes. Confirmation is a business action, not just a simple field update. It validates stock, reduces stock, creates stock movements, and changes order status.”

---

## 55–60 Minutes — Assign Hands-On Work

### Trainer Script

“Your hands-on task is to complete the confirmation flow.

Do not only change the status. The confirmation must validate stock, reduce stock, create movement records, and block repeated confirmation.

After the backend works, create the React detail page and connect the Confirm Order button.”

### Hands-On Assignment

Backend:

* Add `StockMovement` model.
* Run migration.
* Implement `confirmSalesOrder`.
* Add controller function.
* Add route.
* Test using API client.

Frontend:

* Add `getSalesOrder`.
* Add `confirmSalesOrder`.
* Create `SalesOrderDetailPage`.
* Add route `/sales-orders/:id`.
* Add detail link from sales orders list.
* Show Confirm Order button only for `DRAFT` orders.
* Show success and error messages.

---

# Afternoon Review Session — 1 Hour

## Suggested Timing

| Time      | Topic                |
| --------- | -------------------- |
| 0–10 min  | Intern demo          |
| 10–25 min | Backend code review  |
| 25–40 min | Frontend code review |
| 40–50 min | Business rule review |
| 50–55 min | Git and cleanup      |
| 55–60 min | Day 14 preview       |

---

## 0–10 Minutes — Intern Demo

Ask the intern to show:

1. Prisma schema update.
2. Migration file.
3. Confirmation endpoint in API client.
4. Product stock before confirmation.
5. Successful confirmation.
6. Product stock after confirmation.
7. Stock movement record.
8. Attempt to confirm again.
9. Insufficient stock error.
10. React sales order detail page.
11. Confirm Order button.
12. Frontend success/error message.

---

## 10–25 Minutes — Backend Code Review

Use this checklist.

### Prisma Schema

Check:

* `StockMovement` model exists.
* `productId` relation exists.
* `movementType` exists.
* `quantity` exists.
* `referenceType` exists.
* `referenceId` exists.
* `createdAt` exists.

Ask:

**Q. Why does StockMovement have `referenceType` and `referenceId`?**

Expected answer:

“To identify the business event that caused the stock movement. Today it points to a sales order.”

---

### Confirmation Service

Check:

* Order is loaded with items and products.
* Missing order returns 404.
* Non-draft order returns 400.
* Empty order is blocked.
* Insufficient stock is blocked.
* Product stock uses `decrement`.
* Stock movement is created.
* Order status changes to `CONFIRMED`.
* Function uses `prisma.$transaction`.

Ask:

**Q. Why should the service contain confirmation logic instead of the route file?**

Expected answer:

“Because confirmation is business logic. The route should only map the endpoint to the controller.”

---

### Error Handling

Check:

* Errors include `statusCode`.
* Controller passes errors to `next(error)`.
* Frontend receives predictable error response.

Ask:

**Q. What should the frontend display if stock is insufficient?**

Expected answer:

“A clear error message returned from the backend, such as ‘Insufficient stock for product Notebook’.”

---

## 25–40 Minutes — Frontend Code Review

Check:

* `SalesOrderDetailPage` exists.
* Route `/sales-orders/:id` exists.
* Sales order list links to detail page.
* Detail page loads order by ID.
* Loading state exists.
* Error state exists.
* Order header is shown.
* Order items are shown.
* Confirm button appears only for draft orders.
* Confirm button is disabled while confirming.
* Success message is shown after confirmation.
* Error message is shown if confirmation fails.
* Order state updates after confirmation.

Ask:

**Q. Why should the Confirm Order button not appear for confirmed orders?**

Expected answer:

“Because confirmed orders should not be confirmed again. Showing the button would allow a confusing or invalid action.”

---

Ask:

**Q. Why should the frontend refresh or update order data after confirmation?**

Expected answer:

“Because the order status changes from DRAFT to CONFIRMED, and the UI should show the latest backend state.”

---

## 40–50 Minutes — Business Rule Review

Ask the following questions.

### Question 1

**Why is confirmation different from creation?**

Expected answer:

“Creation saves a draft order. Confirmation validates stock, reduces inventory, creates stock movement records, and changes the order status.”

---

### Question 2

**Why use a database transaction?**

Expected answer:

“Because confirmation changes multiple records. The transaction ensures all changes succeed together or none are saved.”

---

### Question 3

**What is idempotency?**

Expected answer:

“Idempotency means repeating the same operation should not produce extra unintended effects.”

Trainer explanation:

“In our case, confirming the same order twice should not reduce stock twice. We block the second confirmation because the order is no longer `DRAFT`.”

---

### Question 4

**Why record stock movements?**

Expected answer:

“To maintain an audit trail of stock changes and know which business transaction caused each stock change.”

---

### Question 5

**How should the frontend respond to confirmation failure?**

Expected answer:

“It should show the backend error message clearly and keep the order unchanged.”

---

## 50–55 Minutes — Git and Cleanup

Ask the intern to run:

```bash
git status
```

Check:

* No unwanted files are staged.
* `.env` is not committed.
* Migration file is committed.
* Prisma schema is committed.
* Backend service/controller/route changes are committed.
* Frontend page/API/route changes are committed.

Suggested commit:

```bash
git add .
git commit -m "Add sales order confirmation and stock validation"
```

---

## 55–60 Minutes — Day 14 Preview

### Trainer Script

“Today we added important business rules.

Tomorrow we will start testing business logic.

The reason is simple: confirmation is too important to trust only by manual testing.

We will test small functions and rules such as:

* Line total calculation
* Order total calculation
* Invalid quantity
* Invalid rate
* Draft-only confirmation rule
* Whether an order can be confirmed

This is how real teams protect business logic from future bugs.”

---

# Trainer Notes

## Keep Emphasizing

* Draft order does not reduce stock.
* Confirmed order reduces stock.
* Backend is the source of truth.
* Frontend should not decide stock changes.
* Confirmation is a business action.
* Stock movement is audit history.
* Transaction protects consistency.
* Confirming twice must not reduce stock twice.

---

## Common Mistakes to Watch For

### Mistake 1 — Only changing status

Bad:

```js
await prisma.salesOrder.update({
  where: { id },
  data: { status: 'CONFIRMED' }
});
```

Why wrong:

* Stock is not validated.
* Stock is not reduced.
* Stock movement is not recorded.

---

### Mistake 2 — Reducing stock before checking all items

Risk:

One product stock may reduce before another product fails validation.

Better:

Validate all items first, then perform updates inside a transaction.

---

### Mistake 3 — Allowing confirmed orders to confirm again

Risk:

Stock reduces multiple times.

Fix:

```js
if (order.status !== 'DRAFT') {
  throw new Error('Only draft orders can be confirmed');
}
```

---

### Mistake 4 — Frontend assumes confirmation success

Bad:

```js
setOrder({ ...order, status: 'CONFIRMED' });
```

Better:

Use backend response:

```js
const updatedOrder = await confirmSalesOrder(id);
setOrder(updatedOrder);
```

---

### Mistake 5 — No stock movement records

Risk:

No audit trail for inventory changes.

Fix:

Create a `StockMovement` record for every product stock reduction.

---

# Assessment Rubric

| Area                     | Expected Evidence                                         |
| ------------------------ | --------------------------------------------------------- |
| Business understanding   | Intern explains draft vs confirmed order                  |
| Stock validation         | Insufficient stock is blocked                             |
| Confirmation safety      | Confirming twice is blocked                               |
| Database consistency     | Prisma transaction is used                                |
| Audit trail              | Stock movement records are created                        |
| Backend structure        | Route, controller, and service responsibilities are clear |
| Frontend detail page     | Order header and items are displayed                      |
| Frontend action handling | Confirm button works and shows success/error              |
| Git workflow             | Changes are committed cleanly                             |

---

# Safe Trainer Closing Script

“Today we completed one of the most realistic parts of the Mini Business Operations App.

The app can now create a sales order, confirm it, validate stock, reduce stock, and record stock movement history.

This is no longer just CRUD. This is business workflow implementation.

Tomorrow we will begin testing these rules so that future changes do not accidentally break stock validation or confirmation behavior.”
