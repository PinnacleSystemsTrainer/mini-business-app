Below are the **Day 8 Student Handout** and **Day 8 Trainer Script** in markdown.

I aligned Day 8 with the handbook goal: **replace in-memory Product API with Prisma/PostgreSQL and connect the React Products page to the backend API**. The handbook explicitly positions Day 8 around this flow: `React page -> frontend API function -> Express route -> controller -> service -> Prisma -> PostgreSQL`, with loading, error, and empty states on the frontend.  It also builds on Day 6 PostgreSQL setup and Day 7 Prisma/Product model work.  

---

# Day 8 Student Handout — Database-Backed Product API and React API Integration

## Fullstack Training Program

## Day Goal

Today you will connect the backend and frontend using real database-backed data.

By the end of Day 8, you should have:

* Updated the Product API to use Prisma instead of in-memory arrays.
* Stored products in PostgreSQL.
* Implemented full Product CRUD API basics:

  * `GET /api/products`
  * `GET /api/products/:id`
  * `POST /api/products`
  * `PATCH /api/products/:id`
  * `DELETE /api/products/:id`
* Created a frontend API service file.
* Loaded real product data into the React Products page.
* Displayed loading, error, and empty states.
* Handled duplicate SKU errors cleanly.
* Understood how frontend, backend, Prisma, and PostgreSQL work together.

Today is an important full-stack connection day.

Until now:

* The backend started with in-memory product data.
* The frontend Products page used mock product data.
* PostgreSQL was prepared.
* Prisma was configured with a Product model.

Today, the app starts behaving more like a real business application.

---

## 1. Starting Point Before Day 8

Before starting Day 8, your project should already have the following.

### Backend

Your backend should have:

```text
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
  .env
  .env.example
  package.json
```

Your backend should already have Prisma installed:

```powershell
npm install prisma @prisma/client
```

You should already have a Product model similar to this:

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
}
```

Your Prisma Client helper should exist:

```js
// backend/src/lib/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
```

### Important Prisma Configuration Note

In the latest Prisma setup, your database URL may be configured through the Prisma configuration file instead of being written directly inside `schema.prisma`.

Your Day 7 setup should already have handled this.

For Day 8, you only need to remember:

* Do not commit real database passwords.
* Keep real local values in `.env`.
* Keep only placeholder values in `.env.example`.
* Prisma Client usage in backend code remains the same.

Example backend usage:

```js
const prisma = require('../lib/prisma');
```

---

## 2. What Changes Today?

Earlier, your product service may have used an in-memory array:

```js
let products = [
  { id: 1, sku: 'P001', name: 'Notebook', price: 50, stockQty: 100 },
  { id: 2, sku: 'P002', name: 'Pen', price: 10, stockQty: 500 }
];
```

That was useful for learning Express, routes, controllers, and services.

But it has a serious problem:

```text
Server restart -> in-memory data disappears
```

Today, product data will come from PostgreSQL through Prisma.

New flow:

```text
React Products Page
  ↓
frontend/src/api/productApi.js
  ↓
GET http://localhost:3000/api/products
  ↓
Express route
  ↓
Product controller
  ↓
Product service
  ↓
Prisma Client
  ↓
PostgreSQL products table
```

---

## 3. Backend API Integration Flow

When the frontend asks for products, this is what happens:

```text
React page loads
  ↓
React calls getProducts()
  ↓
getProducts() calls backend API
  ↓
Express receives GET /api/products
  ↓
Route sends request to controller
  ↓
Controller calls service
  ↓
Service calls Prisma
  ↓
Prisma queries PostgreSQL
  ↓
Products are returned as JSON
  ↓
React displays products
```

This separation is important.

The frontend should not know:

* Database table names
* Prisma model details
* SQL queries
* Database password
* Database connection string

The frontend should only know:

```text
Call the backend API and display the response.
```

---

## 4. Backend Task — Replace In-Memory Product Service with Prisma

Open:

```text
backend/src/services/product.service.js
```

Replace the in-memory array logic with Prisma-based logic.

### Suggested `product.service.js`

```js
const prisma = require('../lib/prisma');

function normalizeProductInput(data) {
  return {
    sku: data.sku?.trim(),
    name: data.name?.trim(),
    price: data.price,
    stockQty: data.stockQty
  };
}

function validateProductInput(data, { partial = false } = {}) {
  const errors = [];

  if (!partial || data.sku !== undefined) {
    if (!data.sku || !String(data.sku).trim()) {
      errors.push('SKU is required');
    }
  }

  if (!partial || data.name !== undefined) {
    if (!data.name || !String(data.name).trim()) {
      errors.push('Name is required');
    }
  }

  if (!partial || data.price !== undefined) {
    const price = Number(data.price);

    if (Number.isNaN(price) || price <= 0) {
      errors.push('Price must be greater than zero');
    }
  }

  if (!partial || data.stockQty !== undefined) {
    const stockQty = Number(data.stockQty);

    if (Number.isNaN(stockQty) || stockQty < 0) {
      errors.push('Stock quantity cannot be negative');
    }
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(', '));
    error.statusCode = 400;
    throw error;
  }
}

