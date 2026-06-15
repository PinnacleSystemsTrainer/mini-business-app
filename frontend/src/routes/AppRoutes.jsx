import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';
import ProductsPage from '../pages/ProductsPage';
import ProductFormPage from '../pages/ProductFormPage';
import CustomersPage from '../pages/CustomersPage';
import CustomerFormPage from '../pages/CustomerFormPage';
import SalesOrdersPage from '../pages/SalesOrdersPage';
import SalesOrderCreatePage from '../pages/SalesOrderCreatePage';
import SalesOrderDetailPage from '../pages/SalesOrderDetailPage';
import LoginPage from '../pages/LoginPage';

function protectedPage(page, roles) {
  return <ProtectedRoute roles={roles}>{page}</ProtectedRoute>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={protectedPage(<DashboardPage />)} />

      <Route path="/products" element={protectedPage(<ProductsPage />)} />
      <Route
        path="/products/new"
        element={protectedPage(<ProductFormPage />, ['ADMIN'])}
      />
      <Route
        path="/products/:id/edit"
        element={protectedPage(<ProductFormPage />, ['ADMIN'])}
      />

      <Route path="/customers" element={protectedPage(<CustomersPage />)} />
      <Route
        path="/customers/new"
        element={protectedPage(<CustomerFormPage />, ['ADMIN'])}
      />
      <Route
        path="/customers/:id/edit"
        element={protectedPage(<CustomerFormPage />, ['ADMIN'])}
      />

      <Route path="/sales-orders" element={protectedPage(<SalesOrdersPage />)} />
      <Route
        path="/sales-orders/new"
        element={protectedPage(<SalesOrderCreatePage />)}
      />
      <Route
        path="/sales-orders/:id"
        element={protectedPage(<SalesOrderDetailPage />)}
      />
    </Routes>
  );
}

export default AppRoutes;
