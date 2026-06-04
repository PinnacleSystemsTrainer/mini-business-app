# Day 9 Trainer Script — Product Form UI and Customer Backend

Fullstack Training Program  
Mini Business Operations App

---

## Trainer Positioning

Day 9 is the day where the frontend moves from only reading product data to creating product data through a real form.

It also starts the next backend master-data module: Customers.

By the end of Day 8, the Product list should already be connected to the backend API through a frontend API service. Product data should be stored in PostgreSQL and accessed through Prisma.

Day 9 builds on that foundation:

```text
Day 8:
PostgreSQL -> Prisma -> Product API -> React Products page

Day 9:
React Product Form -> Product API -> Prisma -> PostgreSQL
Customer model -> Customer API foundation
```

The day should stay practical. Students should not only hear about forms; they should build a product form, submit it, see validation, save data, and confirm that the Products page shows the new product.

---

## Day Goal

By the end of Day 9, students should be able to:

1. Explain what a controlled input is in React.
2. Store form values in React state.
3. Handle input changes using one shared `handleChange` function.
4. Handle form submission using `onSubmit`.
5. Perform basic frontend validation.
6. Call the backend API from a form.
7. Show field-level validation errors.
8. Show submit-level backend errors.
9. Show saving/disabled state during submit.
10. Navigate back to the product list after successful save.
11. Add a Prisma `Customer` model.
12. Run a customer migration.
13. Create Customer route, controller, and service files.
14. Implement Customer CRUD-style APIs.
15. Test Customer APIs using Postman or Thunder Client.

---

## End-of-Day Deliverable

Students should complete:

```text
Frontend:
- ProductFormPage
- /products/new route
- Add Product link from Products page
- createProduct API function
- Frontend validation
- Save and redirect behavior

Backend:
- Customer Prisma model
- Customer migration
- customer.routes.js
- customer.controller.js
- customer.service.js
- Customer APIs tested manually

Git:
- Commit with a meaningful message
```

Suggested commit message:

```text
Add product create form and customer backend API
```

---

# Morning Session — 1 Hour

## Suggested Timing

| Time | Topic |
|---:|---|
| 0–10 min | Recap Day 8 |
| 10–20 min | Explain frontend forms and controlled inputs |
| 20–30 min | Explain form validation and submit flow |
| 30–42 min | Trainer demo: ProductFormPage and route |
| 42–52 min | Backend concept: Customer master data and Prisma model |
| 52–58 min | Trainer demo: Customer route/controller/service plan |
| 58–60 min | Assign hands-on work and success criteria |

---

## 0–10 Minutes — Recap Day 8

### Trainer Script

“Yesterday we made an important shift. Until now, product data was either in memory or mock data. On Day 8, the Product API started using Prisma and PostgreSQL, and the React Products page started loading real product data from the backend.

That means we now have this flow:

```text
React Products page
        ↓
frontend productApi.js
        ↓
GET /api/products
        ↓
Express route/controller/service
        ↓
Prisma
        ↓
PostgreSQL
```

Today we will complete the other side of that flow.

Instead of only reading products, the user should be able to create a product from the React UI.”

### Ask the Students

#### Q1. What changed on Day 8 compared to the mock Products page from Week 1?

Expected answer:

“Products are now loaded from the backend API instead of a local mock array. The backend gets products from PostgreSQL using Prisma.”

Trainer follow-up:

“Correct. The array still exists in React as state, but the source of that array is now the backend response.”

---

#### Q2. What is the role of `productApi.js` in the frontend?

Expected answer:

“It centralizes product-related API calls such as `getProducts()` so the page does not directly contain all fetch logic.”

Trainer follow-up:

“Good. Today we will add another function there: `createProduct()`.”

---

#### Q3. Why do we need loading and error states in the Products page?

Expected answer:

“Because API calls take time and can fail. Loading state tells the user data is being fetched. Error state tells the user something went wrong.”

Trainer follow-up:

“Correct. Today we will use similar thinking during form submission. When saving, the form should not behave like nothing is happening.”

