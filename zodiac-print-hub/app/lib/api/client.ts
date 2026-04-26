"use client";

type ApiOptions = RequestInit & {
  query?: Record<string, string | number | undefined>;
};

/**
 * DEVELOPMENT SEEDED DATA
 * Ensures the dev environment bypasses auth/org selection
 * by using the existing database IDs.
 */
const MOCK_ORG_ID = "cmoa30ire0000o0dwz69fjgah";
const MOCK_USER_ID = "cmoa30is40001o0dwpfkom18r";

const buildQuery = (query?: ApiOptions["query"]) => {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return `?${params.toString()}`;
};

const getClientStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

/**
 * GLOBAL API CLIENT
 * Handles automatic JSON stringification, Header Injection,
 * and Error Normalization.
 */
export const apiClient = async <T = any>(
  url: string,
  options: ApiOptions = {},
): Promise<T> => {
  // 1. Resolve Auth Token (Fall back to seeded User ID for dev)
  const token = getClientStorage("token") || MOCK_USER_ID;

  // 2. Resolve Query Strings
  const queryString = buildQuery(options.query);

  // 3. 🔥 FIX: Handle Body Stringification
  // Standard Fetch requires 'body' to be a string when using application/json.
  // This prevents the "[object Object] is not valid JSON" error on the server.
  const body =
    options.body && typeof options.body === "object"
      ? JSON.stringify(options.body)
      : options.body;

  const res = await fetch(`${url}${queryString}`, {
    ...options,
    body, // Use the stringified version
    headers: {
      "Content-Type": "application/json",
      // Mandatory Org Header for apiHandler verification
      "x-org-id": MOCK_ORG_ID,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });

  // 4. Centralized Error Handling
  if (!res.ok) {
    const error = await res.json().catch(() => ({
      error: "Request failed",
    }));

    throw new Error(error?.error || `Request failed with status ${res.status}`);
  }

  // 5. Response Parsing
  return res.json();
};
