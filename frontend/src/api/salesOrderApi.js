const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export async function getSalesOrders() {
  const response = await fetch(`${API_BASE_URL}/sales-orders`);
  return handleResponse(response);
}

export async function getSalesOrderById(id) {
  const response = await fetch(`${API_BASE_URL}/sales-orders/${id}`);
  return handleResponse(response);
}

export async function createSalesOrder(data) {
  const response = await fetch(`${API_BASE_URL}/sales-orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}
