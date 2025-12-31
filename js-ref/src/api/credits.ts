import type { AxiosInstance } from "axios";

/**
 * Response from the get credits API endpoint.
 */
export interface GetCreditsResponse {
  /**
   * Whether the request was successful.
   */
  success: boolean;

  /**
   * The credits data (present when success is true).
   */
  data?: {
    /**
     * The number of credits remaining.
     */
    credits: number;
  };

  /**
   * Error message (present when success is false).
   */
  error?: string;
}

/**
 * Get the current credit balance for the authenticated user.
 *
 * @param client - The Axios instance to use for the request
 * @returns Promise resolving to the credits response with success status and credit balance
 * @throws {AxiosError} When the API request fails (e.g., 401 for invalid API key)
 *
 * @example
 * ```typescript
 * const result = await client.getCredits();
 *
 * if (result.success && result.data) {
 *   console.log(`Remaining credits: ${result.data.credits}`);
 * }
 * ```
 */
export async function getCredits(
  client: AxiosInstance,
): Promise<GetCreditsResponse> {
  const response = await client.get<GetCreditsResponse>("/v1/credits");
  return response.data;
}
