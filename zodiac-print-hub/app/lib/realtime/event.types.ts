export type RealtimeEvent =
  | { type: "job.created"; payload: JobTicket }
  | { type: "job.updated"; payload: Partial<JobTicket> & { id: string } }
  | { type: "stock.updated"; payload: any }
  | { type: "price.updated"; payload: PriceItem }
  | {
      type: "staff.assigned";
      payload: {
        staffId: string;
        jobId: string;
        status: "BUSY";
      };
    }
  | {
      type: "staff.status.updated";
      payload: {
        staffId: string;
        status: "ONLINE" | "BUSY" | "OFFLINE";
      };
    };
