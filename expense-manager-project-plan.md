# Expense Manager - Complete Project Plan

## Project Overview
A cross-platform expense tracking application with web and mobile support, featuring comprehensive financial management tools with both dark and light mode themes.

---

## Technology Stack

### Frontend (Web)
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **State Management**: Redux / Context API
- **Routing**: React Router

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB / PostgreSQL
- **Authentication**: JWT + OAuth (Google)

### Mobile App
- **Framework**: React Native (Expo)
- **Build**: Expo EAS Build for APK generation

### Common Features
- Dark Mode & Light Mode support across all platforms
- Responsive design
- Real-time data synchronization

---

## Feature Breakdown

## 1. AUTHENTICATION SYSTEM

### Login Options
1. **Google OAuth** - Continue with Google
2. **Email & Password** - Custom authentication

### User Flow
```
Landing Page → Login/Signup
  ↓
  ├─→ Google OAuth
  └─→ Email + Password
      ↓
  Main Dashboard
```

---

## 2. HEADER SECTION

### Components
- **Left Side**: "Hello, [User Name]"
- **Right Side**: Profile Icon with User Photo
- **Theme Toggle**: Dark/Light mode switch

---

## 3. MAIN DASHBOARD (HOME)

### Key Sections

#### A. Recent Transactions
- Display last 10-15 transactions
- Show: Date, Category, Amount, Type (Income/Expense/Transfer)
- Click to view details

#### B. Monthly Overview Card
- **Spending**: Total expenses for current period
- **Income**: Total income for current period
- **Filter Options**:
  - This Month (default)
  - This Year
  - All Time
- Visual indicators (progress bars/graphs)

---

## 4. FOOTER NAVIGATION (Mobile App)

### Navigation Items
1. **Home** 🏠 - Dashboard
2. **Analytics** 📊 - Reports and insights
3. **Add (+)** ➕ - Quick add transaction (center, prominent)
4. **Accounts** 💳 - Account management
5. **More** ⋯ - Settings and additional options

---

## 5. ADD TRANSACTION FEATURE

### Transaction Types

