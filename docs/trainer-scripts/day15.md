# Day 15 Trainer Script — API Integration Tests and Week 3 Review

Fullstack Training Program  
Mini Business Operations App

---

## Trainer Positioning

Day 15 completes Week 3 of the Fullstack Training Program.

By now, students have moved beyond simple CRUD screens. The Mini Business Operations App now includes the core business workflow:

```text
Product master
  ↓
Customer master
  ↓
Sales order creation
  ↓
Sales order line items
  ↓
Backend total calculation
  ↓
Stock validation
  ↓
Order confirmation
  ↓
Stock reduction
  ↓
Stock movement record
```

Day 14 introduced automated testing by testing real backend service code and frontend page behavior.

Day 15 moves one level higher.

Today students will test the backend through real HTTP API endpoints.

The key teaching message for Day 15:

> Unit tests tell us whether important functions behave correctly. API/integration tests tell us whether the backend works correctly when the app is used through real HTTP endpoints.

Today should not become a generic testing lecture. Keep every concept tied to the Mini Business Operations App.

The most important flow to protect is:

```text
Create product
Create customer
Create draft sales order
Confirm sales order
Verify stock reduced
Verify double confirmation is blocked
Verify insufficient stock is blocked
```

---

## Day Goal

By the end of Day 15, students should be able to:

1. Explain the difference between unit tests and API/integration tests.
2. Explain why API tests are valuable for business workflows.
3. Install and use Supertest.
4. Test real Express endpoints without manually using Postman.
5. Create product test data through the API.
6. Create customer test data through the API.
7. Create a draft sales order through the API.
8. Confirm a sales order through the API.
9. Verify product stock reduction after confirmation.
10. Verify insufficient stock rejection.
11. Verify double confirmation rejection.
12. Run the backend test suite locally.
13. Document manual UI test scenarios in the README.
14. Open the Week 3 pull request.

---

## End-of-Day Deliverable

A Week 3 PR opened with:

- Product and customer flows working
- Sales order creation working
- Sales order confirmation working
- Stock validation working
- Stock movement records created
- React sales order create and detail pages working
- Backend unit tests from Day 14
- Backend API/integration tests from Day 15
- README updated with API test command and manual UI test scenario

Suggested PR title:

```text
Week 3 Business Workflow: Sales orders, stock validation, and API tests
```

Suggested commit message:

```text
Add API integration tests for sales order flow
```

---

# Morning Session — 1 Hour

## Suggested Timing

| Time | Topic |
|---:|---|
| 0–10 min | Recap Day 14 and testing levels |
| 10–20 min | Unit tests vs API/integration tests |
| 20–30 min | Main business flow to protect |
| 30–42 min | Supertest setup and basic endpoint test |
| 42–55 min | Trainer demo: sales order API flow test |
| 55–60 min | Assign hands-on work and success criteria |

---

## 0–10 Minutes — Recap Day 14 and Testing Levels

### Trainer Script

“Yesterday we introduced automated testing for the real code in our Mini Business Operations App.

The important point was that we did not create fake helper files only for testing.

On the backend, we tested the real sales order service file:

```text
backend/src/services/salesOrder.service.js
```

That service is responsible for creating sales orders, calculating totals, confirming orders, checking stock, reducing stock, and creating stock movement records.

On the frontend, we tested real user-visible behavior from an existing page.

Today, we move from service-level tests to API-level tests.”

### Ask the Students

#### Q1. What did we test on Day 14?

Expected answer:

“We tested real backend sales order service functions and frontend behavior for an existing page.”

Trainer follow-up:

“Correct. We tested important behavior, but the backend service tests used mocked Prisma.”

#### Q2. Why did we mock Prisma in unit tests?

Expected answer:

“Because unit tests should test service behavior without depending on a real database.”

Trainer follow-up:

“Correct. Mocking made the tests faster and easier to control.”

#### Q3. What is the limitation of only testing services with mocked Prisma?

Expected answer:

“It does not prove that the real Express route, controller, service, Prisma, and database work together.”

Trainer follow-up:

“Exactly. That is why today we add API/integration tests.”

---

## 10–20 Minutes — Unit Tests vs API/Integration Tests

### Trainer Script

“Let us compare the two testing styles clearly.

A unit test checks a small piece of code in isolation.

For example:

```js
await confirmSalesOrder(orderId);
```

In a unit test, we may mock Prisma and control what the database returns.

An API test calls the real HTTP endpoint:

