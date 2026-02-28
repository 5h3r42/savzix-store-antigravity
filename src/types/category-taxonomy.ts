export type CategoryOption = {
  id: string;
  name: string;
  path: string | null;
  parent_id: string | null;
  sort_order: number;
};

export type CategoryAssignment = {
  categoryId: string;
  name: string;
  path: string;
  isPrimary: boolean;
  sortOrder: number;
};
