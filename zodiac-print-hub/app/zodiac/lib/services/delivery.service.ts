import { DeliveryRepository } from "@/lib/repositories/delivery.repository";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { Outbox } from "@/lib/db/outbox";
import type { DeliveryType, DeliveryStatus } from "@/types/zodiac.types";

export class DeliveryService {
  static async create(params: {
    orgId: string;
    jobId: string;
    clientId: string;
    type: DeliveryType;
    address?: string;
  }) {
    return UnitOfWork.run(async (tx) => {
      const delivery = await DeliveryRepository.create(params, tx);

      await Outbox.add(tx, {
        type: "delivery.created",
        orgId: params.orgId,
        entityId: delivery.id,
        payload: delivery,
      });

      return delivery;
    });
  }

  static async list(orgId: string) {
    return DeliveryRepository.list(orgId);
  }

  static async updateStatus(id: string, status: DeliveryStatus) {
    return UnitOfWork.run(async (tx) => {
      const delivery = await DeliveryRepository.updateStatus(id, status, tx);

      await Outbox.add(tx, {
        type: "delivery.updated",
        orgId: delivery.orgId,
        entityId: delivery.id,
        payload: {
          id: delivery.id,
          status: delivery.status,
          updatedAt: delivery.updatedAt,
        },
      });

      return delivery;
    });
  }
}
