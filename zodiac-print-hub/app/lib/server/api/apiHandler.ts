import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { verifyToken } from "@lib/server/auth/auth"; // 🚀 FIX: Import from the utility, not the route

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
  roles?: ("ADMIN" | "STAFF" | "CUSTOMER")[]; // 🚀 SYNCED: Uses your UserRole enum values
  schema?: z.ZodSchema<TBody>;
};

export class ApiError extends Error {
  constructor(
    public message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function apiHandler<TParams = unknown, TBody = any>(
  handler: ApiHandler<TParams, TBody>,
  options: Options<TBody> = {},
) {
  return async (req: NextRequest, context: { params?: any }) => {
    try {
      const url = new URL(req.url);
      const query = Object.fromEntries(url.searchParams);

      /* ---------------- 1. AUTHENTICATION ---------------- */
      const authHeader = req.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "");

      // 🚀 JWT Verification Handshake
      const user = token ? await verifyToken(token) : null;

      if (options.requireAuth && !user) {
        throw new ApiError("Unauthorized", 401);
      }

      /* ---------------- 2. MULTI-TENANCY (X-ORG-ID) ---------------- */
      const headerOrgId = req.headers.get("x-org-id");

      if (options.requireOrg) {
        if (!headerOrgId)
          throw new ApiError("Missing organization header", 400);

        // Security: Ensure user isn't trying to access a different org
        if (user && user.orgId !== headerOrgId) {
          throw new ApiError("Access denied to this organization", 403);
        }
      }

      const orgId = headerOrgId ?? user?.orgId ?? "";

      /* ---------------- 3. RBAC (Roles) ---------------- */
      if (options.roles?.length) {
        if (!user || !options.roles.includes(user.role)) {
          throw new ApiError("Forbidden: Insufficient permissions", 403);
        }
      }

      /* ---------------- 4. BODY & VALIDATION ---------------- */
      let body: TBody | undefined;
      if (
        req.method !== "GET" &&
        req.method !== "DELETE" &&
        req.method !== "HEAD"
      ) {
        const json = await req.json().catch(() => ({}));
        body = options.schema ? options.schema.parse(json) : json;
      }

      /* ---------------- 5. EXECUTE ---------------- */
      const data = await handler({
        req,
        orgId,
        user,
        // Next.js 15+ Params Handshake (ensures params are awaited if dynamic)
        params: (await context?.params) as TParams,
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
