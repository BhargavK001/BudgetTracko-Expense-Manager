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
        { _id: 'cat1', name: 'Food & Canteen', type: 'expense', icon: '🍔', color: '#F59E0B' }, // Zomato, Canteen
        { _id: 'cat2', name: 'Travel (Metro/Auto)', type: 'expense', icon: '�', color: '#3B82F6' },
        { _id: 'cat3', name: 'Pocket Money', type: 'income', icon: '💰', color: '#10B981' },
        { _id: 'cat4', name: 'Recharge & Bills', type: 'expense', icon: '�', color: '#EF4444' }, // Jio/Data
        { _id: 'cat5', name: 'Fun & Movies', type: 'expense', icon: '🎬', color: '#8B5CF6' },
        { _id: 'cat6', name: 'Stationery & Xerox', type: 'expense', icon: '📚', color: '#6366F1' }
    ],
    transactions: [
        {
            _id: 'tx1',
            text: 'Dad Sent Pocket Money',
            amount: 8000,
            type: 'income',
            date: new Date().toISOString(), // Today
            category: 'Pocket Money',
            accountId: { _id: 'acc1', name: 'Pocket Money (SBI)', color: '#1E3A8A' },
            description: 'Monthly allowance'
        },
        {
            _id: 'tx2',
            text: 'Canteen Samosa & Chai',
            amount: 45,
            type: 'expense',
            date: new Date().toISOString(), // Today
            category: 'Food & Canteen',
            accountId: { _id: 'acc3', name: 'Cash Stash', color: '#F59E0B' },
            description: 'Evening snacks with friends'
        },
        {
            _id: 'tx3',
            text: 'Zomato - Burger King',
            amount: 350,
            type: 'expense',
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            category: 'Food & Canteen',
            accountId: { _id: 'acc2', name: 'Paytm / UPI', color: '#10B981' },
            description: 'Late night cravings'
        },
        {
            _id: 'tx4',
            text: 'Metro Card Recharge',
            amount: 500,
            type: 'expense',
            date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            category: 'Travel (Metro/Auto)',
            accountId: { _id: 'acc2', name: 'Paytm / UPI', color: '#10B981' },
            description: 'Monthly metro pass top-up'
        },
        {
            _id: 'tx5',
            text: 'Netflix Mobile Plan',
            amount: 149,
            type: 'expense',
            date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            category: 'Recharge & Bills',
            accountId: { _id: 'acc2', name: 'Paytm / UPI', color: '#10B981' },
            description: 'Monthly subscription'
        },
        {
            _id: 'tx6',
            text: 'Xerox Notes (Physics)',
            amount: 120,
            type: 'expense',
            date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
            category: 'Stationery & Xerox',
            accountId: { _id: 'acc3', name: 'Cash Stash', color: '#F59E0B' },
            description: 'Exam preparation notes'
        },
        {
            _id: 'tx7',
            text: 'Movie Tickets (PVR)',
            amount: 450,
            type: 'expense',
            date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
            category: 'Fun & Movies',
            accountId: { _id: 'acc1', name: 'Pocket Money (SBI)', color: '#1E3A8A' },
            description: 'Weekend movie with batchmates'
        },
        {
            _id: 'tx8',
            text: 'Jio 5G Data Pack',
            amount: 61,
            type: 'expense',
            date: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
            category: 'Recharge & Bills',
            accountId: { _id: 'acc2', name: 'Paytm / UPI', color: '#10B981' },
            description: 'Extra data for project work'
        }
    ],
    budgets: [
        { _id: 'bud1', name: 'Monthly Food & Canteen', amount: 3000, spent: 2200, color: '#F59E0B' }, // Often overshot
        { _id: 'bud2', name: 'Travel & Metro', amount: 1500, spent: 500, color: '#3B82F6' },
        { _id: 'bud3', name: 'Party & Fun', amount: 2000, spent: 450, color: '#8B5CF6' }
    ]
};

