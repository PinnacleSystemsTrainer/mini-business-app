# Day 10 Trainer Script — Customer UI, Error Handling, and Week 2 Review

Fullstack Training Program
Mini Business Operations App

## Trainer Positioning

Day 10 closes Week 2 of the Fullstack Training Program.

By now, students should have:

* Set up the project repository
* Built the Express backend foundation
* Created the React frontend with Tailwind CSS
* Added React Router
* Set up PostgreSQL
* Configured Prisma
* Created the Product model and Product API
* Connected the Products page to the backend API
* Built the Product create form
* Added the Customer model and Customer backend API

Today’s goal is to complete the Customer frontend flow and improve consistency across the full stack.

The main teaching idea for Day 10:

> A full-stack app should not only work when everything goes well. It should also behave clearly when data is loading, when no data exists, and when something fails.

Today students will:

* Add Customer list UI
* Add Customer create form UI
* Connect Customer screens to backend APIs
* Add reusable frontend UI state components
* Improve backend error handling
* Add not-found middleware
* Review Week 2 deliverables
* Open a Week 2 PR

## Day Goal

By the end of Day 10, students should be able to:

1. Explain why predictable backend error responses matter.
2. Add centralized Express error middleware.
3. Add not-found middleware for unknown routes.
4. Clean Product and Customer service errors.
5. Create a frontend Customer API file.
6. Create CustomersPage.
7. Create CustomerFormPage.
8. Add `/customers` and `/customers/new` routes.
9. Reuse LoadingMessage, ErrorMessage, and EmptyState components.
10. Open a Week 2 pull request for review.

## End-of-Day Deliverable

A Week 2 PR opened with:

* PostgreSQL connected
* Prisma configured
* Product model and migration
* Customer model and migration
* Product API backed by database
* Customer API backed by database
* Product list connected to backend
* Product create form working
* Customer list connected to backend
* Customer create form working
* Backend centralized error handling
* Backend not-found middleware
* Reusable frontend loading/error/empty components
* README updated where needed

Suggested PR title:

```
Week 2 Database and API Integration: Products and Customers
```

---

# Morning Session — 1 Hour

## Suggested Timing

| Time      | Topic                                             |
| --------- | ------------------------------------------------- |
| 0–10 min  | Recap Day 9                                       |
| 10–20 min | Why consistent error handling matters             |
| 20–30 min | Backend error middleware and not-found middleware |
| 30–40 min | Frontend reusable loading/error/empty states      |
| 40–55 min | Trainer demo: Customer UI and API integration     |
| 55–60 min | Assign hands-on work and success criteria         |

---

## 0–10 Minutes — Recap Day 9

### Trainer Script

“Yesterday we moved further into real full-stack development.

We built a Product create form in React and connected it to the backend. We also started the Customer backend by adding the Customer model, running a migration, and creating Customer API endpoints.

Today we will complete the Customer frontend flow and improve error handling across the app.

This is important because real users need clear feedback. They should know when data is loading, when there is no data, and when something went wrong.”

### Ask the Students

#### Q1. What did we build on Day 9?

Expected answer:

“We created ProductFormPage, added the `/products/new` route, submitted product data to the backend, showed validation errors, added the Customer model, ran a migration, and created Customer API endpoints.”

#### Q2. Why should frontend validation not replace backend validation?

Expected answer:

“Frontend validation improves user experience, but users can bypass the frontend. The backend protects the actual business data, so backend validation is required.”

#### Q3. What is master data?

Expected answer:

“Master data is relatively stable business data such as products and customers.”

#### Q4. Why should customer code be unique?

Expected answer:

“Customer code uniquely identifies a customer. If duplicate customer codes are allowed, orders and reports can become confusing.”

#### Q5. What should happen after a product is saved successfully?

Expected answer:

“The app should show success feedback or navigate back to the product list, and the new product should appear in the list.”

### Trainer Bridge

“Good. Today we will apply the same thinking to Customers. But we will also improve the app foundation by making errors and UI states reusable.”

---

## 10–20 Minutes — Why Consistent Error Handling Matters

### Trainer Script

“In Week 1, our API was small. If one endpoint returned `{ message: 'Product not found' }` and another returned `{ error: 'Customer not found' }`, it may not feel like a big problem.

But as the app grows, inconsistent errors become painful.

The frontend needs to know how to display errors. If every API returns a different error shape, every page needs custom error handling.

