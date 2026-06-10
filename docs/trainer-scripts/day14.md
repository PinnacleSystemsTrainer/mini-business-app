# Day 14 Trainer Script — Unit Testing Real Backend Services and Frontend Behavior Testing

Fullstack Training Program
Mini Business Operations App

---

## Trainer Positioning

Day 14 introduces automated testing for the actual code already built in the Mini Business Operations App.

The key teaching principle for today is:

> We are not writing tests for dummy helper files. We are writing tests for real project code that is already used by the backend and frontend.

By this stage, students have already built or started building:

* Product management
* Customer management
* Sales order creation
* Sales order list/detail flow
* Sales order item handling
* Backend total calculation
* Stock validation during confirmation
* Order confirmation
* Stock movement creation
* Frontend pages such as `ProductsPage`

The backend already contains real sales order service code.

The important backend file for today is:

```text
backend/src/services/salesOrder.service.js
```

This file exports real service functions such as:

```js
createSalesOrder
getSalesOrders
getSalesOrderById
confirmSalesOrder
```

These are the functions used by the actual API controllers.

So Day 14 must test those real exported functions.

Do not create an unused `salesOrder.logic.js` file just to make testing easy.

Do not paste duplicate helper functions into `salesOrder.service.js`.

Do not replace the existing `module.exports`.

Instead, test the real exported service functions and mock their database dependency.

For the frontend, we will test an existing page that students have already built:

```text
frontend/src/pages/ProductsPage.jsx
```

We will not create a new component only for testing.

The current `ProductsPage` is API-driven. It calls `getProducts()` when the page loads. Therefore, the frontend test must:

* Mock the product API module.
* Wrap the component in `MemoryRouter` because the page renders React Router `Link`.
* Use async queries such as `findByRole` and `findByText`.
* Test the real visible behavior of the page after the mocked API call resolves.

Frontend behavior tests should check things a user can see:

* Page heading
* Helper text
* Add Product link
* Product table headers
* Product rows returned by the mocked API

---

## Day Goal

By the end of Day 14, students should be able to:

* Explain why automated testing matters in business applications.
* Understand the difference between manual testing and automated testing.
* Understand what a unit test is.
* Understand why service functions that use Prisma need mocked dependencies.
* Set up Vitest in the backend.
* Keep backend application code as CommonJS while using Vitest safely.
* Write unit tests for the existing `salesOrder.service.js`.
* Mock Prisma so backend tests do not need a real database.
* Test real sales order service behavior.
* Set up frontend behavior testing using React Testing Library.
* Test an existing React page using visible user-facing behavior.
* Mock frontend API calls in component tests.
* Wrap components with router context when they render React Router links.
* Understand why tests should protect real application behavior.

---

## End-of-Day Deliverable

By the end of the day, students should have:

* Backend Vitest installed.
* Backend test scripts added without breaking the existing `dev` script.
* `backend/vitest.config.mjs` created with `globals: true`.
* Unit tests for the existing `salesOrder.service.js`.
* Prisma mocked in backend tests.
* Test coverage for:

  * Missing sales order items
  * Successful sales order creation
  * Sales order list retrieval
  * Sales order detail retrieval
  * Missing sales order detail returning `null`
  * Insufficient stock during confirmation
  * Successful order confirmation
* Frontend test libraries installed.
* Frontend Vitest configured for React Testing Library.
* Existing frontend `vite.config.js` left unchanged.
* `ProductsPage.jsx` tested using user-visible behavior.
* Product API calls mocked in the frontend test.
* Tests running successfully.
* Code committed.

Suggested commit message:

```text
Add unit tests for sales order service and ProductsPage behavior
```

---

# Morning Session — 1 Hour

## Suggested Timing

| Time      | Topic                                                                  |
| --------- | ---------------------------------------------------------------------- |
| 0–10 min  | Recap sales order workflow and testing need                            |
| 10–20 min | Manual testing vs automated testing                                    |
| 20–30 min | Unit testing real service code                                         |
| 30–40 min | Backend Vitest setup and CommonJS compatibility                        |
| 40–55 min | Trainer demo: test existing `salesOrder.service.js` with mocked Prisma |
| 55–60 min | Assign hands-on work                                                   |

---

## 0–10 Minutes — Recap Sales Order Workflow and Testing Need

### Trainer Script

“Yesterday and in the previous sessions, we built the sales order workflow.

This is no longer just a UI exercise. We now have real business behavior.

The sales order service is responsible for important operations such as:

* Creating a sales order
* Validating the customer
* Validating order input
* Validating products
* Calculating order totals
* Loading sales order details
* Confirming an order
* Checking product stock
* Updating order status
* Reducing product stock
* Creating stock movement records

If any of this logic breaks, the business data becomes wrong.

For example:

* A wrong order total affects billing.
* Confirming an order without stock creates operational problems.
* Missing order items should not be accepted.
* Stock should reduce only during confirmation, not when the order is only a draft.

Today we will write automated tests to protect this real behavior.”

---

### Ask Students

**Q1. Why is sales order testing more important than testing a simple static page?**

Expected answer:

“Because sales order logic affects real business data such as totals, stock, and order status.”

Trainer follow-up:

“Correct. A static page may have display issues, but sales order logic can affect business correctness.”

---

**Q2. Should we create a new dummy helper file only for testing?**

Expected answer:

“No. Tests should protect the real code used by the application.”

Trainer follow-up:

“Correct. We should test the real service functions that the controllers call.”

---

**Q3. Which backend file should we focus on today?**

Expected answer:

```text
backend/src/services/salesOrder.service.js
```

Trainer follow-up:

“Correct. That is the actual sales order service used by the backend API.”

---

## 10–20 Minutes — Manual Testing vs Automated Testing

### Trainer Script

“Before we write test code, let us compare manual testing and automated testing.

Manual testing means we check the application ourselves.

Example manual test for sales order confirmation:

1. Open the frontend.
2. Create a customer.
3. Create products with stock.
4. Create a sales order.
5. Add order items.
6. Confirm the order.
7. Check if status changed.
8. Check if stock reduced.
9. Check if stock movement was created.

This is useful, but it takes time.

If we change the confirmation logic tomorrow, we need to repeat this testing again.

Automated testing means test code checks our application code.

For example, instead of opening the browser and clicking through everything, a unit test can directly call:

```js
await confirmSalesOrder(orderId);
```

Then the test can check:

* Did the service fetch the order?
* Did it reject insufficient stock?
* Did it update the order status?
* Did it reduce product stock?
* Did it create stock movement records?

Automated tests do not replace all manual testing, but they protect important behavior from breaking accidentally.”

---

### Ask Students

**Q. What is the biggest advantage of automated tests?**

Expected answer:

“They can be repeated quickly and consistently after every code change.”

Trainer follow-up:

“Correct. This helps us catch regressions.”

---

## 20–30 Minutes — Unit Testing Real Service Code

### Trainer Script

