import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

type HandlerContext<TParams = unknown, TBody = any> = {
  req: NextRequest;
  orgId: string;
  user?: any;
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

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/* ---------------- helpers ---------------- */

function getOrgId(req: NextRequest, requireOrg = true) {
  const orgId = req.headers.get("x-org-id");

  if (!orgId && requireOrg) {
    throw new ApiError("Missing org context", 401);
  }

  return orgId || "";
}

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

/* ---------------- updated auth stub ---------------- */

// Mocked seeded data based on your IDs
const MOCK_USER = {
  id: "cmoa30is40001o0dwpfkom18r",
  orgId: "cmoa30ire0000o0dwz69fjgah",
  role: "admin",
};

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");

  // If the token matches our seeded UserId, return the full user object
  if (token === MOCK_USER.id) {
    return MOCK_USER;
  }

  return null;
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
      const orgId = getOrgId(req, options.requireOrg);
      const query = getQuery(req);
      const pagination = getPagination(query);

      const user = options.requireAuth ? await getUser(req) : null;

      if (options.requireAuth && !user) {
        throw new ApiError("Unauthorized", 401);
      }

      // Security check: ensure the user belongs to the org they are requesting
      if (user && options.requireOrg && user.orgId !== orgId) {
        throw new ApiError("User does not belong to this organization", 403);
      }

      checkRoles(user, options.roles);

      let body: TBody | undefined;

      if (req.method !== "GET") {
        const raw = await req.text();

        if (raw) {
          const json = JSON.parse(raw);
          body = options.schema ? options.schema.parse(json) : json;
        }
      }

      const data = await handler({
        req,
        orgId,
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

// import { NextRequest, NextResponse } from "next/server";
// import { z, ZodError } from "zod";

// type HandlerContext<TParams = unknown, TBody = any> = {
//   req: NextRequest;
//   orgId: string;
//   user?: any;
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

// export class ApiError extends Error {
//   constructor(
//     message: string,
//     public status = 400,
//   ) {
//     super(message);
//   }
// }

// /* ---------------- helpers ---------------- */

// function getOrgId(req: NextRequest, requireOrg = true) {
//   const orgId = req.headers.get("x-org-id");

//   if (!orgId && requireOrg) {
//     throw new ApiError("Missing org context", 401);
//   }

//   return orgId || "";
// }

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

// /* ---------------- auth stub ---------------- */

// async function getUser(req: NextRequest) {
//   return null;
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
//       const orgId = getOrgId(req, options.requireOrg);
//       const query = getQuery(req);
//       const pagination = getPagination(query);

//       const user = options.requireAuth ? await getUser(req) : null;

//       if (options.requireAuth && !user) {
//         throw new ApiError("Unauthorized", 401);
//       }

//       checkRoles(user, options.roles);

//       let body: TBody | undefined;

//       if (req.method !== "GET") {
//         const raw = await req.text();

//         if (raw) {
//           const json = JSON.parse(raw);
//           body = options.schema ? options.schema.parse(json) : json;
//         }
//       }

//       const data = await handler({
//         req,
//         orgId,
//         user,
//         params: (context?.params ?? {}) as TParams,
//         query,
//         body,
//         pagination,
//       });

//       return NextResponse.json({ data });
//     } catch (err: any) {
//       const status = err instanceof ApiError ? err.status : 500;

//       if (err instanceof ZodError) {
//         return NextResponse.json(
//           {
//             error: err.errors.map((e) => e.message).join(", "),
//           },
//           { status: 400 },
//         );
//       }

//       return NextResponse.json(
//         { error: err.message || "Internal error" },
//         { status },
//       );
//     }
//   };
// }
