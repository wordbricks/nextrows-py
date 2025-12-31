# AGENTS.md

## Project overview
- Python client library for the Nextrows Open API.
- Source lives in `src/nextrows/`.
- Package name on PyPI: `nextrows-py` (import path `nextrows`).

## Build and dev commands
- Create venv: `uv venv`
- Install deps: `uv pip install -e ".[test]"`
- Run tests: `uv run pytest`
- Build package: `uv run python -m build`

## Code style guidelines
- Keep modules small and focused; reuse shared helpers in `src/nextrows/api/`.
- Preserve ASCII-only edits unless the file already contains Unicode.

## Testing instructions
- Run `pytest` before changes are finalized.
- Keep tests minimal and focused on payload/serialization behavior.

## Security considerations
- Never commit API keys or secrets; use environment variables or local configs.
- Avoid logging sensitive request payloads.

## Extra instructions
- Sync docs/examples in `README.md` with any public API changes.
- Async client requires `httpx` and lives alongside the sync client in `src/nextrows/client.py`.