“A unit test checks a small piece of code in isolation.

But our real service functions are not pure helper functions. They talk to Prisma and the database.

For example, `createSalesOrder` uses Prisma to:

* Check whether the customer exists
* Check whether products exist
* Count existing orders to generate an order number
* Create the sales order

`confirmSalesOrder` uses Prisma to:

* Find the order and its items
* Check product stock
* Update product stock
* Update order status
* Create stock movement records
* Fetch and return the final confirmed order

If our unit test uses a real database, it becomes slower and harder to control.

So today, we will mock Prisma.

Mocking means we replace the real database object with a fake object controlled by the test.”

---

### Simple Explanation of Mocking

“Think of Prisma as a real shopkeeper who goes to the warehouse to check stock.

In a unit test, we do not want to go to the real warehouse.

So we use a fake shopkeeper and tell the fake shopkeeper:

* When asked for customer 1, return a customer.
* When asked for order count, return 0.
* When asked for a draft order, return this fake draft order.
* When asked to update stock, return count 1.
* When asked for the final order, return a confirmed order.

This lets us test service behavior without using a real database.”

---

### Ask Students

**Q. Why do we mock Prisma in a unit test?**

Expected answer:

“To test service logic without needing a real database.”

Trainer follow-up:

“Correct. Unit tests should be fast and focused.”

---

**Q. Does mocking Prisma mean the database is not important?**

Expected answer:

“No. Database behavior can be tested later using integration tests. Today we are focusing on unit tests.”

Trainer follow-up:

“Correct. Unit tests and integration tests solve different problems.”

---

## 30–40 Minutes — Backend Vitest Setup and CommonJS Compatibility

### Trainer Script

“We will use Vitest as the test runner.

Our backend code currently uses CommonJS.”

Show example:

```js
const express = require('express');

module.exports = app;
```

“Many Vitest examples use ESM imports:

```js
import { describe, it, expect } from 'vitest';
```

But in our backend test setup, we will avoid mixing too many module styles.

We will configure Vitest globals so test files can use:

```js
describe(...)
it(...)
expect(...)
vi.fn(...)
```

without importing `describe`, `it`, and `expect`.

Important:

Do not use:

```js
const { describe, it, expect } = require('vitest');
```

Instead, use `globals: true` in Vitest config.”

---

## Backend Test Setup

Inside the backend folder:

```powershell
cd backend
```

Install Vitest:

```powershell
npm install --save-dev vitest
```

Create:

```text
backend/vitest.config.mjs
```

Add:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

---

## Update Backend package.json Scripts

### Trainer Script

“Be careful when updating `package.json`.

Do not replace the whole scripts block blindly.

The project already uses `nodemon` for hot reload.

So keep the existing `dev` script as:

```json
"dev": "nodemon src/server.js"
```

Then add test scripts.”

Correct merged example:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

If the project already has other scripts, merge the test scripts into the existing block.

Do not remove existing useful scripts.

---

### Explain Test Commands

```powershell
npm test
```

Runs tests once.

```powershell
npm run test:watch
```

Runs tests in watch mode.

Do not use:

```powershell
npm test:watch
```

That is incorrect.

Because `test:watch` is a custom npm script name, it must be run using:

```powershell
npm run test:watch
```

---

### Ask Students

**Q. What command runs backend tests once?**

Expected answer:

```powershell
npm test
```

---

**Q. What command runs backend tests in watch mode?**

Expected answer:

```powershell
npm run test:watch
```

---

**Q. Why should we not change `dev` to `node src/server.js`?**

Expected answer:

“Because the project uses `nodemon` for hot reload. Replacing it with `node` would remove automatic restart during development.”

Trainer follow-up:

“Correct. Test setup should not break the existing development workflow.”

---

## 40–55 Minutes — Trainer Demo: Test Existing salesOrder.service.js

## Step 1 — Inspect the Real Service Before Writing Tests

### Trainer Script

“Before writing tests, always inspect the real file.

Open:

```text
backend/src/services/salesOrder.service.js
```

Look for:

1. What functions are exported?
2. What Prisma models are used?
3. What Prisma methods are used?
4. What errors are thrown?
5. What data shape is expected?
6. What status values are used?

We should not guess. Tests must match the real service.”

---

### Expected Existing Exports

The file exports real service functions similar to:

```js
module.exports = {
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  confirmSalesOrder,
};
```

Trainer explanation:

“These are the actual functions the backend controllers use.

So these are the correct unit test targets.”

---

### Important Warning

Do not do this:

```js
module.exports = {
  calculateLineTotal,
  calculateOrderTotal,
  validateStockAvailability,
};
```

That would break existing exports if it replaces the current export object.

Do not paste duplicate helper functions into the service.

Do not create an unused testing-only helper file.

Today’s goal is to test the real service behavior.”

---

## Step 2 — Create Backend Test File

Create:

```text
backend/tests/unit/salesOrder.service.test.js
```

Before adding code, explain the structure:

```text
backend/
  tests/
    unit/
      salesOrder.service.test.js
```

---

## Step 3 — Understand Prisma Test Double Path

The service imports Prisma from:

```text
backend/src/lib/prisma.js
```

From the test file path:

```text
backend/tests/unit/salesOrder.service.test.js
```

the require path should be:

```js
require('../../src/lib/prisma')
```

because from the test file:

```text
tests/unit -> backend -> src/lib/prisma
```

---

## Step 4 — Add Prisma Test Double

Add this to the test file:

```js
const prisma = require('../../src/lib/prisma');

const mockPrisma = {
  customer: {
    findUnique: vi.fn(),
  },
  salesOrder: {
    count: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  },
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  },
  stockMovement: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};

Object.assign(prisma, mockPrisma);
```

Trainer explanation:

“This gives the imported Prisma client fake methods for the test.

The fake object has the methods our actual service uses.

The backend service uses CommonJS `require`, so for this project we assign mock delegates onto the same Prisma object that the service imports.

Do not use `vi.mock('../../src/lib/prisma', ...)` here. In this CommonJS setup, that mock does not replace the already-required Prisma client consistently, and `$transaction` stays as the real Prisma method instead of a Vitest mock.

Important details for this project:

* `createSalesOrder` validates the customer using `prisma.customer.findUnique`.
* `createSalesOrder` validates products using `prisma.product.findMany`.
* `createSalesOrder` generates an order number using `prisma.salesOrder.count`.
* `confirmSalesOrder` updates order status using `tx.salesOrder.updateMany`.
* `confirmSalesOrder` reduces stock using `tx.product.updateMany`.
* `confirmSalesOrder` creates stock movement using `tx.stockMovement.create`.
* `confirmSalesOrder` calls `salesOrder.findUnique` once to load the draft order and again to return the final order.”

---

## Step 5 — Import Real Service

After the Prisma test double, import the actual service:

```js
const {
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  confirmSalesOrder,
} = require('../../src/services/salesOrder.service');
```

