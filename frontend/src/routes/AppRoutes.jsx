import { Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import ProductsPage from "../pages/ProductsPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/products" element={<ProductsPage />} />
    </Routes>
  );
}

export default AppRoutes;