```text
POST /api/sales-orders/:id/confirm
```

This means Express receives the request, sends it to the route, the route calls the controller, the controller calls the service, the service calls Prisma, and Prisma talks to the database.

So API tests are slower than unit tests, but they give stronger confidence that the full backend path works.”

### Whiteboard Table

| Test Type | Scope | Speed | Confidence |
|---|---|---|---|
| Unit test | One function/module | Fast | Good for logic |
| API/integration test | Route + controller + service + database | Slower | Good for real backend behavior |
| Manual UI test | Browser + frontend + backend | Slowest | Good for final user flow |

### Ask the Students

#### Q1. Which test is faster: unit test or API test?

Expected answer:

“Unit test.”

#### Q2. Which test gives more confidence that the backend endpoint works as a whole?

Expected answer:

“API/integration test.”

#### Q3. Do API tests replace unit tests?

Expected answer:

“No. They complement each other. Unit tests protect focused logic. API tests protect the full backend flow.”

Trainer explanation:

“Correct. Good projects usually have both.”

---

## 20–30 Minutes — Main Business Flow to Protect

### Trainer Script

“In this app, not all flows are equally important.

A static dashboard display matters, but the most important business behavior is the sales order confirmation flow.

Why?

Because confirmation changes stock.

If confirmation has a bug, the business may show wrong inventory.

For example:

- If stock reduces during draft order creation, inventory becomes wrong.
- If stock does not reduce during confirmation, inventory becomes wrong.
- If confirmation can happen twice, stock reduces twice.
- If insufficient stock is allowed, the business may accept orders it cannot fulfill.

So today’s API tests should protect the sales order business flow.”

### Whiteboard Flow

```text
POST /api/products
  ↓
POST /api/customers
  ↓
POST /api/sales-orders
  ↓
POST /api/sales-orders/:id/confirm
  ↓
Check product stock reduced
  ↓
Try confirm again
  ↓
Expect failure
```

### Ask the Students

#### Q1. Why is confirmation more dangerous than creating a product?

Expected answer:

“Because confirmation changes inventory and creates business impact.”

#### Q2. What should happen if stock is insufficient?

Expected answer:

“The backend should reject confirmation and return a useful error.”

#### Q3. What should happen if the same order is confirmed twice?

Expected answer:

“The backend should block it. Stock should not reduce twice.”

---

## 30–42 Minutes — Supertest Setup and Basic Endpoint Test

### Trainer Script

“To test HTTP endpoints from code, we will use Supertest.

Supertest lets us call the Express app in a test file.

Instead of manually opening Postman and calling `/health`, the test can do this automatically.”

### Trainer Demo — Install Supertest

```powershell
cd backend
npm install -D supertest
```

Confirm test script exists in `backend/package.json`.

Example:

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

### Trainer Demo — Create Integration Test File

Create:

```text
backend/tests/integration/salesOrder.api.test.js
```

Add a basic health test first:

```js
const request = require('supertest');
const app = require('../../src/app');

describe('Backend API smoke tests', () => {
  test('GET /health returns ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
```

### Trainer Explanation

“Start with the simplest endpoint. This confirms that Supertest can import our app and call it.

If this fails, do not start writing bigger tests yet. First fix the test setup.”

### Common Setup Issue

If the test starts the server or hangs, check that students imported:

```text
src/app.js
```

not:

```text
src/server.js
```

Explain:

“`app.js` should define and export the Express app. `server.js` should only start listening on a port. Tests should import `app.js`.”

---

## 42–55 Minutes — Trainer Demo: Sales Order API Flow Test

### Trainer Script

“Now we will test the real business flow.

The test will create data through the API, not by directly inserting into the database.

This is closer to how the frontend uses the backend.”

### Demo Structure

```js
const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/lib/prisma');

describe('Sales order API flow', () => {
  let product;
  let customer;
  let salesOrder;

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('creates a product', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({
        sku: `TEST-PROD-${Date.now()}`,
        name: 'Test Notebook',
        price: 50,
        stockQty: 10
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    product = response.body;
  });

  test('creates a customer', async () => {
    const response = await request(app)
      .post('/api/customers')
      .send({
        code: `TEST-CUST-${Date.now()}`,
        name: 'Test Customer',
        phone: '9876543210',
        email: 'test@example.com'
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    customer = response.body;
  });

  test('creates a draft sales order', async () => {
    const response = await request(app)
      .post('/api/sales-orders')
      .send({
        customerId: customer.id,
        items: [
          {
            productId: product.id,
            quantity: 2,
            rate: 50
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('DRAFT');
    expect(Number(response.body.totalAmount)).toBe(100);

    salesOrder = response.body;
  });

  test('confirms the sales order', async () => {
    const response = await request(app)
      .post(`/api/sales-orders/${salesOrder.id}/confirm`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('CONFIRMED');
  });

  test('reduces product stock after confirmation', async () => {
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id }
    });

    expect(updatedProduct.stockQty).toBe(8);
  });
});
```

