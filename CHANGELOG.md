# Changelog

## [2.1.1] - 2026-05-03

### Added
- **Recurring Bills UI Revamp**: Completely redesigned the Recurring Bills screen. Introduced intuitive account selection using bank-specific icons for tracking payment sources. 
- **Debts Management Overhaul**: Streamlined the "Add Debt" workflow with clean bottom-sheet navigation for lending and borrowing. Created a static, well-spaced "About Debts" informational screen.

### Changed
- **Recurring Bills Logic Update**: Accurate dynamic calculations now divide yearly recurring bills by 12 for the monthly estimate, and correctly filter out inactive bills from the main total.
- **Expo Build Optimizations**: Configured the application for high-performance EAS production builds. Finished migrating to `expo-image` for high-performance rendering and optimized `FlatList` component rendering constraints.
- **Accounts Screen Refinement**: Eliminated IDE warnings, enforced strong typing, and resolved incorrect icon usage by standardizing purely on the `lucide-react-native` library.

### Fixed
- **Expo Navigation Dependency Error**: Resolved an Android bundling failure by correctly linking the missing `@react-navigation/bottom-tabs` dependency in `expo-router`.

## [2.1.0] - 2026-05-02

### Added
- **Envelope Budgeting System**: Transformed the budget management into a strict hierarchical "Envelope" system, requiring users to set a "Total Budget" before allocating sub-category limits. Built robust validation to prevent sub-categories from exceeding the remaining pool.
- **Advanced Sync UI**: Added real-time dynamic "Sync Status" indicators directly on the Edit Profile page so users know precisely when their data last reached the cloud.
- **Custom Analysis Charts**: Introduced completely custom SVG-based charts to the Trends section. Features a cumulative line chart for totals and a day-wise bar chart supporting smooth animations and period comparison.

### Changed
- **Full Dark Mode Token Migration**: Re-engineered the application's entire CSS infrastructure. Migrated all hardcoded components (Home, Stats, Transactions, Debts, Category Management) to utilize dynamic `useThemeStyles` for seamless Dark/Light Mode transitions.
- **Home Screen "Monthly Budget" Card**: Removed confusing "Pace/Projected" metrics in favor of a straightforward, visually distinct actual "Used vs Total" tracker progress bar, directly tied to envelope limits.
- **More Screen Cleanup**: Simplified the Hero Profile card, removing cluttered stats to focus purely on a beautiful user identity card.

### Fixed
- **App Navigation Bottleneck**: Completely resolved severe 10-20 second navigation delays when switching tabs. Eliminated interaction deadlocks and optimized background sync fetching logic to ensure instantaneous UI responsiveness.
- **React Hook Violations**: Refactored major application screens (Home, Analysis, Accounts, More) to resolve critical "Rules of Hooks" exceptions caused by early returns, establishing strict execution order for core logic.
- **Offline Sync Resiliency**: Solidified the MMKV sync engine, creating a proper queue for offline CRUD operations that flawlessly pushes to MongoDB upon reconnection without causing race conditions.

## [2.0.0] - 2026-04-25

### Added
- **AskTracko Mobile AI Integration**: Integrated the 'AskTracko' AI assistant directly into the mobile app, fully connected to the production backend, ensuring context-aware chat history. Includes offline fallback caching for robust access even without a network.
- **Biometric Persistence Integration**: Moved the Biometric App lock functionality to properly persist within the newly updated Privacy & Security context.
- **Offline Sync System**: The mobile app now leverages a mature AsyncStorage mutation queue designed to cache interactions offline and gracefully sync to MongoDB upon reconnection without crashes.

### Changed
- **Comprehensive Mobile UI Polish**: System-wide Haptic feedback added to effectively every primary interaction on the dashboard and settings utilizing `expo-haptics`.
- **Settings Consolidation**: Removed redundant settings rows across the account setup, centralizing Privacy, Analytics, and Security toggles into a singular, clean Privacy & Security Page.
- **Premium App Overhauls**: Replaced legacy and fragmented Help & Support layouts with fully redesigned, highly polished modern light-theme layouts that accurately reflect the premium aesthetic of BudgetTracko.
- **Version Bump**: Formally migrated to application version 2.0.0 reflecting the production-readiness of the mobile infrastructure.

