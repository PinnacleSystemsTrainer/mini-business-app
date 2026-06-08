const prisma = require("../lib/prisma");

function calculateLineTotal(quantity, rate) {
  return Number(quantity) * Number(rate);
}

function validateOrderInput(data) {
  if (!data.customerId) {
    const error = new Error("Customer is required");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    const error = new Error("Order must have at least one item");
    error.statusCode = 400;
    throw error;
  }

  data.items.forEach((item, index) => {
    if (!item.productId) {
      const error = new Error(`Product is required for item ${index + 1}`);
      error.statusCode = 400;
      throw error;
    }

    if (Number(item.quantity) <= 0) {
      const error = new Error(
        `Quantity must be greater than zero for item ${index + 1}`
      );
      error.statusCode = 400;
      throw error;
    }

    if (Number(item.rate) <= 0) {
      const error = new Error(
        `Rate must be greater than zero for item ${index + 1}`
      );
      error.statusCode = 400;
      throw error;
    }
  });
}

async function generateOrderNo() {
  const count = await prisma.salesOrder.count();
  return `SO-${String(count + 1).padStart(4, "0")}`;
}

async function createSalesOrder(data) {
  validateOrderInput(data);

  const customer = await prisma.customer.findUnique({
    where: { id: Number(data.customerId) },
  });

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 400;
    throw error;
  }

  const productIds = data.items.map((item) => Number(item.productId));

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    const error = new Error("One or more products are invalid");
    error.statusCode = 400;
    throw error;
  }

  const orderItems = data.items.map((item) => {
    const quantity = Number(item.quantity);
    const rate = Number(item.rate);
    return {
      productId: Number(item.productId),
      quantity,
      rate,
      lineTotal: calculateLineTotal(quantity, rate),
    };
  });

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + Number(item.lineTotal),
    0
  );

  const orderNo = await generateOrderNo();

  return prisma.salesOrder.create({
    data: {
      orderNo,
      customerId: Number(data.customerId),
      status: "DRAFT",
      totalAmount,
      items: {
        create: orderItems,
      },
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

async function getSalesOrders() {
  return prisma.salesOrder.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      items: {
        select: {
          id: true,
        },
      },
    },
  });
}

async function getSalesOrderById(id) {
  return prisma.salesOrder.findUnique({
    where: {
      id,
    },
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });
}

module.exports = {
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
};
