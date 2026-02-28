# BudgetTracko Web: Optimization & Future Roadmap

This document outlines the remaining tasks, feature additions, and performance optimizations specifically targeted for the **Web Frontend** (`app/frontend`) of BudgetTracko.

---

## 🚀 1. Performance Optimizations

### 1.1 Code Splitting & Lazy Loading
Currently, the entire React application might be bundled into a few large files. We need to implement route-based code splitting to reduce the initial load time.
- [ ] **React.lazy & Suspense**: Wrap heavy route components (`Analytics.jsx`, `Settings.jsx`, `Dashboard.jsx`) with `React.lazy`.
- [ ] **Component Level Lazy Loading**: Heavy charting libraries (Recharts) inside `Analytics` should be dynamically imported if they are causing bundle bloat.

### 1.2 State & Data Optimization
- [ ] **Memoization**: Audit the application for unnecessary re-renders. Use `useMemo` for heavy calculations (like the data processing in `Analytics.jsx` where it calculates trends and category breakdowns) and `React.memo` for pure components (like `TransactionItem` or `StatCard` if used in a long list).
- [ ] **Data Caching & Pagination**:
  - The `getTransactions` fetch currently pulls all data. Implement **pagination** or **infinite scrolling** on the `Transactions.jsx` page.
  - Implement a caching layer (like React Query or SWR) to prevent redundant API calls when navigating between Dashboard and Accounts/Transactions pages.

### 1.3 Asset & Bundle Optimization
- [ ] **Image Optimization**: Ensure any images (like profile pictures or receipts uploaded to Cloudinary) are requested with optimized parameters (WebP format, specific dimensions).
- [ ] **Bundle Analysis**: Run `vite-plugin-bundle-visualizer` to identify large dependencies and swap them out if necessary (e.g., check `date-fns` imports to ensure tree-shaking is working, otherwise switch to `date-fns/format`).

---

## ✨ 2. Outstanding Features (Web)

### 2.1 Core Missing Features
- [ ] **Google Drive Backup/Restore UI**: The backend supports (or will support) Google Drive integration. The `Settings.jsx` page needs a button to "Connect Google Drive" and "Sync Now."
- [ ] **Push Notifications (Web)**:
  - Implement service workers and the Notification API to allow users to receive browser push notifications for:
    - Daily entry reminders (e.g., "Don't forget to track your expenses today at 8 PM").
    - Budget limit alerts (e.g., "You have reached 90% of your Food budget").
  - Connect this to the backend cron jobs.

### 2.2 Advanced Analytics Refinements
- [ ] **Export to PDF/Excel**: While CSV is implemented, add the ability to export the beautiful Analytics page charts as a PDF report.
- [ ] **Forecasting**: Add a simple linear regression or moving average to the `Analytics` trend chart to predict the next month's expenses based on past data.

### 2.3 UI / UX Polish
- [ ] **Keyboard Shortcuts**: Add hotkeys for power users (e.g., `Cmd/Ctrl + K` to open a global search, `N` to quickly open the Add Transaction modal).
- [ ] **Drag and Drop**: Allow users to drag a receipt image directly into the "Add Transaction" modal.
- [ ] **Skeleton Loaders**: Replace simple loading spinners with beautiful skeleton screens for the Dashboard and Analytics pages while data fetches.
- [ ] **Offline Mode (PWA)**: Register a Service Worker with Workbox to make the web app installable as a Progressive Web App (PWA) with basic offline read capability.

---

## 🛠 3. Technical Debt & Upkeep

- [ ] **Accessibility (a11y)**: Audit colors in Dark/Light mode for WCAG compliance. Ensure all functional icons and inputs have `aria-labels`.
- [ ] **Component Extraction**: Review large files like `Analytics.jsx` (600+ lines) and break them down into smaller, testable sub-components (`TrendChart.jsx`, `CategoryBreakdown.jsx`).
- [ ] **Error Boundaries**: Wrap main feature areas in React Error Boundaries so that a crash in a chart doesn't take down the entire application.
- [ ] **E2E Testing**: Setup Cypress or Playwright to automate testing of the core user flows (Login -> Add Transaction -> View Dashboard).

---

### Implementation Priority Proposal:
1. **High Impact, Quick Wins**: Implement `React.lazy` for routes and `useMemo` in `Analytics.jsx` (Section 1.1 & 1.2).
2. **Feature Completion**: Build the Google Drive Sync UI and Web Push Notifications (Section 2.1).
3. **UX Polish**: Add Skeleton Loaders and PWA support (Section 2.3).
