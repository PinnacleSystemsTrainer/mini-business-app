import { API_BASE_URL, handleResponse } from './httpClient';

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

export async function confirmSalesOrder(id) {
  const response = await fetch(`${API_BASE_URL}/sales-orders/${id}/confirm`, {
    method: "POST",
  });
  return handleResponse(response);
}
