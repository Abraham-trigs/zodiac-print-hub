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
  // 🔥 FIXED: Added b2b key to the cache to support the b2b selector
  b2b: { map: null as any, array: EMPTY_ARRAY as any[] },
};

/* =========================================================
   SAFE BASE ACCESSORS (HYDRATION-PROOF)
========================================================= */

export const selectJobsMap = (s: State) => s.jobState?.jobs ?? EMPTY_MAP;
export const selectPricesMap = (s: State) => s.priceState?.prices ?? EMPTY_MAP;
export const selectStaffMap = (s: State) => s.staffState?.staff ?? EMPTY_MAP;

// ✅ SYNCED: Points to b2bState grouping
export const selectB2BMap = (s: State) => s.b2bState?.items ?? EMPTY_MAP;
export const selectSelectedB2BId = (s: State) => s.b2bState?.selectedId;

export const selectClientsMap = (s: State) =>
  s.clientState?.clients ?? EMPTY_MAP;
export const selectInventoryMap = (s: State) =>
  s.inventoryState?.inventory ?? EMPTY_MAP;
export const selectDeliveriesMap = (s: State) =>
  s.deliveryState?.deliveries ?? EMPTY_MAP;
export const selectPaymentsMap = (s: State) =>
  s.paymentState?.payments ?? EMPTY_MAP;

/* =========================================================
   ARRAY / LIST VIEWS (MEMOIZED)
========================================================= */

/**
 * Helper to ensure Object.values doesn't trigger infinite loops
 * by returning the exact same array reference if the map hasn't changed.
 */
/* =========================================================
   ARRAY / LIST VIEWS (MEMOIZED)
========================================================= */

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
// ✅ SYNCED: Now has a cache entry to refer to
export const selectB2BArray = (s: State) =>
  getMemoizedArray(selectB2BMap(s), "b2b");

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
  const b2bItems = selectB2BMap(s); // 🔥 Added to check for negotiations

  return {
    ...job,
    service: prices[job.serviceId],

    // 🔥 NEW: Link the negotiated push record if this was a B2B job
    b2bPush: job.b2bPushId ? b2bItems[job.b2bPushId] : undefined,

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
  if (!job) return undefined;

  const prices = selectPricesMap(s);
  const service = prices[job.serviceId];

  // 🔥 FIXED: Trace the link from Job -> PriceList -> stockRefId
  if (!service || !service.stockRefId) return undefined;

  const inventory = selectInventoryMap(s);
  return inventory[service.stockRefId];
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
  // ✅ FIXED: Updated to match s.draftState.draft path
  const draft = s.draftState?.draft;

  if (!draft || !draft.serviceId) return 0;

  const prices = selectPricesMap(s);
  const service = prices[draft.serviceId];

  if (!service) return 0;

  // 🔥 NEW: B2B Price Hierarchy
  // If there's a B2B deal linked, we fetch that price from b2bState
  let basePrice = service.priceGHS;

  if (draft.b2bPushId) {
    const b2bDeals = selectB2BMap(s);
    const deal = b2bDeals[draft.b2bPushId];
    if (deal?.suggestedPrice) {
      basePrice = deal.suggestedPrice;
    }
  }

  const qty = draft.quantity || 1;

  // ✅ FIXED: Expanded to match Backend isLargeFormat units
  const isArea = ["sqft", "sqm", "Per Sq Meter", "Per Yard"].includes(
    service.unit,
  );

  const area = isArea ? (draft.width || 1) * (draft.height || 1) : 1;

  return basePrice * qty * area;
};

/* =========================================================
   SEARCH HELPERS
========================================================= */

export const selectSearchJobs = (query: string) => (s: State) => {
  const all = selectJobsArray(s);
  const q = query.toLowerCase().trim();
  if (!q) return all;

  return all.filter((j) => {
    // 🔥 FIXED: Search by ID, Service Name, or Client Name (via relation)
    const client = selectClientsMap(s)[j.clientId];
    return (
      j.id.toLowerCase().includes(q) ||
      j.serviceName.toLowerCase().includes(q) ||
      client?.name.toLowerCase().includes(q)
    );
  });
};

export const selectSearchClients = (query: string) => (s: State) => {
  const all = selectClientsArray(s);
  const q = query.toLowerCase().trim();
  if (!q) return all;

  return all.filter(
    (c) =>
      // 🔥 FIXED: Search by Name or Phone Number
      c.name.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q),
  );
};

/* =========================================================
   HOOK WRAPPERS
========================================================= */

// ✅ FIXED: Points to draftState grouping
export const useDraft = () => useDataStore((s: State) => s.draftState?.draft);

// ✅ SYNCED: Points to priceState
export const usePrices = () => useDataStore((s) => s.priceState?.prices);

export const useSelectedService = () =>
  useDataStore((s: State) => {
    // ✅ FIXED: Updated path
    const draft = s.draftState?.draft;
    if (!draft?.serviceId) return undefined;

    // ✅ SYNCED: Points to priceState
    return s.priceState?.prices[draft.serviceId];
  });

// ✅ SYNCED: Uses the updated B2B-aware estimate selector
export const useLiveEstimate = () =>
  useDataStore((s: State) => selectLiveEstimate(s));

// ✅ NEW: Hook for the B2B negotiations
export const useB2BItems = () => useDataStore((s: State) => s.b2bState?.items);
