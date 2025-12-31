# @wordbricks/nextrows-client

[![npm version](https://img.shields.io/npm/v/@wordbricks/nextrows-client.svg)](https://www.npmjs.com/package/@wordbricks/nextrows-client)

TypeScript client for Nextrows Open API.

## Getting Started

### API Key

To use this client, you need a NextRows API key. Create one at:

**[NextRows Dashboard](https://nextrows.com/dashboard/overview)** → Create API Key

### Documentation

For complete API documentation, visit: **[NextRows API Docs](https://nextrows.com/docs/api)**

## Installation

```bash
npm install @wordbricks/nextrows-client
```

```bash
yarn add @wordbricks/nextrows-client
```

```bash
pnpm add @wordbricks/nextrows-client
```

```bash
bun add @wordbricks/nextrows-client
```

## Quick Start

```typescript
import { Nextrows } from "@wordbricks/nextrows-client";

const client = new Nextrows({ apiKey: "sk-nr-your-api-key" });
```

## API Methods

### Extract Data

Extract structured data from URLs or text content using AI.

```typescript
const result = await client.extract({
  type: "url",
  data: ["https://example.com/products"],
  prompt: "Extract all product names and prices",
});

if (result.success) {
  console.log(result.data);
}
```

#### Using Zod Schema

You can use Zod schemas to define the extraction output structure (requires Zod 3.24+):

```typescript
import { z } from "zod/v4";

const productSchema = z.array(
  z.object({
    name: z.string(),
    price: z.number(),
  })
);

const result = await client.extract({
  type: "url",
  data: ["https://example.com/products"],
  schema: productSchema,
});
```

### Run App

Run a published NextRows app and get JSON output.

```typescript
const result = await client.runAppJson({
  appId: "abc123xyz",
  inputs: [
    { key: "url", value: "https://example.com/products" },
    { key: "maxItems", value: 10 },
  ],
});

if (result.success && result.data) {
  console.log("Columns:", result.data.columns);
  console.log("Rows:", result.data.rows);
  console.log(`Run ID: ${result.runId}`);
  console.log(`Elapsed time: ${result.elapsedTime}ms`);
}
```

### Get Credits

Get the current credit balance for the authenticated user.

```typescript
const result = await client.getCredits();

if (result.success && result.data) {
  console.log(`Remaining credits: ${result.data.credits}`);
}
```

## Configuration

```typescript
const client = new Nextrows({
  apiKey: "sk-nr-your-api-key",
  baseUrl: "https://api.nextrows.com", // default
  timeout: 30000, // default, in milliseconds
});
```

## Features

- **Fully Typed**: All request and response types are exported for TypeScript support
- **Simple API**: Easy-to-use methods that mirror the REST API
- **Configurable**: Custom base URL and timeout options
- **Zod Support**: Use Zod schemas for type-safe extraction (optional, requires Zod 3.24+)
