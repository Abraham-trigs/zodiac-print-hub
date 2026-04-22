import { useDataStore } from "@store/core/useDataStore";
import type { State } from "@store/core/useDataStore";

/* =========================================================
   BASE ACCESSORS
========================================================= */

export const selectJobsMap = (s: State) => s.jobs.jobs;
export const selectStaffMap = (s: State) => s.staff.staff;
export const selectClientsMap = (s: State) => s.client.clients;
export const selectPricesMap = (s: State) => s.prices.prices;
export const selectInventoryMap = (s: State) => s.inventory.inventory;
export const selectDeliveriesMap = (s: State) => s.delivery.deliveries;
export const selectPaymentsMap = (s: State) => s.payment.payments;

/* =========================================================
   LIST VIEWS
========================================================= */

export const selectAllJobs = (s: State) => Object.values(s.jobs.jobs);
export const selectAllStaff = (s: State) => Object.values(s.staff.staff);
export const selectAllClients = (s: State) => Object.values(s.client.clients);
export const selectAllPrices = (s: State) => Object.values(s.prices.prices);
export const selectAllInventory = (s: State) =>
  Object.values(s.inventory.inventory);
export const selectAllDeliveries = (s: State) =>
  Object.values(s.delivery.deliveries);

/* =========================================================
   JOB DOMAIN COMPOSITES
========================================================= */

export const selectJobById = (id: string) => (s: State) => s.jobs.jobs[id];

export const selectJobWithRelations = (id: string) => (s: State) => {
  const job = s.jobs.jobs[id];
  if (!job) return undefined;

  return {
    ...job,
    client: s.client.clients[job.clientId],
    staff: job.assignedStaffId ? s.staff.staff[job.assignedStaffId] : undefined,
    delivery: job.deliveryId
      ? s.delivery.deliveries[job.deliveryId]
      : undefined,
    payments: s.payment.payments[job.id] || [],
  };
};

/* =========================================================
   PAYMENT ANALYTICS
========================================================= */

export const selectTotalPaid = (jobId: string) => (s: State) =>
  (s.payment.payments[jobId] || []).reduce((sum, p) => sum + p.amount, 0);

export const selectPaymentStatus =
  (jobId: string, totalDue: number) => (s: State) => {
    const totalPaid = selectTotalPaid(jobId)(s);

    if (totalPaid <= 0) return "UNPAID";
    if (totalPaid < totalDue) return "PARTIAL";
    return "PAID";
  };

/* =========================================================
   STAFF ANALYTICS
========================================================= */

export const selectStaffArray = (s: State) => Object.values(s.staff.staff);

export const selectStaffByJob = (jobId: string) => (s: State) =>
  selectStaffArray(s).find((st) => st.currentJobId === jobId);

export const selectAvailableStaff = (s: State) =>
  selectStaffArray(s).filter((st) => st.status === "ONLINE");

export const selectBusyStaff = (s: State) =>
  selectStaffArray(s).filter((st) => st.status === "BUSY");

/* =========================================================
   INVENTORY / JOB IMPACT
========================================================= */

export const selectInventoryArray = (s: State) =>
  Object.values(s.inventory.inventory);

export const selectLowStockItems =
  (threshold = 10) =>
  (s: State) =>
    selectInventoryArray(s).filter((item) => item.totalRemaining <= threshold);

export const selectStockForJob = (jobId: string) => (s: State) => {
  const job = s.jobs.jobs[jobId];
  if (!job) return [];

  return selectInventoryArray(s).filter((item) => item.id === job.serviceId);
};

/* =========================================================
   DELIVERY PIPELINE
========================================================= */

export const selectDeliveriesArray = (s: State) =>
  Object.values(s.delivery.deliveries);

export const selectPendingDeliveries = (s: State) =>
  selectDeliveriesArray(s).filter((d) => d.status === "PENDING");

export const selectActiveDeliveries = (s: State) =>
  selectDeliveriesArray(s).filter(
    (d) => d.status === "SCHEDULED" || d.status === "OUT_FOR_DELIVERY",
  );

/* =========================================================
   DRAFT / ESTIMATION
========================================================= */

export const selectLiveEstimate = (s: State) => {
  const draft = s.draft.draft;
  const price = s.prices.prices[draft.serviceId];

  if (!price) return 0;

  const base = price.priceGHS;
  const qty = draft.quantity || 1;

  const isArea = price.unit === "sqft" || price.unit === "sqm";

  const area = isArea ? (draft.width || 1) * (draft.height || 1) : 1;

  return base * qty * area;
};

/* =========================================================
   SEARCH HELPERS
========================================================= */

export const selectJobsArray = (s: State) => Object.values(s.jobs.jobs);

export const selectClientsArray = (s: State) => Object.values(s.client.clients);

export const selectSearchJobs = (query: string) => (s: State) => {
  const q = query.toLowerCase();

  return selectJobsArray(s).filter((j) => j.id.toLowerCase().includes(q));
};

export const selectSearchClients = (query: string) => (s: State) => {
  const q = query.toLowerCase();

  return selectClientsArray(s).filter((c) => c.name.toLowerCase().includes(q));
};

/* =========================================================
   HOOK WRAPPERS
========================================================= */

export const useDraft = () => useDataStore((s: State) => s.draft.draft);

export const usePrices = () => useDataStore((s: State) => s.prices.prices);

export const useSelectedService = () =>
  useDataStore((s: State) => {
    const draft = s.draft.draft;
    return s.prices.prices[draft.serviceId];
  });

export const useLiveEstimate = () =>
  useDataStore((s: State) => selectLiveEstimate(s));
