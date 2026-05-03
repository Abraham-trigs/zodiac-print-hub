// src/lib/apiHandler.ts
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { verifyToken } from "@/lib/auth"; // You'll create this for JWT

type HandlerContext<TParams = unknown, TBody = any> = {
  req: NextRequest;
  orgId: string;
  user: any;
  params: TParams;
  query: Record<string, string>;
  body?: TBody;
  pagination: { page: number; limit: number };
};

type ApiHandler<TParams = unknown, TBody = any> = (
  ctx: HandlerContext<TParams, TBody>,
) => Promise<any>;

type Options<TBody = any> = {
  requireOrg?: boolean;
  requireAuth?: boolean;
  roles?: string[];
  schema?: z.ZodSchema<TBody>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function apiHandler<TParams = unknown, TBody = any>(
  handler: ApiHandler<TParams, TBody>,
  options: Options<TBody> = {},
) {
  return async (req: NextRequest, context: { params?: TParams }) => {
    try {
      const url = new URL(req.url);
      const query = Object.fromEntries(url.searchParams);

      /* ---------------- 1. AUTHENTICATION ---------------- */
      const authHeader = req.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "");

      // In production, verify JWT. For now, we'll allow your mock token too.
      const user = token ? await verifyToken(token) : null;

      if (options.requireAuth && !user) {
        throw new ApiError("Unauthorized", 401);
      }

      /* ---------------- 2. MULTI-TENANCY (X-ORG-ID) ---------------- */
      // We take the Org ID from the header (sent by your apiClient)
      const headerOrgId = req.headers.get("x-org-id");

      // Security Check: Ensure the user actually belongs to this Org
      // (Unless they are a super-admin)
      if (options.requireOrg) {
        if (!headerOrgId)
          throw new ApiError("Missing organization header", 400);
        if (user && user.orgId !== headerOrgId && user.role !== "SUPER_ADMIN") {
          throw new ApiError("Access denied to this organization", 403);
        }
      }

      const orgId = headerOrgId ?? user?.orgId ?? "";

      /* ---------------- 3. RBAC ---------------- */
      if (
        options.roles?.length &&
        (!user || !options.roles.includes(user.role))
      ) {
        throw new ApiError("Forbidden: Insufficient permissions", 403);
      }

      /* ---------------- 4. BODY & VALIDATION ---------------- */
      let body: TBody | undefined;
      if (req.method !== "GET" && req.method !== "DELETE") {
        const json = await req.json().catch(() => ({}));
        body = options.schema ? options.schema.parse(json) : json;
      }

      /* ---------------- 5. EXECUTE ---------------- */
      const data = await handler({
        req,
        orgId,
        user,
        params: (context?.params ?? {}) as TParams,
        query,
        body,
        pagination: {
          page: Number(query.page || 1),
          limit: Number(query.limit || 20),
        },
      });

      return NextResponse.json({ data });
    } catch (err: any) {
      console.error(`[API ERROR] ${req.method} ${req.url}:`, err);

      if (err instanceof ZodError) {
        const message = err.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        return NextResponse.json({ error: message }, { status: 400 });
      }

      if (err instanceof ApiError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status },
        );
      }

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}

// import { NextRequest, NextResponse } from "next/server";
// import { z, ZodError } from "zod";

// /* ---------------- types ---------------- */

// type HandlerContext<TParams = unknown, TBody = any> = {
//   req: NextRequest;
//   orgId: string;
//   user: any;
//   params: TParams;
//   query: Record<string, string>;
//   body?: TBody;
//   pagination: {
//     page: number;
//     limit: number;
//     cursor?: string | null;
//   };
// };

// type ApiHandler<TParams = unknown, TBody = any> = (
//   ctx: HandlerContext<TParams, TBody>,
// ) => Promise<any>;

// type Options<TBody = any> = {
//   requireOrg?: boolean;
//   requireAuth?: boolean;
//   roles?: string[];
//   schema?: z.ZodSchema<TBody>;
// };

// /* ---------------- error ---------------- */

