# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2025-12-19

### Added

- **Generic type support for `runAppJson`**: The response data type can now be customized via generic type parameter
  ```typescript
  interface Product {
    name: string;
    price: number;
    url: string;
  }

  const result = await client.runAppJson<Product>({
    appId: "abc123xyz",
    inputs: [{ key: "url", value: "https://example.com" }]
  });

  // result.data is now typed as Product[]
  if (result.success && result.data) {
    for (const product of result.data) {
      console.log(product.name, product.price); // Fully typed!
    }
  }
  ```

## [0.2.0] - 2025-12-18

### Breaking Changes

- **`runAppJson` response format changed**: The `data` field is now an array of JSON objects (with column names as keys) instead of `{ columns, rows }` structure
  ```typescript
  // Before
  result.data.columns // ["Name", "Price"]
  result.data.rows    // [["Product A", 29.99], ...]

  // After
  result.data // [{ Name: "Product A", Price: 29.99 }, ...]
  ```

### Added

- **`runAppTable` method**: New endpoint for running apps with table-formatted output
  ```typescript
  const result = await client.runAppTable({
    appId: "abc123xyz",
    inputs: [{ key: "url", value: "https://example.com" }]
  });

  if (result.success && result.data) {
    console.log(result.data.columns);   // ["Name", "Price", "URL"]
    console.log(result.data.tableData); // [["Product A", 29.99, "..."], ...]
  }
  ```
- New type exports: `AppJsonRow`, `RunAppRequest`, `RunAppTableData`, `RunAppTableRequest`, `RunAppTableResponse`

## [0.1.0] - 2025-12-17

### Breaking Changes

- **Renamed class**: `NextrowsClient` → `Nextrows`
- **Changed constructor signature**: Now accepts an options object instead of positional arguments
  ```typescript
  // Before
  const client = new NextrowsClient("api-key");
  const client = new NextrowsClient("api-key", { timeout: 60000 });

  // After
  const client = new Nextrows({ apiKey: "api-key" });
  const client = new Nextrows({ apiKey: "api-key", timeout: 60000 });
  ```
- **Renamed interface**: `NextrowsClientOptions` → `NextrowsOptions`

### Added

- **Zod schema support**: The `extract` method now accepts Zod schemas in addition to JSON Schema objects (requires Zod 3.24+)
  ```typescript
  import { z } from "zod/v4";

  const schema = z.array(z.object({
    name: z.string(),
    price: z.number()
  }));

  const result = await client.extract({
    type: "url",
    data: ["https://example.com"],
    schema: schema,
  });
  ```
- Added `JsonSchema` type export for explicit JSON Schema typing

## [0.0.5] and earlier

Initial releases with basic API client functionality.
