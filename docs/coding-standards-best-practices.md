# Expense Manager - Coding Standards & Best Practices

## 1. PROJECT STRUCTURE RULES

### ✅ DO: Follow This Folder Structure

#### Web (React)
```
src/
├── components/           # Reusable components only
│   ├── common/          # Buttons, Inputs, Cards, etc.
│   ├── layout/          # Header, Footer, Sidebar
│   └── features/        # Feature-specific components
├── pages/               # One file per route/page
├── hooks/               # Custom React hooks
├── context/             # Context API providers
├── services/            # API calls (grouped by feature)
├── utils/               # Helper functions
├── constants/           # Constants and enums
├── assets/              # Images, icons, fonts
└── styles/              # Global styles (if any)
```

#### Mobile (React Native)
```
src/
├── screens/             # One file per screen
├── components/          # Reusable components
├── navigation/          # Navigation configuration
├── hooks/               # Custom hooks
├── services/            # API calls
├── utils/               # Helper functions
├── constants/           # Constants
├── assets/              # Images, fonts
└── theme/               # Colors, typography
```

#### Backend (Node.js)
```
src/
├── controllers/         # Business logic
├── models/              # Database models
├── routes/              # API routes
├── middleware/          # Custom middleware
├── services/            # External services
├── utils/               # Helper functions
├── validators/          # Input validation
├── config/              # Configuration files
└── constants/           # Constants
```

### ❌ DON'T:
- Don't create random folders like "stuff", "temp", "misc"
- Don't put everything in one folder
- Don't mix components with pages
- Don't put business logic in components
- Don't create deeply nested folders (max 3 levels)

---

## 2. NAMING CONVENTIONS

### ✅ DO:

#### Files & Folders
- **Components**: PascalCase → `UserProfile.jsx`, `TransactionCard.jsx`
- **Pages**: PascalCase → `Dashboard.jsx`, `Login.jsx`
- **Utilities**: camelCase → `formatDate.js`, `validateEmail.js`
- **Hooks**: camelCase with "use" prefix → `useAuth.js`, `useFetch.js`
- **Constants**: UPPER_SNAKE_CASE → `API_ENDPOINTS.js`, `COLORS.js`
- **Folders**: lowercase → `components/`, `services/`, `utils/`

#### Variables & Functions
- **Variables**: camelCase → `userName`, `totalAmount`, `isLoggedIn`
- **Functions**: camelCase, verb-first → `getUserData()`, `calculateTotal()`, `handleSubmit()`
- **Constants**: UPPER_SNAKE_CASE → `const MAX_FILE_SIZE = 5000000`
- **Components**: PascalCase → `<TransactionList />`, `<AddButton />`

#### API & Database
- **API Routes**: kebab-case → `/api/user-profile`, `/api/transactions`
- **Database Collections**: lowercase plural → `users`, `transactions`, `accounts`
- **Database Fields**: camelCase → `firstName`, `createdAt`, `isActive`

### ❌ DON'T:
- Don't use random names like `file1.js`, `component2.jsx`, `stuff.js`
- Don't mix naming styles in same project
- Don't use abbreviations unless common (like `id`, `url`)
- Don't use single letter variables except in loops (`i`, `j`, `k`)

---

## 3. CODE FORMATTING RULES

### ✅ DO: Always Format Like This

#### Indentation & Spacing
```javascript
// Use 2 spaces for indentation
function calculateTotal(items) {
  const total = items.reduce((sum, item) => {
    return sum + item.price;
  }, 0);
  
  return total;
}

// Add blank line between logical sections
const user = await User.findById(userId);
const transactions = await Transaction.find({ userId });

return { user, transactions };
```

#### Line Length
- Maximum 80-100 characters per line
- Break long lines into multiple lines

```javascript
// ✅ Good
const result = await api.createTransaction({
  amount,
  category,
  date,
  note
});

// ❌ Bad - too long
const result = await api.createTransaction({ amount, category, date, note, accountId, tags, attachments });
```

### ❌ DON'T:
- Don't use tabs (use spaces)
- Don't write everything in one line
- Don't inconsistently space code
- Don't skip blank lines between functions

---

## 4. COMMENTING RULES

### ✅ DO: Write Meaningful Comments

