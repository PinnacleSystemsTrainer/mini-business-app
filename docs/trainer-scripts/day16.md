# Day 16 Trainer Script — Project Hardening, Refactoring, Production Readiness, and Application Demonstration

Fullstack Training Program  
Mini Business Operations App

---

## Trainer Positioning

Day 16 is a project hardening day.

Students have already built the main Mini Business Operations App workflow:

- Product management
- Customer management
- Sales order data model
- Sales order list and detail pages
- Sales order creation
- Backend total calculation
- Stock validation
- Order confirmation
- Stock reduction
- Stock movement creation
- Backend tests
- Frontend tests

Today should not feel like a generic refactoring lecture.

The message for students is:

> The application now works. Today we make it cleaner, safer, easier to maintain, easier to test, and easier to hand over.

Day 16 should connect directly to Day 14 and Day 15 testing work.

Testing gives students a safety net. Refactoring teaches them how to improve structure without changing behavior.

---

## Day Goal

By the end of Day 16, students should be able to:

1. Explain what technical debt is.
2. Explain what refactoring is.
3. Distinguish refactoring from feature changes.
4. Review backend service files for duplication and maintainability.
5. Refactor repeated backend error creation.
6. Review existing product validation and reuse/improve it only where duplication remains.
7. Refactor sales order validation and calculation logic where appropriate.
8. Review frontend pages for repeated loading, error, and empty states.
9. Reuse existing shared frontend UI components, or extract them only if they are still missing.
10. Extract repeated API response handling into a shared helper.
11. Run tests after refactoring.
12. Review production readiness.
13. Demonstrate the complete application workflow.

---

## End-of-Day Deliverable

Students should complete:

```text
- Existing workflow verified
- At least one backend refactor completed
- At least one frontend refactor completed
- Backend tests run
- Frontend tests run
- README reviewed or updated
- .gitignore reviewed
- Production readiness checklist completed
- Final business workflow demonstrated
- Work committed
```

Suggested commit message:

```bash
git add .
git commit -m "Harden project and prepare application demonstration"
```

---

# Morning Session — 1 Hour

## Suggested Timing

| Time | Topic |
|---|---|
| 0–10 min | Recap Day 14 and Day 15 |
| 10–20 min | Technical debt and refactoring |
| 20–35 min | Backend hardening workshop |
| 35–50 min | Backend refactoring examples |
| 50–60 min | Assign hands-on backend work |

---

## 0–10 Minutes — Recap Day 14 and Day 15

### Trainer Script

“In the last few sessions, we moved from just building features to checking whether those features are reliable.

We tested real backend service behavior and frontend behavior. We also reviewed the business workflow around sales orders, confirmation, stock validation, stock reduction, and stock movement records.

Today we will use those tests as a safety net while improving the code structure.

The goal is not to add a large new feature. The goal is to prepare the Mini Business Operations App for handover.”

### Ask Students

#### Q1. What were the most important business rules we tested?

Expected answer:

“Sales order creation should validate customer, products, quantity, and rate. The backend should calculate totals. Order confirmation should check stock, reduce stock, create stock movement records, and prevent double confirmation.”

#### Q2. Why are tests useful before refactoring?

Expected answer:

“Tests help confirm that behavior does not break when we improve code structure.”

#### Q3. Should refactoring change how the application behaves?

Expected answer:

“No. Refactoring should improve structure without changing behavior.”

### Trainer Bridge

“Good. That is the core idea today. We already have working behavior. Now we improve the code safely.”

---

## 10–20 Minutes — Technical Debt and Refactoring

### Trainer Script

“Technical debt means code that works now but becomes harder to maintain later.

Technical debt is normal. Every real project develops some technical debt while features are being built.

For example, when we were building product, customer, and sales order features, we may have repeated validation code, repeated error creation code, repeated loading messages, or repeated API response handling.

Today we will identify these areas and clean up a few of them.”

### Whiteboard Examples

Write:

```text
Technical Debt Examples in Our Project

- Product validation to review
- Customer validation repeated
- Sales order validation is long
- Error creation is repeated
- Loading UI consistency to verify
- handleResponse repeated in API files
- README may not fully explain setup
```

### Explain Refactoring

Trainer Script:

“Refactoring means improving internal structure without changing behavior.

If behavior changes, that is not just refactoring. That is a feature change or bug fix.

Professional workflow:

Run tests, refactor, run tests again.”

### Ask Students

