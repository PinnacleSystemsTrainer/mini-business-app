const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let products = [
  { id: 1, sku: "P001", name: "Notebook", price: 50, stockQty: 100 },
  { id: 2, sku: "P002", name: "Pen", price: 10, stockQty: 500 }
];

function findProductById(id) {
  return products.find(product => product.id === id);
}

function validateProductInput(product) {
  const { sku, name, price, stockQty } = product;
  const numericPrice = Number(price);
  const numericStockQty = Number(stockQty);

  if (!sku || !name || price === undefined || stockQty === undefined) {
    return "sku, name, price, and stockQty are required";
  }

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Price must be greater than zero";
  }

  if (!Number.isFinite(numericStockQty) || numericStockQty < 0) {
    return "Stock quantity cannot be negative";
  }

  return null;
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = findProductById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
});

app.post("/api/products", (req, res) => {
  const validationMessage = validateProductInput(req.body);

  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  const { sku, name, price, stockQty } = req.body;
  const existingProduct = products.find(product => product.sku === sku);

  if (existingProduct) {
    return res.status(400).json({ message: "Product SKU already exists" });
  }

  const nextId = Math.max(...products.map(product => product.id), 0) + 1;
  const product = {
    id: nextId,
    sku,
    name,
    price: Number(price),
    stockQty: Number(stockQty)
  };

  products.push(product);

  return res.status(201).json(product);
});

module.exports = app;