Trainer explanation:

“The service import points to the real project file.

This is not dummy code. This is the same service used by the backend API.”

---

## Step 6 — Reset Mocks Before Each Test

Add:

```js
beforeEach(() => {
  vi.clearAllMocks();

  prisma.$transaction.mockImplementation(async (callback) => {
    return callback(prisma);
  });
});
```

Trainer explanation:

“`vi.clearAllMocks()` clears previous mock calls between tests.

The `$transaction` mock allows services that use Prisma transactions to run the callback using the mocked Prisma object.

This project uses the callback form:

```js
prisma.$transaction(async (tx) => {
  // service logic
});
```

So our mock returns:

```js
callback(prisma)
```

That means the transaction client `tx` behaves like our mocked `prisma` object.”

---

# Backend Test Example 1 — createSalesOrder Rejects Empty Items

### Trainer Script

“First, test a validation case.

A sales order should not be created without items.

This test checks the real service behavior.”

Add test:

```js
describe('salesOrder.service createSalesOrder', () => {
  it('rejects order creation when items are missing', async () => {
    await expect(
      createSalesOrder({
        customerId: 1,
        items: [],
      })
    ).rejects.toThrow('Order must have at least one item');
  });
});
```

Trainer explanation:

“This test calls the real `createSalesOrder` function.

We expect it to reject because the order has no items.

Use the exact error message from the actual service:

````text
Order must have at least one item
```”

---

### Ask Students

**Q. Why do we use `rejects.toThrow` instead of `toThrow` here?**

Expected answer:

“Because `createSalesOrder` is an async function that returns a promise. We use `rejects.toThrow` to test promise rejection.”

---

# Backend Test Example 2 — createSalesOrder Creates Order Successfully

### Trainer Script

“Now we test a successful order creation case.

This test verifies that the service can create an order using the real `createSalesOrder` function.

For this project, the service checks:

- Whether the customer exists
- Whether products exist
- Existing sales order count for order number generation
- Sales order creation through Prisma.”

Add:

```js
it('creates a sales order successfully', async () => {
  const input = {
    customerId: 1,
    items: [
      { productId: 1, quantity: 2, rate: 50 },
      { productId: 2, quantity: 3, rate: 10 },
    ],
  };

  const createdOrder = {
    id: 1,
    orderNo: 'SO-001',
    customerId: 1,
    status: 'DRAFT',
    totalAmount: 130,
    items: [
      { id: 1, productId: 1, quantity: 2, rate: 50, lineTotal: 100 },
      { id: 2, productId: 2, quantity: 3, rate: 10, lineTotal: 30 },
    ],
  };

  prisma.customer.findUnique.mockResolvedValue({
    id: 1,
    name: 'Test Customer',
  });

  prisma.product.findMany.mockResolvedValue([
    { id: 1, name: 'Notebook' },
    { id: 2, name: 'Pen' },
  ]);

  prisma.salesOrder.count.mockResolvedValue(0);
  prisma.salesOrder.create.mockResolvedValue(createdOrder);

  const result = await createSalesOrder(input);

  expect(prisma.customer.findUnique).toHaveBeenCalled();
  expect(prisma.product.findMany).toHaveBeenCalled();
  expect(prisma.salesOrder.count).toHaveBeenCalled();
  expect(prisma.salesOrder.create).toHaveBeenCalled();

  expect(Number(result.totalAmount)).toBe(130);
});
````

Trainer explanation:

“This test proves that the real service function can create a sales order when required data exists.

We mock:

* Customer lookup
* Product lookup
* Order count
* Sales order creation

We are not using a real database.”

---

### Ask Students

**Q. Why does this test need `customer.findUnique`?**

Expected answer:

“Because the real service validates the customer before creating the sales order.”

---

**Q. Why does this test need `salesOrder.count`?**

Expected answer:

“Because the real service uses count to generate the sales order number.”

---

# Backend Test Example 3 — getSalesOrders Returns List

### Trainer Script

“Next, we test a simple read function.

This verifies that the service calls Prisma and returns the sales order list.”

Add:

```js
describe('salesOrder.service read functions', () => {
  it('returns sales order list', async () => {
    const orders = [
      {
        id: 1,
        orderNo: 'SO-001',
        status: 'DRAFT',
        totalAmount: 130,
      },
      {
        id: 2,
        orderNo: 'SO-002',
        status: 'CONFIRMED',
        totalAmount: 250,
      },
    ];

    prisma.salesOrder.findMany.mockResolvedValue(orders);

    const result = await getSalesOrders();

    expect(prisma.salesOrder.findMany).toHaveBeenCalled();
    expect(result).toEqual(orders);
  });
});
```

Trainer explanation:

“This test is simple, but it protects the service call.

Later, if someone changes the query incorrectly, tests can catch it.”

---

# Backend Test Example 4 — getSalesOrderById Returns One Order

Add:

```js
it('returns one sales order by id', async () => {
  const order = {
    id: 1,
    orderNo: 'SO-001',
    status: 'DRAFT',
    totalAmount: 130,
    items: [],
  };

  prisma.salesOrder.findUnique.mockResolvedValue(order);

  const result = await getSalesOrderById(1);

  expect(prisma.salesOrder.findUnique).toHaveBeenCalled();
  expect(result).toEqual(order);
});
```

Trainer explanation:

“This test checks that the service returns the order returned by Prisma.”

---

## Backend Test Example 5 — getSalesOrderById Returns Null When Missing

### Trainer Script

“This project’s `getSalesOrderById` service does not throw when an order is missing.

It returns whatever Prisma returns.

If Prisma returns `null`, the service returns `null`.

So do not write a test expecting `Sales order not found` unless the service is changed to throw that error.”

Add:

```js
it('returns null when sales order is not found', async () => {
  prisma.salesOrder.findUnique.mockResolvedValue(null);

  const result = await getSalesOrderById(999);

  expect(prisma.salesOrder.findUnique).toHaveBeenCalled();
  expect(result).toBeNull();
});
```

Trainer explanation:

“This is an important testing habit.

Tests must match actual behavior.

If we want the service to throw on missing order, that should be a separate service change.”

---

# Backend Test Example 6 — confirmSalesOrder Rejects Insufficient Stock

### Trainer Script

“Confirmation is one of the most important business operations.

A confirmed order affects stock.

So we must test that insufficient stock is rejected.”

Add:

```js
describe('salesOrder.service confirmSalesOrder', () => {
  it('rejects confirmation when stock is insufficient', async () => {
    const draftOrder = {
      id: 1,
      orderNo: 'SO-001',
      status: 'DRAFT',
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 5,
          product: {
            id: 1,
            name: 'Notebook',
            stockQty: 3,
          },
        },
      ],
    };

    prisma.salesOrder.findUnique.mockResolvedValue(draftOrder);

    await expect(confirmSalesOrder(1)).rejects.toThrow('Insufficient stock');

    expect(prisma.product.updateMany).not.toHaveBeenCalled();
    expect(prisma.salesOrder.updateMany).not.toHaveBeenCalled();
    expect(prisma.stockMovement.create).not.toHaveBeenCalled();
  });
});
```

