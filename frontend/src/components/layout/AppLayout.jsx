import { NavLink } from "react-router-dom";

function AppLayout({ children }) {
  const linkClass = ({ isActive }) =>
    [
      "rounded-md px-3 py-2 text-sm font-medium",
      isActive
        ? "bg-gray-900 text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    ].join(" ");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Mini Business Operations</h1>
            <p className="text-sm text-gray-500">
              Products, customers, sales orders, and stock
            </p>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink to="/" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/products" className={linkClass}>
              Products
            </NavLink>
            <NavLink to="/customers" className={linkClass}>
              Customers
            </NavLink>
            <NavLink to="/sales-orders" className={linkClass}>
              Sales Orders
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}

export default AppLayout;
