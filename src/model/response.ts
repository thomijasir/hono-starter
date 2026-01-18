export type ResponseStatus = "success" | "error";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface ApiResponse<T = unknown> {
  status: ResponseStatus;
  message: string;
  data: T | null;
  meta?: PaginationMeta;
}