So we want a predictable backend error format.”

### Good Error Response

```
{
  "message": "Customer code already exists"
}
```

### Avoid Inconsistent Responses

```
{
  "error": "Customer code already exists"
}

{
  "msg": "Customer code already exists"
}
```

### Trainer Explanation

“The exact wording can change, but the shape should be predictable. In this training project, we will use a simple error shape:

```
{
  "message": "Useful error message"
}
```

This makes frontend code easier. The frontend can read the `message` field consistently.”

### Ask the Students

#### Q1. Why should backend errors be predictable?

Expected answer:

“Because the frontend can handle and display errors consistently. Developers also understand failures faster.”

#### Q2. Should the backend expose full technical stack traces to the frontend?

Expected answer:

“No. The backend should return useful but safe messages. Stack traces are for developers and logs, not normal users.”

#### Q3. What should a validation error message help the user do?

Expected answer:

“It should help the user understand what to fix, such as ‘Customer name is required’ or ‘Customer code already exists.’”

---

## 20–30 Minutes — Backend Error Middleware and Not-Found Middleware

### Trainer Script

“Express allows us to centralize error handling using middleware. Instead of writing the same error response logic in every controller, we can pass errors to one error handler.”

### Backend Target Structure

```
backend/
  src/
    app.js
    server.js
    middleware/
      errorHandler.js
      notFound.js
    routes/
      product.routes.js
      customer.routes.js
    controllers/
      product.controller.js
      customer.controller.js
    services/
      product.service.js
      customer.service.js
    lib/
      prisma.js
```

### Error Handler Middleware

Create:

```
backend/src/middleware/errorHandler.js
```

Add:

```
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || 'Internal server error'
  });
}

module.exports = errorHandler;
```

### Trainer Explanation

“This middleware receives errors passed using `next(error)`. It decides the status code and sends a consistent JSON response.

The important shape is:

```
{
  "message": "..."
}
```

”

### Not-Found Middleware

Create:

```
backend/src/middleware/notFound.js
```

Add:

```
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

module.exports = notFound;
```

### Trainer Explanation

“This catches unknown routes.

For example, if someone calls:

```
GET /api/unknown
```

the backend should not fail silently. It should return a useful 404 response.”

### Update app.js

```
const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/product.routes');
const customerRoutes = require('./routes/customer.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
```

### Trainer Explanation

“Middleware order matters.

The not-found middleware should come after all valid routes. The error handler should come after the not-found middleware.”

### Ask the Students

#### Q1. Why should notFound come after the real routes?

Expected answer:

“Because Express should first check whether the request matches a real route. If no route matches, then notFound should run.”

#### Q2. Why should errorHandler come near the end?

Expected answer:

“Because it catches errors from routes, controllers, services, and notFound middleware.”

#### Q3. Why do services throw errors instead of directly sending responses?

Expected answer:

“Services should focus on business logic. Controllers and middleware handle HTTP responses.”

---

## 30–40 Minutes — Frontend Reusable Loading, Error, and Empty States

### Trainer Script

“On Day 8, we added loading, error, and empty states for the Products page. Today, we should not copy-paste the same UI everywhere.

ProductsPage and CustomersPage will both need:

* Loading state
* Error state
* Empty state

So we will create reusable components.”

### Recommended Frontend Structure

```
frontend/
  src/
    api/
      httpClient.js
      productApi.js
      customerApi.js
    components/
      layout/
        AppLayout.jsx
      ui/
        Button.jsx
        Card.jsx
        EmptyState.jsx
        ErrorMessage.jsx
        FormField.jsx
        LoadingMessage.jsx
    pages/
      DashboardPage.jsx
      ProductsPage.jsx
      ProductFormPage.jsx
      CustomersPage.jsx
      CustomerFormPage.jsx
    routes/
      AppRoutes.jsx
```

### LoadingMessage Component

Create:

```
frontend/src/components/ui/LoadingMessage.jsx
```

Add:

```
function LoadingMessage({ message = 'Loading...' }) {
  return (
    <div className="rounded-lg border bg-white p-4 text-sm text-gray-600 shadow-sm">
      {message}
    </div>
  );
}

export default LoadingMessage;
```

### ErrorMessage Component

Create:

```
frontend/src/components/ui/ErrorMessage.jsx
```

Add:

