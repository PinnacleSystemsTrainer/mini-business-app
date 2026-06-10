const prisma = require("../../src/lib/prisma");

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
} = require("../../src/services/salesOrder.service");

beforeEach(() => {
  vi.clearAllMocks();

  prisma.$transaction.mockImplementation(async (callback) => {
    return callback(prisma);
  });
});

describe("salesOrder.service createSalesOrder", () => {
  it("rejects order creation when items are missing", async () => {
    await expect(
      createSalesOrder({
        customerId: 1,
        items: [],
      }),
    ).rejects.toThrow("Order must have at least one item");
  });

  it("creates a sales order successfully", async () => {
    const input = {
      customerId: 1,
      items: [
        { productId: 1, quantity: 2, rate: 50 },
        { productId: 2, quantity: 3, rate: 10 },
      ],
    };

    const createdOrder = {
      id: 1,
      orderNo: "SO-001",
      customerId: 1,
      status: "DRAFT",
      totalAmount: 130,
      items: [
        { id: 1, productId: 1, quantity: 2, rate: 50, lineTotal: 100 },
        { id: 2, productId: 2, quantity: 3, rate: 10, lineTotal: 30 },
      ],
    };

    prisma.customer.findUnique.mockResolvedValue({
      id: 1,
      name: "Test Customer",
    });

    prisma.product.findMany.mockResolvedValue([
      { id: 1, name: "Notebook" },
      { id: 2, name: "Pen" },
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

describe("salesOrder.service read functions", () => {
  it("returns sales order list", async () => {
    const orders = [
      {
        id: 1,
        orderNo: "SO-001",
        status: "DRAFT",
        totalAmount: 130,
      },
      {
        id: 2,
        orderNo: "SO-002",
        status: "CONFIRMED",
        totalAmount: 250,
      },
    ];

    prisma.salesOrder.findMany.mockResolvedValue(orders);

    const result = await getSalesOrders();

    expect(prisma.salesOrder.findMany).toHaveBeenCalled();
    expect(result).toEqual(orders);
  });

  it("returns one sales order by id", async () => {
    const order = {
      id: 1,
      orderNo: "SO-001",
      status: "DRAFT",
      totalAmount: 130,
      items: [],
    };

    prisma.salesOrder.findUnique.mockResolvedValue(order);

    const result = await getSalesOrderById(1);

    expect(prisma.salesOrder.findUnique).toHaveBeenCalled();
    expect(result).toEqual(order);
  });

  it("returns null when sales order is not found", async () => {
    prisma.salesOrder.findUnique.mockResolvedValue(null);

    const result = await getSalesOrderById(999);

    expect(prisma.salesOrder.findUnique).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

describe("salesOrder.service confirmSalesOrder", () => {
  it("rejects confirmation when stock is insufficient", async () => {
    const draftOrder = {
      id: 1,
      orderNo: "SO-001",
      status: "DRAFT",
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 5,
          product: {
            id: 1,
            name: "Notebook",
            stockQty: 3,
          },
        },
      ],
    };

    prisma.salesOrder.findUnique.mockResolvedValue(draftOrder);

    await expect(confirmSalesOrder(1)).rejects.toThrow("Insufficient stock");

    expect(prisma.product.updateMany).not.toHaveBeenCalled();
    expect(prisma.salesOrder.updateMany).not.toHaveBeenCalled();
    expect(prisma.stockMovement.create).not.toHaveBeenCalled();
  });

  it("confirms order when stock is available", async () => {
    const draftOrder = {
      id: 1,
      orderNo: "SO-001",
      status: "DRAFT",
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 2,
          product: {
            id: 1,
            name: "Notebook",
            stockQty: 10,
          },
        },
      ],
    };

    const confirmedOrder = {
      ...draftOrder,
      status: "CONFIRMED",
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

    expect(result.status).toBe("CONFIRMED");
  });
});
