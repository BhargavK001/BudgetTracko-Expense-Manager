import { useTheme } from '../context/ThemeContext';
import { useGlobalContext } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BsMoonStars, BsSun, BsPerson, BsShieldLock, BsBell, BsCloudDownload, BsTrash, BsInfoCircle, BsChevronRight, BsPersonX } from 'react-icons/bs';
import { toast } from 'sonner';
import SEO from '../components/common/SEO';
import { userApi } from '../services/api';

import ProfileModal from '../components/ProfileModal';
import SecurityModal from '../components/SecurityModal';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { getTransactions, getAccounts, getCategories, getBudgets } = useGlobalContext();
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const isDark = theme === 'dark';
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Load notification preference from user data
    useEffect(() => {
        if (user?.preferences?.notifications !== undefined) {
            setNotificationsEnabled(user.preferences.notifications);
        }
    }, [user]);

    const handleClearData = async () => {
        if (window.confirm('Are you sure you want to clear ALL your data? This will delete all transactions, accounts, categories, and budgets. This cannot be undone.')) {
            try {
                setClearing(true);
                const res = await userApi.clearAllData();
                const deleted = res.data.deleted;
                toast.success(`Cleared ${deleted.transactions} transactions, ${deleted.accounts} accounts, ${deleted.categories} categories, ${deleted.budgets} budgets`);
                // Refresh all data in context
                getTransactions();
                getAccounts();
                getCategories();
                getBudgets();
            } catch (err) {
                toast.error('Failed to clear data');
            } finally {
                setClearing(false);
            }
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const res = await userApi.exportData();
            const dataStr = JSON.stringify(res.data.data, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `budget_tracko_export_${new Date().toISOString().split('T')[0]}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            toast.success('Data exported successfully');
        } catch (err) {
            toast.error('Failed to export data');
        } finally {
            setExporting(false);
        }
    };

    const toggleNotifications = async () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue); // Optimistic update
        try {
            await userApi.updatePreferences({ notifications: newValue });
            await refreshUser();
            toast.success(`Notifications ${newValue ? 'enabled' : 'disabled'}`);
        } catch (err) {
            setNotificationsEnabled(!newValue); // Revert on error
            toast.error('Failed to update notifications');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to DELETE YOUR ACCOUNT? All your data will be permanently lost. This CANNOT be undone.')) {
            if (window.confirm('This is your last chance. Type "DELETE" in the next prompt to confirm.') && window.prompt('Type DELETE to confirm account deletion:') === 'DELETE') {
                try {
                    await userApi.deleteAccount();
                    toast.success('Account deleted permanently');
                    logout();
                    navigate('/');
                } catch (err) {
                    toast.error('Failed to delete account');
                }
            }
        }
    };

    const Section = ({ title, children }) => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="neo-card p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 md:mb-5">
            <h3 className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-gray-400 mb-2.5 sm:mb-3 md:mb-4 px-0.5">{title}</h3>
            <div className="space-y-1 sm:space-y-2 md:space-y-3">{children}</div>
        </motion.div>
    );

    const SettingItem = ({ icon: Icon, title, desc, action, danger }) => (
        <div
            className="flex items-center justify-between p-2.5 sm:p-3 md:p-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors cursor-pointer gap-2 sm:gap-3 min-h-[44px]"
            onClick={typeof action === 'function' ? action : undefined}
        >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0 rounded-lg flex items-center justify-center ${danger ? 'bg-red-100 dark:bg-red-900/20 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className={`font-bold text-xs sm:text-sm leading-tight ${danger ? 'text-red-500' : ''}`}>{title}</h4>
                    {desc && <p className="text-[10px] sm:text-xs font-medium text-gray-500 truncate leading-tight mt-0.5">{desc}</p>}
                </div>
            </div>
            <div className="text-gray-400 shrink-0 ml-1">
                {action && typeof action !== 'function' ? action : <BsChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto pb-24 sm:pb-20">
            <AnimatePresence>
                {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} />}
                {isSecurityOpen && <SecurityModal onClose={() => setIsSecurityOpen(false)} />}
            </AnimatePresence>

            <SEO
                title="Settings | BudgetTracko"
                description="Configure your application preferences, profile, and security settings."
            />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 sm:mb-6 md:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight">Settings</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary font-semibold text-[11px] sm:text-xs md:text-sm">Preferences & Control</p>
            </motion.div>

            <Section title="Account">
                <SettingItem icon={BsPerson} title="Profile" desc="Manage your personal details" action={() => setIsProfileOpen(true)} />
                <SettingItem icon={BsShieldLock} title="Security" desc="Change password & 2FA" action={() => setIsSecurityOpen(true)} />
            </Section>

            <Section title="Preferences">
                <SettingItem
                    icon={isDark ? BsMoonStars : BsSun}
                    title="Appearance"
                    desc={isDark ? 'Dark Mode' : 'Light Mode'}
                    action={
                        <button onClick={(e) => { e.stopPropagation(); toggleTheme(); }} className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors shrink-0 ${isDark ? 'bg-brand-primary' : 'bg-gray-300'}`}>
                            <span className={`${isDark ? 'translate-x-[18px] sm:translate-x-6' : 'translate-x-1'} inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    }
                />
                <SettingItem icon={BsBell} title="Notifications" desc={notificationsEnabled ? 'On' : 'Off'}
                    action={
                        <button onClick={(e) => { e.stopPropagation(); toggleNotifications(); }} className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors shrink-0 ${notificationsEnabled ? 'bg-brand-primary' : 'bg-gray-300'}`}>
                            <span className={`${notificationsEnabled ? 'translate-x-[18px] sm:translate-x-6' : 'translate-x-1'} inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    }
                />
            </Section>

            <Section title="Data">
                <SettingItem icon={BsCloudDownload} title="Export Data" desc={exporting ? 'Preparing download...' : 'Download all your data as JSON'} action={handleExport} />
                <SettingItem icon={BsTrash} title="Clear All Data" desc={clearing ? 'Clearing...' : 'Delete all transactions, accounts & budgets'} danger action={handleClearData} />
            </Section>

            <Section title="Danger Zone">
                <SettingItem icon={BsPersonX} title="Delete Account" desc="Permanently delete your account & all data" danger action={handleDeleteAccount} />
            </Section>

            <Section title="About">
                <SettingItem icon={BsInfoCircle} title="Version" desc="v1.0.0" />
            </Section>

            <p className="text-center text-[10px] sm:text-xs font-bold text-gray-400 mt-6 sm:mt-8 md:mt-10">
                BudgetTracko © 2026 • Made with ❤️
            </p>
        </div>
    );
};

export default Settings;
