# Day 10 Addendum Trainer Script — Product and Customer Update + Soft Delete

Fullstack Training Program
Mini Business Operations App

## Addendum Purpose

This addendum extends Day 10.

The main Day 10 session completes Customer UI, shared error handling, and Week 2 review. This addendum adds one practical master-data feature that is commonly needed in real business applications:

* Edit Product
* Edit Customer
* Soft delete Product
* Soft delete Customer

This should be treated as an additional guided activity, not a replacement for the main Day 10 content.

## Why Add This Today?

By the end of Day 10, students already understand:

* Product list
* Product create form
* Customer list
* Customer create form
* API service files
* Loading state
* Error state
* Empty state
* Backend error handling
* Prisma-backed Product and Customer APIs

That makes Day 10 a good place to introduce update and soft delete for master data.

The important teaching point:

> In business software, deleting master data usually means deactivating the record, not physically removing it from the database.

## Trainer Positioning

Tell students:

“Today we already completed Product and Customer create/list flows. But real business applications also need a way to correct master data and hide records that should no longer be used.

For example, a product price may need correction. A customer phone number may change. A product may be discontinued. A customer may become inactive.

In many business systems, we do not permanently delete these records. We soft delete them by setting `isActive` to false.”

## Learning Goals

By the end of this addendum, students should be able to:

1. Explain the difference between update and delete.
2. Explain the difference between hard delete and soft delete.
3. Implement Product update using `PATCH /api/products/:id`.
4. Implement Customer update using `PATCH /api/customers/:id`.
5. Implement soft delete using `isActive = false`.
6. Add Edit buttons to Product and Customer list pages.
7. Add Delete or Deactivate buttons to Product and Customer list pages.
8. Reuse existing ProductFormPage and CustomerFormPage for edit mode where possible.
9. Refresh list data after update or soft delete.
10. Explain why soft delete is safer for master data.

---

# Suggested Timing

This addendum can be handled in one of two ways.

## Option A — Short Trainer Demo

Use this if students are still slow with Day 10 work.

| Time   | Activity                                         |
| ------ | ------------------------------------------------ |
| 10 min | Explain update vs soft delete                    |
| 15 min | Backend demo for one entity                      |
| 15 min | Frontend demo for one entity                     |
| 20 min | Students apply same pattern to the second entity |

## Option B — Full Addendum Session

Use this if students are ready for more hands-on work.

| Time   | Activity                              |
| ------ | ------------------------------------- |
| 10 min | Concept explanation                   |
| 20 min | Backend Product update + soft delete  |
| 20 min | Frontend Product edit + deactivate    |
| 20 min | Backend Customer update + soft delete |
| 20 min | Frontend Customer edit + deactivate   |
| 30 min | Review, debugging, and PR cleanup     |

---

# Concept 1 — Update

## Trainer Script

“Update means changing an existing record.

For example:

* Product price changed from 50 to 60
* Product name spelling was corrected
* Customer phone number changed
* Customer email was added later

For this project, we use `PATCH` for update because we may update only some fields.”

## REST API Pattern

```
PATCH /api/products/:id
PATCH /api/customers/:id
```

Example product update request:

```
{
  "name": "Premium Notebook",
  "price": 60,
  "stockQty": 120
}
```

Example customer update request:

```
{
  "name": "ABC Stores",
  "phone": "9876543210",
  "email": "accounts@abcstores.com"
}
```

## Ask Students

### Q1. Why do we use PATCH instead of POST for update?

Expected answer:

“POST is used to create a new record. PATCH is used to update an existing record partially.”

### Q2. Why does the URL contain an ID?

Expected answer:

“The ID tells the backend which existing record should be updated.”

---

# Concept 2 — Hard Delete vs Soft Delete

## Trainer Script

“Delete can mean two different things.

Hard delete means the record is physically removed from the database.

Soft delete means the record remains in the database, but is marked inactive.”

## Hard Delete

Example:

```
await prisma.product.delete({
  where: { id }
});
```

This removes the row from the database.

## Soft Delete

Example:

```
await prisma.product.update({
  where: { id },
  data: { isActive: false }
});
```

This keeps the row but hides it from normal active lists.

## Why Soft Delete Is Better for Master Data

Use soft delete for Products and Customers because:

* Old sales orders may refer to those records.
* Reports may need historical product/customer details.
* Accidental deletion can be recovered.
* Business audit history is safer.
* Foreign key relationship problems are avoided.

## Trainer Warning

Tell students:

“For this training project, we will soft delete Product and Customer records. We will not permanently delete them.”

---

# Backend Product Update

## Product Service

Update:

```
backend/src/services/product.service.js
```

