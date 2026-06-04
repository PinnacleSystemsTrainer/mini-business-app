const customerService = require("../services/customer.service");

function parseCustomerId(id) {
  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return null;
  }

  return customerId;
}

async function listCustomers(req, res, next) {
  try {
    const customers = await customerService.listCustomers();
    return res.json(customers);
  } catch (error) {
    return next(error);
  }
}

async function getCustomer(req, res, next) {
  try {
    const id = parseCustomerId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const customer = await customerService.getCustomerById(id);
    return res.json(customer);
  } catch (error) {
    return next(error);
  }
}

async function createCustomer(req, res, next) {
  try {
    const customer = await customerService.createCustomer(req.body);
    return res.status(201).json(customer);
  } catch (error) {
    return next(error);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const id = parseCustomerId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const customer = await customerService.updateCustomer(id, req.body);
    return res.json(customer);
  } catch (error) {
    return next(error);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const id = parseCustomerId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    await customerService.deleteCustomer(id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