### Trainer Explanation

“This one test file is exercising a lot of the backend:

- Product route
- Product controller
- Product service
- Customer route
- Customer controller
- Customer service
- Sales order route
- Sales order controller
- Sales order service
- Prisma
- Database
- Stock update logic

That is why API/integration tests give strong confidence.”

---

## 55–60 Minutes — Assign Hands-On Work and Success Criteria

### Trainer Script

“Your hands-on task today is to add API/integration tests for the Week 3 sales order flow.

Start with the health endpoint.

Then test product creation.

Then customer creation.

Then sales order creation.

Then confirmation.

After that, add failure tests:

- insufficient stock should fail
- double confirmation should fail
- order without items should fail

Finally, document the manual UI scenario in the README and open your Week 3 pull request.”

### Success Criteria

By the end of the hands-on session, students should have:

- Supertest installed.
- Integration test folder created.
- At least one health endpoint test.
- Product create API test.
- Customer create API test.
- Sales order create API test.
- Sales order confirm API test.
- Stock reduction verification.
- Insufficient stock failure test.
- Double confirmation failure test.
- README manual test scenario.
- Week 3 PR opened.

---

# Afternoon Session — 1 Hour

## Suggested Timing

| Time | Activity |
|---:|---|
| 0–10 min | Student demo of tests |
| 10–25 min | Review API test quality |
| 25–40 min | Debug test failures |
| 40–50 min | Week 3 business workflow review |
| 50–58 min | PR readiness checklist |
| 58–60 min | Preview Day 16 |

---

## 0–10 Minutes — Student Demo

Ask students to show:

1. Test file location.
2. Test command.
3. Passing test output.
4. One successful business-flow test.
5. One failure case test.

Expected command:

```powershell
cd backend
npm test
```

---

## 10–25 Minutes — Review API Test Quality

Review the tests using this checklist.

### Good Test Signs

- Test names describe behavior clearly.
- Test data is unique.
- Tests check status codes.
- Tests check important response body values.
- Tests verify stock reduction.
- Tests verify important failure cases.
- Tests do not use production credentials.
- Tests do not depend on manually created records.

### Weak Test Signs

- Test name says only `test 1`.
- Test does not assert anything meaningful.
- Test uses hardcoded SKU that can collide.
- Test assumes old database data already exists.
- Test only checks status `200` without checking business result.
- Test directly calls service instead of endpoint.
- Test imports `server.js` instead of `app.js`.

---

## 25–40 Minutes — Debug Test Failures

Use common failure categories.

### Failure 1: Cannot find module

Check relative imports.

From:

```text
backend/tests/integration/salesOrder.api.test.js
```

To:

```text
backend/src/app.js
```

Use:

```js
const app = require('../../src/app');
```

### Failure 2: Server starts or test hangs

Student likely imported `server.js`.

Fix:

```js
const app = require('../../src/app');
```

Do not import:

```js
const app = require('../../src/server');
```

### Failure 3: Duplicate SKU or customer code

Use timestamp-based test data:

```js
const unique = Date.now();
```

Example:

```js
sku: `TEST-PROD-${unique}`
```

### Failure 4: Decimal mismatch

Use `Number()`:

```js
expect(Number(response.body.totalAmount)).toBe(100);
```

### Failure 5: Wrong status code

Ask:

“Is the controller returning the correct status code?”

Recommended:

- `201` for create
- `200` for successful read or confirm
- `400` for validation failure
- `404` for missing record

### Failure 6: Stock not reduced

Check:

- Is confirmation endpoint called?
- Is order status still `DRAFT` before confirmation?
- Does the order have items?
- Does the product have enough stock?
- Is Prisma transaction updating product stock?
- Is test fetching the updated product after confirmation?

---

## 40–50 Minutes — Week 3 Business Workflow Review

### Trainer Script

“This week was the business workflow week.

Let us connect everything we built.”

Whiteboard:

