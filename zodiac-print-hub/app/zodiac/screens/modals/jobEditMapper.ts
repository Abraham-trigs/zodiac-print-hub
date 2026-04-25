export type JobEditField =
  | "service"
  | "material"
  | "client"
  | "size"
  | "quantity"
  | "logistics";

export type EntryMode = "IDLE" | "WIDTH" | "HEIGHT" | "QUANTITY";

/**
 * Deterministic mapping layer
 */
export const jobFieldToEntryMode = (field: JobEditField): EntryMode | null => {
  switch (field) {
    case "size":
      // future upgrade: auto-detect width vs height
      return "WIDTH";

    case "quantity":
      return "QUANTITY";

    default:
      return null;
  }
};
