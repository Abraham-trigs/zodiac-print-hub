export interface ClientProfile {
  id: string;
  name: string;
  type: "PRIVATE" | "COMPANY";
  email: string;
  avatarUrl?: string;
  isNew: boolean; // Feature 5.2
  mostPrinted: string; // e.g., "Vinyl" (Feature 5.4)
  lastStaff: string; // Feature 5.3
  lastJobDate: string;
}
