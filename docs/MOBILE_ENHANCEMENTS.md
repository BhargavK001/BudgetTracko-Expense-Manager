# BudgetTracko Mobile: Current State & Enhancements

This document outlines the current state of the **React Native (Expo)** mobile application (`app/mobile`) and lists the essential enhancements required to bring it up to par with the Web version and improve the overall mobile experience.

---

## 📱 1. Current State (Beginner Stage)

The mobile app is currently functional but basic. It features a bottom tab navigation `(tabs)` with the following core screens:
- **Dashboard (`index.tsx`)**: Displays recent transactions and a high-level overview.
- **Accounts (`accounts.tsx`)**: Lists user accounts (Bank, Cash, Wallets).
- **Analytics (`analysis.tsx`)**: Basic spending and income charts using `react-native-chart-kit` and `DonutChart`.
- **More (`more.tsx`)**: Basic settings, profile, and theme toggle.
- **Add Transaction**: A modal (`AddTransactionModal.tsx`) for adding income, expense, and transfer records.

---

## 🚀 2. Missing Core Features (Parity with Web)

To achieve feature parity with the web dashboard, the following core sections need to be built in the mobile app:

### 2.1 Budgeting System
- **State**: Completely missing on mobile.
- **Action**: Create a new screen (e.g., `budgets.tsx`) that fetches and displays category budgets. Implement progress bars (Actual vs. Budget) similar to the web's Budget overlay chart.

### 2.2 Recurring Bills
- **State**: Completely missing on mobile.
- **Action**: Add a "Recurring Bills" or "Subscriptions" management screen. Users should be able to view upcoming bills, their due dates, and mark them as Auto-Pay.

### 2.3 Advanced Analytics
- **State**: The `analysis.tsx` file has basic charts, but lacks the depth of the web version.
- **Action**: Add a "Financial Health Score" gauge and custom date range pickers natively in the mobile app. Improve the category breakdown list view.

---

## ✨ 3. Mobile-Specific Enhancements (UI/UX)

These are improvements tailored specifically for the mobile form factor to make the app feel native and premium.

### 3.1 UX Polish
- **Haptic Feedback**: Integrate `expo-haptics`. Trigger light haptics when toggling themes, successfully adding a transaction, or pressing primary buttons.
- **Swipe Actions**: Implement swipe-to-delete or swipe-to-edit on the `TransactionItem` list using `react-native-gesture-handler` and `react-native-reanimated`.
- **Bottom Sheets**: Replace standard modals with native-feeling bottom sheets (e.g., using `@gorhom/bottom-sheet`) for "Add Transaction" or filter selections.

### 3.2 Performance & Animations
- **Skeleton Loaders**: Add skeleton loading states while fetching data from the backend, instead of a blank screen or basic `ActivityIndicator`.
- **Shared Element Transitions**: Smoothly transition between the Dashboard transaction list and a detailed "Transaction View" screen.

---

## 🔒 4. Advanced Native Integrations

To make the app a true standalone mobile experience, we should leverage native device capabilities.

### 4.1 Biometric Security
- **Feature**: App lock using FaceID or Fingerprint.
- **Action**: Integrate `expo-local-authentication`. Add a setting in `more.tsx` to require biometric authentication upon opening the app or after a timeout.

### 4.2 Push Notifications
- **Feature**: Local and Push reminders.
- **Action**: Integrate `expo-notifications`. 
  - Send local notifications for daily entry reminders.
  - Receive push notifications from the backend for budget limit alerts or upcoming recurring bills.

### 4.3 Offline Support & Sync
- **Feature**: Allow the app to work without an internet connection.
- **Action**: Ensure `AsyncStorage` securely caches the latest known state (Transactions, Accounts). Implement a sync queue that pushes locally created transactions to the server once the connection is restored.

---

### Suggested Prioritization for GitHub Issues:
1. **[Enhancement] Implement Budget Setting & Tracking UI on Mobile** (High Priority - Web Parity)
2. **[Enhancement] Add Recurring Bills Management Screen** (High Priority - Web Parity)
3. **[Enhancement] Integrate Biometric App Lock (FaceID/Fingerprint)** (Medium Priority - Native Polish)
4. **[Enhancement] Add Haptic Feedback and Swipe-to-Delete** (Low Priority - UX)
5. **[Enhancement] Offline Transaction Queue and Sync** (High Priority - Reliability)
