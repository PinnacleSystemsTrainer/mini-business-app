import { API_BASE_URL, handleResponse } from './httpClient';

export async function getCustomers() {
  const response = await fetch(`${API_BASE_URL}/customers`);
  return handleResponse(response);
}

export async function getCustomerById(id) {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`);
  return handleResponse(response);
}

export async function createCustomer(customer) {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(customer)
  });

  return handleResponse(response);
}

export async function updateCustomer(id, customer) {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(customer)
  });

  return handleResponse(response);
}

export async function deleteCustomer(id) {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'DELETE'
  });

  return handleResponse(response);
}
