const prisma = require("../lib/prisma");
const { createAppError } = require("../utils/appError");

function normalizeProductInput(data = {}) {
  return {
    sku: data.sku === undefined ? undefined : String(data.sku).trim(),
    name: data.name === undefined ? undefined : String(data.name).trim(),
    price: data.price,
    stockQty: data.stockQty,
  };
}

function validateProductInput(data = {}, { partial = false } = {}) {
  const errors = [];

  if (!partial || data.sku !== undefined) {
    if (!data.sku || !String(data.sku).trim()) {
      errors.push("SKU is required");
    }
  }

  if (!partial || data.name !== undefined) {
    if (!data.name || !String(data.name).trim()) {
      errors.push("Name is required");
    }
  }

  if (!partial || data.price !== undefined) {
    const price = Number(data.price);

    if (!Number.isFinite(price) || price <= 0) {
      errors.push("Price must be greater than zero");
    }
  }

  if (!partial || data.stockQty !== undefined) {
    const stockQty = Number(data.stockQty);

    if (!Number.isFinite(stockQty) || stockQty < 0) {
      errors.push("Stock quantity cannot be negative");
    }
  }

  if (errors.length > 0) {
    throw createAppError(errors.join(", "));
  }
}

function handleDuplicateSku(error) {
  if (error.code === "P2002") {
    throw createAppError("SKU already exists");
  }

  throw error;
}

async function getAllProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "desc",
    },
  });
}

async function getProductById(id) {
  return prisma.product.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
}

async function createProduct(data = {}) {
  validateProductInput(data);

  const normalized = normalizeProductInput(data);

  try {
    return await prisma.product.create({
      data: {
        sku: normalized.sku,
        name: normalized.name,
        price: normalized.price,
        stockQty: Number(normalized.stockQty),
      },
    });
  } catch (error) {
    handleDuplicateSku(error);
  }
}

async function updateProduct(id, data = {}) {
  validateProductInput(data, { partial: true });

  const existingProduct = await getProductById(id);

  if (!existingProduct) {
    throw createAppError("Product not found", 404);
  }

  const normalized = normalizeProductInput(data);
  const updateData = {};

  if (normalized.sku !== undefined) {
    updateData.sku = normalized.sku;
  }

  if (normalized.name !== undefined) {
    updateData.name = normalized.name;
  }

  if (normalized.price !== undefined) {
    updateData.price = normalized.price;
  }

  if (normalized.stockQty !== undefined) {
    updateData.stockQty = Number(normalized.stockQty);
  }

  try {
    return await prisma.product.update({
      where: {
        id,
      },
      data: updateData,
    });
  } catch (error) {
    handleDuplicateSku(error);
  }
}

async function deleteProduct(id) {
  const existingProduct = await getProductById(id);

  if (!existingProduct) {
    throw createAppError("Product not found", 404);
  }

  return prisma.product.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
