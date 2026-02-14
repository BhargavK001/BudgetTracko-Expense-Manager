import { useTheme } from '../context/ThemeContext';
import { useGlobalContext } from '../context/GlobalContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsMoonStars, BsSun, BsPerson, BsShieldLock, BsBell, BsCloudDownload, BsTrash, BsInfoCircle, BsChevronRight, BsToggleOn, BsToggleOff } from 'react-icons/bs';
import { toast } from 'sonner';

import ProfileModal from '../components/ProfileModal';
import SecurityModal from '../components/SecurityModal';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { transactions, deleteTransaction } = useGlobalContext();
    const isDark = theme === 'dark';
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleClearData = () => {
        if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            transactions.forEach(t => deleteTransaction(t.id));
            toast.success('All data cleared successfully');
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(transactions, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'budget_tracko_data.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast.success('Data exported successfully');
    };

    const toggleNotifications = () => {
        setNotificationsEnabled(!notificationsEnabled);
        toast.success(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`);
    };

    const Section = ({ title, children }) => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="neo-card p-5 mb-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-4">{title}</h3>
            <div className="space-y-4">{children}</div>
        </motion.div>
    );

    const SettingItem = ({ icon: Icon, title, desc, action, danger }) => (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={typeof action === 'function' ? action : undefined}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${danger ? 'bg-red-100 dark:bg-red-900/20 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                    <Icon size={18} />
                </div>
                <div>
                    <h4 className={`font-bold text-sm ${danger ? 'text-red-500' : ''}`}>{title}</h4>
                    {desc && <p className="text-xs font-medium text-gray-500">{desc}</p>}
                </div>
            </div>
            <div className="text-gray-400">
                {/* Fixed: If action is valid React element, render it. Else render Chevron */}
                {action && typeof action !== 'function' ? action : <BsChevronRight />}
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <AnimatePresence>
                {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} />}
                {isSecurityOpen && <SecurityModal onClose={() => setIsSecurityOpen(false)} />}
            </AnimatePresence>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tight">Settings</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary font-semibold text-sm">Preferences & Control</p>
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
                        <button onClick={(e) => { e.stopPropagation(); toggleTheme(); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-brand-primary' : 'bg-gray-300'}`}>
                            <span className={`${isDark ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    }
                />
                <SettingItem icon={BsBell} title="Notifications" desc={notificationsEnabled ? 'On' : 'Off'}
                    action={
                        <button onClick={(e) => { e.stopPropagation(); toggleNotifications(); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-brand-primary' : 'bg-gray-300'}`}>
                            <span className={`${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    }
                />
            </Section>

            <Section title="Data">
                <SettingItem icon={BsCloudDownload} title="Export Data" desc="Download your transaction history" action={handleExport} />
                <SettingItem icon={BsTrash} title="Clear All Data" desc="Permanently delete all records" danger action={handleClearData} />
            </Section>

            <Section title="About">
                <SettingItem icon={BsInfoCircle} title="Version" desc="v1.0.0" />
            </Section>

            <p className="text-center text-xs font-bold text-gray-400 mt-10">
                BudgetTracko © 2026 • Made with ❤️
            </p>
        </div>
    );
};

export default Settings;