Add or verify this function:

```
async function updateProduct(id, data) {
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct || !existingProduct.isActive) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.sku && data.sku !== existingProduct.sku) {
    const duplicateSku = await prisma.product.findUnique({
      where: { sku: data.sku }
    });

    if (duplicateSku) {
      const error = new Error('SKU already exists');
      error.statusCode = 400;
      throw error;
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      sku: data.sku,
      name: data.name,
      price: data.price !== undefined ? Number(data.price) : undefined,
      stockQty:
        data.stockQty !== undefined ? Number(data.stockQty) : undefined
    }
  });
}
```

## Product Soft Delete

Add:

```
async function deleteProduct(id) {
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct || !existingProduct.isActive) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.product.update({
    where: { id },
    data: {
      isActive: false
    }
  });
}
```

## Export Functions

Make sure exports include:

```
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
```

---

# Backend Product Controller

Update:

```
backend/src/controllers/product.controller.js
```

Add:

```
async function updateProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const product = await productService.updateProduct(id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    await productService.deleteProduct(id);

    res.json({
      message: 'Product deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
}
```

Export:

```
module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
```

---

# Backend Product Routes

Update:

```
backend/src/routes/product.routes.js
```

Add:

```
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
```

Expected routes:

```
GET /api/products
GET /api/products/:id
POST /api/products
PATCH /api/products/:id
DELETE /api/products/:id
```

---

# Backend Customer Update

## Customer Service

Update:

```
backend/src/services/customer.service.js
```

Add:

```
async function updateCustomer(id, data) {
  const existingCustomer = await prisma.customer.findUnique({
    where: { id }
  });

  if (!existingCustomer || !existingCustomer.isActive) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.code && data.code !== existingCustomer.code) {
    const duplicateCode = await prisma.customer.findUnique({
      where: { code: data.code }
    });

    if (duplicateCode) {
      const error = new Error('Customer code already exists');
      error.statusCode = 400;
      throw error;
    }
  }

  return prisma.customer.update({
    where: { id },
    data: {
      code: data.code,
      name: data.name,
      phone: data.phone,
      email: data.email
    }
  });
}
```

## Customer Soft Delete

Add:

```
async function deleteCustomer(id) {
  const existingCustomer = await prisma.customer.findUnique({
    where: { id }
  });

  if (!existingCustomer || !existingCustomer.isActive) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.customer.update({
    where: { id },
    data: {
      isActive: false
    }
  });
}
```

Export:

```
module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
```

---

# Backend Customer Controller

Update:

```
backend/src/controllers/customer.controller.js
```

Add:

```
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

    res.json({
      message: 'Customer deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
}
```

Export:

```
module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
```

---

# Backend Customer Routes

Update:

```
backend/src/routes/customer.routes.js
```

Add:

```
router.patch('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
```

Expected routes:

```
GET /api/customers
GET /api/customers/:id
POST /api/customers
PATCH /api/customers/:id
DELETE /api/customers/:id
```

---

# Important Backend List Rule

Product and Customer list APIs should return only active records.

Example:

```
async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { id: 'desc' }
  });
}
```

Example:

```
async function getCustomers() {
  return prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { id: 'desc' }
  });
}
```

Trainer explanation:

“Soft-deleted records are still in the database, but normal list pages should hide them.”

---

# Frontend Product API Additions

Update:

```
frontend/src/api/productApi.js
```

Add:

```
export async function getProductById(id) {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
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

# Frontend Customer API Additions

Update:

```
frontend/src/api/customerApi.js
```

Add:

```
export async function getCustomerById(id) {
  const response = await fetch(`${API_BASE_URL}/api/customers/${id}`);
  return handleResponse(response);
}

export async function updateCustomer(id, customer) {
  const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(customer)
  });

  return handleResponse(response);
}

export async function deleteCustomer(id) {
  const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
    method: 'DELETE'
  });

  return handleResponse(response);
}
```

---

# Frontend Routing

Add edit routes:

```
/products/:id/edit
/customers/:id/edit
```

Update:

```
frontend/src/routes/AppRoutes.jsx
```

Add:

```
<Route path="/products/:id/edit" element={<ProductFormPage />} />
<Route path="/customers/:id/edit" element={<CustomerFormPage />} />
```

Expected route list:

```
/
/products
/products/new
/products/:id/edit
/customers
/customers/new
/customers/:id/edit
```

---

# Product List Actions

In ProductsPage, add an Actions column.

Example header:

```
<th className="px-3 py-2 font-medium">Actions</th>
```

Example row actions:

```
<td className="px-3 py-2">
  <div className="flex items-center gap-3">
    <Link
      to={`/products/${product.id}/edit`}
      className="text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      Edit
    </Link>

    <button
      type="button"
      onClick={() => handleDelete(product.id)}
      className="text-sm font-medium text-red-600 hover:text-red-700"
    >
      Deactivate
    </button>
  </div>