#### A. INCOME
- **Date & Time**: DateTime picker
- **Amount**: Numeric input
- **Category**: Dropdown (Salary, Business, Investment, Gift, etc.)
- **Payment Mode/Account**: Select account (fetched from user's accounts)
- **Other Details**:
  - Note/Description (text area)
  - Tags (comma-separated or chip input)
  - Attachment (upload receipt/image)

#### B. EXPENSE
- **Date & Time**: DateTime picker
- **Amount**: Numeric input
- **Category**: Dropdown (Food, Transport, Bills, Shopping, etc.)
- **Payment Mode/Account**: Select account
- **Other Details**:
  - Note/Description
  - Tags
  - Attachment

#### C. TRANSFER
- **From Account**: Dropdown (source account)
- **To Account**: Dropdown (destination account)
- **Date & Time**: DateTime picker
- **Amount**: Numeric input
- **Note**: Optional description
- **Tags**: Optional tags

### Form Validation
- Required fields: Amount, Date, Category/Accounts
- Amount must be positive number
- Transfer: From and To accounts cannot be same

---

## 6. ANALYTICS SECTION

### Overview Widgets

#### A. Two Main Cards
1. **Spending Analysis**
2. **Income Analysis**

#### B. Time Period Slider
- Week
- Month
- Year
- Custom Date Range

#### C. Budget Selection
- Select specific budget to track
- Compare actual vs budgeted amounts

#### D. Category-wise Breakdown
- **List View**: Category name, amount, percentage
- **Pie Chart**: Visual representation of spending/income by category
- Color-coded categories

#### E. Available for Both
- Expense Analytics
- Income Analytics
- Can switch between views

### Charts & Visualizations
- Line graphs for trends
- Bar charts for comparisons
- Pie charts for category distribution
- Progress bars for budget tracking

---

## 7. ACCOUNTS MANAGEMENT

### Account Types
1. **Bank Accounts**
   - SBI
   - HDFC
   - ICICI
   - Axis
   - Other banks

2. **Cash**
   - Physical cash on hand

3. **Digital Wallets**
   - Paytm
   - Google Pay
   - PhonePe
   - Other wallets

4. **Credit Cards**

### Account Features
- Add multiple accounts
- Set account name
- Set initial balance
- Account type/category
- Account color (for easy identification)
- Edit/Delete accounts
- View account transaction history
- Current balance display

### Account Card Display
```
┌─────────────────────────┐
│ 🏦 SBI Savings         │
│ ₹45,234.50             │
│ Last transaction: 2 days│
└─────────────────────────┘
```

---

## 8. SETTINGS SECTION

### Profile Setup
1. **Name**: Edit display name
2. **Email**: View/Update email
3. **Password Change**: 
   - Current password
   - New password
   - Confirm password
4. **Profile Photo**: Upload/Change profile picture

### Backup & Restore
1. **Backup Options**:
   - **Google Drive**: Auto-sync to Google Drive
   - **Local Storage**: Download CSV file
   
2. **Restore Options**:
   - Import from Google Drive
   - Import from CSV file

### Data Management
- **Export Data**: Download all data as CSV
- **Import Data**: Upload CSV to restore/migrate data

### Calendar Integration
- **Month View Calendar**: Shows all transactions
- Tap on date to see transactions
- Color-coded by transaction type
- Total spending/income for tapped date

### Category Management
- **Add Custom Categories**:
  - Income categories
  - Expense categories
  - Set category icon
  - Set category color

### Default Payment Mode
- Set preferred default account for quick transactions

### Account List Management
- Create new accounts
- Edit existing accounts
- Delete accounts (with confirmation)
- Reorder accounts

### Daily Reminder
- Enable/Disable reminder
- Set time for daily reminder
- Reminder message customization
- Notification settings

### App Preferences
- **Theme**: Light/Dark mode toggle
- **Currency**: Select currency symbol
- **Date Format**: DD/MM/YYYY or MM/DD/YYYY
- **Language**: Multi-language support (future)

### Privacy & Security
- Biometric lock (fingerprint/face ID)
- PIN lock
- Auto-lock timeout

### About & Support
- App version
- Terms of Service
- Privacy Policy
- Contact Support
- Rate the App

---

## 9. DARK MODE & LIGHT MODE

### Color Schemes

#### Light Mode
- Background: White (#FFFFFF)
- Card Background: Light Gray (#F5F5F5)
- Text Primary: Dark Gray (#333333)
- Text Secondary: Medium Gray (#666666)
- Accent: Blue (#007AFF)

#### Dark Mode
- Background: Dark (#121212)
- Card Background: Dark Gray (#1E1E1E)
- Text Primary: White (#FFFFFF)
- Text Secondary: Light Gray (#B0B0B0)
- Accent: Light Blue (#64B5F6)

### Implementation
- Use Tailwind's dark mode with class strategy
- Store theme preference in local storage
- Smooth transition between themes
- Consistent colors across all screens

---

## 10. DATABASE SCHEMA

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  profilePhoto: String (URL),
  googleId: String (for OAuth),
  theme: String ('light' or 'dark'),
  createdAt: Date,
  updatedAt: Date
}
```

### Accounts Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to Users),
  name: String,
  type: String ('bank', 'cash', 'wallet', 'credit_card'),
  balance: Number,
  currency: String,
  color: String,
  icon: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Transactions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String ('income', 'expense', 'transfer'),
  amount: Number,
  category: String,
  accountId: ObjectId (reference to Accounts),
  toAccountId: ObjectId (for transfers),
  fromAccountId: ObjectId (for transfers),
  date: Date,
  time: String,
  note: String,
  tags: Array of Strings,
  attachments: Array of Strings (URLs),
  createdAt: Date,
  updatedAt: Date
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  type: String ('income' or 'expense'),
  icon: String,
  color: String,
  isDefault: Boolean,
  createdAt: Date
}
```

### Budgets Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  categoryId: ObjectId,
  amount: Number,
  period: String ('weekly', 'monthly', 'yearly'),
  startDate: Date,
  endDate: Date,
  createdAt: Date
}
```

---

## 11. API ENDPOINTS

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh JWT token

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/password` - Change password
- `POST /api/user/profile-photo` - Upload profile photo

### Accounts
- `GET /api/accounts` - Get all user accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id` - Get specific account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/recent` - Get recent transactions

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create custom category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Analytics
- `GET /api/analytics/spending` - Get spending analysis
- `GET /api/analytics/income` - Get income analysis
- `GET /api/analytics/category-wise` - Category breakdown
- `GET /api/analytics/monthly-overview` - Monthly summary

### Backup & Restore
- `GET /api/backup/export` - Export data as CSV
- `POST /api/backup/import` - Import data from CSV
- `POST /api/backup/google-drive` - Backup to Google Drive
- `GET /api/backup/google-drive` - Restore from Google Drive

---

## 12. DEVELOPMENT PHASES

### Phase 1: Setup & Authentication (Week 1-2)
- [ ] Setup React project (web)
- [ ] Setup React Native Expo project (mobile)
- [ ] Setup Node.js backend
- [ ] Database setup
- [ ] Implement authentication (email/password)
- [ ] Implement Google OAuth
- [ ] Dark/Light mode setup

### Phase 2: Core Features (Week 3-5)
- [ ] Dashboard/Home screen
- [ ] Add transaction functionality
- [ ] Account management
- [ ] Transaction listing
- [ ] Profile setup

### Phase 3: Analytics & Reporting (Week 6-7)
- [ ] Analytics screen
- [ ] Charts implementation
- [ ] Budget tracking
- [ ] Category-wise analysis

### Phase 4: Settings & Advanced Features (Week 8-9)
- [ ] Settings screen
- [ ] Backup/Restore functionality
- [ ] Calendar view
- [ ] Category management
- [ ] Daily reminders

### Phase 5: Testing & Refinement (Week 10-11)
- [ ] Bug fixing
- [ ] Performance optimization
- [ ] UI/UX improvements
- [ ] Cross-platform testing

### Phase 6: Deployment (Week 12)
- [ ] Build APK for Android
- [ ] Deploy web app
- [ ] Setup backend server
- [ ] Final testing

---

## 13. UI/UX GUIDELINES

### Design Principles
1. **Simplicity**: Clean, minimalist interface
2. **Consistency**: Same components across web and mobile
3. **Accessibility**: Readable fonts, good contrast
4. **Responsiveness**: Works on all screen sizes

### Color Coding
- 🟢 Income: Green (#4CAF50)
- 🔴 Expense: Red (#F44336)
- 🔵 Transfer: Blue (#2196F3)

### Typography
- Headers: Bold, 24-32px
- Body: Regular, 14-16px
- Small text: 12px

### Spacing
- Consistent padding: 16px, 24px
- Card margins: 12px
- Section spacing: 32px

---

## 14. MOBILE APP BUILD (APK)

### Using Expo EAS Build

#### Prerequisites
```bash
npm install -g eas-cli
eas login
```

#### Configuration
1. Create `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

#### Build Commands
```bash
# For development APK
eas build --platform android --profile preview

# For production
eas build --platform android --profile production
```

---

## 15. FOLDER STRUCTURE

### Web (React)
```
expense-manager-web/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Transactions/
│   │   ├── Analytics/
│   │   ├── Accounts/
│   │   └── Settings/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── context/
│   ├── hooks/
│   ├── App.js
│   └── index.js
├── package.json
└── tailwind.config.js
```

### Mobile (React Native)
```
expense-manager-app/
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── services/
│   ├── utils/
│   ├── context/
│   └── theme/
├── assets/
├── App.js
├── app.json
└── package.json
```

### Backend (Node.js)
```
expense-manager-backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── config/
├── server.js
└── package.json
```

---

## 16. KEY PACKAGES

### Web
- react-router-dom
- axios
- tailwindcss
- react-icons
- chart.js / recharts
- date-fns
- react-datepicker

### Mobile
- @react-navigation/native
- @react-navigation/bottom-tabs
- axios
- expo-image-picker
- expo-notifications
- react-native-chart-kit
- @react-native-async-storage/async-storage

### Backend
- express
- mongoose / pg
- bcryptjs
- jsonwebtoken
- passport (Google OAuth)
- multer (file uploads)
- csv-parser
- cors
- dotenv

---

## 17. SECURITY CONSIDERATIONS

- Password hashing with bcrypt
- JWT token expiration
- Secure HTTP headers
- Input validation
- SQL/NoSQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Environment variables for sensitive data

---

## 18. FUTURE ENHANCEMENTS

- Multi-currency support
- Recurring transactions
- Bill reminders
- Receipt OCR
- Financial insights (AI-powered)
- Split expenses (for groups)
- Investment tracking
- Loan/EMI calculator
- Tax calculation
- Export reports (PDF)
- Email reports
- Collaborative budgets

---

## Summary

This expense manager will be a comprehensive financial management solution with:
- ✅ Cross-platform support (Web + Mobile)
- ✅ Secure authentication
- ✅ Multiple account management
- ✅ Detailed transaction tracking
- ✅ Advanced analytics
- ✅ Budget tracking
- ✅ Backup & restore
- ✅ Dark/Light themes
- ✅ User-friendly interface

**Estimated Development Time**: 10-12 weeks for MVP

**Team Requirement**: 
- 1 Full-stack developer (or)
- 1 Frontend + 1 Backend developer

**Budget Estimate**: Based on team and timeline
