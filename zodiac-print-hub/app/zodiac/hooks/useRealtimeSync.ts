"use client";

import { useEffect, useRef } from "react";
import { createRealtimeClient } from "@lib/realtime/client";
import { useDataStore } from "@store/core/useDataStore";

export function useRealtimeSync() {
  const lastVersionMap = useRef<Record<string, number>>({});

  useEffect(() => {
    const unsubscribe = createRealtimeClient((event) => {
      const store = useDataStore.getState();
      const { entityId, version = 0, type, payload: data } = event;

      if (entityId) {
        const last = lastVersionMap.current[entityId] ?? -1;
        if (last >= version) return;
        lastVersionMap.current[entityId] = version;
      }

      switch (type) {
        case "company.created":
          store.setCompany?.(data);
          break;

        case "company.location.updated":
        case "company.activated":
          store.updateCompany?.(data.id, data);
          break;

        case "job.created":
          store.addJob(data);
          break;

        case "job.updated":
        case "job.paid":
          store.updateJob(data.id, data);
          break;

        case "job.staff_assigned":
          store.updateJob(data.id, {
            assignedStaffId: data.assignedStaffId,
            assignedStaffSnapshot: data.assignedStaffSnapshot,
          });
          break;

        case "stock.updated":
          store.consumeStock(data.id, data.totalRemaining ?? data.qty);
          break;

        case "stock.restocked":
          store.restockStock?.(data.id, data.totalRemaining, data.lastUnitCost);
          break;

        case "price.updated":
          store.updatePrice(data.id, data.unitPrice);
          break;

        case "staff.created":
          store.addStaff?.(data);
          break;

        case "staff.updated":
          store.updateStaff?.(data.id, data);
          break;

        case "staff.status.updated":
          store.setStaffStatus?.(data.staffId, data.status);
          break;

        case "staff.assigned":
          store.assignCurrentJob?.(data.staffId, data.jobId);
          store.setStaffStatus?.(data.staffId, data.status);
          break;

        case "delivery.created":
          store.addDelivery?.(data);
          break;

        case "delivery.updated":
          store.updateDelivery?.(data.id, data);
          break;

        case "b2b.pushed":
          store.addB2B?.(data);
          break;

        case "b2b.updated":
          store.updateB2B?.(data.id, data);
          break;

        default:
          console.debug(`[Realtime] Unhandled event: ${type}`);
      }
    });

    return () => {
      unsubscribe();
      lastVersionMap.current = {};
    };
  }, []);
}
