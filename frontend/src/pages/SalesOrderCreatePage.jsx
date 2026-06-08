import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCustomers } from "../api/customerApi";
import { getProducts } from "../api/productApi";
import { createSalesOrder } from "../api/salesOrderApi";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorMessage from "../components/ui/ErrorMessage";
import LoadingMessage from "../components/ui/LoadingMessage";

function calculateLineTotal(item) {
  const quantity = Number(item.quantity || 0);
  const rate = Number(item.rate || 0);
  return quantity * rate;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function SalesOrderCreatePage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1, rate: "" }]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [customerData, productData] = await Promise.all([
          getCustomers(),
          getProducts(),
        ]);
        setCustomers(customerData ?? []);
        setProducts(productData ?? []);
      } catch (err) {
        setLoadError(err.message || "Failed to load form data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function addItemRow() {
    setItems((prev) => [...prev, { productId: "", quantity: 1, rate: "" }]);
  }

  function removeItemRow(indexToRemove) {
    setItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  function updateItem(indexToUpdate, field, value) {
    setItems((prev) =>
      prev.map((item, index) => {
        if (index !== indexToUpdate) return item;
        return { ...item, [field]: value };
      })
    );
  }

  const orderTotal = items.reduce(
    (sum, item) => sum + calculateLineTotal(item),
    0
  );

  async function handleSubmit(event) {
    event.preventDefault();

    if (!customerId) {
      setError("Please select a customer");
      return;
    }

    const hasEmptyProduct = items.some((item) => !item.productId);
    if (hasEmptyProduct) {
      setError("Please select a product for each line item");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const order = await createSalesOrder({
        customerId: Number(customerId),
        items: items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
      });

      navigate(`/sales-orders/${order.id}`);
    } catch (err) {
      setError(err.message || "Failed to create sales order");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingMessage message="Loading form data..." />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">New Sales Order</h2>
        <p className="text-sm text-gray-500">
          Select a customer and add line items to create a draft order.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <ErrorMessage message={error} /> : null}

        <Card>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Order Header
            </h3>

            <div>
              <label
                htmlFor="customerId"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Customer
              </label>
              <select
                id="customerId"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                Line Items
              </h3>
              <button
                type="button"
                onClick={addItemRow}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                + Add Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-500">
                    <th className="px-3 py-2 font-medium">Product</th>
                    <th className="px-3 py-2 font-medium">Qty</th>
                    <th className="px-3 py-2 font-medium">Rate</th>
                    <th className="px-3 py-2 font-medium text-right">
                      Line Total
                    </th>
                    <th className="px-3 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            updateItem(index, "productId", e.target.value)
                          }
                          className="w-full rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        >
                          <option value="">Select product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                          className="w-20 rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(index, "rate", e.target.value)
                          }
                          placeholder="0.00"
                          className="w-28 rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-gray-700">
                        {formatCurrency(calculateLineTotal(item))}
                      </td>
                      <td className="px-3 py-2">
                        {items.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-gray-50">
                    <td
                      colSpan={3}
                      className="px-3 py-2 text-right text-sm font-medium text-gray-700"
                    >
                      Order Total
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(orderTotal)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="text-xs text-gray-400">
              Totals shown are approximate. The backend calculates the final
              amounts.
            </p>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Order"}
          </Button>

          <button
            type="button"
            onClick={() => navigate("/sales-orders")}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default SalesOrderCreatePage;
