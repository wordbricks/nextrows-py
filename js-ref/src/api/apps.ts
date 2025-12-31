import type { AxiosInstance } from "axios";

/**
 * Input value type for app parameters.
 */
export type AppInputValue = string | number | boolean;

/**
 * Input parameter for running an app.
 */
export interface AppInput {
  /**
   * The input parameter key.
   * @example "url"
   */
  key: string;

  /**
   * The input parameter value.
   * @example "https://example.com"
   */
  value: AppInputValue;
}

/**
 * Request parameters for running an app.
 */
export interface RunAppRequest {
  /**
   * The ID of the app to run.
   * @example "abc123xyz"
   */
  appId: string;

  /**
   * Array of input parameters for the app. Each input has a key-value pair.
   *
   * @example
   * ```typescript
   * [
   *   { key: "url", value: "https://example.com/products" },
   *   { key: "maxItems", value: 10 }
   * ]
   * ```
   */
  inputs: AppInput[];
}

/**
 * Cell value type for app output data.
 */
export type AppCellValue = string | number | boolean | null;

/**
 * A row of JSON data from an app run (column names as keys).
 */
export type AppJsonRow = Record<string, AppCellValue>;

/**
 * Request parameters for the run app JSON API endpoint.
 */
export type RunAppJsonRequest = RunAppRequest;

/**
 * Response from the run app JSON API endpoint.
 *
 * @typeParam T - The type of each row in the data array. Defaults to `AppJsonRow`.
 */
export interface RunAppJsonResponse<T = AppJsonRow> {
  /**
   * Whether the request was successful.
   */
  success: boolean;

  /**
   * Array of JSON objects representing the output data.
   * Each object represents a row with column names as keys.
   *
   * @example
   * ```typescript
   * [
   *   { "Name": "Product A", "Price": 29.99, "URL": "https://example.com/product-a" },
   *   { "Name": "Product B", "Price": 49.99, "URL": "https://example.com/product-b" }
   * ]
   * ```
   */
  data?: T[];

  /**
   * Unique identifier for this run.
   * @example "run_abc123"
   */
  runId?: string;

  /**
   * Time taken to execute the app in milliseconds.
   * @example 2500
   */
  elapsedTime?: number;

  /**
   * Error message (present when success is false).
   */
  error?: string;
}

/**
 * Request parameters for the run app table API endpoint.
 */
export type RunAppTableRequest = RunAppRequest;

/**
 * The table data structure from an app run.
 */
export interface RunAppTableData {
  /**
   * Column headers of the result table.
   * @example ["Name", "Price", "URL"]
   */
  columns: string[];

  /**
   * Rows of data in the result table.
   * Each row is an array of cell values corresponding to the columns.
   *
   * @example
   * ```typescript
   * [
   *   ["Product A", 29.99, "https://example.com/product-a"],
   *   ["Product B", 49.99, "https://example.com/product-b"]
   * ]
   * ```
   */
  tableData: AppCellValue[][];
}

/**
 * Response from the run app table API endpoint.
 */
export interface RunAppTableResponse {
  /**
   * Whether the request was successful.
   */
  success: boolean;

  /**
   * Table data with column headers and rows (present when success is true).
   */
  data?: RunAppTableData;

  /**
   * Unique identifier for this run.
   * @example "run_abc123"
   */
  runId?: string;

  /**
   * Time taken to execute the app in milliseconds.
   * @example 2500
   */
  elapsedTime?: number;

  /**
   * Error message (present when success is false).
   */
  error?: string;
}

/**
 * Run a published NextRows app and get JSON output.
 *
 * Executes a published NextRows app with the provided inputs and returns
 * the result as an array of JSON objects. Each object represents a row
 * with column names as keys.
 *
 * @typeParam T - The type of each row in the response data array. Defaults to `AppJsonRow`.
 * @param client - The Axios instance to use for the request
 * @param request - The run app request parameters
 * @returns Promise resolving to the app run response with success status and JSON data
 * @throws {AxiosError} When the API request fails (e.g., 401 for invalid API key, 402 for credits exhausted, 404 for app not found)
 *
 * @example
 * ```typescript
 * // With default type
 * const result = await client.runAppJson({
 *   appId: "abc123xyz",
 *   inputs: [
 *     { key: "url", value: "https://example.com/products" },
 *     { key: "maxItems", value: 10 }
 *   ]
 * });
 *
 * if (result.success && result.data) {
 *   for (const row of result.data) {
 *     console.log(row.Name, row.Price);
 *   }
 * }
 *
 * // With custom type
 * interface Product {
 *   name: string;
 *   price: number;
 *   url: string;
 * }
 *
 * const typedResult = await client.runAppJson<Product>({
 *   appId: "abc123xyz",
 *   inputs: [{ key: "url", value: "https://example.com/products" }]
 * });
 *
 * if (typedResult.success && typedResult.data) {
 *   for (const product of typedResult.data) {
 *     console.log(product.name, product.price); // Fully typed!
 *   }
 * }
 * ```
 */
export async function runAppJson<T = AppJsonRow>(
  client: AxiosInstance,
  request: RunAppJsonRequest,
): Promise<RunAppJsonResponse<T>> {
  const response = await client.post<RunAppJsonResponse<T>>(
    "/v1/apps/run/json",
    request,
  );
  return response.data;
}

/**
 * Run a published NextRows app and get table output.
 *
 * Executes a published NextRows app with the provided inputs and returns
 * the result as table data with column headers and rows.
 *
 * @param client - The Axios instance to use for the request
 * @param request - The run app request parameters
 * @returns Promise resolving to the app run response with success status and table data
 * @throws {AxiosError} When the API request fails (e.g., 401 for invalid API key, 402 for credits exhausted, 404 for app not found)
 *
 * @example
 * ```typescript
 * const result = await client.runAppTable({
 *   appId: "abc123xyz",
 *   inputs: [
 *     { key: "url", value: "https://example.com/products" },
 *     { key: "maxItems", value: 10 }
 *   ]
 * });
 *
 * if (result.success && result.data) {
 *   console.log("Columns:", result.data.columns);
 *   for (const row of result.data.tableData) {
 *     console.log(row);
 *   }
 * }
 * ```
 */
export async function runAppTable(
  client: AxiosInstance,
  request: RunAppTableRequest,
): Promise<RunAppTableResponse> {
  const response = await client.post<RunAppTableResponse>(
    "/v1/apps/run/table",
    request,
  );
  return response.data;
}
