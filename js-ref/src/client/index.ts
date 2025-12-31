import type { AxiosInstance } from "axios";
import axios from "axios";
import {
  type AppJsonRow,
  type RunAppJsonRequest,
  type RunAppJsonResponse,
  type RunAppTableRequest,
  type RunAppTableResponse,
  runAppJson,
  runAppTable,
} from "../api/apps";
import { type GetCreditsResponse, getCredits } from "../api/credits";
import {
  type ExtractRequest,
  type ExtractResponse,
  extract,
} from "../api/extract";

export type {
  AppCellValue,
  AppInput,
  AppInputValue,
  AppJsonRow,
  RunAppJsonRequest,
  RunAppJsonResponse,
  RunAppRequest,
  RunAppTableData,
  RunAppTableRequest,
  RunAppTableResponse,
} from "../api/apps";
export type { GetCreditsResponse } from "../api/credits";
export type {
  ExtractRequest,
  ExtractResponse,
  ExtractSchema,
  ExtractType,
  JsonSchema,
} from "../api/extract";

const BASE_URL = "https://api.nextrows.com";

/**
 * Configuration options for the Nextrows API client.
 */
export interface NextrowsOptions {
  /**
   * Your Nextrows API key (Bearer token)
   */
  apiKey: string;

  /**
   * Base URL for the API.
   * @default "https://api.nextrows.com"
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;
}

/**
 * Client for interacting with the Nextrows API.
 *
 * @example
 * ```typescript
 * import { Nextrows } from "nextrows";
 *
 * const client = new Nextrows({ apiKey: "your-api-key" });
 *
 * // Extract data from a URL
 * const result = await client.extract({
 *   type: "url",
 *   data: ["https://example.com/products"],
 *   prompt: "Extract all product names and prices"
 * });
 *
 * console.log(result.data);
 * ```
 */
export class Nextrows {
  private readonly client: AxiosInstance;
  readonly apiKey: string;

  /**
   * Creates a new Nextrows API client.
   *
   * @param options - Client configuration including API key
   *
   * @example
   * ```typescript
   * // Basic usage
   * const client = new Nextrows({ apiKey: "sk-nr-your-api-key" });
   *
   * // With custom options
   * const client = new Nextrows({
   *   apiKey: "sk-nr-your-api-key",
   *   timeout: 60000, // 60 second timeout
   * });
   * ```
   */
  constructor(options: NextrowsOptions) {
    const { apiKey, baseUrl = BASE_URL, timeout = 30000 } = options;
    this.apiKey = apiKey;

    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Extract structured data from URLs or text content using AI.
   * @see {@link extract} for detailed documentation
   */
  async extract(request: ExtractRequest): Promise<ExtractResponse> {
    return extract(this.client, request);
  }

  /**
   * Get the current credit balance for the authenticated user.
   * @see {@link getCredits} for detailed documentation
   */
  async getCredits(): Promise<GetCreditsResponse> {
    return getCredits(this.client);
  }

  /**
   * Run a published NextRows app and get JSON output.
   *
   * Executes a published NextRows app with the provided inputs and returns
   * the result as an array of JSON objects. Each object represents a row
   * with column names as keys.
   *
   * @typeParam T - The type of each row in the response data array. Defaults to `AppJsonRow`.
   * @see {@link runAppJson} for detailed documentation
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
  async runAppJson<T = AppJsonRow>(
    request: RunAppJsonRequest,
  ): Promise<RunAppJsonResponse<T>> {
    return runAppJson<T>(this.client, request);
  }

  /**
   * Run a published NextRows app and get table output.
   *
   * Executes a published NextRows app with the provided inputs and returns
   * the result as table data with column headers and rows.
   *
   * @see {@link runAppTable} for detailed documentation
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
  async runAppTable(request: RunAppTableRequest): Promise<RunAppTableResponse> {
    return runAppTable(this.client, request);
  }
}
