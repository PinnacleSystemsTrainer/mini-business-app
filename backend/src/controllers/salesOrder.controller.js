const salesOrderService = require("../services/salesOrder.service");

function parseSalesOrderId(id) {
  const salesOrderId = Number(id);

  if (!Number.isInteger(salesOrderId) || salesOrderId <= 0) {
    return null;
  }

  return salesOrderId;
}

async function listSalesOrders(req, res, next) {
  try {
    const orders = await salesOrderService.getSalesOrders();

    const response = orders.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      customer: order.customer,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      itemCount: order.items.length,
    }));

    return res.json(response);
  } catch (error) {
    return next(error);
  }
}

async function getSalesOrder(req, res, next) {
  try {
    const id = parseSalesOrderId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid sales order id" });
    }

    const order = await salesOrderService.getSalesOrderById(id);

    if (!order) {
      return res.status(404).json({ message: "Sales order not found" });
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listSalesOrders,
  getSalesOrder,
};