## [1.0.2] - 2026-03-12

### Added
- **Analytics Date Engine**: Upgraded the analytics screen to dynamically calculate custom start and end dates down to the day or month, featuring an animated sliding filter toggle.
- **Custom Profile Avatars**: Users can now effortlessly select, upload, and remove custom avatar images from the mobile app settings. Features immediate UI sync and secure Cloudinary backend processing via `multer`.
- **Transaction Details Action Bar**: Introduced the ability to directly edit or permanently delete existing transactions from within the application via an inline action sheet. 
- **Universal Transaction Filtering**: The "All Transactions" page now accepts robust queries, allowing users to rapidly filter their entire financial history by type, specific dates, or a live-updating text search bar.
- **EAS Build Configuration**: Injected `eas.json` templates explicitly pointing `buildType` to `.apk` to ensure the correct output binaries during compilation.

### Changed
- **Persistent Sessions**: Updated JWT and Session cookie expirations from 3 days to 30 days. The mobile App now detects valid tokens on launch and bypasses the Welcome screen instantly.
- **Improved Date Pickers**: Replaced clunky native alerts with intuitive and seamless inline `@react-native-community/datetimepicker` modals.

### Fixed
- **Render Optimizations**: Drastically enhanced the UI framerate on heavy data sections utilizing React Native's `InteractionManager` combined with strict `React.memo` bindings on SVG arrays, stopping navigation lag.
- **APK Title Naming conventions**: Repackaged the core identifier inside `app.json` and `package.json` to prevent arbitrary compile titles upon deployment.

## [1.0.1] - 2026-02-21

### Added
- **Tracko Pulse (AI Financial Coach):** Added an interactive chat (`/tracko-pulse/chat`) to ask budgeting advice directly to an AI powered by Gemini/Groq.
- **Monthly Deep-Dive:** Implemented an AI-generated comprehensive monthly spending analysis featuring a Roast, Praise, Hustle Tip, and Investment Strategy.
- **Smart Notifications:** Tracko now silently analyzes week-over-week spending trends upon login and delivers a punchy toast notification comparing your recent habits.
- **Secure Password Recovery:** Implemented a complete "Forgot Password" flow allowing users to securely reset their credentials via email. 
- **Demo Personalization:** Refined demo data to a realistic Indian college student profile (Bhargav Karande).
- **Admin AI Key Manager:** Added a dedicated Admin Settings section to securely hot-swap Gemini, Groq, and OpenRouter API keys to MongoDB (with visual badges and `.env` fallback).
- **Mobile Admin Sidebar:** Replaced the restricted 5-item bottom navigation dock with a scalable, full-screen slide-out hamburger menu to accommodate the growing number of admin pages (`Settings`, `Promotions`, etc.).

### Changed
- **Global Toast Notifications:** Replaced disruptive browser `alert()` popups and silent `console.error` messages across the application with elegant `sonner` toasts.
- **Admin Dashboard Upgrades:** Added inline editing capabilities directly to the Admin Promotions page.
- **Branding Consistency:** Finalized the branding update, removing all remaining instances of "OneCare" and "hms".

### Fixed
- **Autopay Discount Resolution:** Patched an issue where subscription checkout coupons were applying continuously to subsequent recurring payments.
- **Recurring Bills Addition:** Resolved a backend validation error preventing users from adding manual recurring bills.


## [1.0.0] - 2026-02-16

### Added
- Initial production release of BudgetTracko - Expense Manager.
- Comprehensive Dashboard for expense tracking.
- User Authentication (Login/Signup) with secure JWT handling.
- Monthly and Yearly expense visualization charts.
- CSV Export functionality for user data.
- Responsive design for Mobile and Desktop.

### Fixed
- Resolved CORS and CSRF issues for secure API communication.
- Fixed MongoDB connection stability and logging.
- Corrected UI alignment issues in Welcome Modal and Charts.
