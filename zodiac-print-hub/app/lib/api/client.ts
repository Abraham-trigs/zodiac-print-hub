"use client";

type ApiOptions = RequestInit & {
  query?: Record<string, string | number | undefined>;
};

// Your Seeded Data for Mocking
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

export const apiClient = async <T = any>(
  url: string,
  options: ApiOptions = {},
): Promise<T> => {
  // 1. Check local storage, but fallback to your Seeded UserId for development
  const token = getClientStorage("token") || MOCK_USER_ID;

  const queryString = buildQuery(options.query);

  const res = await fetch(`${url}${queryString}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // 2. Inject the mandatory Org ID header required by your server wrapper
      "x-org-id": MOCK_ORG_ID,
      // 3. Inject the Authorization token (acting as your UserId)
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
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
