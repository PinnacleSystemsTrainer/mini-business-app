import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const products = [
  { id: 1, sku: "P001", name: "Notebook", price: 50, stockQty: 100 },
  { id: 2, sku: "P002", name: "Pen", price: 10, stockQty: 500 },
  { id: 3, sku: "P003", name: "Marker", price: 25, stockQty: 40 },
];

function ProductsPage() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">
            Mock product list. This will later come from the backend API.
          </p>
        </div>

        <Button>Add Product</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-500">
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Stock</th>
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
                    Rs. {product.price}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {product.stockQty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default ProductsPage;
