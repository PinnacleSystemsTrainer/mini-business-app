# Day 16 Addendum Trainer Script — Authentication and Authorization

Fullstack Training Program  
Mini Business Operations App

---

## Trainer Positioning

This is an optional addendum after the main Day 16 project hardening session.

Do not mix this into the core Day 16 material unless students have already completed:

- Backend hardening
- Frontend hardening
- Production readiness review
- Application demonstration

Authentication is a large topic. It introduces new concepts that are important but separate from the core business workflow.

The goal is not enterprise-grade security.

The goal is to help students understand a practical full-stack authentication and authorization flow using the same architecture they already know:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
Database
```

Core message:

> Authentication checks who the user is. Authorization checks what the user is allowed to do.

---

## Addendum Goal

By the end of this addendum, students should be able to:

1. Explain authentication.
2. Explain authorization.
3. Explain why passwords must be hashed.
4. Add a User model.
5. Run a Prisma migration and regenerate Prisma Client.
6. Build register and login APIs using route/controller/service structure.
7. Generate JWT tokens.
8. Protect backend routes using auth middleware.
9. Restrict actions using role middleware.
10. Add a React login page.
11. Store token and user details after login.
12. Send token with API requests.
13. Hide UI actions based on role.

---

## Suggested Timing

This addendum can be delivered in one extended session or split across two sessions.

| Time | Topic |
|---|---|
| 0–10 min | Authentication vs authorization |
| 10–20 min | User model, migration, and password hashing |
| 20–35 min | Auth module structure and route/controller/service pattern |
| 35–50 min | Register and login APIs |
| 50–65 min | JWT and auth middleware |
| 65–80 min | Role middleware and route protection matrix |
| 80–100 min | Frontend login, token usage, and role-based UI |
| 100–110 min | Review questions and common mistakes |

If students are tired after Day 16, split this addendum into two sessions.

---

## 0–10 Minutes — Authentication vs Authorization

### Trainer Script

“Until now, our Mini Business Operations App has not required login.

Anyone who can access the app can potentially create products, customers, sales orders, and confirm orders.

In a real business application, this is not acceptable.

We need authentication and authorization.”

Write:

```text
Authentication = Who are you?
Authorization = What are you allowed to do?
```

### Ask Students

#### Q. What is authentication?

Expected answer:

“Authentication verifies who the user is, usually by checking login credentials such as email and password.”

#### Q. What is authorization?

Expected answer:

“Authorization checks what the authenticated user is allowed to do.”

#### Q. Can a user be authenticated but not authorized?

Expected answer:

“Yes. A user may be logged in but still not allowed to perform admin-only actions.”

---

## Role Design

### Trainer Script

“For this project, we will keep roles simple.

We will use two roles:

```text
ADMIN
SALES_USER
```

ADMIN users manage master data and perform final business actions.

SALES_USER users create sales orders using already-created products and customers.”

### Whiteboard

```text
ADMIN
- Manage Products
- Manage Customers
- Create Sales Orders
- Confirm Sales Orders

