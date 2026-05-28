function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-xl font-semibold">Mini Business Operations</h1>
          <p className="text-sm text-gray-500">
            Products, customers, sales orders, and stock
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}

export default AppLayout;
