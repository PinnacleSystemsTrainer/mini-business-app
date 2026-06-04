import { Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import ProductFormPage from "../pages/ProductFormPage";
import ProductsPage from "../pages/ProductsPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/new" element={<ProductFormPage />} />
    </Routes>
  );
}

export default AppRoutes;