SALES_USER
- View Products
- View Customers
- Create Sales Orders
- Cannot Confirm Sales Orders
```

### Ask Students

#### Q. Why should SALES_USER be able to view products?

Expected answer:

“Because sales order creation requires selecting existing products.”

#### Q. Why should SALES_USER be able to view customers?

Expected answer:

“Because a sales order belongs to a customer, so the user must be able to select a customer.”

#### Q. Why should only ADMIN confirm orders?

Expected answer:

“Confirmation changes business stock, creates stock movement records, and finalizes the transaction.”

---

## 10–20 Minutes — User Model, Migration, and Password Hashing

### Trainer Script

“Before users can log in, we need a User table.

The User table stores identity information, but it should never store plain passwords.”

Show the model:

```prisma
model User {
  id           Int      @id @default(autoincrement())
  name         String
  email        String   @unique
  passwordHash String
  role         String   @default("SALES_USER")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Migration Commands

Show:

```bash
cd backend
npx prisma migrate dev --name add_user
npx prisma generate
```

### Trainer Explanation

“Updating schema.prisma is not enough.

The migration updates the database.

Prisma generate updates the Prisma Client so backend code can use `prisma.user`.”

### Ask Students

#### Q. What happens if we update schema.prisma but do not run migration?

Expected answer:

“The database structure will not be updated.”

#### Q. What happens if Prisma Client is not regenerated?

Expected answer:

“Backend code may not recognize the new User model.”

---

## Password Hashing

### Trainer Script

“Never store a password like this in the database:

```text
password123
```

If the database leaks, the password is exposed.

Instead, store a hash.”

Show:

```js
const passwordHash = await bcrypt.hash(data.password, 10);
```

### Ask Students

#### Q. Why do we store passwordHash instead of password?

Expected answer:

“Because storing plain passwords is unsafe. A hash protects the original password better if the database is exposed.”

#### Q. Should the backend ever return passwordHash to the frontend?

Expected answer:

“No. It is internal sensitive data.”

---

## 20–35 Minutes — Auth Module Structure

### Trainer Script

“Authentication should follow the same structure we used for Products, Customers, and Sales Orders.

Do not put all authentication logic inside app.js.

Create route, controller, service, and middleware files.”

Show:

```text
backend/src/routes/auth.routes.js
backend/src/controllers/auth.controller.js
backend/src/services/auth.service.js
backend/src/middleware/auth.js
backend/src/middleware/requireRole.js
```

Mount routes in `app.js`:

```js
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);
```

### Ask Students

#### Q. Why should authentication still use route/controller/service structure?

Expected answer:

“Because it keeps the project consistent. Routes map URLs, controllers handle requests and responses, and services contain business logic.”

---

## 35–50 Minutes — Register and Login APIs

### Trainer Script

“We will create two APIs:

```text
POST /api/auth/register
POST /api/auth/login
```

Register creates a user.

Login verifies email and password and returns a token.”

### Important Security Framing

Tell students:

“Public registration should not allow users to choose their role.

If the register API accepts `role: 'ADMIN'`, any user can create an admin account.”

Avoid:

```js
role: data.role || 'SALES_USER'
```

Use:

```js
role: 'SALES_USER'
```

### Register Flow

Show:

```text
Read name, email, password
Check required fields
Check duplicate email
Hash password
Create user as SALES_USER
Return safe user data
```

Show code:

```js
async function registerUser(data) {
  if (!data.name || !data.email || !data.password) {
    throw createAppError('Name, email, and password are required', 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw createAppError('Email already exists', 400);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: 'SALES_USER',
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
```

### Ask Students

#### Q. Why should register not accept role from request body?

Expected answer:

“Because a user could create an ADMIN account by sending role: ADMIN.”

#### Q. How should the first ADMIN be created?

Expected answer:

“Manually or through a seed script.”

---

## First ADMIN User

### Trainer Script

“Since register always creates SALES_USER, we need another way to create the first ADMIN.

For training, we can use a small seed script.”

Show:

```js
const bcrypt = require('bcryptjs');
const prisma = require('../src/lib/prisma');

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: {
      email: 'admin@example.com',
    },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run:

```bash
cd backend
node scripts/create-admin.js
```

### Trainer Note

Do not spend too much time on seed tooling.

The teaching point is:

```text
Public registration should not create admins.
```

---

## Login Flow

Show:

```text
Read email and password
Find user by email
Compare password with passwordHash
If valid, create JWT
Return token and user details
```

Show code:

```js
async function loginUser(data) {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw createAppError('Invalid credentials', 401);
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw createAppError('Invalid credentials', 401);
  }

  const token = createToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
```

### Trainer Note

Emphasize that invalid email and wrong password should both return a general message like:

```text
Invalid credentials
```

Do not reveal whether the email exists.

---

## 50–65 Minutes — JWT and Auth Middleware

### Trainer Script

“After login, the backend returns a token.

The frontend stores the token.

For future requests, the frontend sends the token in the Authorization header.”

Show:

```http
Authorization: Bearer jwt-token-here
```

### JWT Payload

Show:

```js
function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    }
  );
}
```

### Auth Middleware

Show:

```js
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
}
```

### Ask Students

#### Q. Why do we attach payload to req.user?

Expected answer:

“So later middleware and controllers can know which user is making the request.”

#### Q. What status code should missing token return?

Expected answer:

“401 Unauthorized.”

---

## 65–80 Minutes — Role Middleware and Route Protection

### Trainer Script

“Authentication only tells us who the user is.

Authorization decides what the user can do.

That is why we need role middleware.”

Show:

```js
function requireRole(...allowedRoles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You are not allowed to perform this action',
      });
    }

    next();
  };
}
```

### Route Protection Matrix

Show this table or write it on the board.

#### Products

| Route | ADMIN | SALES_USER |
|---|---|---|
| GET /products | Yes | Yes |
| GET /products/:id | Yes | Yes |
| POST /products | Yes | No |
| PATCH /products/:id | Yes | No |
| DELETE /products/:id | Yes | No |

#### Customers

| Route | ADMIN | SALES_USER |
|---|---|---|
| GET /customers | Yes | Yes |
| GET /customers/:id | Yes | Yes |
| POST /customers | Yes | No |
| PATCH /customers/:id | Yes | No |
| DELETE /customers/:id | Yes | No |

#### Sales Orders

| Route | ADMIN | SALES_USER |
|---|---|---|
| GET /sales-orders | Yes | Yes |
| GET /sales-orders/:id | Yes | Yes |
| POST /sales-orders | Yes | Yes |
| POST /sales-orders/:id/confirm | Yes | No |

### Ask Students

#### Q. What is the difference between 401 and 403?

Expected answer:

“401 means the user is not authenticated. 403 means the user is authenticated but not allowed to perform the action.”

#### Q. Why should product POST require ADMIN?

Expected answer:

“Because creating products changes master data.”

#### Q. Why should sales order confirm require ADMIN?

Expected answer:

“Because confirmation changes stock and creates stock movement records.”

---

## 80–100 Minutes — Frontend Login and Token Usage

### Trainer Script

“Now we connect the frontend.

The login page sends email and password to the backend.

If login succeeds, the frontend stores the token and user details.”

### API Base URL Reminder

Warn students:

“The project already uses an API base URL that includes `/api`.”

Correct pattern:

```js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

