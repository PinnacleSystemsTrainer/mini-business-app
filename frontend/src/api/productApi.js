import { API_BASE_URL, handleResponse } from './httpClient';

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  return handleResponse(response);
}

export async function getProductById(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  return handleResponse(response);
}

export async function createProduct(productData) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  return handleResponse(response);
}

export async function updateProduct(id, productData) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  return handleResponse(response);
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}