```text
Day 11:
Sales order schema and list foundation

Day 12:
Sales order creation API and React order form

Day 13:
Confirmation API, stock validation, stock movements, detail page

Day 14:
Unit tests for real sales order service and frontend behavior tests

Day 15:
API/integration tests and Week 3 PR
```

### Ask Students

#### Q1. What is the difference between creating and confirming an order?

Expected answer:

“Creating an order creates a draft. Confirming an order accepts it as a business transaction and reduces stock.”

#### Q2. Why should backend calculate totals?

Expected answer:

“The frontend can be manipulated. Backend must be the source of truth.”

#### Q3. Why should backend validate stock?

Expected answer:

“Stock is business-critical. The backend must prevent invalid confirmations.”

#### Q4. Why use a Prisma transaction during confirmation?

Expected answer:

“Because multiple related database changes must succeed or fail together: order status update, stock reduction, and stock movement creation.”

#### Q5. Why did we add tests after building the flow?

Expected answer:

“To protect the business logic from future accidental changes.”

---

## 50–58 Minutes — PR Readiness Checklist

Before opening or reviewing the Week 3 PR, check:

### Backend

- Sales order models exist.
- Sales order migration exists.
- Sales order list API works.
- Sales order detail API works.
- Sales order create API works.
- Sales order confirm API works.
- Stock validation works.
- Stock reduction works.
- Stock movement record is created.
- Double confirmation is blocked.
- Backend tests pass.

### Frontend

- Sales Orders navigation exists.
- SalesOrdersPage works.
- SalesOrderCreatePage works.
- SalesOrderDetailPage works.
- Confirm button appears only when appropriate.
- Loading state is handled.
- Error state is handled.
- Empty state is handled.
- Success/failure message is visible.

### Tests

- Unit tests exist.
- API/integration tests exist.
- Frontend behavior test exists.
- Tests run using documented command.

### Documentation

- README updated.
- API test command documented.
- Manual UI test scenario documented.
- Environment notes are clear.
- No real `.env` secrets committed.

### GitHub

- Branch pushed.
- PR opened.
- PR title is clear.
- Commit messages are meaningful.
- PR description explains what was completed.

---

## 58–60 Minutes — Preview Day 16

### Trainer Script

“Week 3 is now complete.

The app has the main business workflow.

From Day 16 onward, we enter the polish and deployment-readiness phase.

Next, we will focus on making the project more professional:

- improving README documentation
- preparing environment variables
- adding GitHub Actions CI
- checking frontend and backend build commands
- preparing deployment notes
- moving toward final demo readiness

The goal is no longer only to build features.

The goal is to make the app easy to run, test, review, and eventually deploy.”

---

# Trainer Notes

## Keep the Focus Practical

Avoid long theory about testing frameworks.

Use this teaching loop:

```text
Business risk
  ↓
Test scenario
  ↓
API endpoint
  ↓
Expected result
```

Example:

```text
Business risk:
Stock may reduce twice.

Test scenario:
Confirm same order twice.

API endpoint:
POST /api/sales-orders/:id/confirm

Expected result:
Second confirmation fails.
```

---

## Avoid These Mistakes

Do not allow students to:

- Write tests against dummy endpoints only.
- Test only `/health` and stop.
- Insert all test data manually in the database.
- Use production database credentials.
- Import `server.js` in tests.
- Skip failure cases.
- Ignore stock verification.
- Leave README undocumented.
- Open a Week 3 PR without running tests.

---

## Minimum Acceptable Day 15 Completion

If students are slow, the minimum acceptable completion is:

- Supertest installed.
- Health endpoint test.
- Product create test.
- Customer create test.
- Sales order create test.
- Sales order confirmation test.
- One stock reduction assertion.
- README manual scenario added.

The insufficient stock and double confirmation tests can be completed as follow-up if needed.

---

## Strong Completion

A strong student should complete:

- All minimum tests.
- Insufficient stock failure test.
- Double confirmation failure test.
- Create order without items failure test.
- Stock movement verification.
- Clean test data strategy.
- Clear README update.
- Week 3 PR ready for review.

---

## Suggested PR Review Comments

Use comments like:

- “Good test coverage for the main sales order flow.”
- “Please add one failure case for insufficient stock.”
- “Avoid relying on existing database records. Create test data inside the test.”
- “Good use of unique SKU/customer code values.”
- “Please verify stock movement creation, not only stock reduction.”
- “README should explain how to run the tests.”
- “Do not import server.js in tests. Import app.js.”
- “Good separation between unit tests and API integration tests.”