#### Q1. What is technical debt?

Expected answer:

“Technical debt is code that works but becomes harder to understand, change, or maintain over time.”

#### Q2. What is refactoring?

Expected answer:

“Refactoring means improving code structure without changing what the application does.”

#### Q3. Why should we avoid refactoring too many things at once?

Expected answer:

“Because if something breaks, it becomes difficult to know which change caused the issue.”

---

## 20–35 Minutes — Backend Hardening Workshop

### Trainer Script

“Let us inspect the backend using the structure we have been following since Week 1.

Routes map URLs.
Controllers handle request and response.
Services contain business logic.

Today, most backend review should focus on service files because that is where validation, calculation, and business rules live.”

### Files To Inspect

Ask students to open:

```text
backend/src/services/product.service.js
backend/src/services/customer.service.js
backend/src/services/salesOrder.service.js
```

### Review Checklist

Ask students to look for:

```text
- Repeated error creation
- Repeated validation
- Long functions
- Repeated calculations
- Business logic inside controllers
- Inconsistent error messages
- Unused code
```

### Discussion Questions

#### Q1. What should stay inside a service file?

Expected answer:

“Business logic, validation, calculations, duplicate checks, database operations, and workflow rules.”

#### Q2. What should stay inside a controller?

Expected answer:

“Reading request data, calling the service, sending response, and passing errors to middleware.”

#### Q3. Why should route files stay thin?

Expected answer:

“Routes should only map URLs and HTTP methods to controller functions. Business logic in routes makes the app harder to maintain.”

---

## 35–50 Minutes — Backend Refactoring Examples

### Example 1 — Repeated Error Creation

Trainer Script:

“Many backend services create errors like this.”

Show:

```js
const error = new Error('SKU already exists');
error.statusCode = 400;
throw error;
```

Explain:

“This works, but if this pattern appears everywhere, it becomes repeated code.”

### Refactor

Create:

```text
backend/src/utils/appError.js
```

Add:

```js
function createAppError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  createAppError,
};
```

Use:

```js
const { createAppError } = require('../utils/appError');

throw createAppError('SKU already exists', 400);
```

### Ask

#### Q. Did application behavior change?

Expected answer:

“No. The same error is still thrown. The structure is cleaner.”

---

### Example 2 — Product Validation Refactor

Trainer Script:

“Now let us look at product creation. Product creation may include required field validation, number validation, duplicate SKU check, and database create logic.”

Show before:

```js
async function createProduct(data) {
  if (!data.sku || !data.name) {
    const error = new Error('SKU and name are required');
    error.statusCode = 400;
    throw error;
  }

  if (Number(data.price) <= 0) {
    const error = new Error('Price must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  if (Number(data.stockQty) < 0) {
    const error = new Error('Stock quantity cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      sku: data.sku,
    },
  });

  if (existingProduct) {
    const error = new Error('SKU already exists');
    error.statusCode = 400;
    throw error;
  }

  return prisma.product.create({
    data: {
      sku: data.sku,
      name: data.name,
      price: Number(data.price),
      stockQty: Number(data.stockQty || 0),
    },
  });
}
```

Explain:

“Earlier versions of the project may have had validation directly inside `createProduct`. In the current repo, `product.service.js` may already contain `validateProductInput`, input normalization, and duplicate SKU handling. Do not recreate what already exists. Day 16 should review this code, confirm it is used consistently, and only refactor remaining duplication.”

Current expected direction:

```js
function validateProductInput(data, { partial = false } = {}) {
  // Keep the existing project implementation if it already handles
  // required fields, number conversion, and partial update cases.
}

function normalizeProductInput(data) {
  // Keep normalization in one place so create/update flows are consistent.
}

async function createProduct(data) {
  validateProductInput(data);
  const normalized = normalizeProductInput(data);

  // Keep duplicate SKU handling here or in a clearly named helper.
  // Do not change API behavior during refactoring.
}
```

Possible safe refactor if repeated error creation remains:

```js
function createAppError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
```

### Ask Students

#### Q1. What changed?

Expected answer:

“Validation moved into a separate function. Product creation behavior remains the same.”

#### Q2. Why is this easier to read?

Expected answer:

“The main createProduct flow is clearer: validate input, check duplicate SKU, create product.”

---

### Example 3 — Sales Order Validation Refactor

Trainer Script:

“Sales order validation is more complex because an order has a customer and many line items.

