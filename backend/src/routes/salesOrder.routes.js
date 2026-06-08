const express = require("express");
const salesOrderController = require("../controllers/salesOrder.controller");

const router = express.Router();

router.post("/", salesOrderController.createSalesOrder);
router.get("/", salesOrderController.listSalesOrders);
router.get("/:id", salesOrderController.getSalesOrder);

module.exports = router;
