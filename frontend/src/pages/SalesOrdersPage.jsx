import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getSalesOrders } from "../api/salesOrderApi";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import ErrorMessage from "../components/ui/ErrorMessage";
import LoadingMessage from "../components/ui/LoadingMessage";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
}

function SalesOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function loadSalesOrders() {
    try {
      setLoading(true);
      setLoadError("");

      const data = await getSalesOrders();
      setOrders(data ?? []);
    } catch (err) {
      setLoadError(err.message || "Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSalesOrders();
  }, []);

  if (loading) {
    return <LoadingMessage message="Loading sales orders..." />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Sales Orders
          </h2>
          <p className="text-sm text-gray-500">
            View customer orders and track their status.
          </p>
        </div>

        <Link to="/sales-orders/new">
          <Button>New Sales Order</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No sales orders yet"
          description="Create a new sales order using the button above."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500">
                  <th className="px-3 py-2 font-medium">Order No</th>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Items</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Created</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {order.orderNo}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {order.customer?.name || "-"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {order.itemCount}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        to={`/sales-orders/${order.id}`}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default SalesOrdersPage;
