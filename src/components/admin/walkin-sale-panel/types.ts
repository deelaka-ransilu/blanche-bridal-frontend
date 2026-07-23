import { Sparkles, Shirt, ShoppingBag } from "lucide-react";
import type { CustomerMeasurement } from "@/types/customer";
import type { Product } from "@/types/product";

export type VisitType = "CUSTOM" | "RENTAL" | "PURCHASE";

export const VISIT_TYPES: {
  type: VisitType;
  label: string;
  description: string;
  icon: typeof Sparkles;
}[] = [
  {
    type: "CUSTOM",
    label: "Custom design",
    description: "Made-to-order — consultation, measurements, production",
    icon: Sparkles,
  },
  {
    type: "RENTAL",
    label: "Rental",
    description: "Existing gown — fitting, adjustments, measurements",
    icon: Shirt,
  },
  {
    type: "PURCHASE",
    label: "Straight purchase",
    description: "Ready-made, off the rack — no fitting needed",
    icon: ShoppingBag,
  },
];

// Step sequence per visit type. "Payment" is the shared endpoint every path
// converges on — only what happens before it differs.
//
// RENTAL: gown selection now happens inside the same step as the
// consultation (one screen: notes + design refs + gown + dates), then
// measurements, then straight to payment — no separate "order" confirmation
// step, since the Order+Rental pair is created when leaving measurements
// and the full rental amount is shown on the payment step itself.
//
// CUSTOM: same shape as RENTAL. Leaving "measurements" creates the real
// Appointment + CustomDesignRequest pair (see custom-design-submit.ts), and
// "payment" is repurposed to show a success card linking into the real
// custom-order flow (quote → payment → production) rather than collecting
// payment here.
export const STEP_SEQUENCE: Record<VisitType, string[]> = {
  CUSTOM: ["customer", "consultation", "measurements", "payment"],
  RENTAL: ["customer", "consultation", "measurements", "payment"],
  PURCHASE: ["customer", "order", "payment"],
};

export const STEP_LABEL: Record<string, string> = {
  customer: "Customer",
  consultation: "Consultation",
  measurements: "Measurements",
  order: "Order",
  payment: "Payment",
};

// Measurement fields are all optional numeric values, entered as text so the
// field can be left blank rather than defaulting to 0.
export type MeasurementValues = Partial<Record<keyof CustomerMeasurement, string>>;

export interface OrderLine {
  key: string;
  product: Product;
  quantity: number;
  size: string;
}
