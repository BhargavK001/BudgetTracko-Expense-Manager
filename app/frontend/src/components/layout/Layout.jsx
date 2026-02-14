import { useTheme } from '../../context/ThemeContext';
import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200 font-sans">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-dark-card shadow-sm">
                <h1 className="text-xl font-bold text-primary">BudgetTracko</h1>
                <div className="flex items-center gap-6">
                    <nav className="flex gap-4">
                        <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary transition">Dashboard</Link>
                        <Link to="/transactions" className="text-gray-600 dark:text-gray-300 hover:text-primary transition">Transactions</Link>
                    </nav>
                    <button
                        onClick={toggleTheme}
                        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-4">
                <Outlet />
            </main>

            <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 mt-8 border-t border-gray-200 dark:border-gray-700">
                &copy; {new Date().getFullYear()} BudgetTracko. All rights reserved.
            </footer>
        </div>
    );
};

export default Layout;