If the validation function becomes too long, split it into smaller functions.”

Show after version:

```js
const { createAppError } = require('../utils/appError');

function validateOrderHasCustomer(data) {
  if (!data.customerId) {
    throw createAppError('Customer is required', 400);
  }
}

function validateOrderHasItems(data) {
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw createAppError('Order must have at least one item', 400);
  }
}

function validateOrderItem(item, index) {
  const itemNumber = index + 1;

  if (!item.productId) {
    throw createAppError(`Product is required for item ${itemNumber}`, 400);
  }

  if (Number(item.quantity) <= 0) {
    throw createAppError(`Quantity must be greater than zero for item ${itemNumber}`, 400);
  }

  if (Number(item.rate) <= 0) {
    throw createAppError(`Rate must be greater than zero for item ${itemNumber}`, 400);
  }
}

function validateOrderInput(data) {
  validateOrderHasCustomer(data);
  validateOrderHasItems(data);
  data.items.forEach(validateOrderItem);
}
```

### Ask Students

#### Q. Why is this useful?

Expected answer:

“The main validation function reads like a checklist. Each smaller function has one responsibility.”

---

### Example 4 — Sales Order Calculation Helper

Trainer Script:

“Calculations are good candidates for helper functions because they are easy to test and reuse.”

Create:

```text
backend/src/utils/salesOrderCalculations.js
```

Add:

```js
function calculateLineTotal(quantity, rate) {
  return Number(quantity) * Number(rate);
}

function calculateOrderTotal(items) {
  return items.reduce((sum, item) => {
    return sum + calculateLineTotal(item.quantity, item.rate);
  }, 0);
}

module.exports = {
  calculateLineTotal,
  calculateOrderTotal,
};
```

Use in service:

```js
const {
  calculateLineTotal,
  calculateOrderTotal,
} = require('../utils/salesOrderCalculations');
```

Trainer Warning:

“Do not break the existing service exports. The controllers still need functions like createSalesOrder and confirmSalesOrder.”

---

## 50–60 Minutes — Assign Hands-On Backend Work

### Hands-On Assignment

Students should choose one backend hardening task:

1. Add `createAppError` helper and use it in one service.
2. Review the existing `validateProductInput` implementation and avoid recreating it if it already exists.
3. Split sales order validation into smaller functions.
4. Extract sales order calculation helpers.

After the change, students must run:

```bash
cd backend
npm test
```

### Success Criteria

Backend refactor is successful when:

```text
[ ] Behavior is unchanged
[ ] Backend tests pass
[ ] Controller imports still work
[ ] Service exports are not broken
[ ] Error response shape remains consistent
```

---

# Afternoon Session — 1 Hour

## Suggested Timing

| Time | Topic |
|---|---|
| 0–10 min | Backend refactor review |
| 10–25 min | Frontend hardening workshop |
| 25–40 min | Frontend refactoring examples |
| 40–50 min | Production readiness review |
| 50–60 min | Application demonstration and wrap-up |

---

## 0–10 Minutes — Backend Refactor Review

Ask students to show:

```text
- What file changed?
- What code was repeated?
- What was extracted?
- Which tests were run?
- Did behavior change?
```

### Trainer Questions

#### Q1. What did you refactor?

Expected answer depends on student work.

#### Q2. How did you verify behavior did not change?

Expected answer:

“I ran tests and manually checked the related API or page.”

#### Q3. What would be risky about refactoring many files at once?

Expected answer:

“If something breaks, it becomes harder to identify the cause.”

---

## 10–25 Minutes — Frontend Hardening Workshop

### Trainer Script

“Now let us review the frontend.

During Week 2 and Week 3, we created several pages. Many pages need loading, error, and empty states. If every page writes these from scratch, the UI becomes inconsistent.

Today we will look for repeated UI patterns and repeated API handling.”

### Files To Inspect

Ask students to open:

```text
frontend/src/pages/ProductsPage.jsx
frontend/src/pages/CustomersPage.jsx
frontend/src/pages/SalesOrdersPage.jsx
frontend/src/pages/SalesOrderDetailPage.jsx
frontend/src/api/productApi.js
frontend/src/api/customerApi.js
frontend/src/api/salesOrderApi.js
```

### Review Checklist

Look for:

```text
- Repeated loading messages
- Repeated error messages
- Repeated empty state messages
- Repeated handleResponse functions
- Hardcoded API URLs
- Unused imports
- Large components
```

