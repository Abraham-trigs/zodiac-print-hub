import { DeliveryRepository } from "@/lib/repositories/delivery.repository";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { Outbox } from "@/lib/db/outbox";
import { WhatsAppService } from "./whatsapp.service";
import type { DeliveryType, DeliveryStatus } from "@prisma/client";

export class DeliveryService {
  /**
   * CREATE DELIVERY NODE
   */
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

  /**
   * UPDATE STATUS & DISPATCH
   */
  static async updateStatus(
    id: string,
    status: DeliveryStatus,
    handledBy?: string,
  ) {
    return UnitOfWork.run(async (tx) => {
      const delivery = await DeliveryRepository.updateStatus(
        id,
        status,
        tx,
        handledBy,
      );

      // 🚀 Automated WhatsApp Triggers
      if (status === "OUT_FOR_DELIVERY") {
        await WhatsAppService.sendDispatchAlert(delivery.id);
      } else if (status === "DELIVERED") {
        await WhatsAppService.sendDeliveryConfirmation(delivery.id);
      }

      await Outbox.add(tx, {
        type: "delivery.updated",
        orgId: delivery.orgId,
        entityId: delivery.id,
        payload: {
          id: delivery.id,
          status: delivery.status,
          handledBy: delivery.handledBy,
        },
      });

      return delivery;
    });
  }

  /**
   * COLLECT AND DELIVER (V2 POD Handshake) 🚀
   * Synchronizes the financial ledger and the logistics node in one atomic step.
   */
  static async collectAndDeliver(params: {
    deliveryId: string;
    orgId: string;
    jobId: string;
    amount: number;
    method: "CASH" | "MOMO_OFFLINE";
  }) {
    return await UnitOfWork.run(async (tx) => {
      // 1. Record the payment in the shop's ledger
      const payment = await tx.payment.create({
        data: {
          orgId: params.orgId,
          jobId: params.jobId,
          amount: params.amount,
          method: params.method,
          note: `POD collected by Rider for Delivery ${params.deliveryId.slice(-4)}`,
        },
      });

      // 2. Mark delivery as complete
      const delivery = await tx.delivery.update({
        where: { id: params.deliveryId },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
        },
      });

      // 3. 🚀 WHATSAPP: Notify client of successful handover and receipt
      await WhatsAppService.sendDeliveryConfirmation(delivery.id);

      // 4. Update the Outbox for real-time dashboard sync
      await Outbox.add(tx, {
        type: "delivery.completed_with_payment",
        orgId: params.orgId,
        payload: {
          deliveryId: delivery.id,
          paymentId: payment.id,
          amount: params.amount,
        },
      });

      return { delivery, payment };
    });
  }

  static async list(orgId: string) {
    return DeliveryRepository.list(orgId);
  }
}
