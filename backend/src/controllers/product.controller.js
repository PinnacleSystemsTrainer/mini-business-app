const productService = require("../services/product.service");

function parseProductId(id) {
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  return productId;
}

async function listProducts(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const id = parseProductId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const id = parseProductId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await productService.updateProduct(id, req.body);
    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const id = parseProductId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    await productService.deleteProduct(id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
