import nock from "nock";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod/v4";
import type {
  ExtractResponse,
  RunAppJsonResponse,
  RunAppTableResponse,
} from "./index";
import { Nextrows } from "./index";

const BASE_URL = "https://api.nextrows.com";

describe("Nextrows", () => {
  let client: Nextrows;
  const apiKey = "sk-nr-test-api-key";

  beforeEach(() => {
    client = new Nextrows({ apiKey });
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should be instantiated with api key", () => {
    expect(client).toBeInstanceOf(Nextrows);
    expect(client.apiKey).toBe(apiKey);
  });

  it("should allow custom base URL", () => {
    const customClient = new Nextrows({
      apiKey,
      baseUrl: "https://custom.api.com",
    });
    expect(customClient).toBeInstanceOf(Nextrows);
  });

  describe("extract", () => {
    it("should call /v1/extract with correct parameters", async () => {
      const mockResponse: ExtractResponse = {
        success: true,
        data: [
          { name: "Product 1", price: "$10.00" },
          { name: "Product 2", price: "$20.00" },
        ],
      };

      const scope = nock(BASE_URL)
        .post("/v1/extract", {
          type: "url",
          data: ["https://example.com"],
          prompt: "Extract product names and prices",
        })
        .matchHeader("Authorization", `Bearer ${apiKey}`)
        .matchHeader("Content-Type", "application/json")
        .reply(200, mockResponse);

      const response = await client.extract({
        type: "url",
        data: ["https://example.com"],
        prompt: "Extract product names and prices",
      });

      expect(scope.isDone()).toBe(true);
      expect(response).toEqual(mockResponse);
    });

    it("should handle text type extraction", async () => {
      const mockResponse: ExtractResponse = {
        success: true,
        data: { title: "Hello World" },
      };

      const scope = nock(BASE_URL)
        .post("/v1/extract", {
          type: "text",
          data: ["The title is Hello World"],
          prompt: "Extract the title",
        })
        .reply(200, mockResponse);

      const response = await client.extract({
        type: "text",
        data: ["The title is Hello World"],
        prompt: "Extract the title",
      });

      expect(scope.isDone()).toBe(true);
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ title: "Hello World" });
    });

    it("should support JSON schema parameter", async () => {
      const mockResponse: ExtractResponse = {
        success: true,
        data: [
          ["Product 1", "$10.00"],
          ["Product 2", "$20.00"],
        ],
      };

      const schema = {
        type: "array",
        items: {
          type: "array",
          items: { type: "string" },
        },
      };

      const scope = nock(BASE_URL)
        .post("/v1/extract", {
          type: "url",
          data: ["https://example.com"],
          schema,
        })
        .reply(200, mockResponse);

      const response = await client.extract({
        type: "url",
        data: ["https://example.com"],
        schema,
      });

      expect(scope.isDone()).toBe(true);
      expect(response.success).toBe(true);
      expect(response.data).toEqual([
        ["Product 1", "$10.00"],
        ["Product 2", "$20.00"],
      ]);
    });

    it("should support Zod schema parameter", async () => {
      const mockResponse: ExtractResponse = {
        success: true,
        data: [
          { name: "Product 1", price: 10 },
          { name: "Product 2", price: 20 },
        ],
      };

      const zodSchema = z.array(
        z.object({
          name: z.string(),
          price: z.number(),
        }),
      );

      // The Zod schema should be converted to JSON Schema
      const scope = nock(BASE_URL)
        .post("/v1/extract", (body) => {
          // Verify the schema was converted to JSON Schema format
          expect(body.schema).toBeDefined();
          expect(body.schema.type).toBe("array");
          expect(body.schema.items.type).toBe("object");
          expect(body.schema.items.properties.name.type).toBe("string");
          expect(body.schema.items.properties.price.type).toBe("number");
          return true;
        })
        .reply(200, mockResponse);

      const response = await client.extract({
        type: "url",
        data: ["https://example.com"],
        schema: zodSchema,
      });

      expect(scope.isDone()).toBe(true);
      expect(response.success).toBe(true);
      expect(response.data).toEqual([
        { name: "Product 1", price: 10 },
        { name: "Product 2", price: 20 },
      ]);
    });

    it("should handle API errors", async () => {
      nock(BASE_URL).post("/v1/extract").reply(401, {
        error: "Unauthorized",
        message: "Invalid API key",
      });

      await expect(
        client.extract({
          type: "url",
          data: ["https://example.com"],
          prompt: "Extract data",
        }),
      ).rejects.toThrow();
    });
  });

  describe("runAppJson", () => {
    it("should call /v1/apps/run/json with correct parameters", async () => {
      const mockResponse: RunAppJsonResponse = {
        success: true,
        data: [
          { Name: "Product A", Price: 29.99, URL: "https://example.com/a" },
          { Name: "Product B", Price: 49.99, URL: "https://example.com/b" },
        ],
        runId: "run_abc123",
        elapsedTime: 2500,
      };

      const scope = nock(BASE_URL)
        .post("/v1/apps/run/json", {
          appId: "abc123xyz",
          inputs: [{ key: "max-items", value: 10 }],
        })
        .matchHeader("Authorization", `Bearer ${apiKey}`)
        .matchHeader("Content-Type", "application/json")
        .reply(200, mockResponse);

      const response = await client.runAppJson({
        appId: "abc123xyz",
        inputs: [{ key: "max-items", value: 10 }],
      });

      expect(scope.isDone()).toBe(true);
      expect(response.success).toBe(true);
      expect(response.data).toEqual([
        { Name: "Product A", Price: 29.99, URL: "https://example.com/a" },
        { Name: "Product B", Price: 49.99, URL: "https://example.com/b" },
      ]);
      expect(response.runId).toBe("run_abc123");
      expect(response.elapsedTime).toBe(2500);
    });

    it("should handle app not found error", async () => {
      nock(BASE_URL).post("/v1/apps/run/json").reply(404, {
        success: false,
        error: "App not found",
      });

      await expect(
        client.runAppJson({
          appId: "invalid-app",
          inputs: [],
        }),
      ).rejects.toThrow();
    });
  });

  describe("runAppTable", () => {
    it("should call /v1/apps/run/table with correct parameters", async () => {
      const mockResponse: RunAppTableResponse = {
        success: true,
        data: {
          columns: ["Name", "Price", "URL"],
          tableData: [
            ["Product A", 29.99, "https://example.com/a"],
            ["Product B", 49.99, "https://example.com/b"],
          ],
        },
        runId: "run_abc123",
        elapsedTime: 2500,
      };

      const scope = nock(BASE_URL)
        .post("/v1/apps/run/table", {
          appId: "abc123xyz",
          inputs: [{ key: "url", value: "https://example.com" }],
        })
        .matchHeader("Authorization", `Bearer ${apiKey}`)
        .matchHeader("Content-Type", "application/json")
        .reply(200, mockResponse);

      const response = await client.runAppTable({
        appId: "abc123xyz",
        inputs: [{ key: "url", value: "https://example.com" }],
      });

      expect(scope.isDone()).toBe(true);
      expect(response.success).toBe(true);
      expect(response.data?.columns).toEqual(["Name", "Price", "URL"]);
      expect(response.data?.tableData).toEqual([
        ["Product A", 29.99, "https://example.com/a"],
        ["Product B", 49.99, "https://example.com/b"],
      ]);
      expect(response.runId).toBe("run_abc123");
      expect(response.elapsedTime).toBe(2500);
    });

    it("should handle credits exhausted error", async () => {
      nock(BASE_URL).post("/v1/apps/run/table").reply(402, {
        success: false,
        error: "Credits exhausted",
      });

      await expect(
        client.runAppTable({
          appId: "abc123xyz",
          inputs: [],
        }),
      ).rejects.toThrow();
    });
  });
});
