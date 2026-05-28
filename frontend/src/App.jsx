import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";

function App() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardPage />
        <ProductsPage />
      </div>
    </AppLayout>
  );
}

export default App;