Trainer explanation:

“This test proves that the service blocks confirmation when stock is not enough.

We also check that stock update, order status update, and stock movement creation did not happen.

That is important because the order should not become confirmed if validation fails.”

---

### Ask Students

**Q. Why do we expect `salesOrder.updateMany` not to be called?**

Expected answer:

“Because if stock is insufficient, the service should stop before updating the order status.”

---

**Q. Why do we expect `product.updateMany` not to be called?**

Expected answer:

“Because stock should not be reduced when confirmation fails.”

---

# Backend Test Example 7 — confirmSalesOrder Updates Order When Stock Is Available

### Trainer Script

“Now we test the successful confirmation path.

The service should:

* Load the draft order
* Check stock
* Reduce product stock using `product.updateMany`
* Create stock movement using `stockMovement.create`
* Update order status using `salesOrder.updateMany`
* Fetch the final confirmed order using `salesOrder.findUnique` again

Important: this service calls `salesOrder.findUnique` twice.

The first call loads the draft order for validation.

The second call returns the final confirmed order.

So our test must use `mockResolvedValueOnce` twice.”

Add:

```js
it('confirms order when stock is available', async () => {
  const draftOrder = {
    id: 1,
    orderNo: 'SO-001',
    status: 'DRAFT',
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 2,
        product: {
          id: 1,
          name: 'Notebook',
          stockQty: 10,
        },
      },
    ],
  };

  const confirmedOrder = {
    ...draftOrder,
    status: 'CONFIRMED',
  };

  prisma.salesOrder.findUnique
    .mockResolvedValueOnce(draftOrder)
    .mockResolvedValueOnce(confirmedOrder);

  prisma.product.updateMany.mockResolvedValue({
    count: 1,
  });

  prisma.stockMovement.create.mockResolvedValue({
    id: 1,
    productId: 1,
    quantity: -2,
  });

  prisma.salesOrder.updateMany.mockResolvedValue({
    count: 1,
  });

  const result = await confirmSalesOrder(1);

  expect(prisma.product.updateMany).toHaveBeenCalled();
  expect(prisma.stockMovement.create).toHaveBeenCalled();
  expect(prisma.salesOrder.updateMany).toHaveBeenCalled();
  expect(prisma.salesOrder.findUnique).toHaveBeenCalledTimes(2);

  expect(result.status).toBe('CONFIRMED');
});
```

Trainer explanation:

“This test matches the actual service behavior.

The service uses `salesOrder.updateMany`, not `salesOrder.update`.

The service uses `product.updateMany`, not `product.update`.

The service calls `findUnique` twice.

If we used only:

```js
prisma.salesOrder.findUnique.mockResolvedValue(draftOrder);
```

both calls would return the draft order and the final result would still have status `DRAFT`.

That is why we use:

````js
mockResolvedValueOnce(draftOrder)
mockResolvedValueOnce(confirmedOrder)
```”

---

## Complete Backend Test File

Use this as the full backend test file:

```js
const prisma = require('../../src/lib/prisma');

const mockPrisma = {
  customer: {
    findUnique: vi.fn(),
  },
  salesOrder: {
    count: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  },
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  },
  stockMovement: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};

Object.assign(prisma, mockPrisma);

const {
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  confirmSalesOrder,
} = require('../../src/services/salesOrder.service');

beforeEach(() => {
  vi.clearAllMocks();

  prisma.$transaction.mockImplementation(async (callback) => {
    return callback(prisma);
  });
});

describe('salesOrder.service createSalesOrder', () => {
  it('rejects order creation when items are missing', async () => {
    await expect(
      createSalesOrder({
        customerId: 1,
        items: [],
      })
    ).rejects.toThrow('Order must have at least one item');
  });

  it('creates a sales order successfully', async () => {
    const input = {
      customerId: 1,
      items: [
        { productId: 1, quantity: 2, rate: 50 },
        { productId: 2, quantity: 3, rate: 10 },
      ],
    };

    const createdOrder = {
      id: 1,
      orderNo: 'SO-001',
      customerId: 1,
      status: 'DRAFT',
      totalAmount: 130,
      items: [
        { id: 1, productId: 1, quantity: 2, rate: 50, lineTotal: 100 },
        { id: 2, productId: 2, quantity: 3, rate: 10, lineTotal: 30 },
      ],
    };

    prisma.customer.findUnique.mockResolvedValue({
      id: 1,
      name: 'Test Customer',
    });

    prisma.product.findMany.mockResolvedValue([
      { id: 1, name: 'Notebook' },
      { id: 2, name: 'Pen' },
    ]);

    prisma.salesOrder.count.mockResolvedValue(0);
    prisma.salesOrder.create.mockResolvedValue(createdOrder);

    const result = await createSalesOrder(input);

    expect(prisma.customer.findUnique).toHaveBeenCalled();
    expect(prisma.product.findMany).toHaveBeenCalled();
    expect(prisma.salesOrder.count).toHaveBeenCalled();
    expect(prisma.salesOrder.create).toHaveBeenCalled();

    expect(Number(result.totalAmount)).toBe(130);
  });
});

