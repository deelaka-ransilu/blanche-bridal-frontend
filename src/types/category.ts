export type CategoryType = "DRESS" | "ACCESSORY";

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  parentId: string | null;
  parentName: string | null;
  createdAt: string;
}