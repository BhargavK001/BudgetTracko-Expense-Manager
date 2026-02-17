import { useAuth } from '../../context/AuthContext';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BsGrid1X2Fill,
    BsCreditCardFill,
    BsPeopleFill,
    BsEnvelopeFill,
    BsGearFill,
    BsBoxArrowRight,
    BsActivity,
    BsShieldLockFill,
} from 'react-icons/bs';
import { toast } from 'sonner';

const navItems = [
    { to: '/admin/dashboard', icon: BsGrid1X2Fill, label: 'Dashboard' },
    { to: '/admin/transactions', icon: BsCreditCardFill, label: 'Transactions' },
    { to: '/admin/users', icon: BsPeopleFill, label: 'Users' },
    { to: '/admin/contacts', icon: BsEnvelopeFill, label: 'Contact Requests' },
    { to: '/admin/settings', icon: BsGearFill, label: 'Settings' },
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

const AdminLayout = () => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.info('Logged out successfully');
        navigate('/admin/login');
    };

    // If not admin, redirect
    if (!loading && (!user || user.role !== 'admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
                <div className="neo-card p-8 max-w-md text-center">
                    <BsShieldLockFill size={48} className="mx-auto mb-4 text-red-500" />
                    <h2 className="text-2xl font-black mb-2">Access Denied</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                        You do not have administrator privileges to access this area.
                    </p>
                    <Link to="/admin/login" className="neo-btn neo-btn-primary">
                        Admin Login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-lg text-brand-black dark:text-white animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-light-card dark:bg-dark-card border-r-2 border-brand-black dark:border-gray-800 z-50 p-5">
                {/* Logo */}
                <div className="mb-6 pl-1">
                    <Link to="/admin/dashboard">
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
                    <div className="mt-2 flex items-center gap-2">
                        <BsShieldLockFill size={12} className="text-brand-yellow" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">
                            Admin Panel
                        </span>
                    </div>
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
                    {/* System Status - in-app navigation */}
                    <SidebarItem
                        to="/system-status"
                        icon={BsActivity}
                        label="System Status"
                        isActive={location.pathname === '/system-status'}
                    />
                </nav>

                {/* Footer */}
                <div className="mt-auto pt-5 border-t-2 border-gray-200 dark:border-gray-800 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-3 px-3 py-3 bg-brand-yellow border-2 border-brand-black rounded-xl neo-shadow-sm">
                            <div className="w-8 h-8 rounded-full border-2 border-brand-black bg-black text-brand-yellow flex items-center justify-center font-black text-sm">
                                {user?.displayName?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black truncate text-brand-black">{user?.displayName || 'Admin'}</p>
                                <p className="text-[10px] font-bold opacity-60 truncate text-brand-black">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-3 bg-red-500 text-white border-2 border-brand-black rounded-xl neo-shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
                            title="Logout"
                        >
                            <BsBoxArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Top Bar */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-panel border-b-2 border-brand-black dark:border-gray-800 px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center safe-area-top">
                <Link to="/admin/dashboard">
                    <motion.div className="text-lg font-black tracking-tighter flex items-center gap-1">
                        <span className="text-brand-black dark:text-white transition-colors">ADMIN</span>
                        <motion.span className="text-white bg-black dark:bg-white dark:text-black px-1 transform -rotate-2 border-2 border-black dark:border-white transition-colors">
                            PANEL
                        </motion.span>
                    </motion.div>
                </Link>
                <div className="flex items-center gap-2">
                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={handleLogout}
                        className="p-2.5 rounded-xl bg-red-500 text-white border-2 border-brand-black neo-shadow-sm"
                        title="Logout"
                    >
                        <BsBoxArrowRight size={14} />
                    </motion.button>
                </div>
            </header>

            {/* Main Content */}
            <main className="lg:pl-64 pt-[60px] sm:pt-[68px] lg:pt-0 min-h-screen pb-20 lg:pb-8">
                <div className="max-w-6xl mx-auto px-3 py-4 sm:p-6 lg:p-8">
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

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-light-card dark:bg-dark-card border-t-2 border-brand-black dark:border-gray-700 z-50 px-1 sm:px-2 py-1 flex justify-around items-center safe-area-bottom">
                {navItems.slice(0, 5).map(item => (
                    <Link key={item.to} to={item.to} className="flex-1 min-w-0">
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-1.5"
                        >
                            <motion.div
                                animate={location.pathname === item.to ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className={`p-2 rounded-xl transition-colors duration-200 ${location.pathname === item.to
                                    ? 'bg-brand-yellow text-brand-black border-2 border-brand-black neo-shadow-sm'
                                    : 'text-light-text-secondary dark:text-dark-text-secondary'
                                    }`}
                            >
                                <item.icon size={16} />
                            </motion.div>
                            <span className={`text-[9px] font-bold mt-0.5 uppercase tracking-wider truncate max-w-full ${location.pathname === item.to ? 'text-brand-black dark:text-brand-yellow' : 'text-light-text-secondary dark:text-dark-text-secondary'
                                }`}>{item.label}</span>
                        </motion.div>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default AdminLayout;