```
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

### EmptyState Component

Create:

```
frontend/src/components/ui/EmptyState.jsx
```

Add:

```
function EmptyState({ title = 'No data found', description }) {
  return (
    <div className="rounded-lg border border-dashed bg-white p-6 text-center shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      ) : null}
    </div>
  );
}

export default EmptyState;
```

### Trainer Explanation

“These components make the UI consistent. If we later want to improve the look of errors or empty states, we update one component instead of many pages.”

### Ask the Students

#### Q1. What is a loading state?

Expected answer:

“A loading state tells the user that the app is fetching or saving data.”

#### Q2. What is an empty state?

Expected answer:

“An empty state tells the user that the request worked, but there is no data to show.”

#### Q3. What is the difference between error state and empty state?

Expected answer:

“An error state means something failed. An empty state means nothing failed, but the result list is empty.”

#### Q4. Why should these states be reusable components?

Expected answer:

“So Products, Customers, and future pages can use the same consistent UI.”

---

## 40–55 Minutes — Trainer Demo: Customer API and UI

### Part A — Frontend Customer API

Create:

```
frontend/src/api/customerApi.js
```

Add:

```
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export async function getCustomers() {
  const response = await fetch(`${API_BASE_URL}/api/customers`);
  return handleResponse(response);
}

