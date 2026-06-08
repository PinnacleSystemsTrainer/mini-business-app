const express = require("express");
const salesOrderController = require("../controllers/salesOrder.controller");

const router = express.Router();

router.get("/", salesOrderController.listSalesOrders);
router.get("/:id", salesOrderController.getSalesOrder);

module.exports = router;
