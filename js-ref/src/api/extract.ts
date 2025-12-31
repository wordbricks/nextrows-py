import type { AxiosInstance } from "axios";

/**
 * The type of data source to extract from.
 * - `"url"` - Extract data from web page URLs
 * - `"text"` - Extract data from raw text content
 */
export type ExtractType = "url" | "text";

/**
 * JSON Schema definition for structured extraction output.
 */
export interface JsonSchema {
  [key: string]: unknown;
}

/**
 * Generic Zod schema type that works with both Zod v3 and v4.
 * We use a structural type to avoid coupling to specific Zod versions.
 */
export interface ZodLike {
  safeParse: (data: unknown) => unknown;
  _def: unknown;
}

/**
 * Schema for structured extraction output.
 * Can be either a JSON Schema object or a Zod schema.
 *
 * @example
 * ```typescript
 * // Using JSON Schema
 * const schema: ExtractSchema = {
 *   type: "array",
 *   items: {
 *     type: "object",
 *     properties: {
 *       name: { type: "string" },
 *       price: { type: "number" }
 *     }
 *   }
 * };
 *
 * // Using Zod schema (requires Zod 3.24+)
 * import { z } from "zod/v4";
 *
 * const schema = z.array(z.object({
 *   name: z.string(),
 *   price: z.number()
 * }));
 * ```
 */
export type ExtractSchema = JsonSchema | ZodLike;

/**
 * Check if a value is a Zod schema.
 */
function isZodSchema(schema: ExtractSchema): schema is ZodLike {
  return (
    schema !== null &&
    typeof schema === "object" &&
    ("_def" in schema || "_zod" in schema) &&
    "safeParse" in schema &&
    typeof (schema as ZodLike).safeParse === "function"
  );
}

// Cache the zod module to avoid repeated dynamic imports
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let zodModule: { toJSONSchema?: (schema: any) => JsonSchema } | null = null;

/**
 * Convert a schema to JSON Schema format.
 * If the schema is a Zod schema, it will be converted using Zod's toJSONSchema().
 */
async function convertToJsonSchema(schema: ExtractSchema): Promise<JsonSchema> {
  if (isZodSchema(schema)) {
    // Try to use cached zod module first
    if (zodModule?.toJSONSchema) {
      return zodModule.toJSONSchema(schema);
    }

    // Dynamically import zod/v4 (works in both ESM and CJS environments)
    try {
      const z = await import("zod/v4");
      if (z && typeof z.toJSONSchema === "function") {
        zodModule = z;
        // Cast to any since we're bridging Zod v3 types with v4's toJSONSchema
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return z.toJSONSchema(schema as any) as JsonSchema;
      }
    } catch {
      // import failed, zod/v4 not available
    }

    throw new Error(
      "Zod schema conversion requires Zod 3.24+ with zod/v4 subpath. " +
        "Please install Zod 3.24+ or use a JSON Schema object directly.",
    );
  }
  return schema;
}

/**
 * Request parameters for the extract API endpoint.
 */
export interface ExtractRequest {
  /**
   * The type of data source to extract from.
   * - `"url"` - Provide valid web page URLs in the `data` array
   * - `"text"` - Provide raw text content in the `data` array
   */
  type: ExtractType;

  /**
   * Array of data sources to extract from.
   * - If `type` is `"url"`, provide valid URLs (e.g., `["https://example.com"]`)
   * - If `type` is `"text"`, provide raw text content
   *
   * @minItems 1
   * @maxItems 20
   */
  data: string[];

  /**
   * Optional natural language prompt describing what data to extract.
   *
   * @maxLength 2000
   * @example "Extract the top 10 companies from the list in a table format."
   */
  prompt?: string;

  /**
   * Optional schema for consistent and predictable extraction results.
   * Can be a JSON Schema object or a Zod schema (requires Zod 3.24+).
   * If not provided, the system will auto-generate the structure based on the data.
   *
   * @example
   * ```typescript
   * // Using JSON Schema
   * schema: {
   *   type: "array",
   *   items: {
   *     type: "object",
   *     properties: {
   *       name: { type: "string" },
   *       price: { type: "number" }
   *     }
   *   }
   * }
   *
   * // Using Zod schema (requires Zod 3.24+)
   * import { z } from "zod/v4";
   * schema: z.array(z.object({
   *   name: z.string(),
   *   price: z.number()
   * }))
   * ```
   */
  schema?: ExtractSchema;
}

/**
 * Response from the extract API endpoint.
 */
export interface ExtractResponse {
  /**
   * Whether the request was successful.
   * Always `true` for successful responses.
   */
  success: boolean;

  /**
   * The extracted data.
   * Structure depends on the provided schema or is auto-generated based on the data.
   */
  data?: unknown;
}

/**
 * Extract structured data from URLs or text content using AI.
 *
 * This endpoint processes the provided data sources and extracts structured
 * information based on the optional prompt and schema.
 *
 * @param client - The Axios instance to use for the request
 * @param request - The extraction request parameters
 * @returns Promise resolving to the extraction response with success status and extracted data
 * @throws {AxiosError} When the API request fails (e.g., 401 for invalid API key)
 *
 * @example
 * ```typescript
 * // Extract from URL with a prompt
 * const result = await client.extract({
 *   type: "url",
 *   data: ["https://example.com/products"],
 *   prompt: "Extract product names and prices as a table"
 * });
 *
 * // Extract from text with a schema for consistent output
 * const result = await client.extract({
 *   type: "text",
 *   data: ["Product A costs $10, Product B costs $20"],
 *   schema: {
 *     type: "array",
 *     items: {
 *       type: "object",
 *       properties: {
 *         name: { type: "string" },
 *         price: { type: "number" }
 *       }
 *     }
 *   }
 * });
 *
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export async function extract(
  client: AxiosInstance,
  request: ExtractRequest,
): Promise<ExtractResponse> {
  // Convert Zod schema to JSON Schema if needed
  const payload = request.schema
    ? { ...request, schema: await convertToJsonSchema(request.schema) }
    : request;

  const response = await client.post<ExtractResponse>("/v1/extract", payload);
  return response.data;
}