export async function createCustomer(customer) {
  const response = await fetch(`${API_BASE_URL}/api/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(customer)
  });

  return handleResponse(response);
}
```

### Trainer Explanation

“This file centralizes Customer API calls.

The page should not build fetch calls everywhere. The page should call `getCustomers()` or `createCustomer()`.

This makes the code easier to read and easier to change later.”

### Ask

#### Q. Why do we use an API service file in the frontend?

Expected answer:

“To centralize backend communication, avoid repeating fetch logic in pages, and keep pages focused on UI behavior.”

---

## Part B — CustomersPage

Create:

```
frontend/src/pages/CustomersPage.jsx
```

Add:

```
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getCustomers } from '../api/customerApi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingMessage from '../components/ui/LoadingMessage';

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadCustomers() {
    try {
      setLoading(true);
      setError('');
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  if (loading) {
    return <LoadingMessage message="Loading customers..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500">
            Manage customer master data used in sales orders.
          </p>
        </div>

        <Link to="/customers/new">
          <Button>Add Customer</Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Create your first customer to start using sales orders."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500">
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Phone</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {customer.code}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {customer.name}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {customer.phone || '-'}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {customer.email || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default CustomersPage;
```

### Trainer Explanation

“This page follows the same pattern as ProductsPage:

* Local state for data
* Loading state
* Error state
* Empty state
* API service function
* Table rendering using `map`

This is a repeated pattern in frontend business apps.”

---

## Part C — CustomerFormPage

Create:

```
frontend/src/pages/CustomerFormPage.jsx
```

Add:

```
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createCustomer } from '../api/customerApi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ErrorMessage from '../components/ui/ErrorMessage';

const initialForm = {
  code: '',
  name: '',
  phone: '',
  email: ''
};

function CustomerFormPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    if (!form.code.trim()) {
      return 'Customer code is required';
    }

    if (!form.name.trim()) {
      return 'Customer name is required';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');

      await createCustomer({
        code: form.code.trim(),
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null
      });

      navigate('/customers');
    } catch (err) {
      setError(err.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Add Customer
        </h2>
        <p className="text-sm text-gray-500">
          Create customer master data for future sales orders.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <ErrorMessage message={error} /> : null}

          <div>
            <label
              htmlFor="code"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Customer Code
            </label>
            <input
              id="code"
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="C001"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Customer Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="ABC Stores"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Optional"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Optional"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Customer'}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CustomerFormPage;
```

### Trainer Explanation

“This page is very similar to ProductFormPage. That is expected.

In real projects, this repetition is how we discover refactoring opportunities.

For now, it is okay to repeat some form structure. Later, we can create reusable FormField components.”

### Ask

#### Q. What is duplicated between ProductFormPage and CustomerFormPage?

Expected answer:

“Form state, handleChange, submit handling, error display, saving state, labels, inputs, and button layout.”

#### Q. Should we refactor everything immediately?

Expected answer:

“No. First make the feature work clearly. Then refactor repeated patterns carefully.”

---

## Part D — Add Routes

Update:

```
frontend/src/routes/AppRoutes.jsx
```

Add:

```
import { Routes, Route } from 'react-router-dom';

import DashboardPage from '../pages/DashboardPage';
import ProductsPage from '../pages/ProductsPage';
import ProductFormPage from '../pages/ProductFormPage';
import CustomersPage from '../pages/CustomersPage';
import CustomerFormPage from '../pages/CustomerFormPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />

      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/new" element={<ProductFormPage />} />

      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/customers/new" element={<CustomerFormPage />} />
    </Routes>
  );
}

export default AppRoutes;
```

---

## Part E — Add Navigation Link

Update:

```
frontend/src/components/layout/AppLayout.jsx
```

Add Customers navigation:

```
<NavLink to="/customers" className={linkClass}>
  Customers
</NavLink>
```

Navigation should now include:

```
Dashboard
Products
Customers
```

---

## 55–60 Minutes — Assign Hands-On Work

### Trainer Script

“Your task today is to complete the Customer UI and improve shared error handling.

Do not start sales orders today. Sales orders begin in Week 3.

Today is about finishing Week 2 cleanly.”

## Hands-On Assignment

### Backend

Students must:

1. Add `backend/src/middleware/errorHandler.js`.

2. Add `backend/src/middleware/notFound.js`.

3. Mount `notFound` and `errorHandler` in `app.js`.

4. Ensure Product service errors use `statusCode`.

5. Ensure Customer service errors use `statusCode`.

6. Ensure all backend error responses use:

   ```
    {
      "message": "Useful error message"
    }
   ```

7. Test unknown route:

   ```
    GET http://localhost:3000/api/unknown
   ```

Expected status:

```
404
```

Expected response shape:

```
{
  "message": "Route not found: /api/unknown"
}
```

### Frontend

Students must:

1. Create `frontend/src/api/customerApi.js`.
2. Create `LoadingMessage.jsx`.
3. Create `ErrorMessage.jsx`.
4. Create `EmptyState.jsx`.
5. Create `CustomersPage.jsx`.
6. Create `CustomerFormPage.jsx`.
7. Add `/customers` route.
8. Add `/customers/new` route.
9. Add Customers link in navigation.
10. Reuse Card and Button components.
11. Show loading, error, and empty states.
12. Disable Save button while submitting.

### GitHub

Students must:

1. Create or continue a Week 2 branch.
2. Commit changes with a meaningful message.
3. Push the branch.
4. Open Week 2 PR.

Suggested commit message:

```
Add customer UI and shared error states
```

---

# Afternoon Review Session — 1 Hour

## 0–10 Minutes — Student Demo

Ask the student to run the backend:

```
cd backend
npm run dev
```

Ask the student to run the frontend:

```
cd frontend
npm run dev
```

Ask them to show:

* `/customers`
* `/customers/new`
* Customer creation
* Customer list after creation
* Loading state if possible
* Empty state if there are no customers
* Error state by stopping backend or triggering a backend error
* Unknown backend route returning 404
* Week 2 PR

---

## 10–25 Minutes — Code Review

### Backend Review Checklist

Check:

```
[ ] backend/src/middleware/errorHandler.js exists
[ ] backend/src/middleware/notFound.js exists
[ ] app.js mounts product routes
[ ] app.js mounts customer routes
[ ] app.js mounts notFound after routes
[ ] app.js mounts errorHandler after notFound
[ ] Product service throws errors with statusCode
[ ] Customer service throws errors with statusCode
[ ] Controllers pass errors using next(error)
[ ] Error response uses message field
[ ] Unknown route returns 404
[ ] Backend still starts successfully
```

### Frontend Review Checklist

Check:

```
[ ] frontend/src/api/customerApi.js exists
[ ] CustomersPage.jsx exists
[ ] CustomerFormPage.jsx exists
[ ] /customers route works
[ ] /customers/new route works
[ ] Customers link appears in navigation
[ ] Customer list loads from API
[ ] Customer create form submits to API
[ ] Customer form handles validation
[ ] Customer form handles backend errors
[ ] Save button disables while saving
[ ] LoadingMessage is reusable
[ ] ErrorMessage is reusable
[ ] EmptyState is reusable
[ ] Card and Button are reused
[ ] Tailwind styling is consistent
```

---

## 25–40 Minutes — Review Questions and Expected Answers

### Q1. Why centralize error handling?

Expected answer:

“Centralized error handling avoids repeating the same error response logic in every controller. It also makes backend responses predictable and easier for the frontend to consume.”

### Q2. What should an API error response contain?

Expected answer:

“At minimum, it should contain a useful message. In this project, we use:

```
{
  "message": "Error message"
}
```

This keeps frontend error handling simple.”

### Q3. What is an empty state?

Expected answer:

“An empty state is shown when the request succeeds but there is no data to display. For example, the Customers page can show ‘No customers found’ when the customer list is empty.”

### Q4. What is the difference between loading, error, and empty state?

Expected answer:

“Loading means the request is still running. Error means the request failed. Empty means the request succeeded but returned no records.”

### Q5. What is duplicated between ProductsPage and CustomersPage?

Expected answer:

“Both pages load data from an API, store loading/error/data state, show a title and action button, show loading/error/empty states, and render a table.”

### Q6. What should be refactored later?

Expected answer:

“We can later refactor repeated table patterns, form field patterns, API response handling, and page layout patterns.”

### Q7. Why should CustomerFormPage not connect directly to PostgreSQL?

Expected answer:

“The frontend runs in the browser and should not know database credentials or database structure. It should call the Express backend API. The backend uses Prisma to talk to PostgreSQL.”

### Q8. Why disable the Save button while submitting?

Expected answer:

“To prevent duplicate submissions and show the user that the save operation is in progress.”

### Q9. Why should services not directly use `req` and `res`?

Expected answer:

“Services should focus on business logic, not HTTP. This makes them easier to test and reuse.”

### Q10. What is complete at the end of Week 2?

Expected answer:

“At the end of Week 2, Products and Customers are backed by PostgreSQL through Prisma, the backend APIs exist, and the React UI can list and create products and customers.”

---

## 40–50 Minutes — Week 2 Review

### Trainer Script

“Let us review what changed during Week 2.

At the end of Week 1, Products were mostly mock or in-memory.

During Week 2, we introduced PostgreSQL and Prisma. We created real database models and migrations. We moved Product API data into the database. We built Product create UI. We added Customer backend and Customer frontend.

This is a major step.

The app now has real master data flows.”

### Week 2 Completed Capabilities

```
Product master:
- Product table exists
- Product API uses database
- Product list loads from backend
- Product create form works

Customer master:
- Customer table exists
- Customer API uses database
- Customer list loads from backend
- Customer create form works

Shared app quality:
- Backend error responses are more predictable
- Frontend shows loading, error, and empty states
- Week 2 PR is ready for review
```

### Week 2 Boundary

### Trainer Script

“Do not start order logic inside Week 2 PR.

Sales orders are Week 3. Week 2 should close with clean Product and Customer master data flows.”

---

## 50–60 Minutes — Debugging and Close

### Common Issue 1: Customers route not found in frontend

Possible cause:

* Route not added in `AppRoutes.jsx`
* Navigation link path is wrong
* Component import path is wrong

Fix:

Check:

```
<Route path="/customers" element={<CustomersPage />} />
<Route path="/customers/new" element={<CustomerFormPage />} />
```

### Common Issue 2: Backend returns HTML error instead of JSON

Possible cause:

* Error handler not mounted
* Error thrown outside Express flow
* Route not using `next(error)`

Fix:

Check middleware order:

```
app.use(notFound);
app.use(errorHandler);
```

### Common Issue 3: Customer create fails with duplicate code

Expected behavior:

If the same customer code already exists, backend should return a 400 error with a useful message.

Example:

```
{
  "message": "Customer code already exists"
}
```

### Common Issue 4: `VITE_API_BASE_URL` is undefined

Possible cause:

* `.env` missing in frontend
* Variable name does not start with `VITE_`
* Frontend dev server was not restarted after editing `.env`

Fix:

Create or update:

```
frontend/.env
```

Add:

```
VITE_API_BASE_URL=http://localhost:3000
```

Restart frontend dev server.

### Common Issue 5: Save button stays disabled

Possible cause:

* `setSaving(false)` not called in `finally`

Fix:

```
try {
  setSaving(true);
  await createCustomer(data);
} catch (err) {
  setError(err.message);
} finally {
  setSaving(false);
}
```

---

# Trainer Closing Script

“Today you completed the Customer frontend flow and improved the reliability of the app.

You added reusable UI states, connected Customer pages to the backend, and made backend errors more predictable.

This closes Week 2.

At the end of Week 2, the Mini Business Operations App now has real database-backed Product and Customer master data.

In Week 3, we will build the main business workflow: Sales Orders. That will connect customers, products, order items, totals, stock validation, order confirmation, and stock movement tracking.”
