import { useTheme } from '../../context/ThemeContext';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Layout = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200 font-sans">
            {/* Animated Header */}
            <motion.header
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-dark-card shadow-sm"
            >
                <motion.h1
                    whileHover={{ scale: 1.05 }}
                    className="text-lg sm:text-xl font-bold text-primary"
                >
                    <Link to="/dashboard">BudgetTracko</Link>
                </motion.h1>
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Desktop nav links */}
                    <nav className="hidden sm:flex gap-4">
                        <Link to="/dashboard">
                            <motion.span
                                whileHover={{ y: -2, color: '#007AFF' }}
                                className={`inline-block transition ${location.pathname === '/dashboard' ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                Dashboard
                            </motion.span>
                        </Link>
                        <Link to="/transactions">
                            <motion.span
                                whileHover={{ y: -2, color: '#007AFF' }}
                                className={`inline-block transition ${location.pathname === '/transactions' ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                Transactions
                            </motion.span>
                        </Link>
                    </nav>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        whileTap={{ scale: 0.9, rotate: -15 }}
                        onClick={toggleTheme}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm sm:text-base"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </motion.button>
                </div>
            </motion.header>

            <main className="container mx-auto p-3 sm:p-4 pb-20 sm:pb-4">
                <Outlet />
            </main>

            {/* Mobile bottom navigation */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-700 z-50 shadow-lg">
                <div className="flex justify-around items-center py-2">
                    <Link to="/dashboard" className="flex flex-col items-center gap-0.5 py-1 px-3">
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className={`text-2xl ${location.pathname === '/dashboard' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                        >
                            📊
                        </motion.div>
                        <span className={`text-[10px] font-semibold ${location.pathname === '/dashboard' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>Dashboard</span>
                    </Link>
                    <Link to="/transactions" className="flex flex-col items-center gap-0.5 py-1 px-3">
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className={`text-2xl ${location.pathname === '/transactions' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                        >
                            💳
                        </motion.div>
                        <span className={`text-[10px] font-semibold ${location.pathname === '/transactions' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>Transactions</span>
                    </Link>
                </div>
            </nav>

            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="hidden sm:block p-4 text-center text-sm text-gray-500 dark:text-gray-400 mt-8 border-t border-gray-200 dark:border-gray-700"
            >
                &copy; {new Date().getFullYear()} BudgetTracko. All rights reserved.
            </motion.footer>
        </div>
    );
};

export default Layout;