async function getAllProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      id: 'desc'
    }
  });
}

async function getProductById(id) {
  return prisma.product.findFirst({
    where: {
      id,
      isActive: true
    }
  });
}

async function createProduct(data) {
  validateProductInput(data);

  const normalized = normalizeProductInput(data);

  try {
    return await prisma.product.create({
      data: {
        sku: normalized.sku,
        name: normalized.name,
        price: normalized.price,
        stockQty: Number(normalized.stockQty || 0)
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const duplicateError = new Error('SKU already exists');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw error;
  }
}

async function updateProduct(id, data) {
  validateProductInput(data, { partial: true });

  const existingProduct = await getProductById(id);

  if (!existingProduct) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (data.sku !== undefined) {
    updateData.sku = String(data.sku).trim();
  }

  if (data.name !== undefined) {
    updateData.name = String(data.name).trim();
  }

  if (data.price !== undefined) {
    updateData.price = data.price;
  }

  if (data.stockQty !== undefined) {
    updateData.stockQty = Number(data.stockQty);
  }

  try {
    return await prisma.product.update({
      where: {
        id
      },
      data: updateData
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const duplicateError = new Error('SKU already exists');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw error;
  }
}

async function deleteProduct(id) {
  const existingProduct = await getProductById(id);

  if (!existingProduct) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.product.update({
    where: {
      id
    },
    data: {
      isActive: false
    }
  });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
```

---

## 5. Why Are We Using Soft Delete?

Notice that `deleteProduct()` does not remove the row permanently.

Instead, it sets:

```js
isActive: false
```

This is called a soft delete.

For a business application, this is often safer than permanently deleting records.

Why?

Because products may later be connected to:

* Sales orders
* Sales order items
* Stock movements
* Audit history
* Reports

If we permanently delete a product, old business records may become confusing.

So for this training project:

```text
DELETE /api/products/:id
```

means:

```text
Mark product as inactive.
```

The product will no longer appear in the active product list.

---

## 6. Update Product Controller

Open:

```text
backend/src/controllers/product.controller.js
```

Use async controller functions because Prisma calls are asynchronous.

### Suggested `product.controller.js`

```js
const productService = require('../services/product.service');

async function listProducts(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await productService.updateProduct(id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    await productService.deleteProduct(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
```

---

## 7. Update Product Routes

Open:

```text
backend/src/routes/product.routes.js
```

Add `PATCH` and `DELETE`.

```js
const express = require('express');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
```

---

## 8. Check `app.js`

Your `backend/src/app.js` should still mount the product routes like this:

```js
app.use('/api/products', productRoutes);
```

Combined with:

```js
router.get('/', productController.listProducts);
```

This creates:

```text
GET /api/products
```

Do not accidentally write this inside `product.routes.js`:

```js
router.get('/products', productController.listProducts);
```

That would create:

```text
GET /api/products/products
```

---

## 9. Backend Manual Test Cases

Start the backend:

```powershell
cd backend
npm run dev
```

Use Postman, Thunder Client, REST Client, or another API testing tool.

### Test 1 — Health Check

```http
GET http://localhost:3000/health
```

Expected status:

```text
200
```

Expected response:

```json
{
  "status": "ok"
}
```

### Test 2 — Get Products

```http
GET http://localhost:3000/api/products
```

Expected status:

```text
200
```

Expected response shape:

```json
[
  {
    "id": 1,
    "sku": "P001",
    "name": "Notebook",
    "price": "50",
    "stockQty": 100,
    "isActive": true,
    "createdAt": "2026-06-03T00:00:00.000Z",
    "updatedAt": "2026-06-03T00:00:00.000Z"
  }
]
```

Note:

Prisma may return `Decimal` values as strings depending on serialization.

So price may appear as:

```json
"50"
```

instead of:

```json
50
```

That is okay for now.

### Test 3 — Create Product

```http
POST http://localhost:3000/api/products
Content-Type: application/json
```

Body:

```json
{
  "sku": "P003",
  "name": "Marker",
  "price": 25,
  "stockQty": 60
}
```

Expected status:

```text
201
```

Expected response should include the new product.

### Test 4 — Duplicate SKU

Send the same request again:

```json
{
  "sku": "P003",
  "name": "Duplicate Marker",
  "price": 30,
  "stockQty": 10
}
```

Expected status:

```text
400
```

Expected response:

```json
{
  "message": "SKU already exists"
}
```

### Test 5 — Update Product

```http
PATCH http://localhost:3000/api/products/1
Content-Type: application/json
```

Body:

```json
{
  "price": 55,
  "stockQty": 120
}
```

Expected status:

```text
200
```

Expected response should show updated values.

### Test 6 — Delete Product

```http
DELETE http://localhost:3000/api/products/1
```

Expected status:

```text
204
```

Now call:

```http
GET http://localhost:3000/api/products
```

The deleted product should no longer appear because it is inactive.

---

## 10. Frontend API Integration

Until now, your Products page used a local array:

```js
const products = [
  { id: 1, sku: 'P001', name: 'Notebook', price: 50, stockQty: 100 }
];
```

Today, remove that mock array and load products from the backend.

---

## 11. Frontend Environment Variable

Create or update:

```text
frontend/.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Create or update:

```text
frontend/.env.example
```

Add:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Important:

* `.env` can contain local machine values.
* `.env.example` should contain safe placeholder values.
* Do not put secrets in frontend `.env` files.
* Vite only exposes variables that start with `VITE_`.

After changing `.env`, restart the frontend dev server.

---

## 12. Create Frontend API Service File

Create:

```text
frontend/src/api/productApi.js
```

Add:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(response) {
  if (!response.ok) {
    let message = 'Something went wrong';

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  return handleResponse(response);
}

export async function getProductById(id) {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
  return handleResponse(response);
}

export async function createProduct(product) {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  });

  return handleResponse(response);
}

export async function updateProduct(id, product) {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  });

  return handleResponse(response);
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE'
  });

  return handleResponse(response);
}
```

---

## 13. Why Use an API Service File?

Do not write `fetch()` directly everywhere inside page components.

Better structure:

```text
ProductsPage.jsx
  ↓
productApi.js
  ↓
Backend API
```

This keeps the code cleaner.

Benefits:

* API URLs are centralized.
* Error handling is reusable.
* Pages stay focused on UI.
* Future changes are easier.
* Customer APIs and Sales Order APIs can follow the same pattern.

---

## 14. Update Products Page to Load Real Data

Open:

```text
frontend/src/pages/ProductsPage.jsx
```

Replace mock data with API loading.

### Suggested `ProductsPage.jsx`

```jsx
import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getProducts } from '../api/productApi';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProducts() {
    try {
      setLoading(true);
      setError('');

      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Products
          </h2>
          <p className="text-sm text-gray-500">
            Product data loaded from the backend API.
          </p>
        </div>

        <Button>Add Product</Button>
      </div>

      <Card>
        {loading ? (
          <p className="text-sm text-gray-500">Loading products...</p>
        ) : error ? (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center">
            <p className="text-sm font-medium text-gray-900">
              No products found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create your first product from the backend API or product form.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500">
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Stock</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {product.name}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {product.stockQty}
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

export default ProductsPage;
```

---

## 15. Frontend Loading Flow

The Products page now follows this flow:

```text
Page renders first time
  ↓
loading = true
  ↓
API request starts
  ↓
Loading message is shown
  ↓
API request succeeds
  ↓
products state is updated
  ↓
loading = false
  ↓
Product table is shown
```

If the API fails:

```text
Page renders
  ↓
API request starts
  ↓
Backend is unavailable or returns error
  ↓
error state is updated
  ↓
Error message is shown
```

If the API returns an empty list:

```text
Page renders
  ↓
API request succeeds
  ↓
products = []
  ↓
Empty state is shown
```

---

## 16. Start Backend and Frontend Together

You need both apps running.

### Terminal 1 — Backend

```powershell
cd backend
npm run dev
```

Expected backend URL:

```text
http://localhost:3000
```

### Terminal 2 — Frontend

```powershell
cd frontend
npm run dev
```

Expected frontend URL:

```text
http://localhost:5173
```

Open:

```text
http://localhost:5173/products
```

The Products page should load data from:

```text
http://localhost:3000/api/products
```

---

## 17. Common Issues and Fixes

### Issue 1 — Products page shows failed to fetch

Possible causes:

* Backend is not running.
* Backend is running on a different port.
* `VITE_API_BASE_URL` is wrong.
* Frontend dev server was not restarted after changing `.env`.
* CORS is not enabled in backend.

Check:

```js
app.use(cors());
```

Check frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Restart frontend after changing `.env`.

---

### Issue 2 — Prisma cannot connect to database

Possible causes:

* PostgreSQL is not running.
* Database name is wrong.
* Password is wrong.
* Prisma config or `.env` is wrong.
* Migration was not applied.

Check:

```powershell
npx prisma migrate status
```

You can also open Prisma Studio:

```powershell
npx prisma studio
```

---

### Issue 3 — Product list is empty

This may not be an error.

Possible reasons:

* No products exist in the database.
* All products are marked as inactive.
* `where: { isActive: true }` filters them out.

Create a product using Postman:

```http
POST http://localhost:3000/api/products
```

Body:

```json
{
  "sku": "P001",
  "name": "Notebook",
  "price": 50,
  "stockQty": 100
}
```

---

### Issue 4 — Duplicate SKU error

This is expected if you create the same SKU twice.

Expected response:

```json
{
  "message": "SKU already exists"
}
```

This proves that the unique constraint and backend error handling are working.

---

### Issue 5 — Price displays strangely

Prisma Decimal values may appear as strings in JSON.

Example:

```json
"price": "50"
```

In React, convert before formatting:

```js
Number(product.price).toFixed(2)
```

---

## 18. Success Criteria

Your Day 8 work is complete when:

* Backend Product API uses Prisma instead of an in-memory array.
* Products are stored in PostgreSQL.
* `GET /api/products` returns products from the database.
* `GET /api/products/:id` works.
* `POST /api/products` creates a database record.
* `PATCH /api/products/:id` updates a database record.
* `DELETE /api/products/:id` marks a product inactive.
* Duplicate SKU returns a clean error message.
* Frontend has `src/api/productApi.js`.
* Products page loads data from backend.
* Products page shows loading state.
* Products page shows error state.
* Products page shows empty state.
* Product rows render using `map`.
* Frontend does not directly connect to PostgreSQL or Prisma.
* Code is committed to Git.

---

## 19. Suggested Commit Message

```powershell
git add .
git commit -m "Connect Product API to Prisma and React"
```

---

## 20. Review Questions You Should Be Able to Answer

1. What changed when we moved from in-memory data to PostgreSQL?
2. Why does the product service need `async` functions now?
3. What does Prisma Client do?
4. Why should the frontend not directly access PostgreSQL?
5. What is the purpose of `productApi.js` in the frontend?
6. Why do we need loading state?
7. Why do we need error state?
8. What is an empty state?
9. Why does duplicate SKU fail?
10. Why do we use soft delete for products?
11. What does `VITE_API_BASE_URL` do?
12. Why must the frontend dev server be restarted after changing `.env`?
13. What is the full flow from React Products page to PostgreSQL?
14. Why should backend validation still exist even if frontend validation is added later?

---

## 21. What Comes Next

On Day 9, you will build the Product Create Form in React and start the Customer backend.

Today, products can be created through API testing tools like Postman or Thunder Client.

Tomorrow, users will start creating products from the frontend UI.

---

# Day 8 Trainer Script — Database-Backed Product API and React API Integration

## Fullstack Training Program

## Trainer Positioning

Day 8 is the first major full-stack connection day of Week 2.

By now, students should have:

* Created the project repository.
* Built an Express backend.
* Refactored backend code into route, controller, and service layers.
* Built a React frontend with Tailwind CSS.
* Added React Router.
* Set up PostgreSQL.
* Configured Prisma.
* Created the Product model and migration.
* Created `src/lib/prisma.js`.

Today, the student replaces temporary in-memory Product API logic with Prisma and connects the React Products page to the backend.

This is an important mindset shift:

```text
Mock/in-memory data -> Real database-backed API -> React API integration
```

Do not introduce the product create form today. That is Day 9.

Today’s frontend goal is only:

```text
Products page loads and displays real backend data.
```

---

## Day Goal

By the end of Day 8, students should be able to:

1. Explain the full-stack data flow from React to PostgreSQL.
2. Replace in-memory Product service logic with Prisma queries.
3. Implement database-backed Product API endpoints.
4. Handle Prisma duplicate SKU errors cleanly.
5. Understand soft delete using `isActive`.
6. Create a frontend API service file.
7. Use `useEffect` and `useState` to load API data.
8. Show loading, error, and empty states.
9. Explain why the frontend should not directly access the database.
10. Commit the completed Day 8 work.

---

## End-of-Day Deliverable

A database-backed Product API connected to the React Products page.

Expected working flow:

```text
PostgreSQL products table
  ↑↓
Prisma Client
  ↑↓
Express Product Service
  ↑↓
Product Controller
  ↑↓
Product Routes
  ↑↓
Frontend productApi.js
  ↑↓
React ProductsPage
```

Suggested commit message:

```text
Connect Product API to Prisma and React
```

---

# Morning Session — 1 Hour

## Suggested Timing

| Time      | Topic                                                       |
| --------- | ----------------------------------------------------------- |
| 0–10 min  | Recap Day 7                                                 |
| 10–20 min | Explain full-stack API integration flow                     |
| 20–35 min | Backend demo: replace in-memory Product service with Prisma |
| 35–45 min | Backend demo: controller/routes and API tests               |
| 45–55 min | Frontend demo: productApi.js and ProductsPage loading       |
| 55–60 min | Assign hands-on work and success criteria                   |

---

## 0–10 Minutes — Recap Day 7

### Trainer Script

“Yesterday we introduced Prisma. We learned that PostgreSQL is the database, Prisma is the ORM, Prisma schema describes the database model, migrations apply database structure changes, and Prisma Client lets backend code query the database.

Today we are going to use that setup for the real Product API.

Until now, our backend Product API used an in-memory array. Our frontend Products page used mock data. Today we will connect both sides properly.”

### Ask the Student

**Q1. What did we create on Day 7?**

Expected answer:

“We configured Prisma, added the Product model, ran a migration, generated Prisma Client, and created a Prisma helper file.”

Better answer:

“We created the database structure for Product and prepared the backend to query PostgreSQL using Prisma Client.”

---

**Q2. Is Prisma the database?**

Expected answer:

“No. PostgreSQL is the database. Prisma is the ORM that helps backend code talk to PostgreSQL.”

---

**Q3. What is a migration?**

Expected answer:

“A migration is a saved instruction for changing the database structure.”

---

**Q4. Why should migrations be committed?**

Expected answer:

“Because other developers need the same database structure. Migration files help everyone apply the same database changes.”

---

**Q5. Why should `.env` not be committed?**

Expected answer:

“Because `.env` may contain secrets like database URLs, passwords, and API keys.”

---

### Trainer Note

Mention the latest Prisma setup adjustment briefly.

Say:

“In the latest Prisma setup, your database URL may be configured through Prisma’s configuration file instead of being placed directly inside `schema.prisma`. That was handled on Day 7. For today, Prisma Client usage remains simple: backend code imports `src/lib/prisma.js` and calls methods like `prisma.product.findMany()`.”

Do not spend too much time on Prisma config today unless students are blocked.

---

## 10–20 Minutes — Full-Stack API Integration Flow

### Trainer Script

“Let us understand today’s full flow.

When the user opens the Products page, React should no longer use a local mock array. Instead, React should call the backend API.

The backend API should no longer use an in-memory array. Instead, the backend service should call Prisma.

Prisma then queries PostgreSQL.

So the full flow is:”

```text
React ProductsPage
  ↓
frontend/src/api/productApi.js
  ↓
GET /api/products
  ↓
Express route
  ↓
Product controller
  ↓
Product service
  ↓
Prisma Client
  ↓
PostgreSQL
```

### Explain Each Part

#### React ProductsPage

“The page is responsible for displaying UI. It should handle loading, error, empty, and success states.”

#### productApi.js

“The API file is responsible for calling backend endpoints. This avoids writing fetch logic randomly in every component.”

#### Express Route

“The route maps the URL to the controller function.”

#### Controller

“The controller handles request and response.”

#### Service

“The service contains business logic and database access.”

#### Prisma Client

“Prisma Client is the JavaScript object used to query PostgreSQL.”

#### PostgreSQL

“PostgreSQL stores the real product records permanently.”

---

### Ask the Student

**Q1. Should React directly connect to PostgreSQL?**

Expected answer:

“No.”

Better answer:

“No. The frontend runs in the browser. It should not know database credentials or database structure. It should call backend APIs. The backend validates requests, applies business rules, and talks to the database.”

---

**Q2. What part of the backend should talk to Prisma?**

Expected answer:

“The service layer.”

Better answer:

“The Product service should use Prisma because it contains product business logic and data access. The route and controller should stay focused on HTTP routing and response handling.”

---

**Q3. Why do we create frontend API service files?**

Expected answer:

“To centralize API calls.”

Better answer:

“API service files keep fetch logic, URLs, and error handling in one place so page components stay focused on UI.”

---

## 20–35 Minutes — Backend Demo: Replace In-Memory Product Service with Prisma

### Trainer Script

“On Day 5, we moved product logic into a service file. That decision helps us today. We can replace the inside of the service without changing the route structure much.

This is the benefit of separating route, controller, and service.”

Show old idea:

```js
let products = [
  { id: 1, sku: 'P001', name: 'Notebook', price: 50, stockQty: 100 }
];
```

Say:

“This was temporary. It disappears when the server restarts. Today, we remove this and query PostgreSQL using Prisma.”

---

### Step 1 — Import Prisma

Open:

```text
backend/src/services/product.service.js
```

Add:

```js
const prisma = require('../lib/prisma');
```

Explain:

“This imports the Prisma Client instance we created on Day 7.”

---

### Step 2 — Create `getAllProducts`

```js
async function getAllProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      id: 'desc'
    }
  });
}
```

### Trainer Explanation

“`findMany` asks Prisma to return multiple product records.

The `where` condition means we only show active products.

The `orderBy` means newer products appear first.”

### Ask

**Q. Why are we filtering by `isActive: true`?**

Expected answer:

“Because deleted or inactive products should not appear in the normal product list.”

---

### Step 3 — Create `getProductById`

```js
async function getProductById(id) {
  return prisma.product.findFirst({
    where: {
      id,
      isActive: true
    }
  });
}
```

### Trainer Explanation

“`findFirst` returns one matching active product. If no product is found, it returns `null`.”

### Ask

**Q. What should the API return if the product does not exist?**

Expected answer:

“404 Not Found with a message like `Product not found`.”

---

### Step 4 — Add Validation Helpers

```js
function normalizeProductInput(data) {
  return {
    sku: data.sku?.trim(),
    name: data.name?.trim(),
    price: data.price,
    stockQty: data.stockQty
  };
}

function validateProductInput(data, { partial = false } = {}) {
  const errors = [];

  if (!partial || data.sku !== undefined) {
    if (!data.sku || !String(data.sku).trim()) {
      errors.push('SKU is required');
    }
  }

  if (!partial || data.name !== undefined) {
    if (!data.name || !String(data.name).trim()) {
      errors.push('Name is required');
    }
  }

  if (!partial || data.price !== undefined) {
    const price = Number(data.price);

    if (Number.isNaN(price) || price <= 0) {
      errors.push('Price must be greater than zero');
    }
  }

  if (!partial || data.stockQty !== undefined) {
    const stockQty = Number(data.stockQty);

    if (Number.isNaN(stockQty) || stockQty < 0) {
      errors.push('Stock quantity cannot be negative');
    }
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(', '));
    error.statusCode = 400;
    throw error;
  }
}
```

### Trainer Explanation

“Database constraints are important, but backend validation is still needed.

The database can reject invalid structure, but the backend should return clean business-friendly error messages.”

### Ask

**Q. If the database already has constraints, why do we still validate in backend code?**

Expected answer:

“Because backend validation gives cleaner error messages and applies business rules before the database operation.”

Better answer:

“Database constraints protect data integrity. Backend validation improves API behavior, user feedback, and business rule clarity. We usually need both.”

---

### Step 5 — Create Product

```js
async function createProduct(data) {
  validateProductInput(data);

  const normalized = normalizeProductInput(data);

  try {
    return await prisma.product.create({
      data: {
        sku: normalized.sku,
        name: normalized.name,
        price: normalized.price,
        stockQty: Number(normalized.stockQty || 0)
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const duplicateError = new Error('SKU already exists');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw error;
  }
}
```

### Trainer Explanation

“Prisma error code `P2002` means a unique constraint failed. In our case, that usually means duplicate SKU.

We do not want to expose a confusing Prisma error to the frontend. We convert it into a clean message.”

### Ask

**Q. Why does duplicate SKU fail?**

Expected answer:

“Because SKU is unique in the Product model and database.”

---

### Step 6 — Update Product

```js
async function updateProduct(id, data) {
  validateProductInput(data, { partial: true });

  const existingProduct = await getProductById(id);

  if (!existingProduct) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (data.sku !== undefined) {
    updateData.sku = String(data.sku).trim();
  }

  if (data.name !== undefined) {
    updateData.name = String(data.name).trim();
  }

  if (data.price !== undefined) {
    updateData.price = data.price;
  }

  if (data.stockQty !== undefined) {
    updateData.stockQty = Number(data.stockQty);
  }

  try {
    return await prisma.product.update({
      where: {
        id
      },
      data: updateData
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const duplicateError = new Error('SKU already exists');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw error;
  }
}
```

### Trainer Explanation

“PATCH means partial update. The frontend may send only the field that changed. That is why we support partial validation.”

### Ask

**Q. What is the difference between POST and PATCH?**

Expected answer:

“POST creates a new record. PATCH updates part of an existing record.”

---

### Step 7 — Soft Delete Product

```js
async function deleteProduct(id) {
  const existingProduct = await getProductById(id);

  if (!existingProduct) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.product.update({
    where: {
      id
    },
    data: {
      isActive: false
    }
  });
}
```

### Trainer Explanation

“We are not permanently deleting the product. We are marking it inactive.

In real business systems, this is often safer because products may be connected to old sales orders or stock movements.”

### Ask

**Q. Why might soft delete be safer than permanent delete?**

Expected answer:

“Because old business records may still refer to the product. Soft delete hides it from active lists without destroying history.”

---

### Step 8 — Export Functions

```js
module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
```

---

## 35–45 Minutes — Controller, Routes, and Backend API Tests

### Trainer Script

“Now that the service uses Prisma, the controller must use `async/await` because database calls take time.”

Show full controller:

```js
const productService = require('../services/product.service');

async function listProducts(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await productService.updateProduct(id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    await productService.deleteProduct(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
```

### Ask

**Q. Why do controller functions now use `async`?**

Expected answer:

“Because Prisma database calls are asynchronous and need `await`.”

---

### Update Routes

```js
const express = require('express');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
```

### Ask

**Q. What route is created by this combination?**

Show:

```js
app.use('/api/products', productRoutes);
router.patch('/:id', productController.updateProduct);
```

Expected answer:

```text
PATCH /api/products/:id
```

---

## Backend Test Demo

Start backend:

```powershell
cd backend
npm run dev
```

### Test Create Product

```http
POST http://localhost:3000/api/products
Content-Type: application/json
```

Body:

```json
{
  "sku": "P001",
  "name": "Notebook",
  "price": 50,
  "stockQty": 100
}
```

Expected:

```text
201 Created
```

### Test Get Products

```http
GET http://localhost:3000/api/products
```

Expected:

```text
200 OK
```

### Test Duplicate SKU

Send the same POST request again.

Expected:

```text
400 Bad Request
```

Expected response:

```json
{
  "message": "SKU already exists"
}
```

### Test Update

```http
PATCH http://localhost:3000/api/products/1
Content-Type: application/json
```

Body:

```json
{
  "price": 55
}
```

Expected:

```text
200 OK
```

### Test Delete

```http
DELETE http://localhost:3000/api/products/1
```

Expected:

```text
204 No Content
```

---

## 45–55 Minutes — Frontend API Integration Demo

### Trainer Script

“Now the backend is using PostgreSQL. The frontend Products page still has mock data. We will replace that with a backend API call.

But we will not put fetch directly everywhere. We will create an API service file.”

---

### Step 1 — Add Frontend Environment Variable

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Create:

```text
frontend/.env.example
```

Add:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Trainer Explanation

“Vite exposes frontend environment variables only if they start with `VITE_`.

After changing `.env`, restart the frontend dev server.”

### Ask

**Q. Why should frontend environment variables start with `VITE_`?**

Expected answer:

“Because Vite only exposes variables with the `VITE_` prefix to frontend code.”

---

### Step 2 — Create `productApi.js`

Create:

```text
frontend/src/api/productApi.js
```

Add:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(response) {
  if (!response.ok) {
    let message = 'Something went wrong';

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  return handleResponse(response);
}

export async function getProductById(id) {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
  return handleResponse(response);
}

export async function createProduct(product) {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  });

  return handleResponse(response);
}

export async function updateProduct(id, product) {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  });

  return handleResponse(response);
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE'
  });

  return handleResponse(response);
}
```

### Trainer Explanation

“This file becomes the frontend’s product API layer.

ProductsPage does not need to know the full backend URL everywhere. It can simply call `getProducts()`.”

### Ask

**Q. Why do we centralize API calls?**

Expected answer:

“To avoid repeating fetch logic and URLs across many components.”

Better answer:

“It keeps pages cleaner, makes error handling reusable, and makes future backend URL changes easier.”

---

### Step 3 — Update ProductsPage

Show the pattern first:

```jsx
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
```

Explain:

“React needs state for the products, state for loading, and state for error.”

Then show full page:

```jsx
import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getProducts } from '../api/productApi';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProducts() {
    try {
      setLoading(true);
      setError('');

      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Products
          </h2>
          <p className="text-sm text-gray-500">
            Product data loaded from the backend API.
          </p>
        </div>

        <Button>Add Product</Button>
      </div>

      <Card>
        {loading ? (
          <p className="text-sm text-gray-500">Loading products...</p>
        ) : error ? (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center">
            <p className="text-sm font-medium text-gray-900">
              No products found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create your first product from the backend API or product form.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500">
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Stock</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {product.name}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {product.stockQty}
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

export default ProductsPage;
```

---

### Explain `useEffect`

Trainer Script:

“`useEffect` lets us run code after the component renders. Here we use it to load products when the Products page opens.”

Ask:

**Q. Why do we not call `getProducts()` directly in the component body?**

Expected answer:

“Because it would run during rendering and could cause repeated API calls. `useEffect` lets us run it at the right time.”

---

### Explain Loading, Error, Empty, Success

Trainer Script:

“A professional screen does not only handle the success case. It should also handle:

* Loading
* Error
* Empty
* Success

This is important in real applications because APIs can be slow, fail, or return no data.”

Ask:

**Q. Why do we need loading state?**

Expected answer:

“Because API calls take time. The user should see that data is being loaded instead of seeing a blank page.”

Ask:

**Q. What is an empty state?**

Expected answer:

“An empty state is what the UI shows when the API succeeds but there is no data to display.”

---

## 55–60 Minutes — Assign Hands-On Work

### Trainer Script

“Your task now is to complete the full Day 8 integration.

First, update the backend Product API to use Prisma. Then test it using Postman or Thunder Client. After the backend works, update the React Products page to load real data from the backend.

Do not build the product create form today. That starts on Day 9. Today, the frontend only needs to display the real product list with loading, error, and empty states.”

### Hands-On Assignment

Backend:

1. Update `product.service.js` to use Prisma.
2. Update controller functions to use `async/await`.
3. Add `PATCH /api/products/:id`.
4. Add `DELETE /api/products/:id`.
5. Handle duplicate SKU errors cleanly.
6. Test all Product API endpoints.

Frontend:

1. Add `frontend/.env`.
2. Add `frontend/.env.example`.
3. Create `src/api/productApi.js`.
4. Update `ProductsPage.jsx`.
5. Show loading state.
6. Show error state.
7. Show empty state.
8. Show products from backend.

Git:

1. Check changes.
2. Commit work.

Suggested commit:

```powershell
git add .
git commit -m "Connect Product API to Prisma and React"
```

---

# Afternoon Review Session — 1 Hour

## 0–10 Minutes — Student Demo

Ask the student to show:

Backend:

* `product.service.js`
* Prisma usage
* `GET /api/products`
* `POST /api/products`
* Duplicate SKU error
* `PATCH /api/products/:id`
* `DELETE /api/products/:id`

Frontend:

* `productApi.js`
* `ProductsPage.jsx`
* Products page loading real data
* Loading state
* Error state if backend is stopped
* Empty state if no products exist

---

## 10–25 Minutes — Backend Code Review

### Review Question 1

**What changed when we moved from memory to database?**

Expected answer:

“Product data is now stored permanently in PostgreSQL instead of being stored temporarily in an array.”

Better answer:

“The service layer now uses Prisma Client to query PostgreSQL. The API behavior is similar, but the data is durable and survives server restarts.”

---

### Review Question 2

**Why are service functions async now?**

Expected answer:

“Because database operations take time and return promises.”

---

### Review Question 3

**What does Prisma Client do?**

Expected answer:

“Prisma Client lets backend JavaScript code query the database using Prisma model methods.”

Example:

```js
prisma.product.findMany()
```

---

### Review Question 4

**Why do we catch Prisma `P2002` errors?**

Expected answer:

“`P2002` means a unique constraint failed. For Product, it usually means duplicate SKU. We catch it so we can return a clean message like `SKU already exists`.”

---

### Review Question 5

**Why do we use soft delete?**

Expected answer:

“Because business records may depend on the product later. Soft delete hides the product from active lists without permanently deleting history.”

---

## 25–40 Minutes — Frontend Code Review

### Review Question 1

**What is the purpose of `productApi.js`?**

Expected answer:

“It contains frontend functions for calling product backend APIs.”

Better answer:

“It centralizes fetch calls, backend URLs, and error handling so page components stay focused on UI.”

---

### Review Question 2

**Why do we need `VITE_API_BASE_URL`?**

Expected answer:

“It stores the backend base URL for the frontend.”

Better answer:

“It lets the frontend call the backend without hardcoding the full URL in every component.”

---

### Review Question 3

**Why do we use `useEffect` to load products?**

Expected answer:

“To call the API when the page loads.”

Better answer:

“`useEffect` runs after render and avoids calling the API repeatedly during rendering.”

---

### Review Question 4

**Why do we need loading state?**

Expected answer:

“Because API requests take time, and the user should know that data is loading.”

---

### Review Question 5

**Why do we need error state?**

Expected answer:

“Because API calls can fail. The UI should show a useful error instead of crashing or staying blank.”

---

### Review Question 6

**What is an empty state?**

Expected answer:

“It is the UI shown when the API succeeds but returns no records.”

---

## 40–50 Minutes — Debugging and Common Issues

### Issue 1 — Frontend says failed to fetch

Possible causes:

* Backend is not running.
* Wrong `VITE_API_BASE_URL`.
* Frontend server was not restarted after `.env` change.
* CORS is not enabled.

Trainer guidance:

“First check whether the backend API opens directly in the browser or Postman. If the backend itself does not respond, fix backend first.”

---

### Issue 2 — API works in Postman but not browser

Likely cause:

* CORS issue
* Wrong frontend API URL
* Browser blocked cross-origin request

Check backend:

```js
app.use(cors());
```

---

### Issue 3 — Prisma connection error

Possible causes:

* PostgreSQL service is stopped.
* Database URL is wrong.
* Database does not exist.
* Migration was not applied.
* Prisma config does not point to the correct `.env` value.

Trainer guidance:

Use:

```powershell
npx prisma migrate status
```

and:

```powershell
npx prisma studio
```

---

### Issue 4 — Products page is empty

Possible causes:

* No products in database.
* Products were soft deleted.
* Query filters `isActive: true`.

Trainer guidance:

Create a product through Postman and refresh the frontend.

---

### Issue 5 — Price appears as a string

Explain:

“Prisma Decimal values may serialize as strings. For display, convert using `Number(price)`.”

Example:

```js
Number(product.price).toFixed(2)
```

---

### Issue 6 — Student builds Product Form early

Trainer guidance:

Pause and say:

“That is the correct next idea, but it is Day 9’s target. Today we only need the Products page to load real backend data. The form will be cleaner once this API layer is working.”

---

## 50–57 Minutes — Review Questions with Expected Answers

1. **What is today’s main achievement?**
   Expected answer: “We connected the Product API to PostgreSQL using Prisma and connected the React Products page to the backend API.”

2. **What is the full flow from React to database?**
   Expected answer: “React ProductsPage calls productApi.js, which calls Express API, which goes through route, controller, service, Prisma, and PostgreSQL.”

3. **Why should React not directly use Prisma?**
   Expected answer: “React runs in the browser. Prisma and database access belong on the backend.”

4. **What does `GET /api/products` return now?**
   Expected answer: “Products from PostgreSQL, filtered to active products.”

5. **What does `POST /api/products` do now?**
   Expected answer: “It validates input and creates a product in PostgreSQL using Prisma.”

6. **What happens when duplicate SKU is submitted?**
   Expected answer: “The backend returns a clean `400` error with `SKU already exists`.”

7. **What does `DELETE /api/products/:id` do in our project?**
   Expected answer: “It marks the product inactive using `isActive: false`.”

8. **What is an API service file in frontend?**
   Expected answer: “A file that contains functions for calling backend APIs.”

9. **Why do we show loading state?**
   Expected answer: “Because API calls take time and the user needs feedback.”

10. **Why do we show empty state?**
    Expected answer: “Because the API may succeed but return no records.”

---

## 57–60 Minutes — Closing Script

“Today is a major milestone. The Product screen is no longer just a mock frontend screen, and the backend is no longer using temporary data.

We now have a real full-stack flow:

React calls Express.
Express calls Prisma.
Prisma talks to PostgreSQL.
PostgreSQL stores the product data.

Tomorrow, we will build on this by adding a Product create form in React and starting the Customer backend. Today’s API service and loading/error patterns will be reused again for customers and later for sales orders.”

---

## Day 8 Success Criteria

Day 8 is complete when:

* Product service uses Prisma.
* No in-memory product array is used for the real Product API.
* Product CRUD endpoints work.
* Duplicate SKU returns a clean error.
* Delete uses soft delete.
* Products are stored in PostgreSQL.
* Frontend has `productApi.js`.
* Frontend uses `VITE_API_BASE_URL`.
* Products page loads real data.
* Loading state is visible.
* Error state is handled.
* Empty state is handled.
* Code is committed.