---

#### Q4. Why should the frontend not directly connect to PostgreSQL?

Expected answer:

“Because the frontend runs in the browser. It should not expose database credentials or database structure. The backend should validate requests and control database access.”

Trainer follow-up:

“Exactly. Even today’s product form will not talk to Prisma directly. It will call the backend API.”

---

## 10–20 Minutes — Explain Frontend Forms and Controlled Inputs

### Trainer Script

“Most business applications are form-heavy. Products, customers, sales orders, order lines, and filters are all entered through forms.

In React, we usually manage form inputs using state. This is called a controlled input.

Controlled means React is controlling the value of the input.”

### Simple Example

```jsx
const [form, setForm] = useState({
  sku: '',
  name: '',
  price: '',
  stockQty: ''
});
```

### Trainer Explanation

“This state object represents the form. Each property matches one input field.

The SKU input uses `form.sku` as its value.

When the user types, we update React state.”

### Demo Code

```jsx
function handleChange(event) {
  const { name, value } = event.target;

  setForm((previousForm) => ({
    ...previousForm,
    [name]: value
  }));
}
```

### Explain Line by Line

```js
const { name, value } = event.target;
```

“The input has a `name` attribute and a current `value`. We read both.”

```js
...previousForm
```

“We keep the existing form values.”

```js
[name]: value
```

“We update only the field that changed.”

### Ask the Students

#### Q1. What is a controlled input?

Expected answer:

“A controlled input is an input whose value comes from React state and whose changes update React state.”

---

#### Q2. Why do we use one `handleChange` function for multiple fields?

Expected answer:

“Because each input has a `name`, so the same function can update the matching property in the form state.”

Trainer follow-up:

“Correct. This prevents writing a separate change handler for SKU, name, price, and stock quantity.”

---

## 20–30 Minutes — Form Validation and Submit Flow

### Trainer Script

“Before saving a product, the frontend should check basic input mistakes.

For example:

- SKU should not be empty.
- Name should not be empty.
- Price should be greater than zero.
- Opening stock should not be negative.

This is frontend validation. It improves the user experience because the user gets quick feedback.

But frontend validation does not replace backend validation.”

### Important Explanation

“Users can bypass the frontend using browser developer tools, Postman, curl, or another script. So the backend must still validate the real request.

Frontend validation is for user experience.
Backend validation is for correctness and safety.”

### Validation Demo

```js
function validateProductForm(form) {
  const errors = {};

  if (!form.sku.trim()) {
    errors.sku = 'SKU is required';
  }

  if (!form.name.trim()) {
    errors.name = 'Name is required';
  }

  if (Number(form.price) <= 0) {
    errors.price = 'Price must be greater than zero';
  }

  if (Number(form.stockQty) < 0) {
    errors.stockQty = 'Opening stock cannot be negative';
  }

  return errors;
}
```

### Form Submit Flow

Show this flow:

```text
User clicks Save
        ↓
prevent default browser form submit
        ↓
validate form
        ↓
if errors exist, show errors and stop
        ↓
prepare payload
        ↓
call createProduct(payload)
        ↓
if success, navigate to /products
        ↓
if failure, show backend error
```

### Explain `event.preventDefault()`

“HTML forms normally try to submit and reload the page. In React, we usually prevent that default behavior and handle the submit using JavaScript.”

### Ask the Students

#### Q1. What does `event.preventDefault()` do?

Expected answer:

“It stops the browser’s default form submission behavior, so React can handle the submit without reloading the page.”

---

#### Q2. Why should frontend validation not replace backend validation?

Expected answer:

“Because frontend validation can be bypassed. The backend is the source of truth and must validate before saving to the database.”

---

#### Q3. What should happen after product save succeeds?

Expected answer:

“The user should be taken back to the Products page, and the newly created product should appear in the list.”

---

## 30–42 Minutes — Trainer Demo: Product Form UI

### Step 1: Add `createProduct` API Function

Open:

```text
frontend/src/api/productApi.js
```

