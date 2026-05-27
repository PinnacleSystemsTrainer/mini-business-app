const products = [
  { id: 1, sku: "P001", name: "Notebook", price: 50, stockQty: 100 },
  { id: 2, sku: "P002", name: "Pen", price: 10, stockQty: 500 },
  { id: 3, sku: "P003", name: "Marker", price: 30, stockQty: 20 }
];

function formatProductLabel(product) {
  const { sku, name } = product;

  return `${sku} - ${name}`;
}

function prepareProductTableRows(products) {
  return products.map(product => {
    const { id, price, stockQty } = product;

    return {
      id,
      label: formatProductLabel(product),
      priceText: `₹${price}`,
      stockText: `${stockQty} units`,
      stockStatus: stockQty < 50 ? "Low Stock" : "Available"
    };
  });
}

console.log("Product label:", formatProductLabel(products[0]));
console.log("Product table rows:", prepareProductTableRows(products));
