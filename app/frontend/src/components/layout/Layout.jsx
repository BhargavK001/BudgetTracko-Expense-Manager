import { useTheme } from '../../context/ThemeContext';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BsGrid1X2Fill,
    BsCreditCardFill,
    BsMoonStarsFill,
    BsSunFill,
    BsGearFill,
    BsGraphUp,
    BsPiggyBank,
    BsWallet2,
} from 'react-icons/bs';

const navItems = [
    { to: '/dashboard', icon: BsGrid1X2Fill, label: 'Dashboard' },
    { to: '/analytics', icon: BsGraphUp, label: 'Analytics' },
    { to: '/transactions', icon: BsCreditCardFill, label: 'Transactions' },
    { to: '/budgets', icon: BsPiggyBank, label: 'Budgets' },
    { to: '/accounts', icon: BsWallet2, label: 'Accounts' },
    { to: '/settings', icon: BsGearFill, label: 'Settings' },
];

const SidebarItem = ({ to, icon: Icon, label, isActive }) => (
    <Link to={to} className="w-full block">
        <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${isActive
                ? 'bg-brand-yellow text-brand-black border-2 border-brand-black neo-shadow-sm'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
        >
            <Icon size={18} />
            <span>{label}</span>
        </motion.div>
    </Link>
);

const MobileNavItem = ({ to, icon: Icon, label, isActive }) => (
    <Link to={to} className="flex-1 min-w-0">
        <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center justify-center py-1.5"
        >
            <motion.div
                animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`p-2 rounded-xl transition-colors duration-200 ${isActive
                    ? 'bg-brand-yellow text-brand-black border-2 border-brand-black neo-shadow-sm'
                    : 'text-light-text-secondary dark:text-dark-text-secondary'
                    }`}
            >
                <Icon size={16} />
            </motion.div>
            <span className={`text-[9px] font-bold mt-0.5 uppercase tracking-wider truncate max-w-full ${isActive ? 'text-brand-black dark:text-brand-yellow' : 'text-light-text-secondary dark:text-dark-text-secondary'
                }`}>{label}</span>
        </motion.div>
    </Link>
);

const Layout = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">

            {/* ─── Desktop Sidebar ─── */}
            <aside className="hidden lg:flex flex-col w-60 fixed left-0 top-0 bottom-0 bg-light-card dark:bg-dark-card border-r-2 border-brand-black dark:border-gray-800 z-50 p-5">
                {/* Logo */}
                <div className="mb-8 pl-1">
                    <Link to="/dashboard">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: -1 }}
                            className="text-xl font-black tracking-tighter flex items-center gap-1 cursor-pointer"
                        >
                            <span className="text-brand-black dark:text-white transition-colors">BUDGET</span>
                            <motion.span
                                whileHover={{ rotate: 2 }}
                                className="text-white bg-black dark:bg-white dark:text-black px-1 transform -rotate-2 border-2 border-black dark:border-white transition-colors"
                            >
                                TRACKO
                            </motion.span>
                        </motion.div>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1.5">
                    {navItems.map(item => (
                        <SidebarItem
                            key={item.to}
                            {...item}
                            isActive={location.pathname === item.to}
                        />
                    ))}
                </nav>

                {/* Footer */}
                <div className="mt-auto pt-5 border-t-2 border-gray-200 dark:border-gray-800 space-y-3">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-bold text-sm"
                    >
                        {theme === 'light' ? <BsMoonStarsFill size={16} /> : <BsSunFill size={16} />}
                        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>

                    <div className="flex items-center gap-3 px-3 py-3 bg-brand-yellow border-2 border-brand-black rounded-xl neo-shadow-sm cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform">
                        <img
                            src="https://ui-avatars.com/api/?name=Student&background=1a1a1a&color=facc15&bold=true&format=svg"
                            alt="Profile"
                            className="w-8 h-8 rounded-full border-2 border-brand-black"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate text-brand-black">Student</p>
                            <p className="text-[11px] font-bold opacity-60 truncate text-brand-black">Free Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ─── Mobile Top Bar ─── */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-panel border-b-2 border-brand-black dark:border-gray-800 px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center safe-area-top">
                <Link to="/dashboard">
                    <motion.div
                        className="text-lg font-black tracking-tighter flex items-center gap-1"
                    >
                        <span className="text-brand-black dark:text-white transition-colors">BUDGET</span>
                        <motion.span
                            className="text-white bg-black dark:bg-white dark:text-black px-1 transform -rotate-2 border-2 border-black dark:border-white transition-colors"
                        >
                            TRACKO
                        </motion.span>
                    </motion.div>
                </Link>
                <div className="flex items-center gap-2">
                    <motion.button
                        whileTap={{ scale: 0.85, rotate: 15 }}
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-light-card dark:bg-dark-card border-2 border-brand-black dark:border-gray-700 neo-shadow-sm"
                    >
                        {theme === 'light' ? <BsMoonStarsFill size={14} /> : <BsSunFill size={14} className="text-brand-yellow" />}
                    </motion.button>
                    <Link to="/settings">
                        <img
                            src="https://ui-avatars.com/api/?name=Student&background=1a1a1a&color=facc15&bold=true&format=svg"
                            alt="Profile"
                            className="w-8 h-8 rounded-full border-2 border-brand-black"
                        />
                    </Link>
                </div>
            </header>

            {/* ─── Main Content ─── */}
            <main className="lg:pl-60 pt-[60px] sm:pt-[68px] lg:pt-0 min-h-screen pb-32 lg:pb-8">
                <div className="max-w-5xl mx-auto px-3 py-4 sm:p-6 lg:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* ─── Mobile Bottom Dock ─── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-light-card dark:bg-dark-card border-t-2 border-brand-black dark:border-gray-700 z-50 px-1 sm:px-2 py-1 flex justify-around items-center safe-area-bottom">
                {navItems.slice(0, 5).map(item => (
                    <MobileNavItem
                        key={item.to}
                        {...item}
                        isActive={location.pathname === item.to}
                    />
                ))}
            </nav>
        </div>
    );
};

export default Layout;