#### When to Comment
```javascript
// ✅ Good - Explains WHY, not WHAT
// Using bcrypt rounds of 10 for security vs performance balance
const hashedPassword = await bcrypt.hash(password, 10);

// ✅ Good - Complex business logic
// Calculate total by excluding transferred amounts to avoid double counting
const netTotal = transactions
  .filter(t => t.type !== 'transfer')
  .reduce((sum, t) => sum + t.amount, 0);

// ✅ Good - Important warnings
// WARNING: Don't change this without updating the mobile app
const API_VERSION = 'v1';

// ✅ Good - Function documentation
/**
 * Calculates monthly spending by category
 * @param {string} userId - User ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (YYYY)
 * @returns {Promise<Object>} Category-wise spending breakdown
 */
async function getMonthlySpending(userId, month, year) {
  // implementation
}
```

### ❌ DON'T: Write Useless Comments

```javascript
// ❌ Bad - States the obvious
const total = 0; // Initialize total to 0
i++; // Increment i

// ❌ Bad - Commented out code (delete it instead)
// const oldFunction = () => {
//   return something;
// }

// ❌ Bad - Misleading or outdated
// TODO: Fix this later (from 2 years ago)
// This function gets user data (but it actually deletes user)
```

### Rules:
- Write comments that explain **WHY**, not **WHAT**
- Keep comments up-to-date with code
- Delete commented-out code (use Git for history)
- Use JSDoc for function documentation
- No random comments like "asdfgh" or "testing"

---

## 5. COMPONENT STRUCTURE RULES

### ✅ DO: Follow This Pattern

```javascript
// 1. Imports (grouped)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 2. Component
function TransactionCard({ transaction, onDelete }) {
  // 3. Hooks at the top
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  
  // 4. Event handlers
  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(transaction.id);
    setIsDeleting(false);
  };
  
  const handleEdit = () => {
    navigate(`/edit/${transaction.id}`);
  };
  
  // 5. Early returns
  if (!transaction) {
    return null;
  }
  
  // 6. Render
  return (
    <div className="card">
      <h3>{transaction.title}</h3>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleDelete} disabled={isDeleting}>
        Delete
      </button>
    </div>
  );
}

// 7. Export at bottom
export default TransactionCard;
```

### ❌ DON'T:
- Don't put business logic inside JSX
- Don't call hooks conditionally or in loops
- Don't mix component logic with API calls
- Don't create inline functions in render (use handlers)

---

## 6. API & DATA HANDLING RULES

### ✅ DO: Organize API Calls

#### Create Service Files
```javascript
// services/transactionService.js

import axios from 'axios';
import { API_BASE_URL } from '../constants';

const transactionService = {
  // Get all transactions
  getAll: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/transactions`, {
      params: filters
    });
    return response.data;
  },
  
  // Create transaction
  create: async (transactionData) => {
    const response = await axios.post(
      `${API_BASE_URL}/transactions`,
      transactionData
    );
    return response.data;
  },
  
  // Update transaction
  update: async (id, updates) => {
    const response = await axios.put(
      `${API_BASE_URL}/transactions/${id}`,
      updates
    );
    return response.data;
  },
  
  // Delete transaction
  delete: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/transactions/${id}`
    );
    return response.data;
  }
};

export default transactionService;
```

#### Use in Components
```javascript
import transactionService from '../services/transactionService';

// ✅ Good - Clean and organized
const fetchTransactions = async () => {
  try {
    const data = await transactionService.getAll({ type: 'expense' });
    setTransactions(data);
  } catch (error) {
    showError('Failed to fetch transactions');
  }
};
```

### ❌ DON'T:
```javascript
// ❌ Bad - API calls directly in components
const fetchData = async () => {
  const res = await fetch('http://localhost:5000/api/transactions');
  const json = await res.json();
  setData(json.data.results);
};
```

---

## 7. ERROR HANDLING RULES

### ✅ DO: Handle Errors Properly

```javascript
// Frontend
try {
  const result = await transactionService.create(data);
  showSuccess('Transaction created successfully');
  navigate('/dashboard');
} catch (error) {
  if (error.response?.status === 401) {
    showError('Please login again');
    navigate('/login');
  } else if (error.response?.status === 400) {
    showError(error.response.data.message);
  } else {
    showError('Something went wrong. Please try again.');
  }
  console.error('Transaction creation failed:', error);
}

// Backend
try {
  const transaction = await Transaction.create(req.body);
  res.status(201).json({ success: true, data: transaction });
} catch (error) {
  console.error('Transaction creation error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Failed to create transaction' 
  });
}
```