describe('salesOrder.service read functions', () => {
  it('returns sales order list', async () => {
    const orders = [
      {
        id: 1,
        orderNo: 'SO-001',
        status: 'DRAFT',
        totalAmount: 130,
      },
      {
        id: 2,
        orderNo: 'SO-002',
        status: 'CONFIRMED',
        totalAmount: 250,
      },
    ];

    prisma.salesOrder.findMany.mockResolvedValue(orders);

    const result = await getSalesOrders();

    expect(prisma.salesOrder.findMany).toHaveBeenCalled();
    expect(result).toEqual(orders);
  });

  it('returns one sales order by id', async () => {
    const order = {
      id: 1,
      orderNo: 'SO-001',
      status: 'DRAFT',
      totalAmount: 130,
      items: [],
    };

    prisma.salesOrder.findUnique.mockResolvedValue(order);

    const result = await getSalesOrderById(1);

    expect(prisma.salesOrder.findUnique).toHaveBeenCalled();
    expect(result).toEqual(order);
  });

  it('returns null when sales order is not found', async () => {
    prisma.salesOrder.findUnique.mockResolvedValue(null);

    const result = await getSalesOrderById(999);

    expect(prisma.salesOrder.findUnique).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

describe('salesOrder.service confirmSalesOrder', () => {
  it('rejects confirmation when stock is insufficient', async () => {
    const draftOrder = {
      id: 1,
      orderNo: 'SO-001',
      status: 'DRAFT',
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 5,
          product: {
            id: 1,
            name: 'Notebook',
            stockQty: 3,
          },
        },
      ],
    };

    prisma.salesOrder.findUnique.mockResolvedValue(draftOrder);

    await expect(confirmSalesOrder(1)).rejects.toThrow('Insufficient stock');

    expect(prisma.product.updateMany).not.toHaveBeenCalled();
    expect(prisma.salesOrder.updateMany).not.toHaveBeenCalled();
    expect(prisma.stockMovement.create).not.toHaveBeenCalled();
  });

  it('confirms order when stock is available', async () => {
    const draftOrder = {
      id: 1,
      orderNo: 'SO-001',
      status: 'DRAFT',
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 2,
          product: {
            id: 1,
            name: 'Notebook',
            stockQty: 10,
          },
        },
      ],
    };

    const confirmedOrder = {
      ...draftOrder,
      status: 'CONFIRMED',
    };

    prisma.salesOrder.findUnique
      .mockResolvedValueOnce(draftOrder)
      .mockResolvedValueOnce(confirmedOrder);

    prisma.product.updateMany.mockResolvedValue({
      count: 1,
    });

    prisma.stockMovement.create.mockResolvedValue({
      id: 1,
      productId: 1,
      quantity: -2,
    });

    prisma.salesOrder.updateMany.mockResolvedValue({
      count: 1,
    });

    const result = await confirmSalesOrder(1);

    expect(prisma.product.updateMany).toHaveBeenCalled();
    expect(prisma.stockMovement.create).toHaveBeenCalled();
    expect(prisma.salesOrder.updateMany).toHaveBeenCalled();
    expect(prisma.salesOrder.findUnique).toHaveBeenCalledTimes(2);

    expect(result.status).toBe('CONFIRMED');
  });
});
````

---

## Trainer Warning About Exact Matching

### Trainer Script

“The test file now matches the actual behavior we know about the service.

Still, before finalizing tests, always verify:

* Does the service use `customer.findUnique`?
* Does it use `salesOrder.count`?
* Does it use `salesOrder.updateMany`?
* Does it use `product.updateMany`?
* Does it use `stockMovement.create`?
* Does it call `findUnique` twice during confirmation?
* What exact error messages are thrown?
* What exact status values are used?

Tests should verify the real behavior, not imagined behavior.”

---

# 55–60 Minutes — Assign Hands-On Work

### Trainer Script

“Your task today is to add tests for the existing sales order service.

Do not create dummy service logic.

Do not paste new helper functions into the service.

Test the real exported functions from `salesOrder.service.js`.

If a test fails because the mock shape is wrong, inspect the service and adjust the mock.

That is part of learning how real unit tests are written.”

---

## Hands-On Assignment

Students must:

1. Install Vitest in backend.
2. Add `backend/vitest.config.mjs`.
3. Merge test scripts into backend `package.json`.
4. Keep `dev` as `nodemon src/server.js`.
5. Create `backend/tests/unit/salesOrder.service.test.js`.
6. Mock Prisma with the models and methods used by the real service:

   * `customer.findUnique`
   * `salesOrder.count`
   * `salesOrder.create`
   * `salesOrder.findMany`
   * `salesOrder.findUnique`
   * `salesOrder.updateMany`
   * `product.findMany`
   * `product.updateMany`
   * `stockMovement.create`
   * `$transaction`
7. Import the real `salesOrder.service.js`.
8. Add test for empty order creation.
9. Add test for successful order creation.
10. Add test for sales order list retrieval.
11. Add test for sales order detail retrieval.
12. Add test for missing sales order detail returning `null`.
13. Add test for insufficient stock during confirmation.
14. Add test for successful confirmation.
15. Run tests.
16. Commit the work.

---

# Afternoon Review Session — 1 Hour

## Suggested Timing

| Time      | Topic                                                |
| --------- | ---------------------------------------------------- |
| 0–10 min  | Student demo                                         |
| 10–25 min | Backend test review                                  |
| 25–35 min | Mocking review                                       |
| 35–45 min | Debugging common backend test failures               |
| 45–55 min | Frontend behavior testing with React Testing Library |
| 55–60 min | Recap and next-day readiness                         |

---

## 0–10 Minutes — Student Demo

Ask students to show:

* `backend/vitest.config.mjs`
* `backend/package.json`
* `backend/tests/unit/salesOrder.service.test.js`
* Existing `backend/src/services/salesOrder.service.js`
* Test output

Ask them to run:

```powershell
cd backend
npm test
```

---

## 10–25 Minutes — Backend Test Review

### Review Question 1

**Q. Are we testing dummy helper code today?**

Expected answer:

“No. We are testing the actual `salesOrder.service.js` used by the backend API.”

---

### Review Question 2

**Q. Why do we mock Prisma?**

Expected answer:

“Because unit tests should test service behavior without depending on a real database.”

---

### Review Question 3

**Q. Why does the mock need `customer.findUnique`?**

Expected answer:

“Because `createSalesOrder` validates the customer before creating the order.”

---

### Review Question 4

**Q. Why does the mock need `salesOrder.count`?**

Expected answer:

“Because the service uses count to generate the order number.”

---

### Review Question 5

**Q. Why does confirmation use `updateMany` instead of `update`?**

Expected answer:

“Because the service uses `updateMany` to safely update only when conditions match. It can check the returned count to detect stale or invalid updates.”

---

### Review Question 6

**Q. Why does the confirmation success test mock `findUnique` twice?**

Expected answer:

“Because the service first loads the draft order and then loads the final confirmed order after updating.”

---

### Review Question 7

**Q. Why should missing sales order detail return `null` in our test?**

Expected answer:

“Because the current `getSalesOrderById` service returns whatever Prisma returns. It does not throw a not-found error.”

---

## 25–35 Minutes — Mocking Review

### Trainer Script

“Mocking can feel confusing at first.

Remember the goal:

The real service calls Prisma.

In a unit test, we replace Prisma with a fake object.

Then we decide what the fake Prisma should return.”

Example:

```js
prisma.customer.findUnique.mockResolvedValue({
  id: 1,
  name: 'Test Customer',
});
```

“This means:

When the service asks Prisma for the customer, return this fake customer.”

Example:

```js
prisma.salesOrder.findUnique
  .mockResolvedValueOnce(draftOrder)
  .mockResolvedValueOnce(confirmedOrder);
```

“This means:

First call returns the draft order.

Second call returns the confirmed order.”

---

### Ask Students

**Q. What does `mockResolvedValue` mean?**

Expected answer:

“It makes the mocked async function return a resolved promise with that value.”

---

**Q. What does `mockResolvedValueOnce` mean?**

Expected answer:

“It controls the return value for one specific call. This is useful when the same mocked function is called multiple times.”

---

**Q. What does `toHaveBeenCalled` check?**

Expected answer:

“It checks whether a mocked function was called.”

---

**Q. What does `not.toHaveBeenCalled` check?**

Expected answer:

“It checks that a mocked function was not called.”

---

## 35–45 Minutes — Debugging Common Backend Test Failures

