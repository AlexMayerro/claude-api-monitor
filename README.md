# Claude Monitor

A modern, always-on-top Windows desktop widget for monitoring your Anthropic
Claude API usage, costs, and rate limits in real time.

![Built with Electron + React + Tailwind](https://img.shields.io/badge/built%20with-Electron%20%2B%20React-6C8CFF)

## Features

- Connect with a standard Anthropic API key, or unlock the full dashboard with an Admin API key
- **Subscription** tab: organization info, spend & costs, usage history with stacked area charts, team members, workspaces, and active API keys
- **API** tab: live connection status, rate-limit progress bars per model family, available models with capability icons, and endpoint status
- **Both** tab: everything in one continuous, scrollable view
- Dark / light / system theme with smooth transitions
- Always-on-top toggle, adjustable window opacity, compact mode
- System tray icon with show/hide, refresh, settings, quit
- Persistent window position and tab selection
- Encrypted local storage for API keys via Electron's `safeStorage`
- Auto-refresh every 30s–5min; rate-limit probe every 2–30 min
- Quick stats footer with today's input/output tokens and estimated cost

## Tech Stack

- Electron 33 (frameless window, custom title bar, system tray)
- React 18 + TypeScript
- Vite for the renderer
- Tailwind CSS 3 with CSS variables for themes
- Zustand for state management
- Recharts for usage and cost visualizations
- Lucide React for icons
- electron-store + safeStorage for persisted, encrypted settings
- Axios for HTTP calls (proxied through the main process to avoid CORS)
- electron-builder NSIS target for the Windows installer (.exe)

## Getting Started

### Prerequisites

- Node.js 18 or newer
- An Anthropic API key (`sk-ant-api...`)
- Optionally, an Admin API key (`sk-ant-admin...`) — required for organization
  details, usage history, and cost reports. Admin keys are only available for
  organization accounts.

### Install

```bash
npm install
```

### Develop

```bash
npm run electron:dev
```

This launches Vite at `http://localhost:5173` and opens the Electron window
with hot reload for the renderer.

### Build the installer

```bash
npm run electron:build
```

Produces `dist/Claude Monitor Setup 1.0.0.exe`. The NSIS installer creates a
desktop shortcut and a Start Menu entry, and supports clean uninstall.

## Account Connection

The first launch shows a guided "Connect Anthropic Account" wizard:

1. Paste your standard API key (`sk-ant-api...`). The app calls
   `GET /v1/models` to verify the key.
2. Optionally paste an Admin API key (`sk-ant-admin...`). The app calls
   `GET /v1/organizations/me` to verify it.
3. On success, keys are encrypted with `safeStorage.encryptString()` and stored
   locally. They are never transmitted anywhere except to Anthropic's API.

You can change or disconnect keys any time from the **Account** panel
(user-circle icon) or **Settings** panel (gear icon).

## Rate Limit Probing

To populate live rate-limit progress bars, the app sends one minimal probe
request to Haiku every 2–30 minutes (configurable). Each probe is
`max_tokens: 1`, costing roughly $0.00001. At the default 5-minute interval the
total daily cost is approximately $0.003.

The Anthropic rate-limit response headers
(`anthropic-ratelimit-*`, `retry-after`) are extracted and rendered as
progress bars, with color shifting from accent → amber (>70% used) → red
(>90% used). Limits for non-probed model families show a hint instead, since
they are only observable on requests against that family.

## File Layout

```
claude-api-monitor/
├── electron-builder.yml          (config inlined in package.json)
├── tsconfig.json                 # renderer
├── tsconfig.electron.json        # main + preload
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── resources/
│   ├── icon.ico
│   └── icon.png
├── scripts/
│   └── build-icons.py            # regenerates icon.ico + icon.png
└── src/
    ├── main/                     # Electron main process
    │   ├── main.ts
    │   ├── preload.ts
    │   ├── ipc-handlers.ts
    │   ├── tray.ts
    │   └── store.ts
    ├── renderer/                 # React app
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   ├── components/
    │   │   ├── TitleBar.tsx
    │   │   ├── TabBar.tsx
    │   │   ├── ConnectAccount.tsx
    │   │   ├── SettingsPanel.tsx
    │   │   ├── AccountPanel.tsx
    │   │   ├── QuickStatsFooter.tsx
    │   │   ├── CollapsibleSection.tsx
    │   │   ├── ProgressBar.tsx
    │   │   ├── Toggle.tsx
    │   │   ├── LockedSection.tsx
    │   │   ├── SubscriptionView.tsx
    │   │   ├── ApiView.tsx
    │   │   ├── BothView.tsx
    │   │   ├── subscription/
    │   │   │   ├── AccountOverview.tsx
    │   │   │   ├── SpendCosts.tsx
    │   │   │   ├── UsageHistory.tsx
    │   │   │   ├── TeamMembers.tsx
    │   │   │   ├── Workspaces.tsx
    │   │   │   └── ApiKeysOverview.tsx
    │   │   └── api/
    │   │       ├── ConnectionStatus.tsx
    │   │       ├── RateLimits.tsx
    │   │       ├── RateLimitCard.tsx
    │   │       ├── AvailableModels.tsx
    │   │       ├── ModelCard.tsx
    │   │       └── EndpointsReference.tsx
    │   ├── hooks/
    │   ├── store/
    │   ├── utils/
    │   └── assets/
    └── shared/
        └── types.ts              # IPC contracts
```

## Security Notes

- All Anthropic HTTP requests are made from the **main** process. The renderer
  never sees the API key and never makes a direct request.
- The preload script exposes only **named, typed IPC channels** via
  `contextBridge`. `nodeIntegration` is off, `contextIsolation` is on,
  `sandbox: false` is required only because we use `electron-store` indirectly
  in handlers.
- API keys are encrypted at rest using `safeStorage.encryptString()` (DPAPI
  on Windows). On platforms without secure storage, a base64 fallback is used.

## License

MIT