Add:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  return handleResponse(response);
}

export async function createProduct(productData) {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  });

  return handleResponse(response);
}
```

### Trainer Explanation

“Notice that we do not write `fetch` directly inside every page. We keep product API calls inside `productApi.js`.

This keeps the page focused on UI and form behavior.”

### Ask

#### Q. Why is `Content-Type: application/json` needed?

Expected answer:

“It tells the backend that the request body is JSON.”

Trainer follow-up:

“Correct. On the backend, `express.json()` reads that JSON body and makes it available as `req.body`.”

---

### Step 2: Add Route for Product Form

Open:

```text
frontend/src/routes/AppRoutes.jsx
```

Add:

```jsx
import { Routes, Route } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import ProductsPage from '../pages/ProductsPage';
import ProductFormPage from '../pages/ProductFormPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/new" element={<ProductFormPage />} />
    </Routes>
  );
}

export default AppRoutes;
```

### Ask

#### Q. What route will show the product form?

Expected answer:

“`/products/new`.”

---

### Step 3: Add Link from Products Page

In `ProductsPage.jsx`, add:

```jsx
import { Link } from 'react-router-dom';
```

Replace the Add Product button with:

```jsx
<Link
  to="/products/new"
  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700"
>
  Add Product
</Link>
```

### Trainer Explanation

“We use `Link` instead of a normal `<a>` tag because React Router should handle navigation without a full page reload.”

---

### Step 4: Create ProductFormPage

Create:

```text
frontend/src/pages/ProductFormPage.jsx
```

Use this page:

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createProduct } from '../api/productApi';
import Card from '../components/ui/Card';

const initialForm = {
  sku: '',
  name: '',
  price: '',
  stockQty: ''
};

function validateProductForm(form) {
  const errors = {};

  if (!form.sku.trim()) {
    errors.sku = 'SKU is required';
  }

  if (!form.name.trim()) {
    errors.name = 'Name is required';
  }

  if (Number(form.price) <= 0) {
    errors.price = 'Price must be greater than zero';
  }

  if (Number(form.stockQty) < 0) {
    errors.stockQty = 'Opening stock cannot be negative';
  }

  return errors;
}

function ProductFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');

    const errors = validateProductForm(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      stockQty: Number(form.stockQty)
    };

    try {
      setSaving(true);
      await createProduct(payload);
      navigate('/products');
    } catch (error) {
      setSubmitError(error.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Add Product
          </h2>
          <p className="text-sm text-gray-500">
            Create a new product master record.
          </p>
        </div>

        <Link
          to="/products"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Back to Products
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none"
              placeholder="Example: P001"
            />
            {fieldErrors.sku ? (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.sku}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none"
              placeholder="Example: Notebook"
            />
            {fieldErrors.name ? (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none"
                placeholder="Example: 50"
              />
              {fieldErrors.price ? (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Opening Stock
              </label>
              <input
                name="stockQty"
                type="number"
                min="0"
                step="1"
                value={form.stockQty}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none"
                placeholder="Example: 100"
              />
              {fieldErrors.stockQty ? (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.stockQty}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Link
              to="/products"
              className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ProductFormPage;
```

### Trainer Notes While Demoing

Point out:

- `useState` stores form values.
- `handleChange` updates the correct field.
- `handleSubmit` controls the save flow.
- `validateProductForm` returns field-level errors.
- `saving` disables the submit button.
- `submitError` shows backend errors.
- `useNavigate` redirects after successful save.

### Ask

#### Q. Why do we convert `price` and `stockQty` using `Number()`?

Expected answer:

“Input values from HTML fields are strings. The backend expects price and stock quantity as numbers.”

Trainer follow-up:

“Correct. Even number inputs give values as strings in the event. We convert them before sending the payload.”

---

## 42–52 Minutes — Backend Concept: Customer Master Data

### Trainer Script

“Now we will start the Customer backend.

Products and customers are both master data.

Master data means relatively stable business data that transactions depend on.

Products are needed before creating sales order items.
Customers are needed before creating sales orders.

