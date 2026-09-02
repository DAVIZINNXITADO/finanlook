# FinanLook on Replit

## Run locally in Replit

The project uses React, TypeScript, TanStack Start, Vite, and Supabase.

```sh
bun run dev -- --host 0.0.0.0 --port 5000
```

The Replit workflow named `Start application` runs this command on port 5000.
The project runtime is pinned to Node.js 22 because the current Supabase client
requires native WebSocket support during server-side rendering.

## Environment

Supabase-backed authentication and data access require these variables:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Keep their values in Replit Secrets or the connected Lovable/Supabase
environment; do not commit them to source control.

## Checks

```sh
bun run build
bun run lint
```

The production build is the reliable export check. The imported snapshot
currently has broad Prettier formatting differences, so `bun run lint` reports
formatting issues outside the runtime fix.