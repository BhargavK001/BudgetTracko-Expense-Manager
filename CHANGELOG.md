# Changelog

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
