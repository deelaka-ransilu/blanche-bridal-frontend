export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parentName: string | null;
  createdAt: string;
}