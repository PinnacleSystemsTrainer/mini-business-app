const productService = require("../services/product.service");

function listProducts(req, res) {
  const products = productService.getAllProducts();
  res.json(products);
}

function getProduct(req, res) {
  const id = Number(req.params.id);
  const product = productService.getProductById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
}

function createProduct(req, res, next) {
  try {
    const product = productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct
};
