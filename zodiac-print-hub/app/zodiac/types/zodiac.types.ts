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
  slug: string;

  // These map 1:1 to Prisma's 'String?' (Nullable)
  logoUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;

  // Maps to Prisma's 'DateTime'
  // Use 'Date' if working in the backend, 'string' if data is serialized (JSON)
  createdAt: Date | string;
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
  avatarUrl: string | null;
  createdAt: Date | string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. STAFF
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A staff member who can be assigned to jobs.
 * Strictly matches 'model Staff' + Joined 'User'.
 */
export interface StaffMember {
  id: string;
  orgId: string;
  userId: string;

  // Professional fields (Directly on Staff model)
  phone: string | null; // Prisma String?
  specialisation: string | null; // Prisma String?
  isActive: boolean; // Prisma @default(true)
  createdAt: Date | string;

  // Joined Identity (The 1:1 link to User)
  user?: AppUser;
}

/**
 * Lightweight summary used on job cards and dashboards.
 * Typically mapped from a Staff + User join.
 */
export interface StaffSummary {
  id: string; // Usually Staff ID
  name: string; // From User
  avatarUrl: string | null; // From User
  role: UserRole; // From User

  // Operational state (Runtime/UI only)
  status: StaffStatus;
  currentJobId: string | null;
}

export type StaffStatus = "ONLINE" | "BUSY" | "OFFLINE";

/**
 * Real-time presence tracking.
 * Note: If this isn't in Prisma yet, keep it as is for UI/Redis.
 */
export interface StaffPresence {
  staffId: string;
  orgId: string;
  status: StaffStatus;
  activeJobId: string | null;
  lastSeenAt: Date | string;
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

  // Nullable fields (Prisma String?)
  companyName: string | null;
  email: string | null;
  phone: string; // Required in schema
  location: string | null;
  profilePictureUrl: string | null;

  // CRM State (Projections)
  isNew: boolean;
  recentStaffId: string | null;

  lastJobId: string | null;
  lastJobDate: Date | string | null; // Prisma DateTime?

  totalJobs: number; // Prisma Int
  mostPrintedServiceId: string | null;

  notes: string | null;

  createdAt: Date | string;
}

/** Read-only summary for job cards and search results. */
export interface ClientSummary {
  id: string;
  name: string;
  phone: string;
  profilePictureUrl: string | null;
  type: ClientType;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PRICE LIST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single service/product in the price list.
 * stock_ref links to StockItem.id so job creation can auto-deduct material.
 */
export type PriceItemType = "MATERIAL" | "SERVICE";

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
  | "PER_PAGE"
  | "PER_100"
  | "PER_SQ_METER"
  | "PER_SET"
  | "PER_YARD";

export interface PriceItem {
  id: string;
  orgId: string;

  name: string;
  category: string;

  unit: ServiceUnit;

  priceGHS: number;

  isActive: boolean;
  updatedAt: string;

  notes?: string;

  type: PriceItemType;

  metadata: PriceItemMetadata;
}

export type PriceItemMetadata = MaterialMetadata | ServiceMetadata;

/** Used by the estimate generator — no prices attached. */
export interface ServiceOption {
  id: string;
  name: string;
  category: string;
  unit: ServiceUnit;
}

export interface MaterialMetadata {
  kind: "MATERIAL";

  costPrice: number;

  width?: number;
  height?: number;

  stockRefId?: string;
}

export interface ServiceMetadata {
  kind: "SERVICE";

  costPrice: number;

  minOrder?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. STOCK / INVENTORY
// ─────────────────────────────────────────────────────────────────────────────

export interface StockItem {
  id: string;
  orgId: string;

  name: string;

  unit: ServiceUnit; // ✅ FIXED (was string — must align with PriceList)

  totalRemaining: number;

  lowStockThreshold: number;

  lastUnitCost: number;

  lastRestockedAt?: string;

  supplierId?: string;
}

export interface WasteAudit {
  staffName: string;
  machineId: string;
  serviceName: string;

  wastedQuantity: number;

  unit: ServiceUnit;

  monetaryLoss: number;

  date: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STOCK MOVEMENT (INVENTORY LEDGER)
// ─────────────────────────────────────────────────────────────────────────────

export type StockMovementType = "RESTOCK" | "DEDUCT" | "WASTE" | "ADJUST";

/**
 * Single source of truth for ALL inventory changes.
 * Event-sourced ledger (DO NOT mutate StockItem directly).
 */
export interface StockMovement {
  id: string;

  orgId: string;
  stockItemId: string;

  type: StockMovementType;

  quantity: number;

  unitCost?: number;

  referenceId?: string; // jobId, restockId, etc.

  referenceType?: "JOB" | "RESTOCK" | "WASTE" | "MANUAL";

  note?: string;

  createdBy: string;

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

export type JobStatus =
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
  | "STOCK_RESTOCKED"
  | "STOCK_DEDUCTED"
  | "STOCK_WASTED"
  | "STOCK_ADJUSTED"
  | "PRICE_CREATED"
  | "PRICE_UPDATED"
  | "PRICE_DELETED"
  | "PAYMENT_UPDATED"
  | "DELIVERY_UPDATED"
  | "B2B_PUSHED";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export interface JobTicket {
  id: string;

  orgId: string;

  clientId: string;

  clientSnapshot: ClientSummary;

  serviceId: string;

  serviceName: string;

  quantity: number;

  width?: number;
  height?: number;

  unit?: ServiceUnit;

  totalPrice: number;

  materialUsed?: number;
  materialWastage?: number;

  status: JobStatus;

  paymentStatus: PaymentStatus;

  isPaid: boolean;

  paymentRef?: string;

  assignedStaffId?: string;

  assignedStaffSnapshot?: StaffSummary;

  deliveryId?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;

  b2bPushId?: string;
}

/**
 * Lightweight card used in lists, staff dashboards, client history.
 * Never carry full job data through list renders.
 * Service
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

/* =========================================================
   OUTBOX EVENT CONTRACT (SINGLE SOURCE OF TRUTH)
========================================================= */

export type DomainEventType =
  | "job.created"
  | "job.updated"
  | "job.status_changed"
  | "stock.updated"
  | "stock.restocked"
  | "stock.deducted"

  // ✅ ADD THESE
  | "price.created"
  | "price.updated"
  | "price.deleted"
  | "payment.updated"
  | "payment.confirmed"
  | "delivery.updated"
  | "client.created"
  | "client.updated"
  | "staff.updated"
  | "estimate.created"
  | "estimate.converted"
  | "b2b.pushed";

/**
 * Maps runtime events → strict domain contract
 * This is what EVERYTHING must use going forward.
 */
export interface DomainEventEnvelope<T = unknown> {
  type: DomainEventType;
  orgId: string;

  entityId: string;
  entityType:
    | "JOB"
    | "CLIENT"
    | "STOCK"
    | "PAYMENT"
    | "DELIVERY"
    | "STAFF"
    | "ESTIMATE"
    | "B2B";

  version: number;

  payload: T;

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