Correct login URL:

```js
fetch(`${API_BASE_URL}/auth/login`)
```

Wrong login URL:

```js
fetch(`${API_BASE_URL}/api/auth/login`)
```

Explain:

“The wrong version can create `/api/api/auth/login`.”

### Login API

```js
import { handleResponse } from './httpClient';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function login(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  return handleResponse(response);
}
```

### Store Token

```js
localStorage.setItem('token', result.token);
localStorage.setItem('user', JSON.stringify(result.user));
```

### Send Token

```js
function getAuthHeaders() {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}
```

### Ask Students

#### Q. Is localStorage the most secure place for tokens?

Expected answer:

“No. It is simple for training, but real applications may use more secure approaches depending on requirements.”

Trainer note:

Do not go too deep into cookie security, refresh tokens, CSRF, and XSS unless students are ready. This is an introductory addendum.

---

## Role-Based UI

### Trainer Script

“Frontend role checks improve user experience, but they are not real security by themselves.”

Show:

```jsx
const user = JSON.parse(localStorage.getItem('user') || 'null');

{user?.role === 'ADMIN' ? (
  <Link to="/products/new">Add Product</Link>
) : null}
```

### Ask Students

#### Q. Why is hiding a button not enough security?

Expected answer:

“Because users can still call backend APIs manually. Backend authorization is required.”

---

## Common Mistakes To Watch For

### Mistake 1 — API URL is wrong

Wrong:

```js
fetch(`${API_BASE_URL}/api/auth/login`)
```

Correct:

```js
fetch(`${API_BASE_URL}/auth/login`)
```

because `API_BASE_URL` already includes `/api`.

---

### Mistake 2 — Public registration creates ADMIN

Wrong:

```js
role: data.role || 'SALES_USER'
```

Correct:

```js
role: 'SALES_USER'
```

---

### Mistake 3 — Missing route mount

If login returns 404, check:

```js
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);
```

---

### Mistake 4 — Prisma user model not available

Run:

```bash
npx prisma migrate dev --name add_user
npx prisma generate
```

---

### Mistake 5 — Missing JWT_SECRET

If login or middleware fails, check backend `.env`:

```env
JWT_SECRET="replace-this-with-a-long-secret-value"
```

---

## 100–110 Minutes — Review Questions

### Q1. What is authentication?

Expected answer:

“Authentication verifies who the user is.”

### Q2. What is authorization?

Expected answer:

“Authorization checks what the user is allowed to do.”

### Q3. Why should passwords be hashed?

Expected answer:

“To avoid storing plain-text passwords in the database.”

### Q4. Why should register not accept role from request body?

Expected answer:

“Because users could create ADMIN accounts for themselves.”

### Q5. Why does SALES_USER need product and customer read access?

Expected answer:

“To create sales orders using existing products and customers.”

### Q6. Why should only ADMIN confirm orders?

Expected answer:

“Because confirmation affects stock and creates stock movement records.”

### Q7. What does 401 mean?

Expected answer:

“The user is not authenticated.”

### Q8. What does 403 mean?

Expected answer:

“The user is authenticated but not allowed to perform the action.”

### Q9. Why is hiding React buttons not enough?

Expected answer:

“Because backend APIs can still be called directly. Authorization must be enforced on the backend.”

### Q10. What URL should frontend login call?

Expected answer:

```js
fetch(`${API_BASE_URL}/auth/login`)
```

because `API_BASE_URL` already includes `/api`.

---

## Addendum Deliverable

Students should complete:

```text
Backend:
- User Prisma model
- Migration and Prisma generate
- JWT_SECRET in .env and .env.example
- auth.routes.js
- auth.controller.js
- auth.service.js
- auth middleware
- requireRole middleware
- Protected product/customer/sales order routes
- Seeded ADMIN user
- Register creates SALES_USER only

Frontend:
- authApi.js
- LoginPage.jsx
- ProtectedRoute.jsx
- Token stored after login
- User stored after login
- Token sent with API requests
- Admin-only buttons hidden for SALES_USER

Testing:
- Login works
- Missing token returns 401
- SALES_USER cannot create product
- SALES_USER can create sales order
- SALES_USER cannot confirm sales order
- ADMIN can confirm sales order
```

Suggested commit message:

```bash
git add .
git commit -m "Add authentication and role-based authorization"
```

---

## Trainer Closing Script

“This addendum adds security concepts on top of the Mini Business Operations App.

The core business workflow still remains the same:

Product master, customer master, sales order creation, confirmation, stock validation, and stock movement.

Authentication and authorization decide who can access those workflows and what actions they are allowed to perform.

The most important ideas are:

Authentication checks who the user is.

Authorization checks what the user can do.

Passwords must be hashed.

Tokens must be verified on the backend.

Frontend UI hiding is helpful, but backend route protection is the real security.”
