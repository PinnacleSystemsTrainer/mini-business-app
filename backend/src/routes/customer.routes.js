const express = require("express");
const customerController = require("../controllers/customer.controller");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get("/", auth, requireRole("ADMIN", "SALES_USER"), customerController.listCustomers);
router.get("/:id", auth, requireRole("ADMIN", "SALES_USER"), customerController.getCustomer);
router.post("/", auth, requireRole("ADMIN"), customerController.createCustomer);
router.patch("/:id", auth, requireRole("ADMIN"), customerController.updateCustomer);
router.delete("/:id", auth, requireRole("ADMIN"), customerController.deleteCustomer);

module.exports = router;
