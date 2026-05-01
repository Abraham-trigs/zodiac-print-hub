import { useDataStore } from "@store/core/useDataStore";
import type { State } from "@store/core/useDataStore";
import { ProductionCalculator } from "@lib/utils/production-calculator";

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
export const selectB2BArray = (s: State) =>
  getMemoizedArray(selectB2BMap(s), "b2b");

// RELATION CACHE
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
    // 🔥 FIXED: Use priceListId junction for V2
    service: prices[job.priceListId],
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
  const b2bItems = selectB2BMap(s);

  return {
    ...job,
    // 🔥 FIXED: Use priceListId junction for V2
    service: prices[job.priceListId],

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
   INVENTORY / JOB IMPACT (V2 ALIGNED)
========================================================= */

export const selectLowStockItems =
  (threshold = 10) =>
  (s: State) =>
    selectInventoryArray(s).filter((item) => item.totalRemaining <= threshold);

export const selectStockForJob = (jobId: string) => (s: State) => {
  const job = selectJobsMap(s)[jobId];
  if (!job) return undefined;

  const prices = selectPricesMap(s);

  // 🔥 FIXED: Resolve via PriceList junction
  const priceItem = prices[job.priceListId];

  // 🔥 FIXED: Trace link PriceList -> materialId -> Stock
  if (!priceItem || !priceItem.materialId) return undefined;

  const inventory = selectInventoryMap(s);
  return inventory[priceItem.materialId];
};

/* =========================================================
   DELIVERY PIPELINE (CONFIRMED)
========================================================= */
export const selectPendingDeliveries = (s: State) =>
  selectDeliveriesArray(s).filter((d) => d.status === "PENDING");

export const selectActiveDeliveries = (s: State) =>
  selectDeliveriesArray(s).filter(
    (d) => d.status === "SCHEDULED" || d.status === "OUT_FOR_DELIVERY",
  );

/* =========================================================
   DRAFT / ESTIMATION (THE V2 BRAIN)
========================================================= */
export const selectLiveEstimate = (s: State) => {
  const draft = s.draftState?.draft;

  // 🔥 FIXED: Use priceListId instead of serviceId
  if (!draft || !draft.priceListId) return 0;

  const prices = selectPricesMap(s);
  const priceItem = prices[draft.priceListId];

  if (!priceItem) return 0;

  // Resolve Base Price (B2B Priority)
  let salePrice = priceItem.salePrice;

  if (draft.b2bPushId) {
    const b2bDeals = selectB2BMap(s);
    const deal = b2bDeals[draft.b2bPushId];
    if (deal?.suggestedPrice) {
      salePrice = deal.suggestedPrice;
    }
  }

  // 🔥 HANDSHAKE: Call the ProductionCalculator
  // This replaces all the 'isArea' manual logic
  const calc = ProductionCalculator.calculate({
    quantity: draft.quantity || 1,
    width: draft.width,
    height: draft.height,
    unit: (priceItem.material?.unit || "piece") as any,
    salePrice,
    mCalcType: priceItem.material?.calcType,
    sCalcType: priceItem.service?.calcType,
  });

  return calc.error ? 0 : calc.totalPrice;
};

/* =========================================================
   SEARCH HELPERS (CONFIRMED)
========================================================= */
export const selectSearchJobs = (query: string) => (s: State) => {
  const all = selectJobsArray(s);
  const q = query.toLowerCase().trim();
  if (!q) return all;

  return all.filter((j) => {
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
      c.name.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q),
  );
};

/* =========================================================
   HOOK WRAPPERS
========================================================= */

// ✅ SYNCED: Accesses the Job Shopping Cart
export const useDraft = () => useDataStore((s: State) => s.draftState?.draft);

// ✅ SYNCED: Accesses the PriceList Master Dictionary
export const usePrices = () => useDataStore((s: State) => s.priceState?.prices);

/**
 * useSelectedPriceItem
 * 🔥 UPDATED: Replaces useSelectedService to align with Junction Architecture.
 * Returns the full Recipe (Material/Service details) for the currently selected product.
 */
export const useSelectedPriceItem = () =>
  useDataStore((s: State) => {
    const draft = s.draftState?.draft;
    // 🔥 FIXED: Look up via priceListId junction
    if (!draft?.priceListId) return undefined;

    return s.priceState?.prices[draft.priceListId];
  });

// ✅ SYNCED: Uses the ProductionCalculator-powered estimate
export const useLiveEstimate = () =>
  useDataStore((s: State) => selectLiveEstimate(s));

// ✅ SYNCED: Accesses partner negotiation items
export const useB2BItems = () => useDataStore((s: State) => s.b2bState?.items);
