// Matches backend ProductionStageRecordResponse exactly (flat IDs, no names —
// see BACKEND_HANDOVER_V2.md / ProductionStageRecordController). If the UI
// ever needs to show names instead of IDs, that requires a separate user
// lookup; out of scope for this pass.

export type ProductionStage =
  | "DESIGN_FINALIZED"
  | "FABRIC_SOURCED_CUT"
  | "BASE_STRUCTURE_STITCHED"
  | "DETAILING_EMBELLISHMENT_ADDED"
  | "FITTING_ADJUSTMENT"
  | "QUALITY_CHECK"
  | "READY_FOR_PICKUP";

export type ProductionStatus = "NONE" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export type ProductionStageRecord = {
  id: string;
  orderId: string;
  currentStage: ProductionStage;
  pendingStage: ProductionStage | null;
  proposedById: string | null;
  status: ProductionStatus;
  assignedEmployeeId: string | null;
  reviewedById: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

// Fixed order — matches ProductionStage enum declaration order on the backend.
// Used to derive done/active/pending visual states from currentStage.
export const PRODUCTION_STAGE_ORDER: ProductionStage[] = [
  "DESIGN_FINALIZED",
  "FABRIC_SOURCED_CUT",
  "BASE_STRUCTURE_STITCHED",
  "DETAILING_EMBELLISHMENT_ADDED",
  "FITTING_ADJUSTMENT",
  "QUALITY_CHECK",
  "READY_FOR_PICKUP",
];

export const PRODUCTION_STAGE_LABELS: Record<ProductionStage, string> = {
  DESIGN_FINALIZED: "Design finalized",
  FABRIC_SOURCED_CUT: "Fabric sourced & cut",
  BASE_STRUCTURE_STITCHED: "Base structure stitched",
  DETAILING_EMBELLISHMENT_ADDED: "Detailing & embellishment added",
  FITTING_ADJUSTMENT: "Fitting adjustment",
  QUALITY_CHECK: "Quality check",
  READY_FOR_PICKUP: "Ready for pickup",
};