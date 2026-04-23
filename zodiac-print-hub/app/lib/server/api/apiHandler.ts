import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

/* ---------------- types ---------------- */

type HandlerContext<TParams = unknown, TBody = any> = {
  req: NextRequest;
  orgId: string;
  user: any;
  params: TParams;
  query: Record<string, string>;
  body?: TBody;
  pagination: {
    page: number;
    limit: number;
    cursor?: string | null;
  };
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

/* ---------------- error ---------------- */

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/* ---------------- auth mock ---------------- */

const MOCK_USER = {
  id: "cmoa30is40001o0dwpfkom18r",
  orgId: "cmoa30ire0000o0dwz69fjgah",
  role: "admin",
};

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");

  if (token === MOCK_USER.id) return MOCK_USER;

  return null;
}

/* ---------------- helpers ---------------- */

function getQuery(req: NextRequest) {
  const url = new URL(req.url);
  const query: Record<string, string> = {};

  url.searchParams.forEach((v, k) => {
    query[k] = v;
  });

  return query;
}

function getPagination(query: Record<string, string>) {
  return {
    page: Number(query.page || 1),
    limit: Number(query.limit || 20),
    cursor: query.cursor || null,
  };
}

function checkRoles(user: any, roles?: string[]) {
  if (!roles?.length) return;

  if (!user || !roles.includes(user.role)) {
    throw new ApiError("Forbidden", 403);
  }
}

/* ---------------- main wrapper ---------------- */

export function apiHandler<TParams = unknown, TBody = any>(
  handler: ApiHandler<TParams, TBody>,
  options: Options<TBody> = {},
) {
  return async (req: NextRequest, context: { params?: TParams }) => {
    try {
      const query = getQuery(req);
      const pagination = getPagination(query);

      /* ---------------- AUTH FIRST ---------------- */
      const user = await getUser(req);

      if (options.requireAuth && !user) {
        throw new ApiError("Unauthorized", 401);
      }

      /* ---------------- ORG FROM SESSION ONLY ---------------- */
      const orgId = user?.orgId;

      if (options.requireOrg && !orgId) {
        throw new ApiError("Missing org context", 401);
      }

      /* ---------------- RBAC ---------------- */
      checkRoles(user, options.roles);

      /* ---------------- BODY ---------------- */
      let body: TBody | undefined;

      if (req.method !== "GET") {
        const raw = await req.text();

        if (raw) {
          const json = JSON.parse(raw);
          body = options.schema ? options.schema.parse(json) : json;
        }
      }

      /* ---------------- EXECUTE ---------------- */
      const data = await handler({
        req,
        orgId: orgId ?? "",
        user,
        params: (context?.params ?? {}) as TParams,
        query,
        body,
        pagination,
      });

      return NextResponse.json({ data });
    } catch (err: any) {
      const status = err instanceof ApiError ? err.status : 500;

      if (err instanceof ZodError) {
        return NextResponse.json(
          {
            error: err.errors.map((e) => e.message).join(", "),
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: err.message || "Internal error" },
        { status },
      );
    }
  };
}
