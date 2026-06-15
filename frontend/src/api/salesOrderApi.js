import {
  API_BASE_URL,
  getAuthHeaders,
  getJsonHeaders,
  handleResponse,
} from './httpClient';

export async function getSalesOrders() {
  const response = await fetch(`${API_BASE_URL}/sales-orders`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getSalesOrderById(id) {
  const response = await fetch(`${API_BASE_URL}/sales-orders/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function createSalesOrder(data) {
  const response = await fetch(`${API_BASE_URL}/sales-orders`, {
    method: "POST",
    headers: getJsonHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function confirmSalesOrder(id) {
  const response = await fetch(`${API_BASE_URL}/sales-orders/${id}/confirm`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}
