# SEO Prerendering Plan

## Overview
Currently, the BudgetTracko frontend is a Single Page Application (SPA), which means Googlebot has to execute JavaScript to see meta tags and page content. This is the primary reason the site is not indexing or ranking well yet (CSR penalty). 

We will introduce **build-time pre-rendering** (Static Site Generation for public routes) using a Vite-compatible prerendering stack (like `vite-plugin-prerender` or `react-snap`), which allows us to serve static HTML with full SEO tags to the browser and Googlebot instantly, without needing a full migration to Next.js.

## Project Type
**WEB** (Vite + React)

## Success Criteria
1. When viewing source (`Ctrl+U`) on `https://www.budgettracko.app/` and `/features`, the full HTML and `<title>` / `<meta>` tags are visible before JS loads.
2. The site remains fully interactive (hydration works) after the initial load.
3. No build errors during the production build on Vercel.

## Tech Stack
- **Vite Plugin:** We will utilize a pre-rendering tool (e.g., `vite-plugin-prerender` or `react-snap`) to crawl the built application and generate static `index.html` files for all our public routes.
- **react-helmet-async:** Will seamlessly inject the tags during the headless render so they get saved into the final HTML.
- **Vercel Routing:** The existing `vercel.json` already falls back to `/index.html`, which is fine. Static routes will be served directly if they exist as `[route]/index.html`.

## File Structure
Changes will touch configuration and routing mostly:
- `app/frontend/vite.config.js` (Add prerender plugin config)
- `app/frontend/package.json` (Add new dependencies)
- `app/frontend/src/main.jsx` (Switch from `render` to `hydrateRoot` for pre-rendered pages)
- `app/frontend/vercel.json` (Ensure clean routing)

## Task Breakdown

### Task 1: Install Pre-rendering Dependencies
- **Agent:** `frontend-specialist`
- **Action:** Add `vite-plugin-prerender` (or evaluate `react-snap`) to the frontend package.
- **INPUT→OUTPUT→VERIFY:** 
  - Input: `package.json`
  - Output: Updated dependencies
  - Verify: Dependencies install successfully via `npm install`.

### Task 2: Configure Vite for Pre-rendering
- **Agent:** `frontend-specialist`
- **Action:** Update `vite.config.js` to include the prerender plugin and configure it for the public routes (`/`, `/features`, `/pricing`, `/about`, `/contact`, `/privacy`, `/terms`).
- **INPUT→OUTPUT→VERIFY:** 
  - Input: `vite.config.js`
  - Output: Pre-rendering plugin mapped to the correct paths.
  - Verify: Generating a build creates directories with `index.html` for each route inside `dist`.

### Task 3: Update React Entry Point (Hydration)
- **Agent:** `frontend-specialist`
- **Action:** Update `src/main.jsx` to use `hydrateRoot` when static HTML is already present, falling back to `createRoot` otherwise. This prevents React from overwriting the pre-rendered HTML before hydration is complete.
- **INPUT→OUTPUT→VERIFY:** 
  - Input: `src/main.jsx`
  - Output: Logic that checks for `hasChildNodes()` or a specific attribute on the root element.
  - Verify: The application runs locally without hydration errors in the dev console.

### Task 4: Local Build & Test Verification
- **Agent:** `frontend-specialist`
- **Action:** Run `npm run build` and then `npm run preview` to test the output.
- **INPUT→OUTPUT→VERIFY:** 
  - Input: Built assets
  - Output: Pre-rendered HTML strings verified via `curl` or by disabling JS in the browser.
  - Verify: SEO tags are present in the raw HTML payload.

### Phase X: Verification
- [ ] Lint: Verify no new linting errors (`npm run lint`).
- [ ] Build: `npm run build` completes successfully and produces static HTML files.
- [ ] SEO Check: Ensure that viewing the `/dist/index.html` shows the full `<title>` and structured data, not just an empty `<div id="root"></div>`.
- [ ] Test: The app features (especially dashboard routes) still load correctly as normal SPAs.
