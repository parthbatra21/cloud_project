// Microservices API Base URLs
// Can be overridden via Vite env vars (VITE_RESTAURANT_API_URL, etc.)
const RESTAURANT_URL = import.meta.env.VITE_RESTAURANT_API_URL || "http://localhost:5001";
const ORDER_URL = import.meta.env.VITE_ORDER_API_URL || "http://localhost:5002";
const DELIVERY_URL = import.meta.env.VITE_DELIVERY_API_URL || "http://localhost:5003";

/**
 * 1. RESTAURANT SERVICE APIS
 */
export async function fetchRestaurants() {
  const res = await fetch(`${RESTAURANT_URL}/restaurants`);
  if (!res.ok) throw new Error(`Failed to load restaurants: HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchRestaurantById(id) {
  const res = await fetch(`${RESTAURANT_URL}/restaurants/${id}`);
  if (!res.ok) throw new Error(`Restaurant not found: HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function fetchRestaurantMenu(restaurantId) {
  const res = await fetch(`${RESTAURANT_URL}/restaurants/${restaurantId}/menu`);
  if (!res.ok) throw new Error(`Failed to load menu: HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

/**
 * 2. ORDER SERVICE APIS
 */
export async function createOrder(orderPayload) {
  const res = await fetch(`${ORDER_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload)
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to place order.");
  }
  return json.data;
}

export async function fetchOrders() {
  const res = await fetch(`${ORDER_URL}/orders`);
  if (!res.ok) throw new Error(`Failed to load orders: HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchOrderById(id) {
  const res = await fetch(`${ORDER_URL}/orders/${id}`);
  if (!res.ok) throw new Error(`Order ${id} not found.`);
  const json = await res.json();
  return json.data;
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${ORDER_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update order status.");
  return json.data;
}

/**
 * 3. DELIVERY SERVICE APIS
 */
export async function fetchDeliveryStatus(orderId) {
  const res = await fetch(`${DELIVERY_URL}/deliveries/${orderId}`);
  if (!res.ok) return null; // May not exist yet
  const json = await res.json();
  return json.data;
}

export async function updateDeliveryStatus(orderId, status) {
  const res = await fetch(`${DELIVERY_URL}/deliveries/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update delivery status.");
  return json.data;
}

export const API_ENDPOINTS = {
  restaurant: RESTAURANT_URL,
  order: ORDER_URL,
  delivery: DELIVERY_URL
};
