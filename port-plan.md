# Nextrows Python Client Port Plan

## Goal
Port the TypeScript client in `js-ref/` to a Python package suitable for publishing on PyPI.

## Scope (feature parity)
- `extract` endpoint (`/v1/extract`) with optional schema conversion
- `getCredits` endpoint (`/v1/credits`)
- `runAppJson` endpoint (`/v1/apps/run/json`)
- `runAppTable` endpoint (`/v1/apps/run/table`)
- Public exports mirroring TS types and client interface

## Proposed Python API surface
- Package name: `nextrows` (import path `nextrows`)
- `Nextrows` client class with:
  - `extract(request: ExtractRequest) -> ExtractResponse`
  - `get_credits() -> GetCreditsResponse`
  - `run_app_json(request: RunAppJsonRequest) -> RunAppJsonResponse`
  - `run_app_table(request: RunAppTableRequest) -> RunAppTableResponse`
- Requests/response typing via `TypedDict` + type aliases for clarity
- Default base URL `https://api.nextrows.com`
- Default timeout 30s (accept float seconds; document difference vs TS milliseconds)

## Dependencies
- `requests` for HTTP (simple, widely available)
- Optional: `pydantic` (extra `schema`) to support `BaseModel` -> JSON Schema conversion
  - Accept JSON Schema dicts directly if no pydantic installed

## Files to create
- `pyproject.toml` (PEP 621 metadata, build system)
- `README.md` (usage, install, API docs, schema support)
- `nextrows/__init__.py` (exports)
- `nextrows/client.py`
- `nextrows/api/apps.py`
- `nextrows/api/credits.py`
- `nextrows/api/extract.py`
- `nextrows/types.py` (shared TypedDicts/type aliases)
- `tests/` (basic request/response shape tests; optional if time)

## Step-by-step execution
1. Create Python package skeleton and typing definitions.
2. Implement HTTP client + endpoints with tests/examples.
3. Add README and packaging metadata for PyPI (name, version, classifiers).
4. (Optional) Add CI/test config and build instructions.

## Open questions
- Desired PyPI package name (assume `nextrows` unless specified).
- Should the client expose async methods (requires `httpx`/`aiohttp`)?
- Should timeout accept milliseconds like TS, or seconds (Python default)?
