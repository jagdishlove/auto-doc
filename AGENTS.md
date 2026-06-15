# AutoDoc AI — Agent Guide

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Dev server at http://0.0.0.0:3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

No test, lint, or typecheck scripts exist.

## Env & Setup

- `GEMINI_API_KEY` in `.env.local` — loaded by Vite at build time, injected via `define` as `process.env.API_KEY` / `process.env.GEMINI_API_KEY`
- `.env.local` is gitignored (via `*.local` in `.gitignore`). Must be created from scratch per clone.
- Without a valid key (`AIza...` prefix), the app silently falls back to mock data (`GeneratedDoc.isMock = true`).

## Architecture

- **Entry**: `index.html` → `src/main.tsx` → `src/App.tsx`. Single-page React 19 app.
- **Routing**: React Router v7. Routes: `/` (login), `/dashboard`, `/editor/:owner/:repo`, `*` (404). Protected routes redirect to `/` if unauthenticated. Auth state passed via `AuthContext`.
- **Pages** (`src/pages/`): `LoginPage`, `DashboardPage`, `EditorPage`, `NotFoundPage`. Each manages its own local state; shared auth state from `AuthContext`.
- **Components** (`src/components/`): `Navbar` (auth-aware, extracted), `DocViewer` (doc rendering with project/file views), `EndpointCard` (expandable endpoint detail card), `TerminalLog` (scrollable log output).
- **Styling**: Tailwind CSS v3 via PostCSS (`tailwind.config.js`, `postcss.config.js`). Fonts: Inter (sans), JetBrains Mono (mono) from Google Fonts.
- **Path alias**: `@/` maps to `./src` (both `tsconfig.json` and `vite.config.ts`).
- **AstAnalysis** runs yielded via `setTimeout(..., 100)` to avoid UI freeze; falls back to regex if `@babel/parser` fails.

## Services (`src/services/`)

- **`githubService.ts`** — GitHub REST API via `fetch`. Uses PAT (scopes: `repo, read:user`). Token stored in `localStorage('gh_auto_doc_token')`. File discovery uses heuristics (`routes/`, `api/`, `server.js` etc.) with exclusions (`node_modules`, `.test.`, `.d.ts`, `dist/`, `config/`).
- **`astService.ts`** — `@babel/parser` with plugins: `typescript`, `jsx`, `classProperties`, `decorators-legacy`, `exportDefaultFrom`. Detects Express-style route calls (`.get()`, `.post()`, etc.) and standard code structure.
- **`geminiService.ts`** — `@google/genai` SDK, model `gemini-2.5-flash`. Structured output via `responseSchema`. Code truncated to 30k chars. Falls back to mock on 400/API key errors.
- **`exportService.ts`** — Markdown, HTML report, or JSON export via blob download.

## Key Conventions

- No backend — everything runs client-side in the browser.
- No tests, no CI/CD, no typechecking configured.
- GitHub file content fetched via Git Trees API (recursive tree, then blob content as base64).
- Batch scan limit: 50 files examined, 10 docs generated max per project scan.
- EditorPage receives `Repository` data via React Router `location.state` when navigating from Dashboard. Direct URL access constructs a minimal repo object from route params.
