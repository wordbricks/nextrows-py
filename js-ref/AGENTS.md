# AGENTS.md

## Project overview
- TypeScript client library for the Nextrows Open API.
- Source lives in `src/`; build output is emitted to `dist/` via `tsup`.
- Published as an ESM package with CJS output for `require`.

## Build and dev commands
- Install deps: `npm install`
- Build library: `npm run build`
- Run playground dev server: `npm run dev`
- Build playground: `npm run build:playground`
- Preview playground: `npm run preview`

## Code style guidelines
- Formatting is enforced with Biome.
- Check formatting: `npm run lint`
- Auto-fix formatting: `npm run format`
- Keep edits in `src/`; avoid hand-editing `dist/` (generated).

## Testing instructions
- Run tests: `npm run test`
- Tests use Vitest; add or update tests when changing behavior.

## Security considerations
- Never commit API keys or secrets; use environment variables or local configs.
- Be cautious with logs or fixtures that may include real tokens or user data.

## Extra instructions
- This repo publishes `dist/` artifacts; regenerate with `npm run build` after code changes.
- The `zod` peer dependency is optional; keep compatibility with Zod v3.24+.
