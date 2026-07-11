<div align="center">
  <br/>
  <img width="120" src="public/logo.svg" alt="AutoDoc AI Logo" />
  <h1 align="center">AutoDoc AI</h1>
  <p align="center">
    <strong>Intelligent API documentation generator</strong><br/>
    Connect a GitHub repository → AST analysis → Gemini-powered docs
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Gemini_2.5--Flash-8E75B2?logo=googlegemini" alt="Gemini 2.5 Flash" />
  </p>
</div>

---

## Overview

AutoDoc AI is a browser-based tool that automatically generates API documentation from any public GitHub repository. It combines static analysis (AST parsing) with Google Gemini's LLM to produce structured, human-readable documentation for Express/FastAPI-style backends.

Everything runs **client-side** — no backend server, no data leaves your browser except the API call to Gemini.

---

## Features

- **GitHub integration** — authenticate with a PAT, browse your repos, auto-discover API files
- **AST analysis** — parses JavaScript/TypeScript with `@babel/parser` to detect routes, functions, classes and imports
- **LLM generation** — sends code to Gemini 2.5 Flash with structured output (JSON schema) for consistent docs
- **Batch scanning** — scan up to 50 files per project, auto-generate docs for the most relevant 10
- **Export** — download documentation as Markdown, HTML report, or raw JSON
- **Mock mode** — works without an API key using simulated responses (useful for demo/trial)

---

## How it works

```
GitHub Repo  ──→  File Discovery (Git Trees API)
                       │
                       ▼
            AST Analysis (babel/parser)
                       │
                       ▼
            Gemini 2.5 Flash (LLM)
                       │
                       ▼
            Structured Documentation
                       │
               ┌───────┴───────┐
               ▼               ▼
          Export (.md)    Preview in UI
          Export (.html)
          Export (.json)
```

1. **Authenticate** with a GitHub Personal Access Token (scopes: `repo`, `read:user`)
2. **Select a repository** from your GitHub account
3. **Auto-scan** discovers API-like files using path heuristics (`routes/`, `api/`, `server.js`, etc.)
4. Each file is parsed with `@babel/parser` to extract routes, functions, classes and imports
5. The code + AST metadata is sent to **Gemini 2.5 Flash** which returns structured JSON documentation
6. View consolidated docs or drill into individual files — export when ready

---

## Quick start

### Prerequisites

- **Node.js** >= 18
- A **Gemini API key** (get one at [aistudio.google.com](https://aistudio.google.com/apikey))
- A **GitHub Personal Access Token** with `repo` and `read:user` scopes ([generate one](https://github.com/settings/tokens/new?description=AutoDoc%20AI%20(Browser)&scopes=repo,read:user))

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd autodoc-ai

# Install dependencies
npm install

# Set your Gemini API key
echo "GEMINI_API_KEY=AIza..." > .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** Without a valid Gemini API key (`AIza...` prefix), the app falls back to mock data. You can explore the full UI, but the generated documentation will be simulated.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `http://0.0.0.0:3000` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Bundler | Vite 6 |
| Styling | Tailwind CSS 3 (PostCSS) |
| Routing | React Router 7 |
| AST Parser | `@babel/parser` (plugins: typescript, jsx, classProperties, decorators) |
| LLM | `@google/genai` SDK — Gemini 2.5 Flash (structured output via `responseSchema`) |
| Icons | Lucide React |
| GitHub API | REST API via `fetch` (Git Trees, blob content) |

---

## Project structure

```
src/
├── main.tsx              # Entry point (BrowserRouter wrapper)
├── App.tsx               # Route definitions + auth guards
├── index.css             # Tailwind directives + global styles
├── types.ts              # Shared TypeScript types
├── contexts/
│   └── AuthContext.tsx   # Auth state (token, user, login/logout)
├── pages/
│   ├── LoginPage.tsx     # GitHub PAT login form
│   ├── DashboardPage.tsx # Repository list with search/filter
│   ├── EditorPage.tsx    # File browser + analysis + doc viewer
│   └── NotFoundPage.tsx  # 404 catch-all
├── components/
│   ├── Navbar.tsx        # Top navigation (auth-aware)
│   ├── DocViewer.tsx     # Documentation renderer (single/project view)
│   ├── EndpointCard.tsx  # Expandable endpoint detail card
│   └── TerminalLog.tsx   # Scrollable log output terminal
└── services/
    ├── githubService.ts  # GitHub REST API (auth, repos, files, content)
    ├── astService.ts     # babel/parser AST analysis + regex fallback
    ├── geminiService.ts  # Gemini LLM integration + mock fallback
    └── exportService.ts  # Markdown/HTML/JSON blob download
```

---

## Limitations

- **Client-side only** — all API calls originate from the browser. GitHub PAT is stored in `localStorage`. There is no backend.
- **No OAuth** — GitHub SSO requires a backend; PAT-based auth is used instead.
- **No test suite** — the project does not have test, lint, or typecheck scripts configured.
- **Batch limits** — scanning is capped at 50 files examined and 10 docs generated per project to avoid rate limits and UI freezes.
- **Code truncation** — files larger than ~30k characters are truncated before being sent to Gemini.

---

## License

This project is provided for demonstration and educational purposes.
