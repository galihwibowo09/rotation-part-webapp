# Rotation Part Inventory — Demo Web App (Vite + React + Tailwind)

This repository contains a single-file demo React app (converted to a small Vite project) for the Rotation Part Inventory UI built earlier.

## What's included
- Vite + React starter
- Tailwind CSS setup (configured)
- `src/App.jsx` contains the UI component (mock API inside)
- `src/main.jsx` entry point
- `index.html` Vite entry
- Instructions to replace mock API with SharePoint / Microsoft Graph (see next steps)

## Quick start (local)
1. Install Node.js (>=18 recommended).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Open the URL printed by Vite (usually http://localhost:5173).

## Build for production
```bash
npm run build
npm run preview
```

## Tailwind build already configured via PostCSS and tailwind.config.cjs.

## Deploy
- You can deploy the `dist` folder to Netlify, Vercel, or any static hosting.
- For Vercel: `vercel --prod` (connect repo).
- For Netlify: drag & drop `dist` folder or link the repo.

## Next step (you asked for No.2)
I will provide step-by-step guidance and example code to replace the mock API with SharePoint/Graph API calls and secure auth flow (MSAL) — as your requested next step.
