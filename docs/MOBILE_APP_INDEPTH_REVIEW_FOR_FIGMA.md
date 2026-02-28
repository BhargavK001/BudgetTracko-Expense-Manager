# BudgetTracko Mobile App — In-Depth Product Review (for Figma AI)

**Prepared on:** February 28, 2026  
**App scope reviewed:** `app/mobile` (Expo + React Native)

---

## 1) What this document is for

Use this as a **single source of truth** when prompting Figma AI to redesign the mobile app.  
You can combine this with your internet UI screenshots as visual inspiration.

This document captures:
- Current app information architecture and navigation
- Every existing section/screen and what it does
- What is truly implemented vs mocked/placeholder
- Current UX patterns and design language
- Functional constraints that design must respect

---

## 2) Product summary (current state)

BudgetTracko mobile is a dark-themed expense manager focused on:
- Fast manual transaction tracking
- Monthly spending/income insights
- Basic account-wise balance visibility
- Feature-discovery/onboarding walkthrough
- Auth flows (email + social callback handling)

### Current maturity level
- Core flows are implemented for **auth + local transaction tracking + dashboard analytics**.
- Several sections are **UI-complete but logic mocked/local-only** (AI chat, recurring bills, budgets, reminders, premium plans, export/rate actions).

---

## 3) Tech stack and app foundations

### Framework/runtime
- Expo SDK 54, React 19, React Native 0.81
- Expo Router (file-based routing)
- React Native Reanimated + SVG charts

### Data and networking
- `AsyncStorage` for local persistence:
  - auth token/user
  - transaction list
- Axios service with base URL switching (dev host detection + production URL)
- Auth API integration exists (`/auth/login`, `/auth/signup`, `/auth/forgotpassword`, `/auth/me`)

### App-wide providers
- `AuthProvider`
- `TransactionProvider`
- `SafeAreaProvider`

### Theme and visual system
- Dark-first palette (`DarkTheme`) with yellow neo-brutalist accent
- Heavy borders, high-contrast cards, uppercase headings, bold weights
- Persistent custom bottom tab bar with central FAB add button

---

## 4) Navigation map (information architecture)

## Root stack
- `index` → redirects to `welcome`
- `welcome`
- `features/*` (stack)
- `(auth)/*` (stack)
- `(tabs)/*` (bottom tabs)
- `help-support`
- `share-app`
- `premium`
- `profile`
- `privacy-security`
- `settings/*` (stack)

## Tab navigator (`(tabs)`)
- `index` → Home dashboard
- `pulse` → Tracko Pulse hub
- `accounts` → account balances view
- `more` → settings/help/utility launcher
- Center FAB opens `AddTransactionModal`

## Auth stack
- `login`
- `signup`
- `forgot-password`
- `callback` (social auth deep-link completion)

## Features stack
- `track` (onboarding step 1)
- `trends` (onboarding step 2)
- `security` (onboarding step 3)
- `offline` (onboarding step 4)
- `ask-tracko` (chat UI)
- `analysis` (deep-dive analytics)
- `budgets` (budget manager)
- `recurring-bills` (recurring bills manager)

## Settings stack
- `settings/index`
- `settings/reminders`

---

## 5) Screen-by-screen feature inventory

## A) Entry + onboarding

### `welcome`
**Purpose:** first brand/marketing screen.  
**Key actions:**
- “Start Tracking Free” → `/features/track`
- “Login” → `/(auth)/login`

**Notes:** highly animated hero; no data dependencies.

### `features/track`, `features/trends`, `features/security`, `features/offline`
**Purpose:** 4-step feature storytelling/onboarding carousel-like flow.  
**Key actions:** next/skip navigation into auth.

**Implementation status:** visual-first; mostly static/mocked content.

---

## B) Authentication

### `/(auth)/login`
**Implemented:**
- Email/password login via backend
- Google/GitHub OAuth via `expo-web-browser` auth session
- Handles callback token/user and stores in AsyncStorage
- Forgot password entry point

