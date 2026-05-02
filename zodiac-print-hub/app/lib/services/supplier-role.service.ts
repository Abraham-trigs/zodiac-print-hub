import { prisma } from "@lib/prisma-client";
import { UnitOfWork } from "@/lib/db/unitOfWork";

export class SupplierRoleService {
  /**
   * ONBOARD SUPPLIER USER
   * Creates a system User with the 'SUPPLIER' role and links it to the Registry.
   */
  static async createSupplierAccount(params: {
    supplierId: string;
    orgId: string;
    email: string;
    name: string;
  }) {
    return await UnitOfWork.run(async (tx) => {
      // 1. Create the User in the Org with role 'SUPPLIER'
      const user = await tx.user.create({
        data: {
          email: params.email,
          name: params.name,
          role: "SUPPLIER", // Ensure this exists in your Role Enum
          orgId: params.orgId,
        },
      });

      // 2. Link the Registry Record to this new User
      return await tx.supplier.update({
        where: { id: params.supplierId },
        data: { linkedUserId: user.id },
      });
    });
  }
}