### ❌ DON'T:
```javascript
// ❌ Bad - Silent failures
try {
  await saveData();
} catch (error) {
  // Do nothing
}

// ❌ Bad - Generic errors
catch (error) {
  alert('Error');
}

// ❌ Bad - Exposing sensitive info
catch (error) {
  res.json({ error: error.stack });
}
```

---

## 8. STATE MANAGEMENT RULES

### ✅ DO: Keep State Clean

```javascript
// ✅ Good - Organized state
const [user, setUser] = useState(null);
const [transactions, setTransactions] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

// ✅ Good - Update state immutably
setTransactions(prev => [...prev, newTransaction]);
setUser(prev => ({ ...prev, name: newName }));

// ✅ Good - Use Context for global state
const { user, setUser } = useAuth();
```

### ❌ DON'T:
```javascript
// ❌ Bad - Mutating state directly
transactions.push(newTransaction); // Wrong!
user.name = 'New Name'; // Wrong!

// ❌ Bad - Too many useState
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [address, setAddress] = useState('');
// Use one object instead!

// ❌ Bad - Storing derived data in state
const [total, setTotal] = useState(0);
const [count, setCount] = useState(0);
// Calculate these from transactions instead!
```

---

## 9. STYLING RULES (Tailwind CSS)

### ✅ DO: Use Tailwind Consistently

```javascript
// ✅ Good - Organized classes
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
    Title
  </h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
    Click
  </button>
</div>

// ✅ Good - Reusable component classes
const buttonStyles = "px-4 py-2 rounded font-medium transition";
const primaryButton = `${buttonStyles} bg-blue-500 text-white hover:bg-blue-600`;
const secondaryButton = `${buttonStyles} bg-gray-200 text-gray-800 hover:bg-gray-300`;
```

### ❌ DON'T:
```javascript
// ❌ Bad - Inline styles with Tailwind
<div style={{ padding: '16px' }} className="bg-white">

// ❌ Bad - Mixing random custom CSS
<div className="custom-style-123 flex">

// ❌ Bad - Not using dark mode classes
<div className="bg-white text-black"> // Should include dark: variants
```

---

## 10. SECURITY RULES

### ✅ DO: Follow Security Best Practices

```javascript
// ✅ Good - Validate inputs
const { error } = validateTransaction(req.body);
if (error) {
  return res.status(400).json({ message: error.details[0].message });
}

// ✅ Good - Sanitize user inputs
const sanitizedNote = note.trim().substring(0, 500);

// ✅ Good - Use environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Good - Hash passwords
const hashedPassword = await bcrypt.hash(password, 10);

// ✅ Good - Verify JWT tokens
const decoded = jwt.verify(token, JWT_SECRET);
```

### ❌ DON'T:
```javascript
// ❌ Bad - Hardcoded secrets
const JWT_SECRET = 'mysecret123';

// ❌ Bad - No validation
const user = await User.create(req.body); // Dangerous!

// ❌ Bad - Plain text passwords
const user = { password: req.body.password };

// ❌ Bad - Exposing sensitive data
res.json({ user: userWithPassword });
```

---

## 11. PERFORMANCE RULES

### ✅ DO: Optimize Performance

```javascript
// ✅ Good - Use useCallback for functions
const handleDelete = useCallback(async (id) => {
  await deleteTransaction(id);
}, []);

// ✅ Good - Use useMemo for expensive calculations
const totalExpenses = useMemo(() => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}, [transactions]);

// ✅ Good - Lazy load heavy components
const Charts = lazy(() => import('./components/Charts'));

// ✅ Good - Pagination for large lists
const ITEMS_PER_PAGE = 20;

// ✅ Good - Debounce search
const debouncedSearch = debounce(searchTransactions, 300);
```

### ❌ DON'T:
```javascript
// ❌ Bad - Recalculating on every render
function Component() {
  const total = transactions.reduce(...); // Runs every render!
}

// ❌ Bad - Loading everything at once
const [transactions, setTransactions] = useState([]); // 10,000 items

// ❌ Bad - No optimization
{transactions.map(t => <TransactionCard transaction={t} />)}
// Use React.memo for TransactionCard
```

---

## 12. TESTING RULES

### ✅ DO: Write Tests

```javascript
// ✅ Good - Test critical functions
describe('calculateTotal', () => {
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
  
  it('should sum all amounts correctly', () => {
    const items = [{ amount: 10 }, { amount: 20 }];
    expect(calculateTotal(items)).toBe(30);
  });
});

// ✅ Good - Test API endpoints
describe('POST /api/transactions', () => {
  it('should create transaction successfully', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .send(validTransaction)
      .expect(201);
    
    expect(response.body.success).toBe(true);
  });
});
```

