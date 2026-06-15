const express = require("express");
const salesOrderController = require("../controllers/salesOrder.controller");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.post("/", auth, requireRole("ADMIN", "SALES_USER"), salesOrderController.createSalesOrder);
router.get("/", auth, requireRole("ADMIN", "SALES_USER"), salesOrderController.listSalesOrders);
router.post("/:id/confirm", auth, requireRole("ADMIN"), salesOrderController.confirmSalesOrder);
router.get("/:id", auth, requireRole("ADMIN", "SALES_USER"), salesOrderController.getSalesOrder);

module.exports = router;
