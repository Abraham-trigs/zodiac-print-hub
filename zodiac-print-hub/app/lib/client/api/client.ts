"use client";

type ApiOptions = RequestInit & {
  query?: Record<string, string | number | undefined>;
};

// --- PRODUCTION CONFIG ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * 🛰️ QUERY BUILDER
 * Fixed the ReferenceError by explicitly defining this helper.
 */
const buildQuery = (query?: ApiOptions["query"]) => {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

/**
 * PRODUCTION API CLIENT (V2)
 * The primary industrial handshake for the Zodiac Hub.
 */
export const apiClient = async <T = any>(
  url: string,
  options: ApiOptions = {},
): Promise<T> => {
  const isBrowser = typeof window !== "undefined";

  // 1. 🛡️ CONTEXT EXTRACTION
  const token = isBrowser ? localStorage.getItem("token") : null;
  const activeOrgId = isBrowser ? localStorage.getItem("active_org_id") : null;

  // 🚀 SLUG DISCOVERY: Attempts to find the /zodiac/[slug] context from the URL
  let activeOrgSlug = "";
  if (isBrowser) {
    const parts = window.location.pathname.split("/");
    // Usually /zodiac/accra-main/... so parts[2] is the slug
    activeOrgSlug = parts[2] || "";
  }

  const queryString = buildQuery(options.query);

  const body =
    options.body && typeof options.body === "object"
      ? JSON.stringify(options.body)
      : options.body;

  // 2. 📡 NETWORK EXECUTION
  const res = await fetch(`${API_BASE_URL}${url}${queryString}`, {
    ...options,
    body,
    headers: {
      "Content-Type": "application/json",
      "x-org-id": activeOrgId || "",
      "x-org-slug": activeOrgSlug, // 🚀 Multi-tenant fallback for the apiHandler
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });

  // 3. ⚠️ ERROR & SESSION HANDLING
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));

    // 🛡️ AUTO-LOGOUT: Snaps the session if the token is revoked
    if (res.status === 401 && isBrowser) {
      localStorage.removeItem("token");
      localStorage.removeItem("active_org_id");
      // Optional: window.location.href = "/auth/login";
    }

    throw new Error(
      errorBody?.error || errorBody?.message || `Network Error: ${res.status}`,
    );
  }

  return res.json();
};
