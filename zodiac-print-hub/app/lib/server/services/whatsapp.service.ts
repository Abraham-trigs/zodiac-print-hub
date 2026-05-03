import type { prisma } from "@lib/prisma-client";

export class WhatsAppService {
  /**
   * SEND_PROOF_LINK
   * Triggered when a designer uploads artwork.
   */
  static async sendApprovalRequest(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { client: true, organisation: true },
    });

    if (!job || !job.client.phone) return;

    const message = `
*${job.organisation.name.toUpperCase()} • DESIGN PROOF*
---
Hi ${job.client.name}, your proof for Order *#${job.shortRef}* is ready.

Please review and authorize production here:
🔗 ${process.env.NEXT_PUBLIC_APP_URL}/approve/${job.approvalToken}

_Reply with 'HELP' if the link doesn't open._
    `.trim();

    return await this.dispatch(job.client.phone, message);
  }

  /**
   * SEND_PICKUP_READY
   * Triggered when the printer operator 'Shoots' the layout.
   */
  static async sendPickupAlert(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { client: true, organisation: true },
    });

    if (!job || !job.client.phone) return;

    const message = `
*${job.organisation.name.toUpperCase()} • READY FOR PICKUP*
---
✅ Good news! Your order *#${job.shortRef}* has cleared production.

You can collect it at our workshop. Please show this ShortRef to the front desk: *${job.shortRef}*

Thank you for choosing ${job.organisation.name}!
    `.trim();

    return await this.dispatch(job.client.phone, message);
  }

  /**
   * SEND_DISPATCH_ALERT (V2 Delivery Node)
   * Triggered when a rider is assigned and leaves the shop.
   */
  static async sendDispatchAlert(deliveryId: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        job: { include: { organisation: true } },
        client: true,
      },
    });

    if (!delivery || !delivery.client.phone) return;

    const message = `
*${delivery.job.organisation.name.toUpperCase()} • DISPATCHED*
---
Hi ${delivery.client.name}, your order *#${delivery.job.shortRef}* is now out for delivery.

🛵 *Rider:* ${delivery.handledBy || "Shop Dispatch"}
📍 *Destination:* ${delivery.address || "Main Address"}

Please have your ShortRef ready for verification: *${delivery.job.shortRef}*
    `.trim();

    return await this.dispatch(delivery.client.phone, message);
  }

  /**
   * SEND_DELIVERY_CONFIRMATION (V2 Delivery Node)
   * Triggered when the rider marks the order as delivered.
   */
  static async sendDeliveryConfirmation(deliveryId: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        job: { include: { organisation: true } },
        client: true,
      },
    });

    if (!delivery || !delivery.client.phone) return;

    const message = `
*${delivery.job.organisation.name.toUpperCase()} • DELIVERED*
---
✅ Order *#${delivery.job.shortRef}* has been successfully delivered.

Thank you for trusting our node! If you have any feedback, please reply to this message.
    `.trim();

    return await this.dispatch(delivery.client.phone, message);
  }

  /**
   * THE DISPATCHER (The Bridge)
   */
  private static async dispatch(phone: string, message: string) {
    console.log(`[WHATSAPP_NODE] Outgoing to ${phone}:`, message);

    // Industrial Handshake with provider (Placeholder for Meta/Twilio/Hubtel API)
    /*
    await fetch('https://provider.com', {
        method: 'POST',
        body: JSON.stringify({ to: phone, body: message })
    });
    */
  }
}
