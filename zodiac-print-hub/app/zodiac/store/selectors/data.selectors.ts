import { useDataStore } from "@store/core/useDataStore";
import type { State } from "@store/core/useDataStore";

/* =========================================================
   STABLE FALLBACKS (Prevents Infinite Loops)
========================================================= */
const EMPTY_MAP = Object.freeze({});
const EMPTY_ARRAY = Object.freeze([]);

/* =========================================================
   MEMOIZATION CACHE (Internal)
========================================================= */
const cache = {
  jobs: { map: null as any, array: EMPTY_ARRAY as any[] },
  staff: { map: null as any, array: EMPTY_ARRAY as any[] },
  clients: { map: null as any, array: EMPTY_ARRAY as any[] },
  prices: { map: null as any, array: EMPTY_ARRAY as any[] },
  inventory: { map: null as any, array: EMPTY_ARRAY as any[] },
  delivery: { map: null as any, array: EMPTY_ARRAY as any[] },
  payment: { map: null as any, array: EMPTY_ARRAY as any[] },
};

/* =========================================================
   SAFE BASE ACCESSORS (HYDRATION-PROOF)
========================================================= */

// Update this in your selectors file:
export const selectJobsMap = (s: State) => s.jobState?.jobs ?? EMPTY_MAP;

export const selectStaffMap = (s: State) => s.staff?.staff ?? EMPTY_MAP;
export const selectClientsMap = (s: State) => s.client?.clients ?? EMPTY_MAP;
export const selectPricesMap = (s: State) => s.prices?.prices ?? EMPTY_MAP;
export const selectInventoryMap = (s: State) =>
  s.inventory?.inventory ?? EMPTY_MAP;
export const selectDeliveriesMap = (s: State) =>
  s.delivery?.deliveries ?? EMPTY_MAP;
export const selectPaymentsMap = (s: State) => s.payment?.payments ?? EMPTY_MAP;

/* =========================================================
   ARRAY / LIST VIEWS (MEMOIZED)
========================================================= */

/**
 * Helper to ensure Object.values doesn't trigger infinite loops
 * by returning the exact same array reference if the map hasn't changed.
 */
const getMemoizedArray = (currentMap: any, cacheKey: keyof typeof cache) => {
  if (currentMap === cache[cacheKey].map) return cache[cacheKey].array;
  cache[cacheKey].map = currentMap;
  cache[cacheKey].array = Object.values(currentMap);
  return cache[cacheKey].array;
};

export const selectJobsArray = (s: State) =>
  getMemoizedArray(selectJobsMap(s), "jobs");
export const selectStaffArray = (s: State) =>
  getMemoizedArray(selectStaffMap(s), "staff");
export const selectClientsArray = (s: State) =>
  getMemoizedArray(selectClientsMap(s), "clients");
export const selectPricesArray = (s: State) =>
  getMemoizedArray(selectPricesMap(s), "prices");
export const selectInventoryArray = (s: State) =>
  getMemoizedArray(selectInventoryMap(s), "inventory");
export const selectDeliveriesArray = (s: State) =>
  getMemoizedArray(selectDeliveriesMap(s), "delivery");
export const selectPaymentsArray = (s: State) =>
  getMemoizedArray(selectPaymentsMap(s), "payment");

let jobsWithRelationsCache: any[] = [];
let jobsRef: any = null;
let pricesRef: any = null;
let clientsRef: any = null;
let staffRef: any = null;

export const selectJobsWithRelations = (s: State) => {
  const jobs = selectJobsArray(s);
  const prices = selectPricesMap(s);
  const clients = selectClientsMap(s);
  const staff = selectStaffMap(s);

  if (
    jobs === jobsRef &&
    prices === pricesRef &&
    clients === clientsRef &&
    staff === staffRef
  ) {
    return jobsWithRelationsCache;
  }

  jobsRef = jobs;
  pricesRef = prices;
  clientsRef = clients;
  staffRef = staff;

  jobsWithRelationsCache = jobs.map((job) => ({
    ...job,
    service: prices[job.serviceId],
    client: clients[job.clientId],
    staff: job.assignedStaffId ? staff[job.assignedStaffId] : undefined,
  }));

  return jobsWithRelationsCache;
};

/* =========================================================
   🔁 BACKWARD COMPATIBILITY ALIASES
========================================================= */

export const selectAllJobs = selectJobsArray;
export const selectAllStaff = selectStaffArray;
export const selectAllClients = selectClientsArray;
export const selectAllPrices = selectPricesArray;
export const selectAllInventory = selectInventoryArray;
export const selectAllDeliveries = selectDeliveriesArray;
export const selectAllPayments = selectPaymentsArray;

/* =========================================================
   JOB DOMAIN COMPOSITES
========================================================= */

export const selectJobById = (id: string) => (s: State) => selectJobsMap(s)[id];

export const selectJobWithRelations = (id: string) => (s: State) => {
  const job = selectJobsMap(s)[id];
  if (!job) return undefined;

  const prices = selectPricesMap(s);

  return {
    ...job,
    service: prices[job.serviceId], // ✅ ADD THIS

    client: selectClientsMap(s)[job.clientId],
    staff: job.assignedStaffId
      ? selectStaffMap(s)[job.assignedStaffId]
      : undefined,
    delivery: job.deliveryId
      ? selectDeliveriesMap(s)[job.deliveryId]
      : undefined,
    payments: selectPaymentsMap(s)[job.id] ?? EMPTY_ARRAY,
  };
};

/* =========================================================
   PAYMENT ANALYTICS
========================================================= */

export const selectTotalPaid = (jobId: string) => (s: State) =>
  (selectPaymentsMap(s)[jobId] ?? EMPTY_ARRAY).reduce(
    (sum, p) => sum + p.amount,
    0,
  );

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

export const selectStaffByJob = (jobId: string) => (s: State) =>
  selectStaffArray(s).find((st) => st.currentJobId === jobId);

export const selectAvailableStaff = (s: State) =>
  selectStaffArray(s).filter((st) => st.status === "ONLINE");

export const selectBusyStaff = (s: State) =>
  selectStaffArray(s).filter((st) => st.status === "BUSY");

/* =========================================================
   INVENTORY / JOB IMPACT
========================================================= */

export const selectLowStockItems =
  (threshold = 10) =>
  (s: State) =>
    selectInventoryArray(s).filter((item) => item.totalRemaining <= threshold);

export const selectStockForJob = (jobId: string) => (s: State) => {
  const job = selectJobsMap(s)[jobId];
  if (!job) return EMPTY_ARRAY;
  return selectInventoryArray(s).filter((item) => item.id === job.serviceId);
};

/* =========================================================
   DELIVERY PIPELINE
========================================================= */

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
  // Add optional chaining here to handle cases where draft might be null
  const draft = s.draft?.draft;

  if (!draft || !draft.serviceId) return 0;

  const prices = selectPricesMap(s);
  const price = prices[draft.serviceId];

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

export const selectSearchJobs = (query: string) => (s: State) => {
  const all = selectJobsArray(s);
  const q = query.toLowerCase().trim();
  if (!q) return all;
  return all.filter((j) => j.id.toLowerCase().includes(q));
};

export const selectSearchClients = (query: string) => (s: State) => {
  const all = selectClientsArray(s);
  const q = query.toLowerCase().trim();
  if (!q) return all;
  return all.filter((c) => c.name.toLowerCase().includes(q));
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