## Common Failure 1 — `describe is not defined`

Cause:

* `vitest.config.mjs` missing.
* `globals: true` not configured.
* Tests are not running through Vitest.

Fix:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

---

## Common Failure 2 — `vi is not defined`

Cause:

* `globals: true` not configured.
* Or test environment is not reading the config.

Fix:

Check:

```text
backend/vitest.config.mjs
```

and run tests from the backend folder:

```powershell
cd backend
npm test
```

---

## Common Failure 3 — Prisma Require Path Is Wrong

Example error:

```text
Cannot find module '../../src/lib/prisma'
```

Cause:

The relative require path is wrong.

From:

```text
backend/tests/unit/salesOrder.service.test.js
```

to:

```text
backend/src/lib/prisma.js
```

the path should be:

```js
../../src/lib/prisma
```

---

## Common Failure 4 — `customer.findUnique` Is Undefined

Example error:

```text
Cannot read properties of undefined (reading 'findUnique')
```

Cause:

The service calls `prisma.customer.findUnique`, but the mock does not include `customer`.

Fix:

```js
customer: {
  findUnique: vi.fn(),
}
```

and in the test:

```js
prisma.customer.findUnique.mockResolvedValue({
  id: 1,
  name: 'Test Customer',
});
```

---

## Common Failure 5 — `salesOrder.count` Is Not a Function

Example error:

```text
TypeError: prisma.salesOrder.count is not a function
```

Cause:

The service calls `prisma.salesOrder.count` while generating order number.

Fix:

```js
salesOrder: {
  count: vi.fn(),
}
```

and in the test:

```js
prisma.salesOrder.count.mockResolvedValue(0);
```

---

## Common Failure 6 — Wrong Update Method

Example error:

```text
Cannot read properties of undefined reading 'mockResolvedValue'
```

Cause:

The test uses:

```js
prisma.salesOrder.update.mockResolvedValue(...)
```

but the service uses:

```js
prisma.salesOrder.updateMany(...)
```

Fix:

Use:

```js
prisma.salesOrder.updateMany.mockResolvedValue({
  count: 1,
});
```

and assert:

```js
expect(prisma.salesOrder.updateMany).toHaveBeenCalled();
```

---

## Common Failure 7 — Product Update Method Mismatch

Cause:

The test uses:

```js
prisma.product.update.mockResolvedValue(...)
```

but the service uses:

```js
prisma.product.updateMany(...)
```

Fix:

Use:

```js
prisma.product.updateMany.mockResolvedValue({
  count: 1,
});
```

and assert:

```js
expect(prisma.product.updateMany).toHaveBeenCalled();
```

---

## Common Failure 8 — Final Result Still Says DRAFT

Cause:

The service calls `salesOrder.findUnique` twice during confirmation.

If the test uses:

```js
prisma.salesOrder.findUnique.mockResolvedValue(draftOrder);
```

both calls return the draft order.

Fix:

Use sequential mock values:

```js
prisma.salesOrder.findUnique
  .mockResolvedValueOnce(draftOrder)
  .mockResolvedValueOnce(confirmedOrder);
```

---

## Common Failure 9 — Wrong Not-Found Behavior

Cause:

The test expects:

```js
await expect(getSalesOrderById(999)).rejects.toThrow('Sales order not found');
```

but the actual service returns `null`.

Fix:

Use:

```js
prisma.salesOrder.findUnique.mockResolvedValue(null);

const result = await getSalesOrderById(999);

expect(result).toBeNull();
```

---

## Common Failure 10 — Wrong Error Message

Example:

```text
Expected error message:
Sales order must have at least one item

Received:
Order must have at least one item
```

Fix:

Use the exact error message from the actual service:

```text
Order must have at least one item
```

---

## Common Failure 11 — `npm test:watch` Does Not Work

Cause:

`test:watch` is a custom script name.

Correct command:

```powershell
npm run test:watch
```

Incorrect command:

```powershell
npm test:watch
```

---

## Common Failure 12 — Dev Script Lost Hot Reload

Cause:

Student replaced:

```json
"dev": "nodemon src/server.js"
```

with:

```json
"dev": "node src/server.js"
```

Fix:

Restore:

```json
"dev": "nodemon src/server.js"
```

---

# 45–55 Minutes — Frontend Behavior Testing with React Testing Library

## Trainer Positioning

### Trainer Script

“The backend part of Day 14 tests real service behavior.

Now we will test frontend behavior.

Frontend behavior testing is different from testing small utility functions.

Today, we are not focusing on functions like:

```js
formatCurrency()
isLowStock()
buildProductOptions()
```

Those helper tests can be useful later, but today we want to learn how to test what the user sees.

React Testing Library helps us test components the way users experience them.

We ask questions like:

* Is the expected heading visible?
* Is the helper text visible?
* Is the Add Product link visible?
* Are the table headers visible?
* Are the product rows visible after the API call succeeds?

The goal is not to test Tailwind classes or internal implementation details.

The goal is to test visible behavior.

We will test an existing API-driven page:

```text
frontend/src/pages/ProductsPage.jsx
```

We are not creating a new component only for testing.”

---

## Why ProductsPage Is a Good Test Target

### Trainer Script

“`ProductsPage` is a good first React Testing Library target because students already built it earlier and it is a real page in the Mini Business Operations App.

The current page is API-driven.

It calls `getProducts()` inside `useEffect` when the page loads.

That means the test must mock the API call.

If we do not mock the API call, the page will start in loading state, then fail because no backend is running in the test environment.

So the test must provide fake API data and wait for the UI to update.”

---

## Frontend Testing Setup

Inside the frontend folder:

```powershell
cd frontend
```

Install testing dependencies:

```powershell
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

---

## Update frontend package.json Scripts

Do not replace the whole `scripts` block.

The frontend may already have:

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

Keep existing scripts and add test scripts.

Correct merged version:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Important:

* Do not remove `lint`.
* Do not remove `preview`.
* Use `npm test` to run tests once.
* Use `npm run test:watch` for watch mode.

---

## Configure Vitest for React Components

Create:

```text
frontend/vitest.config.js
```

Add:

```js
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
    },
  })
);
```

Create:

```text
frontend/src/test/setup.js
```

Add:

```js
import '@testing-library/jest-dom/vitest';
```

### Trainer Explanation

“React components need a browser-like environment because they render DOM elements.

Vitest by itself can run JavaScript tests, but React component tests need `jsdom`.

The setup file adds extra matchers like:

```js
toBeInTheDocument()
```

These make component tests easier to read.”

---

## Trainer Note — Why Do We Have Both vite.config.js and vitest.config.js?

### Trainer Script

“The frontend already has:

```text
frontend/vite.config.js
```

That file is used by the Vite dev server and production build.

For tests, we are adding:

```text
frontend/vitest.config.js
```

This file is only for Vitest test settings such as:

```js
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test/setup.js',
}
```

Do not modify or remove the existing `vite.config.js`.

The normal frontend dev server and build continue to use `vite.config.js`.

In our `vitest.config.js`, we use `mergeConfig` so Vitest can reuse the existing Vite plugins from `vite.config.js`.

This matters because the existing frontend Vite config already includes plugins such as React and Tailwind-related setup.

So the rule is:

* `vite.config.js` is for dev server and build.
* `vitest.config.js` is for tests.
* `vitest.config.js` merges the existing Vite config and adds test-only settings.”

---

## Create ProductsPage Test File

Create:

```text
frontend/src/pages/ProductsPage.test.jsx
```

Add:

```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductsPage from './ProductsPage';

