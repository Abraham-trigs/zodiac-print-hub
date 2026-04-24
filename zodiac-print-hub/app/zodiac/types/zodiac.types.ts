// =============================================================================
// zodiac.types.ts — Single source of truth for all PrintOps types
// =============================================================================

//
// RULES:
//   - All store slices, API handlers, and UI components import from HERE only.
//   - Never redeclare a type locally if it belongs to the domain.
//   - Add new types at the bottom of their section with a JSDoc comment.
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// 1. ORGANISATION (Multi-tenant root)
// ─────────────────────────────────────────────────────────────────────────────

/** Top-level tenant. Every record belongs to an org. */
export interface Organisation {
  id: string;
  name: string;
  slug: string; // URL-safe identifier e.g. "printzone-accra"
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: string; // ISO 8601
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. AUTH + RBAC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Roles control what a user can see and do.
 *
 * ADMIN     — full access, settings, price list, reports
 * OPERATOR  — create/update jobs, manage staff assignments
 * CASHIER   — confirm payments, view jobs, no price editing
 * GUEST     — read-only client-facing view
 */

export type UserRole =
  | "ADMIN"
  | "OPERATOR"
  | "CASHIER"
  | "GUEST"
  | "GRAPHIC_DESIGNER";

export interface AppUser {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. STAFF
// ─────────────────────────────────────────────────────────────────────────────

/** A staff member who can be assigned to jobs. Linked to an AppUser. */
export interface StaffMember {
  id: string;
  orgId: string;
  userId: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  specialisation?: string;

  isActive: boolean;

  // NEW (safe, non-breaking)
  currentJobId?: string;
  status?: StaffStatus;

  createdAt: string;
}

/** Lightweight summary used on job cards and dashboards. */
export interface StaffSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;

  // NEW for dashboards
  status?: StaffStatus;
  currentJobId?: string;
}

export type StaffStatus = "ONLINE" | "BUSY" | "OFFLINE";

export interface StaffPresence {
  staffId: string;
  orgId: string;
  status: StaffStatus;
  activeJobId?: string;
  lastSeenAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CLIENT
// ─────────────────────────────────────────────────────────────────────────────

export type ClientType = "PRIVATE" | "COMPANY";

export interface Client {
  id: string;
  orgId: string;
  type: ClientType;
  name: string;
  companyName?: string; // if type === "COMPANY"
  email?: string;
  phone: string;
  location?: string;
  profilePictureUrl?: string;
  isNew: boolean; // auto-flagged on first job
  recentStaffId?: string; // → StaffMember.id of last staff who served them
  notes?: string;
  createdAt: string;
}

/** Read-only summary for job cards, search results, delivery records. */
export interface ClientSummary {
  id: string;
  name: string;
  phone: string;
  profilePictureUrl?: string;
  type: ClientType;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PRICE LIST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single service/product in the price list.
 * stock_ref links to StockItem.id so job creation can auto-deduct material.
 */

export type ServiceUnit =
  | "sqft"
  | "sqm"
  | "sqcm"
  | "inch"
  | "ft"
  | "yd"
  | "mm"
  | "cm"
  | "m"
  | "meter"
  | "pack"
  | "piece"
  | "roll"
  | "box"
  | "ream"
  | "bottle"
  | "liter"
  | "hour"
  | "Per Page"
  | "Per 100"
  | "Per Sq Meter"
  | "Per Set"
  | "Per Yard";

export interface PriceItem {
  id: string;
  orgId: string;
  name: string;
  category: string; // e.g. "Large Format", "Business Cards", "Banners"
  unit: string; // e.g. "sqft", "pcs", "sheets"
  priceGHS: number;
  stockRefId?: string;
  isActive: boolean;
  updatedAt: string;
  notes?: string;
}

/** Used by the estimate generator — no prices attached. */
export interface ServiceOption {
  id: string;
  name: string;
  category: string;
  unit: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. STOCK / INVENTORY
// ─────────────────────────────────────────────────────────────────────────────

export interface StockItem {
  id: string;
  orgId: string;
  name: string;
  unit: string; // e.g. "sqft", "sheets", "rolls"
  totalRemaining: number;
  lowStockThreshold: number; // trigger warning below this value
  lastUnitCost: number; // GHS — cost of most recent restock
  lastRestockedAt?: string;
  supplierId?: string;
}

export interface RestockRecord {
  id: string;
  stockItemId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  recordedBy: string; // → StaffMember.id
  date: string;
}

export interface WasteAudit {
  staffName: string;
  machineId: string;
  serviceName: string;
  wastedQuantity: number;
  unit: string;
  monetaryLoss: number;
  date: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STOCK MOVEMENT (INVENTORY LEDGER)
// ─────────────────────────────────────────────────────────────────────────────

export type StockMovementType = "RESTOCK" | "DEDUCT" | "WASTE" | "ADJUST";

/**
 * Single source of truth for ALL inventory changes.
 * Replaces RestockRecord as the canonical ledger.
 */
export interface StockMovement {
  id: string;

