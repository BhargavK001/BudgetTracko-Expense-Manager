# BudgetTracko - Expense Manager: Current Project Status & Overview

## 📌 Project Overview & Idea
**BudgetTracko** is a comprehensive, cross-platform personal finance management application designed to help students, professionals, and families control their financial life. The core idea is to move beyond simple expense tracking to provide deep insights into spending habits, enabling users to save more and spend wisely.

The project aims to provide a seamless experience across **Web** (for detailed analysis and management) and **Mobile** (for on-the-go tracking), synchronized in real-time.

### 🎯 Core Objectives
- **Centralize Finances**: Track cash, bank accounts, digital wallets, and credit cards in one place.
- **Spending Insights**: Visual analytics to understand where money is going.
- **Budget Control**: Set limits and get alerts to avoid overspending.
- **Accessibility**: Available as a modern web app and a native mobile app.

---

## 🚧 Current Implementation Status

### ✅ Completed / Functional
- **Authentication**: Secure login/signup system using JWT and Firebase Auth.
  - Google OAuth integration.
  - Password reset functionality.
- **Web Dashboard**: 
  - Responsive UI built with React + Tailwind CSS.
  - Real-time overview of Balance, Income, and Expenses.
  - "Spending Trend" and category breakdowns.
- **Transaction Management**:
  - Add/Edit/Delete Income, Expenses, and Transfers.
  - Categorization and tagging support.
  - Recurring Entries (subscriptions, rent).
- **Budgeting**: 
  - Comprehensive budget setting and tracking limits per category.
  - Category-based budget vs actual comparisons.
- **Mobile App**: 
  - React Native (Expo) implementation for Android.
  - Key features: Dashboard, Add Transaction, Analytics.
- **Backend API**:
  - Robust Node.js/Express REST API.
  - MongoDB database integration with Mongoose.
  - Endpoints for Auth, Users, Accounts, Transactions, and Analytics.
- **Theme**: Dark and Light mode support across platforms.

### 🛠 In Progress / Pending Refinement
- **Export/Import**: Google Drive backup and restore integration.
- **Notifications**: Push notifications for bill reminders and budget alerts (Libraries not yet installed).

---

## 💻 Technology Stack

### Frontend (Web)
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Context API
- **Visualization**: Recharts / Chart.js

### Mobile App
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **Charts**: React Native Chart Kit

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Passport.js (Google Strategy), JWT
- **Security**: Helmet, CORS, Rate Limiting

### Infrastructure
- **Hosting (Web)**: Vercel
- **Hosting (Backend)**: Render / Railway / AWS
- **Image Storage**: Cloudinary

---

## 📂 Project Structure

```
BudgetTracko/
├── app/
│   ├── backend/            # Express.js Server & API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── config/
│   │   └── package.json
│   │
│   ├── frontend/           # React Web Application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── context/
│   │   │   └── hooks/
│   │   └── package.json
│   │
│   └── mobile/             # React Native App
│       ├── src/
│       │   ├── screens/
│       │   ├── navigation/
│       │   └── components/
│       └── app.json
│
├── .github/                # GitHub Actions & Workflows
└── README.md              # Original Repo Readme
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Connection URI (Local or Atlas)
- Google OAuth Credentials (for social login)

### 1. Backend Setup
```bash
cd app/backend
npm install
cp .env.example .env  # Configure your MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_ID
npm run dev
```

### 2. Frontend (Web) Setup
```bash
cd app/frontend
npm install
cp .env.example .env  # Configure VITE_API_BASE_URL
npm run dev
```

### 3. Mobile App Setup
```bash
cd app/mobile
npm install
npx expo start
```

---

## ✨ Key Features Summary

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Multi-Platform** | Web & Android support with synced data. | ✅ Live |
| **Financial Overview** | Dashboard with cards for Net Worth, Income, Expense. | ✅ Live |
| **Smart Transactions** | Categorized entries with notes and attachments. | ✅ Live |
| **Recurring Entries** | Setup automatic payments for rent/subscriptions. | ✅ Live |
| **Budgeting System** | Manage and track category-specific budgets. | ✅ Live |
| **Advanced Analytics** | Custom date ranges, health score gauge, and deep-dive charts. | ✅ Live |
| **Visual Analytics** | Pie charts and trend lines for spending habits. | ✅ Live |
| **Data Security** | Encrypted passwords and secure token-based auth. | ✅ Live |
| **Theme System** | Toggle between professional Light and sleek Dark modes. | ✅ Live |

---

*This document reflects the current state of the BudgetTracko project as of Feb 2026.*