### Ask Students

#### Q1. Why should loading and error states be consistent?

Expected answer:

“Because users should get predictable feedback across the app.”

#### Q2. Why should API response handling be centralized?

Expected answer:

“So all API files handle backend success and error responses consistently.”

---

## 25–40 Minutes — Frontend Refactoring Examples

### Example 1 — LoadingMessage

Before:

```jsx
if (loading) {
  return <p>Loading products...</p>;
}
```

Refactor:

```text
frontend/src/components/ui/LoadingMessage.jsx
```

```jsx
function LoadingMessage({ message = 'Loading...' }) {
  return (
    <div className="rounded-lg border bg-white p-4 text-sm text-gray-600 shadow-sm">
      {message}
    </div>
  );
}

export default LoadingMessage;
```

Usage:

```jsx
import LoadingMessage from '../components/ui/LoadingMessage';

if (loading) {
  return <LoadingMessage message="Loading products..." />;
}
```

### Ask

#### Q. What changed?

Expected answer:

“The loading UI moved into a reusable component. The page behavior remains the same.”

---

### Example 2 — ErrorMessage

Before:

```jsx
if (error) {
  return <p>{error}</p>;
}
```

Refactor:

```text
frontend/src/components/ui/ErrorMessage.jsx
```

```jsx
function ErrorMessage({ message = 'Something went wrong.' }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {message}
    </div>
  );
}

export default ErrorMessage;
```

Usage:

```jsx
import ErrorMessage from '../components/ui/ErrorMessage';

if (error) {
  return <ErrorMessage message={error} />;
}
```

### Ask

#### Q. Why is `role="alert"` useful?

Expected answer:

“It helps identify the message as an important alert, including for assistive technologies.”

---

### Example 3 — EmptyState

Create:

```text
frontend/src/components/ui/EmptyState.jsx
```

```jsx
function EmptyState({ title = 'No data found', description }) {
  return (
    <div className="rounded-lg border border-dashed bg-white p-6 text-center shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      ) : null}
    </div>
  );
}

export default EmptyState;
```

Usage:

```jsx
if (products.length === 0) {
  return (
    <EmptyState
      title="No products found"
      description="Create your first product to start using the app."
    />
  );
}
```

For sales orders:

```jsx
<EmptyState
  title="No sales orders found"
  description="Create a sales order after products and customers are ready."
/>
```

---

### Example 4 — Shared API Response Handling

Trainer Script:

“Many API files may have the same handleResponse function. That is a strong refactoring candidate.”

Before:

```js
async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}
```

Create:

```text
frontend/src/api/httpClient.js
```

Add:

```js
export async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}
```

Use in `productApi.js`:

```js
import { handleResponse } from './httpClient';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  return handleResponse(response);
}
```

Use similar imports in `customerApi.js` and `salesOrderApi.js`.

### Trainer Warning

“Do not accidentally change API URLs or request methods while refactoring. In the current repo, `VITE_API_BASE_URL` already includes `/api`, so product calls should use `${API_BASE_URL}/products`, not `${API_BASE_URL}/api/products`. Keep behavior the same.”

---

## 40–50 Minutes — Production Readiness Review

### Trainer Script

“Now we will review whether the project is clean enough to hand over or prepare for deployment.

Production readiness does not mean the app is perfect. It means obvious risks are handled.”

### Backend Checklist

Ask students to verify:

```text
[ ] Backend starts
[ ] /health works
[ ] Product APIs work
[ ] Customer APIs work
[ ] Sales order APIs work
[ ] Confirmation API works
[ ] Error responses use message field
[ ] Environment variables are used
[ ] No passwords are hardcoded
[ ] Backend tests pass
```

### Frontend Checklist

```text
[ ] Frontend starts
[ ] Navigation works
[ ] Product pages work
[ ] Customer pages work
[ ] Sales order pages work
[ ] Loading states exist
[ ] Error states exist
[ ] Empty states exist
[ ] API URL follows the current convention: VITE_API_BASE_URL includes /api, endpoint paths use /products, /customers, /sales-orders
[ ] Frontend tests pass
```

### Repository Checklist

```text
[ ] README explains the project
[ ] README has setup instructions
[ ] README has test instructions
[ ] .gitignore includes node_modules
[ ] .gitignore includes .env
[ ] .gitignore includes dist
[ ] .gitignore includes coverage
[ ] node_modules is not committed
[ ] .env is not committed
```

