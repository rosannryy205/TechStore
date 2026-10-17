import { API_BASE_URL } from "@/constants/api";

/**
 * Wrapper HTTP gọn gàng, tự động thêm credentials và parse json
 */
export async function httpRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
  const headers = { ...options.headers };
  // Only set application/json if body is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = payload?.message || `Lỗi HTTP: ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