</td>
```

Add handler:

```
async function handleDelete(id) {
  const confirmed = window.confirm(
    'Deactivate this product? It will be hidden from active product lists.'
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteProduct(id);
    await loadProducts();
  } catch (err) {
    setError(err.message || 'Failed to deactivate product');
  }
}
```

Trainer note:

“Use `Deactivate` instead of `Delete` in the UI. This makes the business behavior clearer.”

---

# Customer List Actions

In CustomersPage, add an Actions column.

Example row actions:

```
<td className="px-3 py-2">
  <div className="flex items-center gap-3">
    <Link
      to={`/customers/${customer.id}/edit`}
      className="text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      Edit
    </Link>

    <button
      type="button"
      onClick={() => handleDelete(customer.id)}
      className="text-sm font-medium text-red-600 hover:text-red-700"
    >
      Deactivate
    </button>
  </div>
</td>
```

Add handler:

```
async function handleDelete(id) {
  const confirmed = window.confirm(
    'Deactivate this customer? It will be hidden from active customer lists.'
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteCustomer(id);
    await loadCustomers();
  } catch (err) {
    setError(err.message || 'Failed to deactivate customer');
  }
}
```

---

# Form Reuse for Edit Mode

## Trainer Explanation

“Create and edit forms are very similar.

Create mode starts with an empty form and calls POST.

Edit mode loads an existing record, fills the form, and calls PATCH.

So we can reuse the same form page.”

## ProductFormPage Edit Logic

ProductFormPage can check whether there is an ID in the URL.

```
const { id } = useParams();
const isEditMode = Boolean(id);
```

If edit mode:

* Load product by ID
* Fill form state
* On submit, call updateProduct
* Navigate back to `/products`

If create mode:

* Use empty form
* On submit, call createProduct
* Navigate back to `/products`

## CustomerFormPage Edit Logic

CustomerFormPage can follow the same pattern.

```
const { id } = useParams();
const isEditMode = Boolean(id);
```

If edit mode:

* Load customer by ID
* Fill form state
* On submit, call updateCustomer
* Navigate back to `/customers`

---

# Review Questions

## Q1. What is soft delete?

Expected answer:

“Soft delete means the record is not physically removed from the database. Instead, it is marked inactive, usually using a field like `isActive = false`.”

## Q2. Why is soft delete safer for Products and Customers?

Expected answer:

“Because products and customers may be referenced by past sales orders. Keeping the record protects history, reports, and relationships.”

## Q3. What is the difference between PATCH and DELETE?

Expected answer:

“PATCH updates fields on an existing record. DELETE is used to remove or deactivate a record.”

## Q4. Are we really deleting records from the database?

Expected answer:

“No. For this project, DELETE endpoints perform soft delete by setting `isActive` to false.”

## Q5. Why should active list APIs filter by `isActive: true`?

Expected answer:

“Because soft-deleted records should remain in the database but should not appear in normal active lists.”

## Q6. Why use `Deactivate` instead of `Delete` in the UI?

Expected answer:

“Because the record is not physically removed. Deactivate better describes what is happening.”

## Q7. What should happen after successful deactivation?

Expected answer:

“The list should reload, and the deactivated record should disappear from the active list.”

## Q8. What should happen if a user tries to edit a deactivated record?

Expected answer:

“The backend should return not found or prevent editing inactive records.”

---

# Success Criteria

By the end of this addendum:

```
[ ] Product update endpoint works
[ ] Product soft delete endpoint works
[ ] Customer update endpoint works
[ ] Customer soft delete endpoint works
[ ] Product list hides inactive products
[ ] Customer list hides inactive customers
[ ] Product edit route exists
[ ] Customer edit route exists
[ ] Product list has Edit and Deactivate actions
[ ] Customer list has Edit and Deactivate actions
[ ] Product form supports create and edit modes
[ ] Customer form supports create and edit modes
[ ] Deactivate action asks for confirmation
[ ] List refreshes after deactivation
[ ] Error messages display cleanly
```

---

# Suggested Commit Message

```
Add update and soft delete for product and customer masters
```

---

# Trainer Closing Script

“This addendum completes the basic master-data lifecycle.

We can now create, view, update, and deactivate Products and Customers.

This is very close to how real business systems handle master data.

Tomorrow, we will move into transaction data: Sales Orders. Products and Customers will become the foundation for creating orders.”
