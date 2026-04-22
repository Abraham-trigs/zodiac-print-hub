import "dotenv/config";
import { prisma } from "../app/lib/prisma-client";

import {
  UserRole,
  ClientType,
  ServiceUnit,
  JobStatus,
  PaymentStatus,
  DeliveryType,
  DeliveryStatus,
  PaymentMethod,
  B2BStatus,
} from "@prisma/client";

async function main() {
  // ─────────────────────────────
  // 1. ORGANISATION
  // ─────────────────────────────
  const org = await prisma.organisation.upsert({
    where: { slug: "zodiac-print-hub" },
    update: {},
    create: {
      name: "Zodiac Print Hub",
      slug: "zodiac-print-hub",
      contactEmail: "admin@zodiacprint.com",
      contactPhone: "+233200000000",
      address: "Accra, Ghana",
    },
  });

  // ─────────────────────────────
  // 2. USERS (Using upsert to prevent unique email errors)
  // ─────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@zodiac.com" },
    update: {},
    create: {
      orgId: org.id,
      name: "System Admin",
      email: "admin@zodiac.com",
      role: UserRole.ADMIN,
    },
  });

  const operatorUser = await prisma.user.upsert({
    where: { email: "operator@zodiac.com" },
    update: {},
    create: {
      orgId: org.id,
      name: "Operator One",
      email: "operator@zodiac.com",
      role: UserRole.OPERATOR,
    },
  });

  const designerUser = await prisma.user.upsert({
    where: { email: "design@zodiac.com" },
    update: {},
    create: {
      orgId: org.id,
      name: "Design Lead",
      email: "design@zodiac.com",
      role: UserRole.GRAPHIC_DESIGNER,
    },
  });

  // ─────────────────────────────
  // 3. STAFF
  // ─────────────────────────────
  const operatorStaff = await prisma.staff.upsert({
    where: { userId: operatorUser.id },
    update: {},
    create: {
      orgId: org.id,
      userId: operatorUser.id,
      name: "John Operator",
      role: UserRole.OPERATOR,
      phone: "+233200000001",
      specialisation: "Printing & Finishing",
    },
  });

  const designerStaff = await prisma.staff.upsert({
    where: { userId: designerUser.id },
    update: {},
    create: {
      orgId: org.id,
      userId: designerUser.id,
      name: "Ama Designer",
      role: UserRole.GRAPHIC_DESIGNER,
      phone: "+233200000010",
      specialisation: "Brand & Layout Design",
    },
  });

  // ─────────────────────────────
  // 4. CLIENTS
  // ─────────────────────────────
  const clientA = await prisma.client.create({
    data: {
      orgId: org.id,
      type: ClientType.COMPANY,
      name: "Acme Corp",
      companyName: "Acme Corporation Ltd",
      email: "client@acme.com",
      phone: "+233200000002",
      location: "Accra",
      notes: "VIP client",
    },
  });

  // Ensure this 'const clientB =' is present!
  const clientB = await prisma.client.create({
    data: {
      orgId: org.id,
      type: ClientType.PRIVATE,
      name: "Kwame Mensah",
      email: "kwame@gmail.com",
      phone: "+233200000003",
      location: "Tema",
      isNew: false,
    },
  });

  // ─────────────────────────────
  // 5. PRICE LIST (Updated from PriceItem)
  // ─────────────────────────────
  const priceA = await prisma.priceList.create({
    data: {
      orgId: org.id,
      name: "A3 Color Print",
      category: "Printing",
      unit: ServiceUnit.PER_PAGE,
      priceGHS: 5.0,
    },
  });

  const priceB = await prisma.priceList.create({
    data: {
      orgId: org.id,
      name: "Banner Large Format",
      category: "Wide Format",
      unit: ServiceUnit.PER_SQ_METER,
      priceGHS: 120,
    },
  });

  const priceC = await prisma.priceList.create({
    data: {
      orgId: org.id,
      name: "Flyer Design",
      category: "Design",
      unit: ServiceUnit.PER_SET,
      priceGHS: 80,
    },
  });

  // ─────────────────────────────
  // 6. STOCK
  // ─────────────────────────────
  const stockA = await prisma.stockItem.create({
    data: {
      orgId: org.id,
      name: "A4 Paper",
      unit: "ream",
      totalRemaining: 100,
      lowStockThreshold: 10,
      lastUnitCost: 25,
    },
  });

  // ─────────────────────────────
  // 7. JOBS
  // ─────────────────────────────
  const job1 = await prisma.job.create({
    data: {
      orgId: org.id,
      clientId: clientA.id,
      serviceId: priceA.id,
      serviceName: priceA.name,
      quantity: 20,
      unit: "pages",
      totalPrice: 100,
      costPrice: 60,
      profitMargin: 40,
      status: JobStatus.IN_PROGRESS,
      paymentStatus: PaymentStatus.PARTIAL,
      assignedStaffId: operatorStaff.id,
      notes: "Urgent corporate print job",
    },
  });

  const job2 = await prisma.job.create({
    data: {
      orgId: org.id,
      clientId: clientB.id, // Ensure clientB is defined above
      serviceId: priceC.id, // Ensure priceC is defined above
      serviceName: priceC.name,
      quantity: 1,
      unit: "set",
      totalPrice: 80,
      costPrice: 30,
      profitMargin: 50,
      status: JobStatus.QUALITY_CHECK,
      paymentStatus: PaymentStatus.UNPAID,
      assignedStaffId: designerStaff.id,
      notes: "Flyer design review",
    },
  });

  const job3 = await prisma.job.create({
    data: {
      orgId: org.id,
      clientId: clientA.id,
      serviceId: priceB.id,
      serviceName: priceB.name,
      quantity: 10,
      unit: "sqm",
      totalPrice: 1200,
      costPrice: 800,
      profitMargin: 400,
      status: JobStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      isPaid: true,
      assignedStaffId: operatorStaff.id,
      notes: "Completed banner production",
    },
  });

  // ─────────────────────────────
  // 8. DELIVERIES
  // ─────────────────────────────
  await prisma.delivery.createMany({
    data: [
      {
        orgId: org.id, // Unified naming
        jobId: job1.id,
        clientId: clientA.id,
        type: DeliveryType.CLIENT_COURIER,
        status: DeliveryStatus.SCHEDULED,
        address: "Accra Central",
        scheduledDate: new Date(),
      },
      {
        orgId: org.id,
        jobId: job2.id,
        clientId: clientB.id,
        type: DeliveryType.PRINTER_DELIVERY,
        status: DeliveryStatus.PENDING,
        address: "Tema Station",
      },
    ],
  });

  // ─────────────────────────────
  // 9. PAYMENTS
  // ─────────────────────────────
  await prisma.payment.createMany({
    data: [
      {
        orgId: org.id,
        jobId: job1.id,
        amount: 50,
        method: PaymentMethod.MOMO,
        reference: "TXN-111",
        confirmedBy: admin.id,
      },
      {
        orgId: org.id,
        jobId: job3.id,
        amount: 1200,
        method: PaymentMethod.CASH,
        reference: "CASH-222",
        confirmedBy: admin.id, // Fixed: admin.id used for consistency
      },
    ],
  });

  // ─────────────────────────────
  // 10. B2B PUSH
  // ─────────────────────────────
  await prisma.b2BPush.createMany({
    data: [
      {
        orgId: org.id,
        originalJobId: job2.id,
        clientName: clientB.name,
        serviceName: priceC.name,
        specs: "Outsource design workload",
        deadline: new Date(Date.now() + 86400000),
        suggestedPrice: 100,
        status: B2BStatus.PENDING,
      },
      {
        orgId: org.id,
        originalJobId: job1.id,
        clientName: clientA.name,
        serviceName: priceA.name,
        specs: "Bulk print overflow job",
        deadline: new Date(Date.now() + 172800000),
        suggestedPrice: 200,
        status: B2BStatus.NEGOTIATING,
      },
    ],
  });

  // ─────────────────────────────
  // 11. AUDIT LOGS
  // ─────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        orgId: org.id,
        action: "SEED_INIT",
        entityId: job1.id,
        entityType: "Job",
        performedBy: admin.id,
        meta: { source: "seed" },
      },
      {
        orgId: org.id,
        action: "JOB_CREATED",
        entityId: job2.id,
        entityType: "Job",
        performedBy: operatorUser.id,
      },
    ],
  });

  // ─────────────────────────────
  // 12. OUTBOX EVENTS
  // ─────────────────────────────
  await prisma.outboxEvent.createMany({
    // ✅ Use lowercase 'o' to match your model
    data: [
      {
        type: "JOB_CREATED",
        payload: { jobId: job1.id },
        orgId: org.id,
        status: "PENDING",
      },
      {
        type: "PAYMENT_RECEIVED",
        payload: { jobId: job3.id, amount: 1200 },
        orgId: org.id,
        status: "PENDING",
      },
    ],
  });

  console.log("Seed completed successfully! ✔");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