### ❌ DON'T:
- Don't skip tests for critical features
- Don't test implementation details
- Don't write tests that always pass

---

## 13. GIT & VERSION CONTROL RULES

### ✅ DO: Follow Git Best Practices

#### Commit Messages
```
✅ Good commit messages:
feat: Add transaction filtering by date range
fix: Resolve login redirect issue
refactor: Simplify authentication logic
docs: Update API documentation
style: Format code with Prettier
test: Add tests for transaction service

❌ Bad commit messages:
"update"
"fix bug"
"asdfgh"
"changes"
"WIP"
```

#### Branching
```
main (production)
├── develop (development)
│   ├── feature/add-transaction-filter
│   ├── feature/dark-mode
│   ├── bugfix/login-issue
│   └── hotfix/critical-security-patch
```

### ❌ DON'T:
- Don't commit directly to main
- Don't commit sensitive data (.env files)
- Don't commit node_modules
- Don't use vague commit messages

---

## 14. CODE QUALITY CHECKLIST

### Before Every Commit:

✅ **Code Works**
- [ ] Code runs without errors
- [ ] All features work as expected
- [ ] No console errors

✅ **Code Quality**
- [ ] No unused variables or imports
- [ ] No commented-out code
- [ ] Proper error handling
- [ ] Consistent naming conventions

✅ **Performance**
- [ ] No infinite loops
- [ ] No memory leaks
- [ ] Optimized re-renders

✅ **Security**
- [ ] Inputs validated
- [ ] No hardcoded secrets
- [ ] No sensitive data exposed

✅ **Documentation**
- [ ] Complex logic commented
- [ ] README updated if needed
- [ ] API changes documented

---

## 15. COMMON MISTAKES TO AVOID

### ❌ NEVER DO THIS:

```javascript
// 1. Don't ignore TypeScript/ESLint warnings
// @ts-ignore  // Bad!
// eslint-disable-next-line  // Bad unless necessary!

// 2. Don't use var (use const/let)
var x = 10; // Bad!

// 3. Don't use == (use ===)
if (value == '10') // Bad!

// 4. Don't modify props directly
props.user.name = 'New'; // Bad!

// 5. Don't forget async/await
fetch('/api/data').then(res => res.json()); // Use async/await instead

// 6. Don't nest callbacks (callback hell)
doSomething(() => {
  doAnother(() => {
    doMore(() => {
      // Bad!
    });
  });
});

// 7. Don't console.log in production
console.log('debug info'); // Remove before commit!

// 8. Don't ignore errors
try {
  await riskyOperation();
} catch (e) {} // Never do this!

// 9. Don't use magic numbers
if (amount > 5000000) // What is 5000000? Use constant!

// 10. Don't create god functions
function doEverything() {
  // 500 lines of code... Bad!
}
```

---

## 16. DAILY DEVELOPMENT WORKFLOW

### ✅ DO THIS EVERY DAY:

1. **Start of Day**
   ```bash
   git pull origin develop
   npm install  # If package.json changed
   ```

2. **During Development**
   - Write clean, formatted code
   - Test as you code
   - Commit frequently with meaningful messages
   - Push at end of day

3. **Before Commit**
   - Remove console.logs
   - Delete commented code
   - Run linter: `npm run lint`
   - Format code: `npm run format`
   - Test: `npm test`

4. **End of Day**
   ```bash
   git add .
   git commit -m "feat: descriptive message"
   git push origin feature-branch
   ```

---

## SUMMARY - THE GOLDEN RULES

1. ✅ **Keep it Clean** - Well-organized folders and files
2. ✅ **Keep it Simple** - Don't over-engineer
3. ✅ **Keep it Consistent** - Same style throughout
4. ✅ **Keep it Secure** - Validate, sanitize, encrypt
5. ✅ **Keep it Fast** - Optimize performance
6. ✅ **Keep it Documented** - Comment complex logic
7. ✅ **Keep it Tested** - Write tests for critical features
8. ✅ **Keep it Updated** - Remove outdated code
9. ✅ **Keep it Professional** - No random comments or names
10. ✅ **Keep it Collaborative** - Clear commit messages

**Remember:** Good code is code that others can understand and maintain easily!
