import { apiHandler } from "@lib/server/api/apiHandler";
import { NextResponse } from "next/server";
import { z } from "zod"; // <--- ADD THIS

const TestSchema = z.object({
  title: z.string().min(3),
});

// Keep your GET if you want to test both, or just the POST
export const POST = apiHandler(
  async (ctx) => {
    return { received: ctx.body };
  },
  {
    requireAuth: true,
    requireOrg: true, // Recommended since your client sends it
    schema: TestSchema,
  },
);
