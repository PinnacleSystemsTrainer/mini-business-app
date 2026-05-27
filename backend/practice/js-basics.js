const products = [
  { id: 1, sku: "P001", name: "Notebook", price: 50, stockQty: 100 },
  { id: 2, sku: "P002", name: "Pen", price: 10, stockQty: 500 },
  { id: 3, sku: "P003", name: "Marker", price: 30, stockQty: 20 }
];

const orderItems = [
  { productId: 1, quantity: 2, rate: 50 },
  { productId: 2, quantity: 5, rate: 10 }
];

function findProductBySku(products, sku) {
  return products.find(product => product.sku === sku);
}

function calculateStockValue(products) {
  return products.reduce((sum, product) => {
    return sum + product.price * product.stockQty;
  }, 0);
}

function getLowStockProducts(products, threshold) {
  return products.filter(product => product.stockQty < threshold);
}

function validateProduct(product) {
  const errors = [];

  if (!product.sku) {
    errors.push("SKU is required");
  }

  if (!product.name) {
    errors.push("Name is required");
  }

  if (product.price <= 0) {
    errors.push("Price must be greater than zero");
  }

  if (product.stockQty < 0) {
    errors.push("Stock quantity cannot be negative");
  }

  return errors;
}

function calculateLineTotal(quantity, rate) {
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  if (rate <= 0) {
    throw new Error("Rate must be greater than zero");
  }

  return quantity * rate;
}

function calculateOrderTotal(items) {
  return items.reduce((sum, item) => {
    return sum + calculateLineTotal(item.quantity, item.rate);
  }, 0);
}

console.log("Find P002:", findProductBySku(products, "P002"));
console.log("Find P999:", findProductBySku(products, "P999") || "Product not found");
console.log("Total stock value:", calculateStockValue(products));
console.log("Low stock products:", getLowStockProducts(products, 50));
console.log(
  "Validate product:",
  validateProduct({ sku: "", name: "", price: 0, stockQty: -1 })
);
console.log("Line total:", calculateLineTotal(2, 50));
console.log("Order total:", calculateOrderTotal(orderItems));
