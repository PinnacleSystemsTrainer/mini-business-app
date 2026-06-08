# Day 12 Trainer Script — Sales Order Creation API and React Order Form

Fullstack Training Program

## Trainer Positioning

Day 12 is the first day where the Mini Business Operations App starts behaving like a real business workflow.

Until now, students have built:

- Product master data
- Customer master data
- Sales order schema
- Sales order list foundation
- React pages for listing master and transaction data
- Backend APIs connected to PostgreSQL through Prisma

Today, students will create a sales order with multiple line items.

This is more complex than creating a product or customer because a sales order has:

- A customer
- One or more line items
- Product selection per line
- Quantity per line
- Rate per line
- Line total calculation
- Order total calculation
- Backend validation
- Frontend form state for dynamic rows

The main teaching point for Day 12:

The frontend can help the user enter and preview the order, but the backend must validate and calculate the real totals.

Day 12 should not reduce stock yet. Stock reduction happens only when an order is confirmed, which is Day 13.

## Day Goal

By the end of Day 12, students should be able to:

1. Explain why sales order creation is more complex than product or customer creation.
2. Explain the difference between order header data and line item data.
3. Implement `POST /api/sales-orders`.
4. Validate that the selected customer exists.
5. Validate that the order has at least one item.
6. Validate that each selected product exists.
7. Validate that quantity is greater than zero.
8. Validate that rate is greater than zero.
9. Calculate line totals in the backend.
10. Calculate order total in the backend.
11. Create a sales order and related sales order items using Prisma.
12. Build a React sales order creation page.
13. Load customers and products into dropdowns.
14. Add and remove item rows in React state.
15. Submit the order from React to the backend.
16. Navigate to the sales order detail or list page after creation.

## End-of-Day Deliverable

A working sales order creation flow:

- `POST /api/sales-orders` works from an API client.
- React `SalesOrderCreatePage` exists.
- User can select a customer.
- User can add one or more line items.
- User can select products.
- User can enter quantity and rate.
- Frontend displays approximate line totals and order total.
- Backend calculates and saves the real totals.
- Order is saved with status `DRAFT`.
- User can navigate after successful save.

Suggested commit message:

    Add sales order creation API and React order form

---

# Morning Session — 1 Hour

## Suggested Timing

| Time | Topic |
|---|---|
| 0–10 min | Recap Day 11 |
| 10–20 min | Sales order creation business flow |
| 20–30 min | Backend validation and total calculation |
| 30–42 min | Backend API design and Prisma create flow |
| 42–55 min | React dynamic line item form |
| 55–60 min | Assign hands-on task and success criteria |

---

## 0–10 Minutes — Recap Day 11

### Trainer Script

“Yesterday we created the sales order foundation.

We added the sales order data model. We learned that a sales order is transaction data, not master data.

Products and customers are master data. They are relatively stable records.

A sales order is transaction data because it records a business activity: a customer placing an order.

We also created the sales order list foundation. Today, we will create new sales orders from both the backend API and the React frontend.”

### Ask the Students

#### Q1. What is the difference between master data and transaction data?

Expected answer:

“Master data is relatively stable business data, such as products and customers. Transaction data records business activity, such as sales orders and stock movements.”

Trainer follow-up:

“Correct. A product may exist for a long time, but a sales order records a specific event.”

#### Q2. Why does a sales order need a customer?

Expected answer:

“Because an order belongs to a customer. We need to know who placed the order and keep the customer relationship for history, display, and business tracking.”

#### Q3. Why do sales orders need line items?

Expected answer:

“Because one order can contain multiple products. Each product in the order needs its own quantity, rate, and line total.”

#### Q4. What status should a newly created order have?

Expected answer:

“A newly created order should usually start as `DRAFT`.”

Trainer explanation:

“Correct. A draft order has been created, but it has not yet affected stock. Stock should reduce only when the order is confirmed.”

#### Q5. Should stock reduce today when the order is created?

Expected answer:

“No. Stock should not reduce during order creation. Stock reduction happens during confirmation.”

Trainer explanation:

“Correct. Today we create draft orders. Tomorrow we will confirm orders, validate stock, reduce stock, and create stock movement records.”

---

## 10–20 Minutes — Sales Order Creation Business Flow

### Trainer Script

“Let us understand what happens when a user creates a sales order.

The user chooses a customer.

