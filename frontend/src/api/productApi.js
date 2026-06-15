import {
  API_BASE_URL,
  getAuthHeaders,
  getJsonHeaders,
  handleResponse,
} from './httpClient';

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getProductById(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function createProduct(productData) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: getJsonHeaders(),
    body: JSON.stringify(productData),
  });

  return handleResponse(response);
}

export async function updateProduct(id, productData) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PATCH",
    headers: getJsonHeaders(),
    body: JSON.stringify(productData),
  });

  return handleResponse(response);
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}
