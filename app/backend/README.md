# BudgetTracko Backend

The backend for BudgetTracko is built with Node.js, Express, and MongoDB. It handles user authentication, expense tracking, budgeting, and data management.

## Table of Contents

-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Scripts](#scripts)
-   [API Documentation](#api-documentation)
    -   [Auth](#auth)
    -   [User](#user)
    -   [Transactions](#transactions)
    -   [Budgets](#budgets)
    -   [Categories](#categories)
    -   [Accounts](#accounts)
    -   [Payments](#payments)

## Installation

1.  Navigate to the backend directory:
    ```bash
    cd app/backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

Create a `.env` file in the `app/backend` directory with the following variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port for the server to run on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_jwt_secret` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `FRONTEND_URL` | URL of the frontend application | `http://localhost:5173` |
| `BACKEND_URL` | URL of the backend application | `http://localhost:5000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `...` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `...` |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | `...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | `...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | `...` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `...` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `...` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `...` |

## Scripts

-   `npm start`: Runs the server (production).
-   `npm run dev`: Runs the server with `nodemon` for development.
-   `npm run lint`: Runs ESLint to check for code quality issues.
-   `npm run format`: Formats code using Prettier.

## API Documentation

### Auth

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/login` | Login user | No |
| `GET` | `/api/auth/google` | Initiate Google OAuth | No |
| `GET` | `/api/auth/github` | Initiate GitHub OAuth | No |
| `GET` | `/api/auth/logout` | Logout user (clears cookie) | No |
| `GET` | `/api/auth/me` | Get current user & refresh session | Yes (Cookie) |

### User

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/profile` | Get user profile details | Yes |
| `PUT` | `/api/user/profile` | Update user profile | Yes |
| `PUT` | `/api/user/change-password` | Change user password | Yes |
| `PUT` | `/api/user/preferences` | Update user preferences | Yes |
| `GET` | `/api/user/export` | Export all user data (JSON) | Yes |
| `GET` | `/api/user/export/csv` | Export transactions as CSV | Yes |
| `POST` | `/api/user/import/csv` | Import transactions from CSV | Yes |
| `DELETE` | `/api/user/data` | Clear all user data | Yes |
| `DELETE` | `/api/user/account` | Delete user account permanently | Yes |

### Transactions

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions` | Get all transactions | Yes |
| `POST` | `/api/transactions` | Create a new transaction | Yes |
| `GET` | `/api/transactions/:id` | Get a specific transaction | Yes |
| `PUT` | `/api/transactions/:id` | Update a transaction | Yes |
| `DELETE` | `/api/transactions/:id` | Delete a transaction | Yes |
| `GET` | `/api/transactions/account/:accountId` | Get transactions for an account | Yes |

### Budgets

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/budgets` | Get all budgets | Yes |
| `POST` | `/api/budgets` | Create a new budget | Yes |
| `PUT` | `/api/budgets/:id` | Update a budget | Yes |
| `DELETE` | `/api/budgets/:id` | Delete a budget | Yes |

### Categories

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Get all categories | Yes |
| `POST` | `/api/categories` | Create a new category | Yes |
| `PUT` | `/api/categories/:id` | Update a category | Yes |
| `DELETE` | `/api/categories/:id` | Delete a category | Yes |

### Accounts

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/accounts` | Get all accounts | Yes |
| `POST` | `/api/accounts` | Create a new account | Yes |
| `PUT` | `/api/accounts/:id` | Update an account | Yes |
| `DELETE` | `/api/accounts/:id` | Delete an account | Yes |

### Payments

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payment/create-order` | Create a Razorpay order | Yes |
| `POST` | `/api/payment/verify-payment` | Verify Razorpay payment | Yes |