Then the user adds one or more line items.

Each line item has:

- Product
- Quantity
- Rate

The frontend may show a preview:

quantity × rate = line total

The frontend may also show the order total by adding all line totals.

But the backend must calculate the real total again.

Why?

Because users can change frontend data using browser tools or manual API requests. The backend protects the real business data.”

### Business Flow Diagram

Show this on the board:

    User opens Sales Order Create page
        ↓
    Frontend loads customers
        ↓
    Frontend loads products
        ↓
    User selects customer
        ↓
    User adds line items
        ↓
    Frontend shows approximate totals
        ↓
    User submits order
        ↓
    Backend validates customer and products
        ↓
    Backend validates quantity and rate
        ↓
    Backend calculates line totals
        ↓
    Backend calculates order total
        ↓
    Backend saves SalesOrder and SalesOrderItems
        ↓
    Backend returns created order

### Ask the Students

#### Q1. Why should the frontend show approximate totals?

Expected answer:

“To improve user experience. The user can see what they are entering before saving.”

#### Q2. Why should the backend calculate totals again?

Expected answer:

“Because the backend is the source of truth. Frontend values can be changed or bypassed, so backend validation and calculation protect the database.”

#### Q3. Should the request body include `totalAmount` from the frontend?

Expected answer:

“No. The frontend should send customer and item details. The backend should calculate `lineTotal` and `totalAmount`.”

Trainer explanation:

“Exactly. We do not trust totals sent from the frontend. We calculate them in the backend.”

---

## 20–30 Minutes — Backend Validation and Total Calculation

### Trainer Script

“Sales order creation has more validation than product creation.

For a product, we checked fields like SKU, name, price, and stock quantity.

For a sales order, we must validate the full relationship.

Business rules for Day 12:

- Customer must exist.
- Order must have at least one item.
- Each product must exist.
- Quantity must be greater than zero.
- Rate must be greater than zero.
- Backend calculates line total.
- Backend calculates order total.
- New order status should be `DRAFT`.
- Stock should not reduce yet.”

### Validation Table

| Rule | Why It Matters |
|---|---|
| Customer must exist | An order cannot belong to a missing customer |
| At least one item required | An empty order is not meaningful |
| Product must exist | Cannot order a product that is not in the system |
| Quantity > 0 | Zero or negative quantity is invalid |
| Rate > 0 | Zero or negative rate is invalid for this training flow |
| Backend calculates totals | Prevents trusting manipulated frontend totals |
| Status starts as DRAFT | Stock should not reduce until confirmation |

### Demo Business Functions

Explain that these can live inside `salesOrder.service.js` or helper files.

    function calculateLineTotal(quantity, rate) {
      return Number(quantity) * Number(rate);
    }

    function calculateOrderTotal(items) {
      return items.reduce((sum, item) => {
        return sum + calculateLineTotal(item.quantity, item.rate);
      }, 0);
    }

### Ask the Students

#### Q1. What should happen if the order has no items?

Expected answer:

“The backend should reject the request with a validation error.”

Suggested response:

    {
      "message": "Order must have at least one item"
    }

#### Q2. What should happen if a product ID is invalid?

Expected answer:

“The backend should reject the request because the product does not exist.”

#### Q3. Why should the backend check quantity and rate?

Expected answer:

“Because frontend validation can be bypassed. Backend validation protects the actual database.”

#### Q4. What should the backend calculate?

Expected answer:

“The backend should calculate each line total and the final order total.”

---

## 30–42 Minutes — Backend API Design and Prisma Create Flow

### Trainer Script

“Today we will implement one main endpoint:

    POST /api/sales-orders

This endpoint creates an order header and its line items.

The request should include only the data needed to create the order.

The frontend should send:

- customerId
- items
  - productId
  - quantity
  - rate

The frontend should not send trusted totals.”

### Request Shape

    {
      "customerId": 1,
      "items": [
        {
          "productId": 1,
          "quantity": 2,
          "rate": 50
        },
        {
          "productId": 2,
          "quantity": 3,
          "rate": 10
        }
      ]
    }

### Expected Backend Behavior

The backend should:

1. Read `customerId` and `items` from `req.body`.
2. Check that the customer exists.
3. Check that `items` is a non-empty array.
4. Check each item.
5. Check that each product exists.
6. Calculate line totals.
7. Calculate order total.
8. Generate an order number.
9. Create the sales order with status `DRAFT`.
10. Create related sales order items.
11. Return the created order.

