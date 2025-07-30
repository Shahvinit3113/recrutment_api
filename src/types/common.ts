export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DatabaseRecord {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export interface SoftDeleteRecord extends DatabaseRecord {
  is_active: boolean;
}

export type SortDirection = "ASC" | "DESC";

export interface SortOption {
  field: string;
  direction: SortDirection;
}

export interface FilterOption {
  field: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN" | "NOT IN";
  value: any;
}
