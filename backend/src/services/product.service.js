let products = [
  { id: 1, sku: "P001", name: "Notebook", price: 50, stockQty: 100 },
  { id: 2, sku: "P002", name: "Pen", price: 10, stockQty: 500 }
];

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getAllProducts() {
  return products;
}

function getProductById(id) {
  return products.find(product => product.id === id);
}

function createProduct(data = {}) {
  const price = Number(data.price);
  const stockQty = Number(data.stockQty);

  if (
    !data.sku ||
    !data.name ||
    data.price === undefined ||
    data.stockQty === undefined
  ) {
    throw createError("sku, name, price, and stockQty are required");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw createError("Price must be greater than zero");
  }

  if (!Number.isFinite(stockQty) || stockQty < 0) {
    throw createError("Stock quantity cannot be negative");
  }

  const existingProduct = products.find(product => product.sku === data.sku);
  if (existingProduct) {
    throw createError("Product SKU already exists");
  }

  const nextId = Math.max(...products.map(product => product.id), 0) + 1;
  const product = {
    id: nextId,
    sku: data.sku,
    name: data.name,
    price,
    stockQty
  };

  products.push(product);
  return product;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct
};