A sales order should not only store a customer name typed randomly. It should refer to a real Customer record.”

### Explain Customer Fields

| Field | Meaning |
|---|---|
| `code` | Business code for the customer |
| `name` | Customer name |
| `phone` | Optional contact detail |
| `email` | Optional contact detail |
| `isActive` | Used to hide/deactivate customers instead of hard deleting immediately |

### Ask

#### Q1. Why should customer code be unique?

Expected answer:

“Because it identifies the customer. Duplicate customer codes can create confusion in orders and reports.”

---

#### Q2. Is customer master data or transaction data?

Expected answer:

“Customer is master data.”

---

#### Q3. Is sales order master data or transaction data?

Expected answer:

“Sales order is transaction data because it records a business activity.”

---

## 52–58 Minutes — Trainer Demo: Customer Backend Plan

### Step 1: Add Prisma Model

Open:

```text
backend/prisma/schema.prisma
```

Add:

```prisma
model Customer {
  id        Int      @id @default(autoincrement())
  code      String   @unique
  name      String
  phone     String?
  email     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Run:

```powershell
cd backend
npx prisma migrate dev --name add_customer
```

### Trainer Explanation

“This migration changes the database structure. It creates the customer table based on the Prisma model.

Remember: migrations are for structure, not for adding one customer record.”

### Ask

#### Q. What does this migration do?

Expected answer:

“It creates or updates the database structure for the Customer model.”

---

### Step 2: Create Customer Backend Files

Target files:

```text
backend/src/routes/customer.routes.js
backend/src/controllers/customer.controller.js
backend/src/services/customer.service.js
```

### Trainer Explanation

“We will follow the same structure we used for Product:

```text
Route -> Controller -> Service -> Prisma -> PostgreSQL
```

The route maps URLs.
The controller handles request and response.
The service contains customer business logic and talks to Prisma.”

---

## 58–60 Minutes — Assign Hands-On Work

### Trainer Script

“Your hands-on task has two parts.

First, complete the Product form in React and prove that a product can be created from the browser.

Second, create the Customer backend model and API. Customer UI will come next, but today the Customer API should work from Postman or Thunder Client.”

### Success Criteria Summary

Students must show:

```text
Frontend:
- /products/new works
- Form uses controlled inputs
- Field errors are shown
- Product save calls backend
- Successful save redirects to /products
- New product appears in list