### Ask Students

#### Q1. Why should `.env` not be committed?

Expected answer:

“It may contain database URLs, passwords, API keys, or deployment secrets.”

#### Q2. Why should README include setup instructions?

Expected answer:

“So another developer can install, run, test, and understand the project.”

#### Q3. Why should API URLs come from environment variables?

Expected answer:

“Because local and production backend URLs may be different.”

---

## 50–60 Minutes — Application Demonstration and Wrap-Up

### Demonstration Flow

Ask students to demonstrate:

```text
1. Start backend
2. Start frontend
3. Create product
4. Create customer
5. Create sales order
6. Confirm sales order
7. Show stock reduction
8. Show stock movement record using DB/API/test evidence, unless a UI view already exists
9. Run backend tests
10. Run frontend tests
```

### Trainer Script

“This demonstration is not just a UI demo. It is a business workflow demo.

You should be able to explain what happens in the frontend, backend, service layer, Prisma, and database.”

### Ask Final Review Questions

#### Q1. What happens when a sales order is created?

Expected answer:

“The frontend sends customer and item details. The backend validates the customer and products, validates quantity and rate, calculates line totals and order total, and saves a draft order with items.”

#### Q2. What happens when a sales order is confirmed?

Expected answer:

“The backend checks the order is still draft, validates stock, reduces product stock, creates stock movement records, and marks the order confirmed.”

#### Q3. Why do stock movement records exist?

Expected answer:

“They provide an audit trail explaining why stock changed.”

#### Q4. Why should the backend be the source of truth?

Expected answer:

“Because frontend data can be manipulated. The backend protects business rules, validation, calculations, and database updates.”

#### Q5. What did refactoring improve today?

Expected answer:

“Refactoring improved code structure, reduced duplication, and made the project easier to maintain without changing behavior.”

---

# Common Student Mistakes

## Mistake 1 — Changing Behavior During Refactor

Trainer correction:

“Stop and compare the behavior before and after. Refactoring should not change business behavior.”

## Mistake 2 — Not Running Tests

Trainer correction:

“Every refactor must be followed by tests. Tests are your safety net.”

## Mistake 3 — Breaking Module Exports

Trainer correction:

“Before changing exports, check who imports this file. Controllers may depend on existing service exports.”

## Mistake 4 — Moving Logic To The Wrong Layer

Trainer correction:

“Business logic belongs in services. Controllers should not become business logic containers.”

## Mistake 5 — Hardcoding URLs

Trainer correction:

“Use environment variables. In the current repo, `VITE_API_BASE_URL` should include the `/api` base path, for example `http://localhost:3000/api`, and API files should call endpoint paths such as `/products`.”

## Mistake 6 — Treating README As Optional

Trainer correction:

“A project without setup instructions is difficult for another developer to use.”

---

# Day 16 Assessment Rubric

| Area | Expected Evidence |
|---|---|
| Technical debt understanding | Student can explain why working code may still need cleanup |
| Refactoring understanding | Student can explain behavior-preserving code improvement |
| Backend review | Student reviews service files and identifies duplication |
| Backend refactor | Student completes one safe backend refactor |
| Frontend review | Student reviews pages and API files for repeated patterns |
| Frontend refactor | Student completes one safe frontend refactor |
| Testing discipline | Student runs tests after refactoring |
| Production readiness | Student checks env, README, gitignore, and secrets |
| Application demonstration | Student demonstrates full business flow |
| Communication | Student can explain what changed and why |

---

# Trainer Notes: What Not To Do On Day 16

Do not turn Day 16 into a generic lecture on clean code.

Do not introduce large new architecture patterns.

Do not ask students to rewrite the project.

Do not introduce authentication in the core Day 16 session.

Do not let refactoring break existing tests.

Do not spend the whole day on README only.

Do not skip the application demonstration.

Do not let students change business rules and call it refactoring.

---

# Day 16 Summary For Trainer

Day 16 should accomplish four things:

1. Help students review the real project they built.
2. Teach safe refactoring using actual project code.
3. Prepare the project for handover or deployment review.
4. Help students demonstrate the complete business workflow confidently.

Closing script:

“Today you moved from feature building to project hardening.

That is an important professional step.

A developer’s job is not only to make code work. A developer must also make code understandable, maintainable, testable, and safe to hand over.

Your Mini Business Operations App now has working business features, tests, cleaner code structure, and a clearer handover path.”
