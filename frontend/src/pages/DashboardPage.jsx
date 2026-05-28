import Card from "../components/ui/Card";

const summary = [
  { label: "Products", value: 3 },
  { label: "Customers", value: 0 },
  { label: "Sales Orders", value: 0 },
];

function DashboardPage() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {item.value}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
