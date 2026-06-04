const express = require("express");
const customerController = require("../controllers/customer.controller");

const router = express.Router();

router.get("/", customerController.listCustomers);
router.get("/:id", customerController.getCustomer);
router.post("/", customerController.createCustomer);
router.patch("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
