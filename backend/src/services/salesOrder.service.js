const prisma = require("../lib/prisma");

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
  getSalesOrders,
  getSalesOrderById,
};
