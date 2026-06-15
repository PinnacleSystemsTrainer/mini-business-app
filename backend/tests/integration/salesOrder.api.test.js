process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/lib/prisma');

const runId = Date.now();
let adminToken;
let salesToken;

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );
}

beforeAll(async () => {
  const admin = await prisma.user.create({
    data: {
      name: 'Test Admin',
      email: `test-admin-${runId}@example.com`,
      passwordHash: 'not-used-in-api-tests',
      role: 'ADMIN',
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Test Sales User',
      email: `test-sales-${runId}@example.com`,
      passwordHash: 'not-used-in-api-tests',
      role: 'SALES_USER',
    },
  });

  adminToken = createToken(admin);
  salesToken = createToken(salesUser);
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [`test-admin-${runId}@example.com`, `test-sales-${runId}@example.com`],
      },
    },
  });
  await prisma.$disconnect();
});

describe('Backend API smoke tests', () => {
  test('GET /health returns ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});

describe('API authorization', () => {
  test('rejects missing token on protected routes', async () => {
    const response = await request(app).get('/api/products');

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/authentication required/i);
  });

  test('blocks SALES_USER from creating products', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        sku: `TEST-FORBIDDEN-${runId}`,
        name: 'Forbidden Product',
        price: 50,
        stockQty: 10,
      });

    expect(response.status).toBe(403);
  });
});

describe('Sales order API flow', () => {
  const unique = Date.now();
  let product;
  let customer;
  let salesOrder;

  afterAll(async () => {
    if (salesOrder) {
      await prisma.stockMovement.deleteMany({ where: { referenceId: salesOrder.id } });
      await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: salesOrder.id } });
      await prisma.salesOrder.delete({ where: { id: salesOrder.id } });
    }
    if (customer) {
      await prisma.customer.delete({ where: { id: customer.id } });
    }
    if (product) {
      await prisma.product.delete({ where: { id: product.id } });
    }
  });

  test('creates a product', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: `TEST-PROD-${unique}`,
        name: 'Test Notebook',
        price: 50,
        stockQty: 10,
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    product = response.body;
  });

  test('creates a customer', async () => {
    const response = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: `TEST-CUST-${unique}`,
        name: 'Test Customer',
        phone: '9876543210',
        email: 'test@example.com',
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    customer = response.body;
  });

  test('creates a draft sales order', async () => {
    const response = await request(app)
      .post('/api/sales-orders')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customerId: customer.id,
        items: [
          {
            productId: product.id,
            quantity: 2,
            rate: 50,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('DRAFT');
    expect(Number(response.body.totalAmount)).toBe(100);

    salesOrder = response.body;
  });

  test('confirms the sales order', async () => {
    const response = await request(app)
      .post(`/api/sales-orders/${salesOrder.id}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('CONFIRMED');
  });

  test('reduces product stock after confirmation', async () => {
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
    });

    expect(updatedProduct.stockQty).toBe(8);
  });

  test('creates a stock movement record after confirmation', async () => {
    const movement = await prisma.stockMovement.findFirst({
      where: { referenceId: salesOrder.id, referenceType: 'SALES_ORDER' },
    });

    expect(movement).not.toBeNull();
    expect(movement.movementType).toBe('OUT');
    expect(movement.quantity).toBe(2);
  });

  test('blocks double confirmation', async () => {
    const response = await request(app)
      .post(`/api/sales-orders/${salesOrder.id}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(response.status).toBe(400);
  });
});

describe('Sales order failure cases', () => {
  const unique = Date.now() + 1;
  let lowStockProduct;
  let customer;

  beforeAll(async () => {
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: `TEST-LOW-${unique}`,
        name: 'Low Stock Item',
        price: 20,
        stockQty: 1,
      });
    lowStockProduct = productRes.body;

    const customerRes = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: `TEST-FAIL-${unique}`,
        name: 'Fail Test Customer',
        phone: '1111111111',
        email: 'fail@example.com',
      });
    customer = customerRes.body;
  });

  afterAll(async () => {
    if (lowStockProduct) {
      await prisma.product.delete({ where: { id: lowStockProduct.id } });
    }
    if (customer) {
      await prisma.customer.delete({ where: { id: customer.id } });
    }
  });

  test('rejects order creation without items', async () => {
    const response = await request(app)
      .post('/api/sales-orders')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ customerId: customer.id, items: [] });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/at least one item/i);
  });

  test('rejects confirmation when stock is insufficient', async () => {
    const orderRes = await request(app)
      .post('/api/sales-orders')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customerId: customer.id,
        items: [{ productId: lowStockProduct.id, quantity: 5, rate: 20 }],
      });
    expect(orderRes.status).toBe(201);

    const confirmRes = await request(app)
      .post(`/api/sales-orders/${orderRes.body.id}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(confirmRes.status).toBe(400);
    expect(confirmRes.body.message).toMatch(/insufficient stock/i);

    await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: orderRes.body.id } });
    await prisma.salesOrder.delete({ where: { id: orderRes.body.id } });
  });
});
