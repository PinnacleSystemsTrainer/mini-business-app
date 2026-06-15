import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getStoredUser } from "../api/authApi";
import {
  confirmSalesOrder,
  getSalesOrderById,
} from "../api/salesOrderApi";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
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

function SalesOrderDetailPage() {
  const { id } = useParams();
  const user = getStoredUser();
  const isAdmin = user?.role === "ADMIN";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        setLoadError("");

        const data = await getSalesOrderById(id);
        setOrder(data);
      } catch (err) {
        setLoadError(err.message || "Failed to load sales order");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  async function handleConfirm() {
    try {
      setConfirming(true);
      setConfirmError("");
      setSuccessMessage("");

      const confirmedOrder = await confirmSalesOrder(id);
      setOrder(confirmedOrder);
      setSuccessMessage("Sales order confirmed successfully.");
    } catch (err) {
      setConfirmError(err.message || "Failed to confirm sales order");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return <LoadingMessage message="Loading sales order..." />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  if (!order) {
    return <ErrorMessage message="Sales order not found" />;
  }

  const canConfirm = isAdmin && order.status === "DRAFT";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to="/sales-orders"
            className="mb-2 inline-block text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Back to sales orders
          </Link>
          <h2 className="text-lg font-semibold text-gray-900">
            Sales Order {order.orderNo}
          </h2>
          <p className="text-sm text-gray-500">
            Review order details and confirm when stock is ready.
          </p>
        </div>

        {canConfirm ? (
          <Button onClick={handleConfirm} disabled={confirming}>
            {confirming ? "Confirming..." : "Confirm Order"}
          </Button>
        ) : null}
      </div>

      {successMessage ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {confirmError ? <ErrorMessage message={confirmError} /> : null}

      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Customer
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {order.customer?.name || "-"}
            </p>
            <p className="text-xs text-gray-500">
              {order.customer?.code || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Status
            </p>
            <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
              {order.status}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Created
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Total
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-500">
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium text-right">Qty</th>
                <th className="px-3 py-2 font-medium text-right">Rate</th>
                <th className="px-3 py-2 font-medium text-right">
                  Line Total
                </th>
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {item.product?.name || "-"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {item.product?.sku || "-"}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-gray-50">
                <td
                  colSpan={4}
                  className="px-3 py-2 text-right text-sm font-medium text-gray-700"
                >
                  Order Total
                </td>
                <td className="px-3 py-2 text-right text-sm font-semibold text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default SalesOrderDetailPage;
