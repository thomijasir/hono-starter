/**
 * Interface representing pagination metadata.
 */
export interface PaginationMeta {
  /** The current page number. */
  page: number;
  /** The number of items per page. */
  limit: number;
  /** The total number of items. */
  total: number;
  /** The total number of pages. */
  totalPages?: number;
}

/**
 * Interface representing a standard API response.
 *
 * @template T - The type of the data payload. Defaults to `unknown`.
 */
export interface ApiResponse<T = unknown> {
  /** Indicates if the request was successful. */
  success: boolean;
  /** A message accompanying the response. */
  message: string;
  /** The data payload of the response. */
  data: T | null;
  /** Optional pagination metadata. */
  meta?: PaginationMeta;
}

/**
 * Interface representing a standard Error API response.
 *
 * @template T - The type of the data payload. Defaults to `unknown`.
 */
export interface ErrorApiResponse<T = unknown> {
  /** Indicates if the request was successful. */
  success: boolean;
  /** A message accompanying the response. */
  message: string;
  /** The data payload of the response. */
  error: T | null;
}
