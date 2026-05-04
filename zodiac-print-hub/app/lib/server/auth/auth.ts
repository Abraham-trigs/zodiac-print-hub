import { SignJWT, jwtVerify } from "jose";
import { ApiError } from "@server/api/apiHandler"; // 🚀 Fixed Alias

// 🚀 SECURITY HANDSHAKE: Ensure the secret exists
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("CRITICAL: JWT_SECRET missing in .env");
}
const KEY = new TextEncoder().encode(secret);

interface TokenPayload {
  userId: string;
  orgId: string;
  role:
    | "ADMIN"
    | "STAFF"
    | "CUSTOMER"
    | "SUPPLIER"
    | "GUEST"
    | "GRAPHIC_DESIGNER"; // Added SUPPLIER to match your recent work
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(KEY);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, KEY);
    return payload as unknown as TokenPayload;
  } catch (error) {
    // Suppress console logs in production to prevent log flooding
    if (process.env.NODE_ENV === "development") {
      console.error("[AUTH] Token verification failed:", error);
    }
    return null;
  }
}

export async function getAuthContext(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new ApiError("No authorization header", 401);

  const token = authHeader.replace("Bearer ", "");
  const user = await verifyToken(token);

  if (!user) throw new ApiError("Invalid session", 401);
  return user;
}
