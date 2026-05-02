import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { Outbox } from "@/lib/db/outbox";
import { POStatus } from "@prisma/client";

export const POST = apiHandler<{ id: string }>(
  async ({ params, orgId, user }) => {
    const { id } = await params;

    // 1. Resolve the Supplier Record linked to this User
    const supplierRecord = await prisma.supplier.findUnique({
      where: { linkedUserId: user.id },
    });

    if (user.role === "SUPPLIER" && !supplierRecord) {
      throw new ApiError("Unauthorized: No linked supplier identity.", 403);
    }

    // 2. Update PO Status
    const updatedOrder = await prisma.stockPurchaseOrder.update({
      where: {
        id,
        orgId,
        // Security: Suppliers can only ship their own orders
        ...(user.role === "SUPPLIER" && { supplierId: supplierRecord?.id }),
      },
      data: {
        status: POStatus.ORDERED,
        // Optional: Set estimated arrival based on material lead times
      },
      include: { supplier: true },
    });

    // 3. 🚀 BROADCAST: Notify the Shop Manager
    await Outbox.add(prisma, {
      type: "procurement.order_shipped",
      orgId,
      payload: {
        orderId: updatedOrder.id,
        supplierName: updatedOrder.supplier.name,
        message: `Supplier ${updatedOrder.supplier.name} has shipped Order #${updatedOrder.id.slice(-6).toUpperCase()}.`,
      },
    });

    return updatedOrder;
  },
  { requireAuth: true, requireOrg: true },
);
