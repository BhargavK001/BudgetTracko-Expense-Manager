# Production Readiness Roadmap: BudgetTracko Mobile

To launch BudgetTracko for real users with high reliability and feature parity, the following items must be addressed.

## 🚀 1. Feature Parity (Missing from Web)

### 1.1 Budgeting System [HIGH PRIORITY]
- **Goal**: Allow users to set and track monthly budgets per category.
- **Action**: Implement `BudgetsScreen.tsx`. Fetch from `/api/budgets`. Show progress bars (Spent vs. Budgeted).
- **Status**: Backend ready, Mobile missing.

### 1.2 Recurring Bills & Subscriptions [HIGH PRIORITY]
- **Goal**: Manage monthly bills (rent, Netflix, etc.) with reminders.
- **Action**: Implement `RecurringBillsScreen.tsx`. Fetch from `/api/recurring`. Integrate with local notifications for due dates.
- **Status**: Backend ready, Mobile missing.

### 1.3 AskTracko AI Assistant [MEDIUM PRIORITY]
- **Goal**: Natural language query for financial insights (e.g., "How much did I spend on coffee this week?").
- **Action**: Build a chat interface for mobile using the `/api/ask-tracko` (or equivalent) endpoint.
- **Status**: Web implemented, Mobile missing.

---

## 🛠 2. Technical Hardening (Stability & Errors)

### 2.1 Offline Support & Sync [CRITICAL]
- **Issue**: App fails or shows empty states without internet.
- **Requirement**: 
  - Cache core data (transactions, accounts) in `AsyncStorage`.
  - Implement an "Offline Queue" for new transactions that syncs when connection returns.
- **Verification**: Test app in Airplane mode.

### 2.2 Error Handling & State Management [HIGH]
- **Requirement**: 
  - Add Skeleton loaders for all screens during fetch.
  - Implement retry logic for failed API calls.
  - Consistent "Empty States" with actionable buttons.

### 2.3 Biometric App Lock [MEDIUM]
- **Requirement**: Full implementation of `expo-local-authentication`. Add toggle in Settings. Require lock on every app resume.

---

## ✨ 3. UI/UX Polishing (Premium Feel)

### 3.1 Transaction List Enhancements
- **Swipe Actions**: Swipe-to-delete and swipe-to-edit on transaction items.
- **Haptic Feedback**: Trigger `expo-haptics` on all primary actions (save, tab switch, theme toggle).

### 3.2 Bottom Sheets
- **Requirement**: Replace current full-screen modals for "Add Transaction" and "Filters" with native-feeling bottom sheets (e.g., `@gorhom/bottom-sheet`).

---

## 🔒 4. Production Checklist (Before Launch)

- [ ] **Secure Storage**: Ensure JWT and user secrets are stored in `expo-secure-store` (currently using `AsyncStorage` for some items).
- [ ] **Sentry Integration**: Add crash reporting to track production errors.
- [ ] **Push Notifications Configuration**: Setup Expo Push Tokens and backend trigger logic.
- [ ] **App Store Optimization (ASO)**: Finalize icons, splash screens, and app descriptions.
- [ ] **Terms & Privacy**: Ensure the mobile app links to the production TOS and Privacy Policy.