### `/(auth)/signup`
**Implemented:**
- Email/password signup via backend

**Partial/mock:**
- Social buttons are visible but currently no attached handler logic in signup screen

### `/(auth)/forgot-password`
**Implemented:**
- Calls forgot-password endpoint
- Success state UI shown

### `/(auth)/callback`
**Implemented:**
- Reads token + user from deep link query
- Completes social login + redirects to tabs

---

## C) Main app tabs

### 1) Home (`(tabs)/index`)
**Purpose:** financial snapshot dashboard.  
**Data source:** `TransactionContext`, `AuthContext`.

**Implemented features:**
- Greeting with first name
- Current month spending and income cards
- Available balance pill
- Recent transactions list (up to 10)
- Empty state when no transactions
- Advanced widgets:
  - Financial Health (savings rate)
  - Spending Pace (projected monthly spending vs target)
  - Upcoming Bills (currently mock list)

### 2) Pulse (`(tabs)/pulse`)
**Purpose:** AI area entry hub.  
**Actions:**
- “Chat with Bot” → `/features/ask-tracko`
- “Monthly Deep-Dive” → `/features/analysis`

**Status:** navigation hub + marketing copy complete.

### 3) Accounts (`(tabs)/accounts`)
**Purpose:** per-account balance summary.  
**Data source:** computed from transactions by account field.

**Implemented features:**
- Show/hide balance toggle
- Total available balance and credit card placeholder
- Sections for `Slice`, `Bank Account`, `Cash`

**Constraint:** accounts are currently fixed labels in UI.

### 4) Analysis (`(tabs)/analysis`)  
**Note:** exists in code but not in active tab config.

**Implemented:**
- Week/Month/Year filters
- Date-range filtering
- Income/expense/balance summary
- Category donut breakdown
- Spending trend bar chart
- Financial insight cards (daily avg, per tx, tx count)

**Partial:** export icon is visual-only.

### 5) More (`(tabs)/more`)
**Purpose:** profile/utility/settings launcher.

**Implemented actions/routes:**
- Profile
- Settings
- Reminders
- Privacy & Security
- Budgets
- Recurring Bills
- Help & Support
- Share App
- Premium
- Logout (clears local auth)

**Placeholder actions in menu:**
- Export Data (no action)
- Rate Us (no action)

---

## D) Feature pages

### `features/ask-tracko`
**UI implemented:** full chat interface with messages, avatars, typing/loading phrases.  
**Current logic:** mocked response generator (keyword-based local responses).  
**Not yet:** real AI backend conversation.

### `features/analysis`
Same analytics engine as tab analysis screen but with back header and “Monthly Analysis” context.

### `features/budgets`
**UI implemented:**
- Weekly/Monthly/Yearly budget tabs
- Budget cards with progress bars
- Add/edit/delete budget modal

**Current logic:** budgets live in local component state only (not persisted, not synced).

### `features/recurring-bills`
**UI implemented:**
- Bill list cards, monthly estimate, add/edit/delete modal
- quick presets and auto-pay switch

**Current logic:** local component state only (not persisted, not scheduler-linked).

---

## E) Secondary pages

### `profile`
- Static profile identity + hardcoded stats and account details

### `settings/index`
- General settings rows (currency/week/language)
- dark mode and biometric switches
- reminders route
- backup and clear data rows

**Status:** mostly UI-level toggles and placeholders; no persistent settings management.

### `settings/reminders`
- Daily reminders / budget alerts / weekly reports switches
- reminder time row
- test notification button

**Status:** UI-only; no notification scheduling integration.

### `help-support`
- FAQ cards
- opens support email (`mailto:`)

### `privacy-security`
- policy-style information sections
- static text content

### `premium`
- Pricing tiers and plan cards

**Status:** marketing UI only; no purchase/paywall flow.

### `share-app`
- Native share sheet integration
- open website link
- social link buttons

### `+not-found`
- fallback route screen.

---

## 6) Core functional modules

