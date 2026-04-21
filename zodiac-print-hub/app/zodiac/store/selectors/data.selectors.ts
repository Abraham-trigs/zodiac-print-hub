import { useDataStore } from "../core/useDataStore";
import { shallow } from "zustand/shallow";

/* =====================================================
   REACTIVE SELECTORS (UI SAFE - Zustand subscriptions)
===================================================== */

export const useDraft = () => useDataStore((s) => s.draft);

export const usePrices = () => useDataStore((s) => s.prices);

export const useJobs = () => useDataStore((s) => s.jobs);

export const useDeliveries = () => useDataStore((s) => s.deliveries);

/* =====================================================
   DERIVED REACTIVE SELECTORS (PREFERRED FOR UI)
===================================================== */

export const useSelectedService = () =>
  useDataStore((s) => s.prices.find((p) => p.id === s.draft.serviceId));

export const useLiveEstimate = () =>
  useDataStore((s) => {
    const service = s.prices.find((p) => p.id === s.draft.serviceId);

    if (!service) return 0;

    return (service.basePrice || 0) * (s.draft.quantity || 1);
  });

/* =====================================================
   ACTIONS (stable reference with shallow)
===================================================== */

export const useDataActions = () =>
  useDataStore(
    (s) => ({
      setDraft: s.setDraft,
      resetDraft: s.resetDraft,
      createJob: s.createJob,
      updateJobStatus: s.updateJobStatus,
      startJob: s.startJob,
      assignStaff: s.assignStaff,
      recordWastage: s.recordWastage,
      addDelivery: s.addDelivery,
      updateDelivery: s.updateDelivery,
      confirmPayment: s.confirmPayment,
      calculateLiveEstimate: s.calculateLiveEstimate,
      getUniqueJobRef: s.getUniqueJobRef,
    }),
    shallow,
  );
