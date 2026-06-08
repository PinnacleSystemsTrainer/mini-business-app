import { Routes, Route } from 'react-router-dom';

import DashboardPage from '../pages/DashboardPage';
import ProductsPage from '../pages/ProductsPage';
import ProductFormPage from '../pages/ProductFormPage';
import CustomersPage from '../pages/CustomersPage';
import CustomerFormPage from '../pages/CustomerFormPage';
import SalesOrdersPage from '../pages/SalesOrdersPage';
import SalesOrderCreatePage from '../pages/SalesOrderCreatePage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />

      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/new" element={<ProductFormPage />} />
      <Route path="/products/:id/edit" element={<ProductFormPage />} />

      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/customers/new" element={<CustomerFormPage />} />
      <Route path="/customers/:id/edit" element={<CustomerFormPage />} />

      <Route path="/sales-orders" element={<SalesOrdersPage />} />
      <Route path="/sales-orders/new" element={<SalesOrderCreatePage />} />
    </Routes>
  );
}

export default AppRoutes;
