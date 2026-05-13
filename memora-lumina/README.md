# Memora Lumina

> The AI that truly knows you.

Memora Lumina is a premium desktop app that puts an intelligent, persistent memory layer in front of your AI conversations. Bring your own Anthropic API key, chat with Claude through the app, and Memora Lumina quietly builds a powerful 4-layer memory system in the background — surfacing the right context at the right time and giving you a fully searchable **Memory Stream** of everything it has learned about you.

---

## Highlights

- **4-layer memory architecture** — Core Identity, Long-Term, Mid-Term, Short-Term — automatically extracted and consolidated.
- **Smart context injection** — every message is enriched with the most relevant past memories via FTS5 ranking + recency + importance scoring.
- **Memory Stream** — a live, keyword-searchable feed of everything remembered, with real-time highlighting and an auto-jump-to-relevant view while chatting.
- **Split-screen** — drag any tab into a split view to put the Memory Stream next to a chat.
- **Streaming responses, Markdown + code highlighting, conversation pinning/renaming.**
- **Dark / Light theme** with custom accent colors, granular density controls, and instant theme switching.
- **Everything local** — your API key, conversations, and memories live in a SQLite database on your machine. No cloud, no telemetry.

---

## Tech stack

- Electron + React 18 + TypeScript + Tailwind CSS
- Zustand (state) · Framer Motion (animation) · Lucide React (icons)
- better-sqlite3 with **FTS5** for the Memory Stream
- `@anthropic-ai/sdk` for streaming chat completion
- electron-builder → Windows NSIS installer

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run in development (Vite + Electron with HMR)
npm run electron:dev
```

On first launch the app walks you through a 3-step onboarding:

1. **Choose your AI** (Anthropic Claude — more providers coming).
2. **Connect your API key** — verified with a live ping to Anthropic.
3. **Tell me about yourself** — name, primary use case, and an optional initial context block.

You'll then land in the chat. As you talk, memories are extracted in the background and appear in the Memory Stream tab.

> Grab an Anthropic API key at [console.anthropic.com](https://console.anthropic.com/).

---

## Building the Windows installer

```bash
npm run electron:build
```

The signed (or unsigned) NSIS installer is written to `release/Memora-Lumina-Setup-<version>.exe`. It installs per-user, creates desktop + start-menu shortcuts, and leaves your memories database in place on uninstall (unless the user opts out).

---

## Project layout

```
memora-lumina/
├── assets/                      App icons + bundled fonts
├── scripts/build-icons.py       Regenerate icon.png / icon.ico
├── src/
│   ├── main/                    Electron main process
│   │   ├── database.ts          SQLite + FTS5 schema bootstrap
│   │   ├── memory/              4-layer memory engine
│   │   │   ├── engine.ts        Extraction + storage
│   │   │   ├── injector.ts      3-stage smart context injection
│   │   │   ├── search.ts        FTS5 search + relevance ranking
│   │   │   └── layers.ts        Consolidation / promotion
│   │   ├── llm/                 Provider abstraction (Anthropic for v1)
│   │   ├── ipc/                 IPC handlers (chat, memory, settings, profile)
│   │   ├── main.ts              Window + lifecycle
│   │   └── preload.ts           Secure contextBridge API
│   ├── renderer/                React UI
│   │   ├── components/
│   │   │   ├── chat/            Streaming chat with markdown + code highlighting
│   │   │   ├── memory-stream/   Search, highlighting, auto-jump
│   │   │   ├── settings/        9 settings sections, all live-applied
│   │   │   ├── onboarding/      3-step wizard
│   │   │   ├── layout/          Title bar, sidebar, tabs, split pane
│   │   │   ├── splash/          Animated splash
│   │   │   └── common/          Buttons, inputs, modals, etc.
│   │   ├── stores/              Zustand stores (app, chat, memory, settings)
│   │   ├── hooks/               Theme, IPC, keyboard shortcuts
│   │   └── lib/                 Themes, constants, utils
│   └── shared/types.ts          Shared TypeScript types
└── electron-builder config lives in package.json#build
```

---

## Memory system in brief

Every assistant response triggers a lightweight extraction pass against Claude Haiku 4.5, scoring candidate facts on importance (1–10) and assigning a memory layer:

- **Core Identity** — permanent, injected into every prompt (name, values, long-term goals).
- **Long-Term** — months to years (major projects, decisions, deep insights).
- **Mid-Term** — days to weeks (active projects, current goals).
- **Short-Term** — current session (live context).

Background consolidation promotes/demotes memories based on age, importance, and access frequency.

When you send a message, the injector:

1. Extracts keywords from your message.
2. Queries FTS5 + scores results by `bm25 + (importance × 1.5) + recency bonus + access bonus`.
3. Builds a compact system block (always within your configured token budget) and prepends it to the request.

The Memory Stream surfaces this same database with instant search, layer filtering, importance dots, and a one-click "Add to context" button per memory.

---

## License

MIT
