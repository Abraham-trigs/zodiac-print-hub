// lib/server/auth/getCurrentUser.ts
import { prisma } from "@lib/prisma-client";
import { NextRequest } from "next/server";

export async function getCurrentUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  return prisma.user.findUnique({
    where: { id: token },
    include: {
      org: true, // important for SaaS context
    },
  });
}