  orgId: string;
  stockItemId: string;

  type: StockMovementType;

  quantity: number;
  unitCost?: number;

  // Traceability (important for job → stock linkage)
  referenceId?: string; // jobId, restockId, etc.
  referenceType?: "JOB" | "RESTOCK" | "WASTE" | "MANUAL";

  note?: string;

  createdBy: string; // StaffMember.id
  createdAt: string;
}

/**
 * Lightweight analytics view (for dashboards)
 */
export interface StockMovementSummary {
  stockItemId: string;
  type: StockMovementType;
  totalQuantity: number;
  totalCost?: number;
  lastUpdatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. JOB ENGINE b2b
// payment
// ─────────────────────────────────────────────────────────────────────────────

type JobStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "QUALITY_CHECK"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED"
  | "PAUSED";

export type DomainEvent =
  | "JOB_CREATED"
  | "JOB_UPDATED"
  | "STOCK_UPDATED"
  | "PAYMENT_UPDATED"
  | "DELIVERY_UPDATED"
  | "B2B_PUSHED";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export interface JobTicket {
  id: string; // job reference e.g. "ZDC-2024-001"
  orgId: string;
  clientId: string; // → Client.id
  clientSnapshot: ClientSummary; // frozen at job creation (survives client edits)
  serviceId: string; // → PriceItem.id
  serviceName: string; // frozen at creation
  quantity: number;
  width?: number; // for large format (feet or metres)
  height?: number;
  unit?: string; // "sqft" | "pcs" | etc.
  totalPrice: number; // GHS — calculated at creation
  materialUsed?: number; // units deducted from inventory
  materialWastage?: number; // units recorded as waste
  status: JobStatus;
  paymentStatus: PaymentStatus;
  isPaid: boolean; // convenience flag (true when paymentStatus === "PAID")
  paymentRef?: string; // e.g. Momo ref, screenshot filename, job code
  assignedStaffId?: string; // → StaffMember.id
  assignedStaffSnapshot?: StaffSummary;
  deliveryId?: string; // → DeliveryRecord.id
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  b2bPushId?: string;
}

/**
 * Lightweight card used in lists, staff dashboards, client history.
 * Never carry full job data through list renders.
 */
export interface JobSummary {
  id: string;
  clientName: string;
  serviceName: string;
  status: JobStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  assignedStaffId?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. JOB FILES + VERSIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface JobFileVersion {
  versionId: string;
  jobId: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string; // → StaffMember.id
  uploadedAt: string;
  notes?: string;
}

export interface JobFilesContainer {
  jobId: string;
  currentActiveVersionId: string;
  versions: JobFileVersion[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. DELIVERY
// ─────────────────────────────────────────────────────────────────────────────

export type DeliveryType =
  | "PHYSICAL_PICKUP"
  | "PRINTER_DELIVERY"
  | "CLIENT_COURIER";
export type DeliveryStatus =
  | "PENDING"
  | "SCHEDULED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "PAUSED"
  | "FAILED";

export interface DeliveryRecord {
  id: string;
  orgId: string;
  jobId: string; // → JobTicket.id
  clientId: string; // → Client.id
  type: DeliveryType;
  status: DeliveryStatus;
  scheduledDate?: string;
  deliveredAt?: string;
  handledBy?: string; // → StaffMember.id (if printer delivers)
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. PAYMENTS + EXPENSES
// ─────────────────────────────────────────────────────────────────────────────

export type PaymentMethod =
  | "CASH"
  | "MOMO"
  | "BANK_TRANSFER"
  | "CARD"
  | "OTHER";

export type PaymentRecordStatus = "PENDING" | "CONFIRMED" | "FAILED";

export interface PaymentRecord {
  id: string;
  orgId: string;
  jobId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentRecordStatus; // NEW

  reference?: string; // Momo ref, cheque number, etc.
  screenshotUrl?: string;
  confirmedBy?: string; // → StaffMember.id
  confirmedAt: string;
  createdAt: string; // NEW
}

export interface PaymentLedger {
  jobId: string;
  totalDue: number;
  totalPaid: number;
  balance: number;
  status: PaymentStatus;
}

// (recommended for partial payments)

export type ExpenseCategory =
  | "MATERIAL"
  | "EQUIPMENT"
  | "UTILITY"
  | "SALARY"
  | "TRANSPORT"
  | "OTHER";

export interface ExpenseRecord {
  id: string;
  orgId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidBy?: string; // → StaffMember.id
  date: string;
  receiptUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. ESTIMATES / QUOTES draft
// ─────────────────────────────────────────────────────────────────────────────

export type EstimateStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "EXPIRED"
  | "CONVERTED";

export interface EstimateLineItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  width?: number;
  height?: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface Estimate {
  id: string;
  orgId: string;
  clientId?: string;
  clientName: string;
  status: EstimateStatus;
  lineItems: EstimateLineItem[];
  totalGHS: number;
  validUntil?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  convertedJobId?: string; // set when estimate becomes a real job
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. AUDIT LOG
// ─────────────────────────────────────────────────────────────────────────────

export type AuditAction =
  | "JOB_CREATED"
  | "JOB_STATUS_CHANGED"
  | "JOB_ASSIGNED"
  | "PAYMENT_CONFIRMED"
  | "PRICE_UPDATED"
  | "STOCK_RESTOCKED"
  | "WASTAGE_RECORDED"
  | "DELIVERY_UPDATED"
  | "CLIENT_CREATED"
  | "ESTIMATE_CREATED"
  | "ESTIMATE_CONVERTED";

export interface AuditLogEntry {
  id: string;
  orgId: string;
  action: AuditAction;
  entityId: string; // ID of the record that changed
  entityType: string; // "JOB" | "CLIENT" | "STOCK" | etc.
  performedBy: string; // → StaffMember.id
  meta?: Record<string, unknown>; // any extra context (old value, new value)
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. STORE DRAFT STATE (Job creation bridge)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transient form state held in the store while a job is being built.
 * Cleared via resetDraft() after createJob() succeeds.
 */
export interface JobDraft {
  id: string; // pre-generated job ref (regenerated on reset)
  clientId: string; // → Client.id  (empty string = not yet selected)
  clientName: string; // for display while client not yet in DB
  serviceId: string;
  quantity: number;
  width: number;
  height: number;
  deliveryType: DeliveryType;
  notes?: string;
  assignedStaffId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. SEARCH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Each screen declares which SearchMode it operates in.
 * The global search bar reads this to scope its query correctly.
 */
export type SearchMode =
  | "JOBS"
  | "CLIENTS"
  | "STAFF"
  | "STOCK"
  | "ESTIMATES"
  | "DELIVERIES";

export interface SearchResult<T> {
  mode: SearchMode;
  query: string;
  results: T[];
  totalCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. UI / LOADING STATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Named loading keys used by the process store.
 * Adding a new async operation? Add its key here first.
 */
export type LoadingKey =
  | "initData"
  | "createJob"
  | "updatePrice"
  | "restockItem"
  | "confirmPayment"
  | "addDelivery"
  | "addClient"
  | "addStaff"
  | "createEstimate"
  | "uploadFile";

/** Maps each loading key to its current boolean state. */
export type LoadingMap = Partial<Record<LoadingKey, boolean>>;

/** Named error keys — mirrors LoadingKey. */
export type ErrorKey = LoadingKey;
export type ErrorMap = Partial<Record<ErrorKey, string | null>>;

// ─────────────────────────────────────────────────────────────────────────────
// 16. UTILITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Makes all keys in T optional except the ones listed in K. */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/** Deep readonly — use for frozen snapshots (e.g. clientSnapshot on a job). */
export type Immutable<T> = { readonly [K in keyof T]: T[K] };

/** Pagination params for list queries. */
export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. B2B / EXTERNAL TRADE LAYER
// ─────────────────────────────────────────────────────────────────────────────

export type B2BStatus =
  | "PENDING"
  | "ACCEPTED"
  | "NEGOTIATING"
  | "REJECTED"
  | "COMPLETED";
export interface B2BClientSnapshot {
  clientId: string;
  clientName: string;
  serviceName: string;
  specs?: string;
  deadline?: string;
}

export interface B2BPush {
  id: string;
  orgId: string;

  originalJobId: string; // → JobTicket.id
  clientSnapshot: B2BClientSnapshot;

  specs: string;
  deadline: string;

  suggestedBargainPrice?: number;

  status: B2BStatus;

  createdAt: string;
  updatedAt: string;
}
