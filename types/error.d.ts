export interface ErrorResponse {
  error: string;
}

export interface InventoryError {
  product_id: number;
  name?: string;
  requested?: number;
  available?: number;
  error: string;
}

export interface InventoryErrorResponse {
  errors: InventoryError[];
}

export interface RateLimitErrorResponse {
  error: string;
  retry_after: number;
}

export interface ValidationErrorResponse {
  errors: Record<string, string[]>;
}
