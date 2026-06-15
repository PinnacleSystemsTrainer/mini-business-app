const prisma = require("../lib/prisma");
const { createAppError } = require("../utils/appError");
const {
  calculateLineTotal,
  calculateOrderTotal,
} = require("../utils/salesOrderCalculations");

function validateOrderHasCustomer(data) {
  if (!data.customerId) {
    throw createAppError("Customer is required");
  }
}

function validateOrderHasItems(data) {
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw createAppError("Order must have at least one item");
  }
}

function validateOrderItem(item, index) {
  const itemNumber = index + 1;

  if (!item.productId) {
    throw createAppError(`Product is required for item ${itemNumber}`);
  }

  if (Number(item.quantity) <= 0) {
    throw createAppError(
      `Quantity must be greater than zero for item ${itemNumber}`
    );
  }

  if (Number(item.rate) <= 0) {
    throw createAppError(`Rate must be greater than zero for item ${itemNumber}`);
  }
}

function validateOrderInput(data) {
  validateOrderHasCustomer(data);
  validateOrderHasItems(data);
  data.items.forEach(validateOrderItem);
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
    throw createAppError("Customer not found");
  }

  const productIds = data.items.map((item) => Number(item.productId));

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    throw createAppError("One or more products are invalid");
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

  const totalAmount = calculateOrderTotal(data.items);

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

async function confirmSalesOrder(id) {
  const orderId = Number(id);

  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: {
        id: orderId,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!order) {
      throw createAppError("Sales order not found", 404);
    }

    if (order.status !== "DRAFT") {
      throw createAppError("Only draft orders can be confirmed");
    }

    if (!order.items || order.items.length === 0) {
      throw createAppError("Cannot confirm an order without items");
    }

    for (const item of order.items) {
      if (item.quantity <= 0) {
        throw createAppError("Order item quantity must be greater than zero");
      }

      if (!item.product) {
        throw createAppError("Order item product not found");
      }

      if (item.product.stockQty < item.quantity) {
        throw createAppError(`Insufficient stock for product ${item.product.name}`);
      }
    }

    const statusUpdate = await tx.salesOrder.updateMany({
      where: {
        id: order.id,
        status: "DRAFT",
      },
      data: {
        status: "CONFIRMED",
      },
    });

    if (statusUpdate.count !== 1) {
      throw createAppError("Only draft orders can be confirmed");
    }

    for (const item of order.items) {
      const productUpdate = await tx.product.updateMany({
        where: {
          id: item.productId,
          stockQty: {
            gte: item.quantity,
          },
        },
        data: {
          stockQty: {
            decrement: item.quantity,
          },
        },
      });

      if (productUpdate.count !== 1) {
        throw createAppError(`Insufficient stock for product ${item.product.name}`);
      }

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          movementType: "OUT",
          quantity: item.quantity,
          referenceType: "SALES_ORDER",
          referenceId: order.id,
        },
      });
    }

    return tx.salesOrder.findUnique({
      where: {
        id: order.id,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    });
  });
}

module.exports = {
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  confirmSalesOrder,
};
