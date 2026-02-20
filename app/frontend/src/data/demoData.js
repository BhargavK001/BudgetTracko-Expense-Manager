export const demoData = {
    user: {
        _id: 'demo-student-123',
        name: 'Bhargav Karande',
        displayName: 'Bhargav Karande', // Added for Dashboard greeting
        email: 'bhargav.student@budgettracko.app',
        isDemo: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bhargav'
    },
    accounts: [
        { _id: 'acc1', name: 'Pocket Money (SBI)', type: 'Bank', balance: 5000, color: '#1E3A8A' },
        { _id: 'acc2', name: 'Paytm / UPI', type: 'Wallet', balance: 1250, color: '#10B981' }, // High velocity spending
        { _id: 'acc3', name: 'Cash Stash', type: 'Cash', balance: 450, color: '#F59E0B' }
    ],
    categories: [
        { _id: 'cat1', name: 'Food & Canteen', type: 'expense', icon: 'food', color: '#F59E0B' }, // Zomato, Canteen
        { _id: 'cat2', name: 'Travel (Metro/Auto)', type: 'expense', icon: 'transport', color: '#3B82F6' },
        { _id: 'cat3', name: 'Pocket Money', type: 'income', icon: 'money', color: '#10B981' },
        { _id: 'cat4', name: 'Recharge & Bills', type: 'expense', icon: 'bills', color: '#EF4444' }, // Jio/Data
        { _id: 'cat5', name: 'Fun & Movies', type: 'expense', icon: 'entertainment', color: '#8B5CF6' },
        { _id: 'cat6', name: 'Stationery & Xerox', type: 'expense', icon: 'education', color: '#6366F1' }
    ],
    transactions: [
        // ─── WEEK 1 (1st - 7th) ───
        {
            _id: 'tx1',
            text: 'Dad Sent Pocket Money',
            amount: 15000,
            type: 'income',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
            category: 'Pocket Money',
            accountId: { _id: 'acc1', name: 'Pocket Money (SBI)', color: '#1E3A8A' },
            description: 'Monthly allowance'
        },
        {
            _id: 'tx2',
            text: 'Hostel Fees / Rent Share',
            amount: -4500,
            type: 'expense',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 3).toISOString(),
            category: 'Recharge & Bills',
            accountId: { _id: 'acc1', name: 'Pocket Money (SBI)', color: '#1E3A8A' },
            description: 'Monthly rent share'
        },
        {
            _id: 'tx3',
            text: 'Grocery & Essentials',
            amount: -1200,
            type: 'expense',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(),
            category: 'Food & Canteen',
            accountId: { _id: 'acc2', name: 'Paytm / UPI', color: '#10B981' },
            description: 'Stocking up for the month'
        },

        // ─── WEEK 2 (8th - 14th) ───
        {
            _id: 'tx4',
            text: 'Metro Card Recharge',
            amount: -800,
            type: 'expense',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
            category: 'Travel (Metro/Auto)',
            accountId: { _id: 'acc2', name: 'Paytm / UPI', color: '#10B981' },
            description: 'Monthly pass'
        },
        {
            _id: 'tx5',
            text: 'Stationery & Books',
            amount: -650,
            type: 'expense',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 12).toISOString(),
            category: 'Stationery & Xerox',
            accountId: { _id: 'acc3', name: 'Cash Stash', color: '#F59E0B' },
            description: 'Practical journals and pens'
        },
        {
            _id: 'tx6',
            text: 'Canteen Snacks',
            amount: -150,
            type: 'expense',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 14).toISOString(),
            category: 'Food & Canteen',
            accountId: { _id: 'acc3', name: 'Cash Stash', color: '#F59E0B' },
            description: 'Samosa party'
        },

        // ─── WEEK 3 (15th - 21st) ───
        {
            _id: 'tx7',
            text: 'Freelance Project Payment',
            amount: 5000,
            type: 'income',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 16).toISOString(),
            category: 'Pocket Money', // Or 'Side Hustle' if we add it
            accountId: { _id: 'acc1', name: 'Pocket Money (SBI)', color: '#1E3A8A' },
            description: 'Logo design for a friend'
        },
        {
            _id: 'tx8',
            text: 'Weekend Movie & Dinner',
            amount: -1800,
            type: 'expense',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 18).toISOString(),
            category: 'Fun & Movies',
            accountId: { _id: 'acc2', name: 'Paytm / UPI', color: '#10B981' },
            description: 'Treat for friends'
        },
        {
            _id: 'tx9',
            text: 'Mobile Data Plan',
            amount: -299,
            type: 'expense',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString(),
            category: 'Recharge & Bills',
            accountId: { _id: 'acc2', name: 'Paytm / UPI', color: '#10B981' },
            description: 'Jio 5G Pack'
        },

        // ─── WEEK 4 (22nd - End) ───
        {
            _id: 'tx10',
            text: 'Xerox & Printouts',
            amount: -80,
            type: 'expense',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 24).toISOString(),
            category: 'Stationery & Xerox',
            accountId: { _id: 'acc3', name: 'Cash Stash', color: '#F59E0B' },
            description: 'Assignment submission'
        },
        {
            _id: 'tx11',
            text: 'Midnight Cravings (Zomato)',
            amount: -450,
            type: 'expense',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 26).toISOString(),
            category: 'Food & Canteen',
            accountId: { _id: 'acc2', name: 'Paytm / UPI', color: '#10B981' },
            description: 'Stress eating during exams'
        },
        {
            _id: 'tx12',
            text: 'Borrowed from Roommate',
            amount: 500,
            type: 'income',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 28).toISOString(),
            category: 'Pocket Money',
            accountId: { _id: 'acc3', name: 'Cash Stash', color: '#F59E0B' },
            description: 'Short on cash for end month'
        }
    ],
    budgets: [
        { _id: 'bud1', name: 'Monthly Food & Canteen', amount: 3000, spent: 2200, color: '#F59E0B' }, // Often overshot
        { _id: 'bud2', name: 'Travel & Metro', amount: 1500, spent: 500, color: '#3B82F6' },
        { _id: 'bud3', name: 'Party & Fun', amount: 2000, spent: 450, color: '#8B5CF6' }
    ],
    recurringBills: [
        { _id: 'rec1', name: 'Netflix', amount: 649, dueDate: 18, category: 'Entertainment', frequency: 'monthly', autoPay: true },
        { _id: 'rec2', name: 'Electricity', amount: 1450, dueDate: 22, category: 'Bills', frequency: 'monthly', autoPay: false },
        { _id: 'rec3', name: 'Hostel Rent', amount: 4500, dueDate: 5, category: 'Housing', frequency: 'monthly', autoPay: true }
    ]
};