### Suggested Response Shape

    {
      "id": 1,
      "orderNo": "SO-0001",
      "customerId": 1,
      "status": "DRAFT",
      "totalAmount": "130",
      "items": [
        {
          "id": 1,
          "productId": 1,
          "quantity": 2,
          "rate": "50",
          "lineTotal": "100"
        },
        {
          "id": 2,
          "productId": 2,
          "quantity": 3,
          "rate": "10",
          "lineTotal": "30"
        }
      ]
    }

### Suggested Backend Files

Expected files:

    backend/
      src/
        routes/
          salesOrder.routes.js
        controllers/
          salesOrder.controller.js
        services/
          salesOrder.service.js
        lib/
          prisma.js

### Controller Example

    const salesOrderService = require('../services/salesOrder.service');

    async function createSalesOrder(req, res, next) {
      try {
        const salesOrder = await salesOrderService.createSalesOrder(req.body);
        res.status(201).json(salesOrder);
      } catch (error) {
        next(error);
      }
    }

    module.exports = {
      createSalesOrder
    };

### Route Example

    const express = require('express');
    const salesOrderController = require('../controllers/salesOrder.controller');

    const router = express.Router();

    router.post('/', salesOrderController.createSalesOrder);

    module.exports = router;

### App Route Mounting

In `backend/src/app.js`:

    const salesOrderRoutes = require('./routes/salesOrder.routes');

    app.use('/api/sales-orders', salesOrderRoutes);

### Service Example

