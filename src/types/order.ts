import type { Status } from "@/components/dashboard/status-badge";

export type OrderStage = {
  label: string;
  state: "done" | "active" | "upcoming";
};

export type Order = {
  id: string;
  customerName: string;
  item: string;
  size: string;
  total: string;
  balanceDue: string;
  placedDate: string;
  status: Status;
  statusLabel: string;
  stages: OrderStage[];
};