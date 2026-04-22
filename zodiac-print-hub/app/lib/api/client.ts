"use client";

type ApiOptions = RequestInit & {
  query?: Record<string, string | number | undefined>;
};

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

export const apiClient = async <T = any>(
  url: string,
  options: ApiOptions = {},
): Promise<T> => {
  const token = getClientStorage("token");

  /**
   * ORG CONTEXT:
   * Try to get the orgId from storage first.
   * Fallback to your seeded ID so development doesn't break.
   */
  const orgId = getClientStorage("orgId") || "cmo94sps10000dkdwpcls7psc";

  const queryString = buildQuery(options.query);

  const res = await fetch(`${url}${queryString}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      "x-org-id": orgId, // ✅ This satisfies your Backend's requirement
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({
      error: "Request failed",
    }));

    throw new Error(error?.error || "Request failed");
  }

  return res.json();
};

// "use client";

// type ApiOptions = RequestInit & {
//   query?: Record<string, string | number | undefined>;
// };

// const buildQuery = (query?: ApiOptions["query"]) => {
//   if (!query) return "";

//   const params = new URLSearchParams();

//   Object.entries(query).forEach(([key, value]) => {
//     if (value !== undefined && value !== null) {
//       params.append(key, String(value));
//     }
//   });

//   return `?${params.toString()}`;
// };

// const getClientStorage = (key: string) => {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem(key);
// };

// export const apiClient = async <T = any>(
//   url: string,
//   options: ApiOptions = {},
// ): Promise<T> => {
//   const token = getClientStorage("token");

//   const queryString = buildQuery(options.query);

//   const res = await fetch(`${url}${queryString}`, {
//     ...options,
//     headers: {
//       ...(options.headers || {}),
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     },
//   });

//   if (!res.ok) {
//     const error = await res.json().catch(() => ({
//       error: "Request failed",
//     }));

//     throw new Error(error?.error || "Request failed");
//   }

//   return res.json();
// };