vi.mock('../api/productApi', () => ({
  getProducts: vi.fn().mockResolvedValue([
    {
      id: 1,
      sku: 'P001',
      name: 'Notebook',
      price: 50,
      stockQty: 10,
    },
    {
      id: 2,
      sku: 'P002',
      name: 'Pen',
      price: 10,
      stockQty: 20,
    },
    {
      id: 3,
      sku: 'P003',
      name: 'Marker',
      price: 15,
      stockQty: 5,
    },
  ]),
  deleteProduct: vi.fn(),
}));

function renderProductsPage() {
  return render(
    <MemoryRouter>
      <ProductsPage />
    </MemoryRouter>
  );
}

describe('ProductsPage', () => {
  it('shows the products page heading and helper text', async () => {
    renderProductsPage();

    expect(
      await screen.findByRole('heading', { name: 'Products' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Product data loaded from the backend API.')
    ).toBeInTheDocument();
  });

  it('shows the Add Product link', async () => {
    renderProductsPage();

    expect(
      await screen.findByRole('link', { name: 'Add Product' })
    ).toBeInTheDocument();
  });

  it('shows product table headers after products are loaded', async () => {
    renderProductsPage();

    expect(
      await screen.findByRole('columnheader', { name: 'SKU' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: 'Name' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: 'Price' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: 'Stock' })
    ).toBeInTheDocument();
  });

  it('renders products returned by the API', async () => {
    renderProductsPage();

    expect(await screen.findByText('P001')).toBeInTheDocument();
    expect(screen.getByText('Notebook')).toBeInTheDocument();

    expect(screen.getByText('P002')).toBeInTheDocument();
    expect(screen.getByText('Pen')).toBeInTheDocument();

    expect(screen.getByText('P003')).toBeInTheDocument();
    expect(screen.getByText('Marker')).toBeInTheDocument();
  });
});
```

---

## Explain the ProductsPage Test

### Trainer Script

“This test checks existing frontend behavior.

We are not testing a new demonstration component.

We are testing a page that students already built earlier in the project.

The test verifies what the user can actually see after the product API returns data:

* Products heading
* Helper text
* Add Product link
* Table headers
* Product rows

This is React Testing Library’s main idea: test the UI the way the user experiences it.”

---

## Explain the API Mock

```jsx
vi.mock('../api/productApi', () => ({
  getProducts: vi.fn().mockResolvedValue([
    {
      id: 1,
      sku: 'P001',
      name: 'Notebook',
      price: 50,
      stockQty: 10,
    },
  ]),
  deleteProduct: vi.fn(),
}));
```

### Trainer Script

“`ProductsPage` calls `getProducts()` when the component loads.

In the test environment, we do not want to call the real backend.

So we mock `getProducts()` and tell it to return fake products.

This lets us test the page behavior without running the backend server.”

---

## Explain MemoryRouter

```jsx
function renderProductsPage() {
  return render(
    <MemoryRouter>
      <ProductsPage />
    </MemoryRouter>
  );
}
```

### Trainer Script

“`ProductsPage` renders React Router `Link` components.

A `Link` needs router context.

If we render `ProductsPage` without a router, the test will fail with an error like:

```text
useHref() may be used only in the context of a <Router> component.
```

`MemoryRouter` provides router context for tests.

It does not open a real browser route. It simply gives React Router enough context to render links.”

---

## Explain Why Add Product Is a Link, Not a Button

```jsx
screen.findByRole('link', { name: 'Add Product' });
```

### Trainer Script

“In the actual `ProductsPage`, `Add Product` is rendered using React Router’s `Link`.

That means the accessible role is `link`, not `button`.

So this is correct:

```jsx
screen.findByRole('link', { name: 'Add Product' });
```

This would be wrong:

```jsx
screen.findByRole('button', { name: 'Add Product' });
```

Tests should match the real UI.”

---

## Explain Async Queries

```jsx
expect(await screen.findByText('P001')).toBeInTheDocument();
```

### Trainer Script

“Because `ProductsPage` loads products inside `useEffect`, product rows do not appear immediately.

The component first renders loading state.

Then the mocked API resolves.

Then React updates the screen.

So we use async queries like `findByText` and `findByRole`.

`findBy...` waits for the element to appear.

Use `findBy...` when the UI appears after async work.”

---

## Explain getByText

```jsx
screen.getByText('Notebook');
```

### Trainer Script

“After the first async assertion has waited for products to load, we can use `getByText` for other product values that should already be on the screen.”

---

## Explain columnheader

```jsx
screen.getByRole('columnheader', { name: 'SKU' });
```

### Trainer Script

“Table headers have the accessible role `columnheader`.

This lets us test the table structure in a user-focused way.”

---

## Important Note About Exact Text

### Trainer Script

“If this test fails because the text is slightly different, do not blindly change the component or the test.

First inspect `ProductsPage.jsx`.

The test should match the actual UI text.

For this project, the helper text is:

```text
Product data loaded from the backend API.
```

If the UI text changes later, update the test only if the new text is intentional.

The goal is to test existing behavior, not imagined behavior.”

---

## Run Frontend Tests

Run:

```powershell
cd frontend
npm test
```

Expected result:

```text
Test Files  1 passed
Tests       4 passed
```

Exact output may differ.

---

## What This Frontend Test Proves

The `ProductsPage` behavior tests prove that:

* The products page renders inside router context.
* The page heading is visible.
* The helper text is visible.
* The Add Product link is visible.
* The product API is mocked.
* The table headers appear after products load.
* Product rows returned by the mocked API appear on the screen.

This is frontend behavior testing.

---

## What Not to Test Today

Do not test Tailwind classes today.

Avoid tests like:

```js
expect(element).toHaveClass('rounded-lg');
```

That kind of test is usually brittle for beginners.

Do not test implementation details like:

```text
- Internal variable names
- Component file structure
- Whether a specific div exists
- Whether a specific Tailwind class was used
```

Focus on user-visible behavior:

```text
- Text appears
- Link appears
- Table headers appear
- Product rows appear after the API call resolves
```

---

# 55–60 Minutes — Final Recap and Next-Day Readiness

## Trainer Recap Script

“Today we learned how to test real project code.

The most important lesson is:

Tests should protect the code the application actually uses.

For the backend, we tested `salesOrder.service.js`, which is the real sales order service used by the API.

Because the service talks to Prisma, we mocked Prisma.

That allowed us to test business behavior without a real database.

We tested important sales order behavior such as:

* Rejecting empty orders
* Creating orders
* Reading order lists
* Reading order details
* Returning `null` when an order detail is missing
* Rejecting insufficient stock
* Confirming valid orders

For the frontend, we tested visible behavior from an existing API-driven page: `ProductsPage`.

We tested:

* Products page heading
* Helper text
* Add Product link
* Product table headers
* Product rows returned by a mocked API call

This is how testing should grow in a real project: start with important business behavior and add coverage around real code.”

---

# Final Review Questions

Ask students:

1. Why should we test real service functions instead of dummy helper files?
2. Which backend service did we test today?
3. Why do we mock Prisma?
4. Why does the Prisma mock need `customer.findUnique`?
5. Why does the Prisma mock need `salesOrder.count`?
6. Why does confirmation use `updateMany`?
7. Why do we use `mockResolvedValueOnce` in the confirmation success test?
8. Why should missing sales order detail return `null` in the test?
9. Why should insufficient stock block confirmation?
10. Why should backend `dev` remain `nodemon src/server.js`?
11. What is the correct watch command?
12. What does React Testing Library help us test?
13. Why do React component tests need `jsdom`?
14. Why did we test `ProductsPage` instead of creating a new component?
15. Why do we need `MemoryRouter` in the `ProductsPage` test?
16. Why is `Add Product` tested as a link instead of a button?
17. Why do we mock `getProducts()`?
18. Why do we use `findBy...` queries for product rows?
19. Why do we have both `vite.config.js` and `vitest.config.js`?
20. Why should we avoid testing Tailwind classes today?

---

## Expected Answers

### 1. Why should we test real service functions instead of dummy helper files?

Because tests should protect production code that the application actually uses. Testing unused helper files does not give confidence that the app works.

---

### 2. Which backend service did we test today?

```text
backend/src/services/salesOrder.service.js
```

---

### 3. Why do we mock Prisma?

Because unit tests should verify service logic without depending on a real database.

---

### 4. Why does the Prisma mock need `customer.findUnique`?

Because `createSalesOrder` validates the customer before creating the order.

---

### 5. Why does the Prisma mock need `salesOrder.count`?

Because `createSalesOrder` uses `salesOrder.count` to generate the order number.

---

### 6. Why does confirmation use `updateMany`?

Because the service updates records conditionally and can check the returned `count`. This helps guard against invalid or stale updates.

---

### 7. Why do we use `mockResolvedValueOnce` in the confirmation success test?

Because `confirmSalesOrder` calls `salesOrder.findUnique` twice: first to load the draft order and second to return the final confirmed order.

---

### 8. Why should missing sales order detail return `null` in the test?

Because the current `getSalesOrderById` service returns whatever Prisma returns. If Prisma returns `null`, the service returns `null`.

---

### 9. Why should insufficient stock block confirmation?

Because the business should not confirm orders it cannot fulfill.

---

### 10. Why should backend `dev` remain `nodemon src/server.js`?

Because the project uses nodemon for hot reload. Replacing it with `node src/server.js` removes automatic restart during development.

---

### 11. What is the correct watch command?

```powershell
npm run test:watch
```

---

### 12. What does React Testing Library help us test?

It helps us test React components based on what users can see and do.

---

### 13. Why do React component tests need `jsdom`?

Because React components render DOM elements, and `jsdom` provides a browser-like DOM environment during tests.

---

### 14. Why did we test `ProductsPage` instead of creating a new component?

Because tests should protect real project code. `ProductsPage` already exists in the application, so testing it gives more useful confidence than testing a new component created only for demonstration.

---

### 15. Why do we need `MemoryRouter` in the `ProductsPage` test?

Because `ProductsPage` renders React Router `Link` components, and `Link` needs router context.

---

### 16. Why is `Add Product` tested as a link instead of a button?

Because the actual component renders `Add Product` using React Router `Link`, which has the accessible role `link`.

---

### 17. Why do we mock `getProducts()`?

Because the component calls the backend API when it loads. In a component test, we do not want to depend on a real backend server.

---

### 18. Why do we use `findBy...` queries for product rows?

Because products appear after an async API call. `findBy...` waits for the element to appear.

---

### 19. Why do we have both `vite.config.js` and `vitest.config.js`?

`vite.config.js` is used by the frontend dev server and production build.

`vitest.config.js` is test-only. It merges the existing Vite config and adds test settings such as `jsdom`, `globals`, and the setup file.

---

### 20. Why should we avoid testing Tailwind classes today?

Because class-based tests are often brittle and focus on implementation details rather than user-visible behavior.

---

# Day 14 Success Criteria

Students are successful if:

* Backend tests target the real `salesOrder.service.js`.
* No dummy testing-only backend service file is created.
* Existing service exports are not broken.
* Prisma mock includes:

  * `customer.findUnique`
  * `salesOrder.count`
  * `salesOrder.create`
  * `salesOrder.findMany`
  * `salesOrder.findUnique`
  * `salesOrder.updateMany`
  * `product.findMany`
  * `product.updateMany`
  * `stockMovement.create`
  * `$transaction`
* Tests use actual error messages.
* Tests use `updateMany` where the service uses `updateMany`.
* Confirmation success test uses sequential `findUnique` mock values.
* Missing sales order detail test expects `null`, not a thrown error.
* `npm test` works in backend.
* `npm run test:watch` works in backend.
* Backend `dev` still uses `nodemon`.
* Frontend test setup does not remove `lint` or `preview`.
* Existing `vite.config.js` remains unchanged.
* Frontend `vitest.config.js` uses `mergeConfig` to reuse `vite.config.js`.
* Frontend Vitest config uses `jsdom`.
* `src/test/setup.js` imports `@testing-library/jest-dom/vitest`.
* `ProductsPage.test.jsx` mocks `getProducts`.
* `ProductsPage.test.jsx` wraps `ProductsPage` in `MemoryRouter`.
* `ProductsPage.test.jsx` tests visible heading and helper text.
* `ProductsPage.test.jsx` tests Add Product as a link.
* `ProductsPage.test.jsx` tests table headers after products load.
* `ProductsPage.test.jsx` tests product rows returned by the mocked API.
* Students can explain what behavior their tests protect.

---

# Suggested Next Day Bridge

The next testing step can be API/integration testing.

Possible next topics:

* Test `POST /api/sales-orders`
* Test `GET /api/sales-orders`
* Test `POST /api/sales-orders/:id/confirm`
* Use a test database
* Seed test data
* Test API status codes and response bodies
* Add GitHub Actions to run tests automatically before pull requests are merged

Trainer closing line:

“Today we tested the service layer and frontend page behavior. Next, we can test the API layer that connects the frontend and backend.”