// export class ApiError extends Error {
//   constructor(
//     message: string,
//     public status = 400,
//   ) {
//     super(message);
//   }
// }

// /* ---------------- auth mock ---------------- */

// const MOCK_USER = {
//   id: "cmoa30is40001o0dwpfkom18r",
//   orgId: "cmoa30ire0000o0dwz69fjgah",
//   role: "admin",
// };

// async function getUser(req: NextRequest) {
//   const authHeader = req.headers.get("authorization");
//   if (!authHeader) return null;

//   const token = authHeader.replace("Bearer ", "");

//   if (token === MOCK_USER.id) return MOCK_USER;

//   return null;
// }

// /* ---------------- helpers ---------------- */

// function getQuery(req: NextRequest) {
//   const url = new URL(req.url);
//   const query: Record<string, string> = {};

//   url.searchParams.forEach((v, k) => {
//     query[k] = v;
//   });

//   return query;
// }

// function getPagination(query: Record<string, string>) {
//   return {
//     page: Number(query.page || 1),
//     limit: Number(query.limit || 20),
//     cursor: query.cursor || null,
//   };
// }

// function checkRoles(user: any, roles?: string[]) {
//   if (!roles?.length) return;

//   if (!user || !roles.includes(user.role)) {
//     throw new ApiError("Forbidden", 403);
//   }
// }

// /* ---------------- main wrapper ---------------- */

// export function apiHandler<TParams = unknown, TBody = any>(
//   handler: ApiHandler<TParams, TBody>,
//   options: Options<TBody> = {},
// ) {
//   return async (req: NextRequest, context: { params?: TParams }) => {
//     try {
//       const query = getQuery(req);
//       const pagination = getPagination(query);

//       /* ---------------- AUTH FIRST ---------------- */
//       const user = await getUser(req);

//       if (options.requireAuth && !user) {
//         throw new ApiError("Unauthorized", 401);
//       }

//       /* ---------------- ORG FROM SESSION ONLY ---------------- */
//       const orgId = user?.orgId;

//       if (options.requireOrg && !orgId) {
//         throw new ApiError("Missing org context", 401);
//       }

//       /* ---------------- RBAC ---------------- */
//       checkRoles(user, options.roles);

//       /* ---------------- BODY ---------------- */
//       let body: TBody | undefined;

//       if (req.method !== "GET") {
//         const raw = await req.text();

//         if (raw) {
//           try {
//             const json = JSON.parse(raw);
//             // Validation happens here. If it fails, ZodError is thrown.
//             body = options.schema ? options.schema.parse(json) : json;
//           } catch (jsonErr) {
//             if (jsonErr instanceof ZodError) throw jsonErr;
//             throw new ApiError("Invalid JSON body", 400);
//           }
//         }
//       }

//       /* ---------------- EXECUTE ---------------- */
//       const data = await handler({
//         req,
//         orgId: orgId ?? "",
//         user,
//         params: (context?.params ?? {}) as TParams,
//         query,
//         body,
//         pagination,
//       });

//       return NextResponse.json({ data });
//     } catch (err: any) {
//       // Log the actual error for the developer to see in the console
//       console.error(`[apiHandler] Error:`, err);

//       /* ---------------- ZOD VALIDATION ERRORS ---------------- */
//       if (err instanceof ZodError) {
//         // 🔥 SAFE: Ensure we don't crash when mapping errors
//         const messages = err.errors
//           ?.map((e) => `${e.path.join(".")}: ${e.message}`)
//           .join(", ");
//         return NextResponse.json(
//           {
//             error: messages || "Validation failed",
//           },
//           { status: 400 },
//         );
//       }

//       /* ---------------- KNOWN API ERRORS ---------------- */
//       if (err instanceof ApiError) {
//         return NextResponse.json(
//           { error: err.message },
//           { status: err.status },
//         );
//       }

//       /* ---------------- UNKNOWN INTERNAL ERRORS ---------------- */
//       return NextResponse.json(
//         { error: err.message || "Internal server error" },
//         { status: 500 },
//       );
//     }
//   };
// }