Backend:
- Customer model added
- Migration applied
- Customer APIs work
- Duplicate customer code is rejected
- Missing customer name is rejected
```

---

# Hands-On Assignment Details

## Part A — Product Form UI

Students should complete:

```text
frontend/src/api/productApi.js
frontend/src/pages/ProductFormPage.jsx
frontend/src/routes/AppRoutes.jsx
frontend/src/pages/ProductsPage.jsx
```

Required behavior:

- Add Product link opens `/products/new`.
- Product form has SKU, name, price, and opening stock.
- Form uses controlled inputs.
- Validation errors are displayed below fields.
- Submit calls `createProduct`.
- Submit button is disabled while saving.
- Backend error appears at the top of the form.
- Successful save navigates to `/products`.

---

## Part B — Customer Backend API

Students should add the Customer model and API.

### Customer Model

```prisma
model Customer {
  id        Int      @id @default(autoincrement())
  code      String   @unique
  name      String
  phone     String?
  email     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Migration:

```powershell
npx prisma migrate dev --name add_customer
```

### Customer Service

```js
const prisma = require('../lib/prisma');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateCustomerData(data) {
  if (!data.code || !data.code.trim()) {
    throw createError('Customer code is required');
  }

  if (!data.name || !data.name.trim()) {
    throw createError('Customer name is required');
  }
}

async function listCustomers() {
  return prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { id: 'desc' }
  });
}

async function getCustomerById(id) {
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      isActive: true
    }
  });

  if (!customer) {
    throw createError('Customer not found', 404);
  }

  return customer;
}

async function createCustomer(data) {
  validateCustomerData(data);

  const existingCustomer = await prisma.customer.findUnique({
    where: { code: data.code.trim() }
  });

  if (existingCustomer) {
    throw createError('Customer code already exists');
  }

  return prisma.customer.create({
    data: {
      code: data.code.trim(),
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null
    }
  });
}

async function updateCustomer(id, data) {
  await getCustomerById(id);
  validateCustomerData(data);

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      code: data.code.trim(),
      NOT: { id }
    }
  });

  if (existingCustomer) {
    throw createError('Customer code already exists');
  }

  return prisma.customer.update({
    where: { id },
    data: {
      code: data.code.trim(),
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null
    }
  });
}

async function deleteCustomer(id) {
  await getCustomerById(id);

  return prisma.customer.update({
    where: { id },
    data: { isActive: false }
  });
}

module.exports = {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
```

### Customer Controller

```js
const customerService = require('../services/customer.service');

async function listCustomers(req, res, next) {
  try {
    const customers = await customerService.listCustomers();
    res.json(customers);
  } catch (error) {
    next(error);
  }
}

async function getCustomer(req, res, next) {
  try {
    const id = Number(req.params.id);
    const customer = await customerService.getCustomerById(id);
    res.json(customer);
  } catch (error) {
    next(error);
  }
}

async function createCustomer(req, res, next) {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const id = Number(req.params.id);
    const customer = await customerService.updateCustomer(id, req.body);
    res.json(customer);
  } catch (error) {
    next(error);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const id = Number(req.params.id);
    await customerService.deleteCustomer(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
```

### Customer Routes

```js
const express = require('express');
const customerController = require('../controllers/customer.controller');

const router = express.Router();

router.get('/', customerController.listCustomers);
router.get('/:id', customerController.getCustomer);
router.post('/', customerController.createCustomer);
router.patch('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
```

### app.js Route Mounting

```js
const customerRoutes = require('./routes/customer.routes');

app.use('/api/customers', customerRoutes);
```

---

# Afternoon Review Session — 1 Hour

## Suggested Timing

| Time | Topic |
|---:|---|
| 0–10 min | Student demo: Product form |
| 10–25 min | Frontend code review |
| 25–40 min | Customer backend API review |
| 40–50 min | Manual API test review |
| 50–58 min | Concept questions and expected answers |
| 58–60 min | Day 10 readiness |

---

## 0–10 Minutes — Student Demo: Product Form

Ask students to run:

Backend:

```powershell
cd backend
npm run dev
```

Frontend:

```powershell
cd frontend
npm run dev
```

Ask them to show:

1. `/products` page.
2. Add Product link.
3. `/products/new` page.
4. Empty form validation.
5. Successful product creation.
6. Redirect back to `/products`.
7. New product visible in list.
8. Duplicate SKU error.

### Trainer Check

Confirm:

- Form does not reload the page.
- Field values are controlled by React state.
- Button is disabled while saving.
- Backend errors are visible.
- Successful save reloads product list by returning to `/products`.

---

## 10–25 Minutes — Frontend Code Review

### Review Point 1: Controlled Inputs

Ask:

#### Q. Where are form values stored?

Expected answer:

“In React state, inside the `form` object.”

Trainer comment:

“Correct. That makes the inputs controlled.”

---

### Review Point 2: Shared handleChange

Ask:

#### Q. How does one `handleChange` function update different fields?

Expected answer:

“It reads `name` and `value` from the input and updates the matching property using `[name]: value`.”

Trainer comment:

“Good. This pattern is very useful for forms with multiple fields.”

---

### Review Point 3: Validation

Ask:

#### Q. What does `validateProductForm` return?

Expected answer:

“It returns an object containing validation messages for fields that are invalid.”

Trainer comment:

“Correct. If the object has keys, the form should not submit.”

---

### Review Point 4: Submit Flow

Ask:

#### Q. Why do we use `try/catch` around `createProduct`?

Expected answer:

“Because the API call can fail, for example if the SKU already exists or the backend is down.”

Trainer comment:

“Correct. The form should handle backend errors gracefully.”

---

### Review Point 5: Navigation

Ask:

#### Q. What does `navigate('/products')` do?

Expected answer:

“It redirects the user back to the Products page after a successful save.”

Trainer comment:

“Correct. After creation, the user should return to the product list and see the saved product.”

---

## 25–40 Minutes — Customer Backend Review

Ask students to show:

```text
backend/prisma/schema.prisma
backend/src/routes/customer.routes.js
backend/src/controllers/customer.controller.js
backend/src/services/customer.service.js
backend/src/app.js
```

### Review Point 1: Prisma Model

Ask:

#### Q. Which field makes customer code unique?

Expected answer:

“`code String @unique`.”

Trainer comment:

“Correct. The database should prevent duplicate customer codes.”

---

### Review Point 2: Optional Fields

Ask:

#### Q. What does `String?` mean in Prisma?

Expected answer:

“It means the field is optional or nullable.”

Trainer comment:

“Correct. Phone and email are useful, but they may not always be available.”

---

### Review Point 3: Service Responsibility

Ask:

#### Q. What logic belongs in `customer.service.js`?

Expected answer:

“Validation, duplicate checks, finding records, creating records, updating records, deactivating records, and Prisma calls.”

Trainer comment:

“Correct. The service is the business logic layer.”

---

### Review Point 4: Controller Responsibility

Ask:

#### Q. What does the controller do?

Expected answer:

“It reads request data, calls the service, and sends the HTTP response.”

Trainer comment:

“Correct. The controller connects Express request/response handling to the service.”

---

### Review Point 5: Route Responsibility

Ask:

#### Q. What does the route file do?

Expected answer:

“It maps HTTP methods and URLs to controller functions.”

Trainer comment:

“Correct. Routes should stay thin.”

---

## 40–50 Minutes — Manual Customer API Test Review

Ask students to test these APIs.

### Create Customer

```text
POST http://localhost:3000/api/customers
```

Body:

```json
{
  "code": "C001",
  "name": "ABC Stores",
  "phone": "9876543210",
  "email": "accounts@abcstores.com"
}
```

Expected:

```text
201 Created
```

---

### List Customers

```text
GET http://localhost:3000/api/customers
```

Expected:

```text
200 OK
```

---

### Get Customer by ID

```text
GET http://localhost:3000/api/customers/1
```

Expected:

```text
200 OK
```

---

### Duplicate Customer Code

```text
POST http://localhost:3000/api/customers
```

Body:

```json
{
  "code": "C001",
  "name": "Duplicate Customer"
}
```

Expected:

```text
400 Bad Request
```

Expected response:

```json
{
  "message": "Customer code already exists"
}
```

---

### Missing Customer Name

```text
POST http://localhost:3000/api/customers
```

Body:

```json
{
  "code": "C002"
}
```

Expected:

```text
400 Bad Request
```

---

### Update Customer

```text
PATCH http://localhost:3000/api/customers/1
```

Body:

```json
{
  "code": "C001",
  "name": "ABC Stores Updated",
  "phone": "9876543210",
  "email": "admin@abcstores.com"
}
```

Expected:

```text
200 OK
```

---

### Delete or Deactivate Customer

```text
DELETE http://localhost:3000/api/customers/1
```

Expected:

```text
204 No Content
```

Trainer note:

“This implementation uses soft delete by setting `isActive` to `false`. In many business applications, master data is not immediately hard deleted because old transactions may need history.”

---

## 50–58 Minutes — Concept Questions and Expected Answers

### 1. What is a controlled input?

Expected answer:

“A controlled input is an input whose value is stored in React state and updated through an `onChange` handler.”

---

### 2. Why do we keep form values in state?

Expected answer:

“So React can control the form, validate values, prepare the payload, reset fields, and respond to user input.”

---

### 3. What does `event.preventDefault()` do?

Expected answer:

“It prevents the browser from doing its default form submit and page reload.”

---

### 4. Why should frontend validation not replace backend validation?

Expected answer:

“Because frontend validation can be bypassed. The backend must protect the real data before saving to the database.”

---

### 5. Why do we convert price and stock quantity to numbers?

Expected answer:

“Form input values come as strings. The backend and database expect numeric values for price and stock quantity.”

---

### 6. What is master data?

Expected answer:

“Master data is relatively stable business data that transactions depend on, such as products and customers.”

---

### 7. Why is customer code unique?

Expected answer:

“Because it identifies a customer in the business system. Duplicate customer codes can create confusion.”

---

### 8. What is a Prisma migration?

Expected answer:

“A migration is an instruction/history file that changes the database structure, such as creating the Customer table.”

---

### 9. What does `String?` mean in the Prisma model?

Expected answer:

“It means the field is optional or nullable.”

---

### 10. Why use route/controller/service structure for Customer API?

Expected answer:

“To keep code organized. Routes map URLs, controllers handle request/response, and services contain business logic and Prisma calls.”

---

### 11. Why might we deactivate customers instead of hard deleting them?

Expected answer:

“Because customers may be linked to past orders. Deactivation hides them from active use while preserving history.”

---

### 12. What will Day 10 build on top of today’s Customer backend?

Expected answer:

“Day 10 will build Customer UI pages and connect them to the Customer API.”

---

## 58–60 Minutes — Day 10 Readiness

### Trainer Closing Script

“Today we completed an important full-stack create flow for Products.

The user can now create a product from the React UI, the frontend calls the backend API, the backend validates and saves through Prisma, and PostgreSQL stores the product.

We also started the Customer backend module. Customers are now defined in Prisma and exposed through APIs.

Tomorrow, we will connect the Customer UI to this backend and improve shared error handling so Products and Customers follow the same clean pattern.”

---

# Trainer Review Checklist

## Frontend Checklist

- [ ] `ProductFormPage.jsx` exists.
- [ ] `/products/new` route exists.
- [ ] Products page has Add Product navigation.
- [ ] Form uses `useState`.
- [ ] Inputs use `value` and `onChange`.
- [ ] `handleChange` updates form state.
- [ ] `handleSubmit` uses `event.preventDefault()`.
- [ ] Frontend validation works.
- [ ] Field errors display near fields.
- [ ] `createProduct` API function exists.
- [ ] Submit button shows saving state.
- [ ] Backend errors are shown.
- [ ] Success redirects to `/products`.
- [ ] New product appears on Products page.

## Backend Checklist

- [ ] `Customer` model exists in Prisma schema.
- [ ] `code` is unique.
- [ ] `phone` and `email` are optional.
- [ ] Migration was created and applied.
- [ ] `customer.routes.js` exists.
- [ ] `customer.controller.js` exists.
- [ ] `customer.service.js` exists.
- [ ] Customer routes are mounted in `app.js`.
- [ ] `GET /api/customers` works.
- [ ] `GET /api/customers/:id` works.
- [ ] `POST /api/customers` works.
- [ ] `PATCH /api/customers/:id` works.
- [ ] `DELETE /api/customers/:id` works.
- [ ] Duplicate customer code is rejected.
- [ ] Missing customer name is rejected.
- [ ] Error response uses predictable `message` field.

## Git Checklist

- [ ] Code committed.
- [ ] Commit message is meaningful.
- [ ] Branch pushed if using feature branches.

---

# Common Trainer Notes

## What to Emphasize

Emphasize:

- Frontend form validation is not enough by itself.
- Backend remains the source of truth.
- Controlled inputs are a core React pattern.
- `productApi.js` keeps API communication centralized.
- Prisma migrations track database structure changes.
- Customer is master data.
- Route/controller/service structure should be repeated consistently.

## What Not to Overdo

Avoid spending too much time on:

- Advanced form libraries.
- Complex schema validation libraries.
- Authentication.
- Authorization.
- Customer UI implementation.
- Sales order relationships.
- Advanced Prisma relationship modeling.

Those topics can come later. Day 9 should stay focused on product form creation and Customer backend foundation.