Use this as a teaching example. Adjust field names if the existing Prisma schema differs.

    const prisma = require('../lib/prisma');

    function calculateLineTotal(quantity, rate) {
      return Number(quantity) * Number(rate);
    }

    function validateOrderInput(data) {
      if (!data.customerId) {
        const error = new Error('Customer is required');
        error.statusCode = 400;
        throw error;
      }

      if (!Array.isArray(data.items) || data.items.length === 0) {
        const error = new Error('Order must have at least one item');
        error.statusCode = 400;
        throw error;
      }

      data.items.forEach((item, index) => {
        if (!item.productId) {
          const error = new Error(`Product is required for item ${index + 1}`);
          error.statusCode = 400;
          throw error;
        }

        if (Number(item.quantity) <= 0) {
          const error = new Error(`Quantity must be greater than zero for item ${index + 1}`);
          error.statusCode = 400;
          throw error;
        }

        if (Number(item.rate) <= 0) {
          const error = new Error(`Rate must be greater than zero for item ${index + 1}`);
          error.statusCode = 400;
          throw error;
        }
      });
    }

    async function generateOrderNo() {
      const count = await prisma.salesOrder.count();
      return `SO-${String(count + 1).padStart(4, '0')}`;
    }

    async function createSalesOrder(data) {
      validateOrderInput(data);

      const customer = await prisma.customer.findUnique({
        where: {
          id: Number(data.customerId)
        }
      });

      if (!customer) {
        const error = new Error('Customer not found');
        error.statusCode = 400;
        throw error;
      }

      const productIds = data.items.map(item => Number(item.productId));

      const products = await prisma.product.findMany({
        where: {
          id: {
            in: productIds
          },
          isActive: true
        }
      });

      if (products.length !== productIds.length) {
        const error = new Error('One or more products are invalid');
        error.statusCode = 400;
        throw error;
      }

      const orderItems = data.items.map(item => {
        const quantity = Number(item.quantity);
        const rate = Number(item.rate);

        return {
          productId: Number(item.productId),
          quantity,
          rate,
          lineTotal: calculateLineTotal(quantity, rate)
        };
      });

      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + Number(item.lineTotal);
      }, 0);

      const orderNo = await generateOrderNo();

      return prisma.salesOrder.create({
        data: {
          orderNo,
          customerId: Number(data.customerId),
          status: 'DRAFT',
          totalAmount,
          items: {
            create: orderItems
          }
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
    }

    module.exports = {
      createSalesOrder,
      calculateLineTotal
    };

### Trainer Notes About the Service Example

Explain clearly:

- `validateOrderInput` checks basic input shape.
- Customer existence is checked using Prisma.
- Product existence is checked using Prisma.
- `lineTotal` is calculated in the backend.
- `totalAmount` is calculated in the backend.
- The order is created with nested `items.create`.
- The order starts as `DRAFT`.
- There is no stock reduction today.

### Important Discussion: Order Number Generation

Trainer Script:

“For training simplicity, we are generating the order number from the current count.

This is acceptable for local learning.

In a real production system, order number generation must be more careful because two users may create orders at the same time. Production systems may use database sequences, locking, or a dedicated numbering table.

For this training program, the main goal is to understand the sales order creation flow.”

### Ask the Students

#### Q1. What does `items.create` do in Prisma?

Expected answer:

“It creates related sales order item records while creating the sales order.”

#### Q2. Why do we include customer and product data in the response?

Expected answer:

“So the frontend can display meaningful names and details without making extra API calls immediately.”

#### Q3. Why is status set to `DRAFT`?

Expected answer:

“Because the order is created but not confirmed yet. Stock should reduce only during confirmation.”

---

## 42–55 Minutes — React Dynamic Line Item Form

### Trainer Script

“Now we will look at the frontend.

Sales order form state is more complex than product or customer form state.

A product form has simple fields like SKU, name, price, and stock.

A sales order form has:

- One customer
- Many item rows
- Each row has product, quantity, and rate
- Rows can be added
- Rows can be removed
- Totals are derived from the rows

This is why we store line items as an array in React state.”

### React State Shape

    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState([
      { productId: '', quantity: 1, rate: '' }
    ]);

### Why an Array?

Trainer Script:

“We use an array because the user can add multiple products to the same order.

Each object in the array represents one order line.”

### Example Item Object

    {
      productId: '1',
      quantity: 2,
      rate: 50
    }

### Derived Line Total

    function calculateLineTotal(item) {
      return Number(item.quantity || 0) * Number(item.rate || 0);
    }

### Derived Order Total

    const orderTotal = items.reduce((sum, item) => {
      return sum + calculateLineTotal(item);
    }, 0);

### Important Teaching Point

Trainer Script:

“These frontend calculations are for display only.

They help the user understand the form.

But the backend will calculate totals again before saving.”

### Add Item Row

    function addItemRow() {
      setItems(prev => [
        ...prev,
        { productId: '', quantity: 1, rate: '' }
      ]);
    }

### Remove Item Row

    function removeItemRow(indexToRemove) {
      setItems(prev => prev.filter((item, index) => index !== indexToRemove));
    }

### Update Item Row

    function updateItem(indexToUpdate, field, value) {
      setItems(prev =>
        prev.map((item, index) => {
          if (index !== indexToUpdate) {
            return item;
          }

          return {
            ...item,
            [field]: value
          };
        })
      );
    }

### Ask the Students

#### Q1. Why do we use `map` to update an item row?

Expected answer:

“Because we need to create a new array where only one item is changed and the other rows remain the same.”

#### Q2. Why should we avoid directly mutating the `items` array?

Expected answer:

“React state should be updated immutably. Creating a new array helps React detect the change and re-render.”

#### Q3. Why do we use `filter` to remove a row?

Expected answer:

“Because `filter` creates a new array without the row we want to remove.”

#### Q4. Is the frontend total the final trusted total?

Expected answer:

“No. It is only a preview. The backend calculates the trusted total.”

---

## 55–60 Minutes — Assign Hands-On Task

### Trainer Script

“Your task today is to implement sales order creation from both backend and frontend.

Start with the backend API. Test it using Postman, Thunder Client, or REST Client.

After the backend works, build the React form.

Do not implement stock reduction today. The order should be created as `DRAFT`.

Tomorrow we will implement confirmation, stock validation, stock movement records, and prevent double confirmation.”

### Hands-On Assignment

Backend:

1. Add or verify `POST /api/sales-orders`.
2. Validate customer.
3. Validate at least one item.
4. Validate products.
5. Validate quantity and rate.
6. Calculate line totals.
7. Calculate order total.
8. Save `SalesOrder` and `SalesOrderItem` records.
9. Return created order with customer and item details.

Frontend:

1. Create `SalesOrderCreatePage.jsx`.
2. Add route `/sales-orders/new`.
3. Add navigation or button from Sales Orders page to create page.
4. Load customers.
5. Load products.
6. Show customer dropdown.
7. Show line item rows.
8. Allow adding item rows.
9. Allow removing item rows.
10. Show approximate line totals.
11. Show approximate order total.
12. Submit order to backend.
13. Show loading and error states.
14. Navigate after successful creation.

Success criteria:

- API creates a draft sales order.
- API calculates total in backend.
- React form creates an order.
- Line item rows can be added and removed.
- Frontend does not send trusted total.
- Order appears in sales order list after creation.
- Code is committed.

---

# Afternoon Review Session — 1 Hour

## Suggested Timing

| Time | Topic |
|---|---|
| 0–10 min | Student demo |
| 10–25 min | Backend review |
| 25–40 min | Frontend review |
| 40–50 min | Debugging and edge cases |
| 50–60 min | Recap and next-day preview |

---

## 0–10 Minutes — Student Demo

Ask the student to demonstrate:

1. Backend server running.
2. `POST /api/sales-orders` from API client.
3. Successful order creation.
4. Failed request with missing customer.
5. Failed request with empty items.
6. React sales order create page.
7. Customer dropdown.
8. Product dropdowns.
9. Add item row.
10. Remove item row.
11. Display approximate total.
12. Submit order from React.
13. Navigate after save.
14. Sales order appears in list.

---

## 10–25 Minutes — Backend Review

### Review Checklist

Check the following:

- Is the route correctly mounted as `/api/sales-orders`?
- Is `POST /api/sales-orders` implemented?
- Is the controller thin?
- Is business logic in the service?
- Does validation happen in the backend?
- Does the backend check customer existence?
- Does the backend check product existence?
- Does the backend reject empty item arrays?
- Does the backend reject invalid quantity?
- Does the backend reject invalid rate?
- Does the backend calculate line total?
- Does the backend calculate total amount?
- Does the created order start as `DRAFT`?
- Does the backend avoid reducing stock today?

### Ask the Student

#### Q1. Why should the controller stay thin?

Expected answer:

“The controller should handle request and response. Business logic should stay in the service so it is easier to test, reuse, and maintain.”

#### Q2. Why should the service not trust frontend totals?

Expected answer:

“Because users can manipulate frontend values or call the API manually. The backend must calculate the real totals.”

#### Q3. What happens if product ID is invalid?

Expected answer:

“The backend should return a validation error and should not create the order.”

#### Q4. What should be the status of a newly created order?

Expected answer:

“`DRAFT`.”

#### Q5. Should stock reduce when a draft order is created?

Expected answer:

“No. Stock reduction should happen only when the order is confirmed.”

---

## 25–40 Minutes — Frontend Review

### Review Checklist

Check the following:

- Does `SalesOrderCreatePage.jsx` exist?
- Is the route `/sales-orders/new` configured?
- Can the user reach the create page?
- Are customers loaded from backend?
- Are products loaded from backend?
- Is customer selection controlled by state?
- Are line items stored as an array?
- Can the user update product, quantity, and rate per row?
- Can the user add a row?
- Can the user remove a row?
- Is approximate line total displayed?
- Is approximate order total displayed?
- Does submit call the backend?
- Is there a loading state?
- Is there an error state?
- Does the page navigate after success?

### Ask the Student

#### Q1. How do we represent multiple line items in React state?

Expected answer:

“As an array of item objects, where each object contains productId, quantity, and rate.”

Example:

    [
      { productId: '1', quantity: 2, rate: 50 },
      { productId: '2', quantity: 3, rate: 10 }
    ]

#### Q2. Why do we need `map` when updating item rows?

Expected answer:

“To create a new array where only the selected row is updated.”

#### Q3. Why do we need `filter` when removing item rows?

Expected answer:

“To create a new array excluding the removed row.”

#### Q4. Why is frontend validation still useful if backend validation is required?

Expected answer:

“Frontend validation gives faster feedback and improves user experience. Backend validation protects the real data.”

#### Q5. What should happen after save succeeds?

Expected answer:

“The app should navigate to the sales order detail page or sales order list page and show the created order.”

---

## 40–50 Minutes — Debugging and Edge Cases

Discuss common bugs.

### Bug 1: Product Dropdown Does Not Show Products

Possible causes:

- Product API is not running.
- `VITE_API_BASE_URL` is wrong.
- Product API function path is wrong.
- Products state is not set after fetch.
- Error is swallowed silently.

Trainer prompt:

“Check the browser console and network tab. Do not guess blindly.”

### Bug 2: Customer Dropdown Is Empty

Possible causes:

- No customers exist in database.
- Customer API is not implemented correctly.
- API response shape is different from what frontend expects.
- Frontend is using wrong property names.

### Bug 3: Line Total Shows NaN

Possible causes:

- Quantity is an empty string.
- Rate is an empty string.
- Number conversion is missing.
- Calculation does not handle blank values.

Suggested safe frontend calculation:

    function calculateLineTotal(item) {
      const quantity = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      return quantity * rate;
    }

### Bug 4: Backend Saves Wrong Total

Possible causes:

- Values are not converted to numbers.
- Decimal handling is inconsistent.
- Frontend total is being trusted.
- Items array is not being mapped correctly.

Trainer reminder:

“The backend total should be calculated from backend-validated item values.”

### Bug 5: Order Is Created Without Items

Possible cause:

- Backend validation only checks if `items` exists, not whether it is a non-empty array.

Correct check:

    if (!Array.isArray(data.items) || data.items.length === 0) {
      const error = new Error('Order must have at least one item');
      error.statusCode = 400;
      throw error;
    }

### Bug 6: Stock Reduces During Creation

Trainer correction:

“Remove that logic from Day 12. Stock must not reduce during order creation. Stock reduction belongs to order confirmation on Day 13.”

---

## 50–60 Minutes — Recap and Next-Day Preview

### Recap Questions

#### Q1. What did we build today?

Expected answer:

“We built sales order creation from backend and frontend. The backend creates sales orders and line items. The frontend provides a form to select customer, products, quantities, and rates.”

#### Q2. What does the backend calculate?

Expected answer:

“The backend calculates line totals and order total.”

#### Q3. What does the frontend calculate?

Expected answer:

“The frontend calculates approximate totals for display only.”

#### Q4. Why does the new order start as `DRAFT`?

Expected answer:

“Because it has not been confirmed yet and should not affect stock.”

#### Q5. What will we build tomorrow?

Expected answer:

“Sales order detail page, confirmation API, stock validation, stock reduction, and stock movement records.”

### Trainer Closing Script

“Today’s work is a major step in the Mini Business Operations App.

Products and customers are master data. Sales orders are real transaction data.

You now created a transaction with a header and multiple line items.

The important rule to remember is:

The frontend helps the user enter the order.
The backend protects the business data.

Tomorrow, we will take the next step. We will confirm a draft order. Confirmation will validate stock, reduce product stock quantity, prevent double confirmation, and record stock movement history.”

---

# Day 12 Assessment Rubric

| Area | Expected Evidence |
|---|---|
| Sales order understanding | Student can explain order header and line items |
| Backend API | `POST /api/sales-orders` works |
| Backend validation | Customer, products, quantity, rate, and items are validated |
| Backend calculation | Line totals and order total are calculated in backend |
| Prisma usage | SalesOrder and SalesOrderItem records are created correctly |
| React form state | Student uses customer state and item array state |
| Dynamic rows | Student can add, update, and remove item rows |
| API integration | React form submits to backend successfully |
| Error handling | Backend and frontend show useful errors |
| Business boundary | Student understands stock is not reduced until confirmation |
| Git workflow | Work is committed with meaningful message |

---

# Trainer Notes: What Not to Do on Day 12

Avoid implementing stock reduction today.

Avoid trusting frontend totals.

Avoid letting the frontend send `totalAmount` as the saved value.

Avoid skipping backend validation because frontend validation exists.

Avoid building the form with only one hardcoded item row.

Avoid storing sales order items as plain text or JSON if the Prisma schema already has a relational `SalesOrderItem` model.

Avoid placing all sales order business logic inside the controller.

Avoid making the Day 12 form too visually complex. Functional correctness matters more today.

Avoid spending too much time on advanced decimal precision issues. Keep the training focus on flow, validation, and backend source of truth.

---

# Day 12 Summary for Trainer

Day 12 should accomplish four things:

1. Make students understand sales order creation as a transaction workflow.
2. Make backend validation and backend calculation non-negotiable.
3. Teach React dynamic form state using an array of line items.
4. Prepare the project for Day 13 confirmation and stock validation.

The best Day 12 outcome is that students can say:

“I can create a draft sales order with multiple products. I understand why the frontend shows totals but the backend calculates the real totals. I also understand that stock should not reduce until the order is confirmed.”