## `TransactionContext` (important)
Implemented:
- Transaction create/delete
- AsyncStorage persistence
- Monthly filtering
- Total income, total expense, balance calculations
- Category breakdown calculations

Data model fields:
- `id`, `title`, `amount`, `type`, `category`, `date`, `account`

Supported account values in add modal:
- `Cash`
- `Bank Account`
- `Slice`

Category sets:
- Expense: Food and Dining, Transport, Shopping, Entertainment, Bills & Utilities, Health, Education, Other
- Income: Salary, Freelance, Investment, Gift, Other

## `AuthContext` (important)
Implemented:
- login/signup/logout
- forgot password
- social login completion
- load stored auth from AsyncStorage
- optional `/auth/me` verification refresh

---

## 7) Current UX/UI language (to inform redesign)

### Visual style now
- Dark canvas + yellow accent
- Neo-brutalist edges (thick borders, strong block shadows)
- Heavy uppercase headings and very bold typography
- Card-heavy layouts and icon-led list rows

### Interaction patterns now
- Sticky top headers
- Scroll-heavy screen bodies
- Large bottom tab with floating add FAB
- Bottom-sheet style create transaction flow
- Frequent status chips/progress bars/insight widgets

### Motion
- Animated splash intro sequence
- Entry animations on many sections/cards
- Subtle motion in onboarding and welcome hero

---

## 8) What is real vs mocked (important for design planning)

## Fully functional today
- Auth: login/signup/forgot/social callback handling
- Persistent local transaction system
- Dashboard totals and analytics calculations
- Add transaction modal + category/account capture
- Account balances derived from transactions
- Share sheet and link opening

## Partially functional / mocked
- Ask Tracko chat responses (mock)
- Upcoming bills widget data (mock)
- Budget management persistence (local only)
- Recurring bills persistence (local only)
- Reminder switches and time (UI only)
- Export actions (UI only)
- Rate us (UI only)
- Premium pricing/paywall transactions (UI only)
- Some profile stats/details hardcoded

---

## 9) Design constraints Figma AI should respect

- Keep app **single-hand usable** with high readability and large touch targets.
- Preserve key flows:
  - onboarding → auth
  - auth → tabs
  - tabs + central quick-add transaction
  - more menu as utility hub
- Keep these must-have sections:
  - Home dashboard
  - Pulse hub + Ask Tracko chat
  - Accounts
  - Analysis
  - Budgets
  - Recurring bills
  - Settings + reminders
  - Support / Privacy / Premium / Share / Profile
- Design for dark-first, but allow clean theming structure for future light mode.
- Avoid requiring backend-only features for basic daily tracking (local-first still important).

---

## 10) Ready-to-paste prompt for Figma AI

Use this prompt (and attach your screenshot references):

"Design a complete modern mobile UI system for BudgetTracko (expense manager). The app currently has: welcome/onboarding, auth (login/signup/forgot/social), main tabs (Home dashboard, Pulse, Accounts, More), add-transaction modal, analytics, AI chat screen, budgets, recurring bills, settings/reminders, profile, privacy, help, premium, and share screens. Build a cohesive design direction with clear hierarchy, strong readability, and smooth mobile UX. Keep all current sections and flows, but redesign visual language to be premium and modern while staying practical for daily finance tracking. Include component system, spacing/typography/color tokens, tab bar + FAB patterns, form patterns, empty states, error states, loading states, and chart card styles. Mark which screens are data-heavy and propose reusable templates for list/detail/summary views." 

---

## 11) Suggested redesign deliverables checklist

Ask Figma AI to generate:
- Global design system (colors, type scale, spacing, radii, elevation)
- Core reusable components (buttons, inputs, cards, chips, list items, modals)
- Navigation patterns (root stack + tabs + in-stack headers)
- End-to-end screens for every route listed above
- States: empty, loading, success, error, offline
- Interaction notes for animations/microinteractions

---

If you want, a second companion file can be generated next with a **screen-by-screen wireframe requirement table** (fields, actions, and state rules per page) to make the Figma output even more consistent.