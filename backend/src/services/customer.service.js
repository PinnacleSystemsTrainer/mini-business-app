const prisma = require("../lib/prisma");
const { createAppError } = require("../utils/appError");

function normalizeCustomerInput(data = {}) {
  return {
    code: data.code === undefined ? undefined : String(data.code).trim(),
    name: data.name === undefined ? undefined : String(data.name).trim(),
    phone:
      data.phone === undefined || data.phone === null
        ? null
        : String(data.phone).trim() || null,
    email:
      data.email === undefined || data.email === null
        ? null
        : String(data.email).trim() || null,
  };
}

function validateCustomerData(data = {}) {
  if (!data.code || !String(data.code).trim()) {
    throw createAppError("Customer code is required");
  }

  if (!data.name || !String(data.name).trim()) {
    throw createAppError("Customer name is required");
  }
}

async function listCustomers() {
  return prisma.customer.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "desc",
    },
  });
}

async function getCustomerById(id) {
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      isActive: true,
    },
  });

  if (!customer) {
    throw createAppError("Customer not found", 404);
  }

  return customer;
}

async function createCustomer(data = {}) {
  validateCustomerData(data);

  const normalized = normalizeCustomerInput(data);

  const existingCustomer = await prisma.customer.findUnique({
    where: {
      code: normalized.code,
    },
  });

  if (existingCustomer) {
    throw createAppError("Customer code already exists");
  }

  return prisma.customer.create({
    data: normalized,
  });
}

async function updateCustomer(id, data = {}) {
  await getCustomerById(id);
  validateCustomerData(data);

  const normalized = normalizeCustomerInput(data);

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      code: normalized.code,
      NOT: {
        id,
      },
    },
  });

  if (existingCustomer) {
    throw createAppError("Customer code already exists");
  }

  return prisma.customer.update({
    where: {
      id,
    },
    data: normalized,
  });
}

async function deleteCustomer(id) {
  await getCustomerById(id);

  return prisma.customer.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
}

module.exports = {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
