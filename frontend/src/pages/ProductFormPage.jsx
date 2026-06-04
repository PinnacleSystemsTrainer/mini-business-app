import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createProduct } from "../api/productApi";
import Card from "../components/ui/Card";

const initialForm = {
  sku: "",
  name: "",
  price: "",
  stockQty: "",
};

function validateProductForm(form) {
  const errors = {};

  if (!form.sku.trim()) {
    errors.sku = "SKU is required";
  }

  if (!form.name.trim()) {
    errors.name = "Name is required";
  }

  if (Number(form.price) <= 0) {
    errors.price = "Price must be greater than zero";
  }

  if (Number(form.stockQty) < 0) {
    errors.stockQty = "Opening stock cannot be negative";
  }

  return errors;
}

function ProductFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    const errors = validateProductForm(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      stockQty: Number(form.stockQty),
    };

    try {
      setSaving(true);
      await createProduct(payload);
      navigate("/products");
    } catch (error) {
      setSubmitError(error.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Add Product</h2>
          <p className="text-sm text-gray-500">
            Create a new product master record.
          </p>
        </div>

        <Link
          to="/products"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Back to Products
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none"
              placeholder="Example: P001"
            />
            {fieldErrors.sku ? (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.sku}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none"
              placeholder="Example: Notebook"
            />
            {fieldErrors.name ? (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none"
                placeholder="Example: 50"
              />
              {fieldErrors.price ? (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.price}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Opening Stock
              </label>
              <input
                name="stockQty"
                type="number"
                min="0"
                step="1"
                value={form.stockQty}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none"
                placeholder="Example: 100"
              />
              {fieldErrors.stockQty ? (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.stockQty}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Link
              to="/products"
              className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ProductFormPage;
