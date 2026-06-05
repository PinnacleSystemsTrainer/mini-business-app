import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { deleteProduct, getProducts } from '../api/productApi';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingMessage from '../components/ui/LoadingMessage';

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(price));
}

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  async function loadProducts() {
    try {
      setIsLoading(true);
      setLoadError('');
      const data = await getProducts();
      setProducts(data ?? []);
    } catch (err) {
      setLoadError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      'Deactivate this product? It will be hidden from active product lists.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionError('');
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setActionError(err.message || 'Failed to deactivate product');
    }
  }

  if (isLoading) {
    return <LoadingMessage message="Loading products..." />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">
            Product data loaded from the backend API.
          </p>
        </div>

        <Link
          to="/products/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700"
        >
          Add Product
        </Link>
      </div>

      {actionError ? <ErrorMessage message={actionError} /> : null}

      {products.length === 0 ? (
        <EmptyState
          title="No active products found"
          description="Create your first product to get started."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500">
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Stock</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{product.name}</td>
                    <td className="px-3 py-2 text-gray-700">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {product.stockQty}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Deactivate
                        </button>
                      </div>
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

export default ProductsPage;
