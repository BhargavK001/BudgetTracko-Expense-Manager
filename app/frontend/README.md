# BudgetTracko Frontend

The frontend for BudgetTracko is a React application built with Vite and Tailwind CSS. It provides a responsive and intuitive user interface for managing expenses.

## Table of Contents

-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Scripts](#scripts)
-   [Project Structure](#project-structure)
    -   [Pages](#pages)
    -   [Components](#components)

## Installation

1.  Navigate to the frontend directory:
    ```bash
    cd app/frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

Create a `.env` file in the `app/frontend` directory with the following variable:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL of the backend API | `http://localhost:5000` |

## Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run lint`: Runs ESLint to check for code quality issues.
-   `npm run preview`: Locally preview the production build.

## Project Structure

### Pages

The application is composed of the following key pages in `src/pages`:

*   **Public Pages:**
    *   `LandingPage`: Homepage describing the app features.
    *   `Login` / `Signup`: User authentication pages.
    *   `ForgotPassword`: Password recovery.
    *   `Pricing`: Subscription and pricing information.
    *   `About`, `Contact`, `Features`, `Privacy`, `TermsOfService`: Informational pages.
*   **Protected Pages (Dashboard):**
    *   `Dashboard`: Main user overview with charts and summaries.
    *   `Transactions`: List and management of all transactions.
    *   `Analytics`: Detailed financial analysis and reports.
    *   `Budgets`: Budget creation and tracking.
    *   `Accounts`: Management of bank/cash accounts.
    *   `Settings`: User profile and application settings.
    *   `Billing`: Subscription and billing history.

### Components

Reusable UI components located in `src/components`:

*   **Modals:** `TransactionDetailModal`, `TransactionForm`, `WelcomeModal`, `ProfileModal`, `SecurityModal`, `AccountHistoryModal`.
*   **Management:** `CategoryManager`, `CategoryEdit`, `ProfileEdit`, `SecurityEdit`.
*   **UI Elements:** `SkeletonLoader`, `SuccessAnimation`.
*   **Routing:** `PublicRoute` (Redirects authenticated users away from public pages).
