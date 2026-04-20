type JsonValue = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string | null;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  quantity: number;
  sku: string;
  categoryId: number;
  image_url?: string;
}

export interface Rating {
  id: number;
  userId: number;
  score: number;
  review?: string | null;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sku?: string;
  image_url?: string | null;
  category?: Category;
  ratings?: Rating[];
  is_active?: boolean;
}

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthSession {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}

export interface CartOrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  total_amount: number;
  status: string;
  payment_status?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:3000";
const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL ?? "http://localhost:3001";
const ORDERS_API_URL = import.meta.env.VITE_ORDERS_API_URL ?? "http://localhost:3002";

const AUTH_SESSION_KEY = "market-auth-session";

async function readResponse<T>(response: Response): Promise<T> {
  const rawBody = await response.text();
  const body = rawBody ? (JSON.parse(rawBody) as { message?: string; data?: T }) : null;

  if (!response.ok) {
    throw new Error(body?.message ?? response.statusText);
  }

  return (body?.data ?? (body as T)) as T;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  return readResponse<T>(response);
}

export function getStoredSession(): AuthSession | null {
  const rawSession = localStorage.getItem(AUTH_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("userEmail", session.user.email);
  window.dispatchEvent(new Event("market-auth-changed"));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userEmail");
  window.dispatchEvent(new Event("market-auth-changed"));
}

export function getSessionUser(): SessionUser | null {
  return getStoredSession()?.user ?? null;
}

export function isAuthenticated(): boolean {
  return getStoredSession() !== null;
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  const session = await request<AuthSession>(`${AUTH_API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveSession(session);
  return session;
}

export async function registerUser(payload: {
  email: string;
  password: string;
  name: string;
  phone: string;
  confirmPassword?: string;
}): Promise<AuthSession> {
  const registerPayload = {
    ...payload,
    confirmPassword: payload.confirmPassword ?? payload.password,
  };

  const session = await request<AuthSession>(`${AUTH_API_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify(registerPayload),
  });

  saveSession(session);
  return session;
}

export async function fetchProducts(params: {
  search?: string;
  categoryId?: number;
  limit?: number;
  offset?: number;
} = {}): Promise<Product[]> {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.categoryId !== undefined) {
    query.set("categoryId", String(params.categoryId));
  }

  query.set("limit", String(params.limit ?? 24));
  query.set("offset", String(params.offset ?? 0));

  const response = await request<{ data?: Product[] }>(
    `${CATALOG_API_URL}/catalog/search?${query.toString()}`,
  );

  return response.data ?? [];
}

export async function fetchProduct(productId: number): Promise<Product> {
  return request<Product>(`${CATALOG_API_URL}/catalog/products/${productId}`);
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await request<Category[] | { data?: Category[] }>(
    `${CATALOG_API_URL}/catalog/categories`,
  );

  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  return request<Product>(`${CATALOG_API_URL}/catalog/products`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(productId: number): Promise<void> {
  await request<void>(`${CATALOG_API_URL}/catalog/products/${productId}`, {
    method: "DELETE",
  });
}

export async function createCategory(payload: {
  name: string;
  description: string;
  image_url?: string;
}): Promise<Category> {
  return request<Category>(`${CATALOG_API_URL}/catalog/categories`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchOrders(userId: number): Promise<Order[]> {
  const response = await request<{ data?: Order[] }>(
    `${ORDERS_API_URL}/orders/user/${userId}`,
  );

  return response.data ?? [];
}

export async function createOrder(userId: number, items: CartOrderItem[]): Promise<Order> {
  return request<Order>(`${ORDERS_API_URL}/orders`, {
    method: "POST",
    body: JSON.stringify({
      userId,
      items,
    }),
  });
}
