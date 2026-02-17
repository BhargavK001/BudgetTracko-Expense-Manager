import { useTheme } from '../context/ThemeContext';
import { useGlobalContext } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BsMoonStars, BsSun, BsPerson, BsShieldLock, BsBell, BsCloudDownload, BsTrash, BsInfoCircle, BsChevronRight, BsPersonX, BsCreditCard2Front, BsGrid } from 'react-icons/bs';
import { toast } from 'sonner';
import SEO from '../components/common/SEO';
import { userApi } from '../services/api';

import ProfileEdit from '../components/ProfileEdit';
import SecurityEdit from '../components/SecurityEdit';
import CategoryEdit from '../components/CategoryEdit';
import ConfirmationModal from '../components/common/ConfirmationModal';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { getTransactions, getAccounts, getCategories, getBudgets } = useGlobalContext();
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const isDark = theme === 'dark';
    const [openSection, setOpenSection] = useState(null); // 'profile', 'security', or null
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Load notification preference from user data
    useEffect(() => {
        if (user?.preferences?.notifications !== undefined) {
            setNotificationsEnabled(user.preferences.notifications);
        }
    }, [user]);

    // Modals state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
        requireInput: false,
        expectedInput: ''
    });

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleClearData = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Clear All Data?',
            message: 'Are you sure you want to clear ALL your data? This will delete all transactions, accounts, categories, and budgets. This cannot be undone.',
            type: 'danger',
            confirmText: 'Yes, Clear All',
            onConfirm: async () => {
                closeConfirmModal();
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
        });
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

    const handleExportCSV = async () => {
        try {
            setExporting(true);
            const res = await userApi.exportCSV();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `budget_tracko_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('CSV exported successfully');
        } catch (err) {
            toast.error('Failed to export CSV');
        } finally {
            setExporting(false);
        }
    };

    const handleImportCSV = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            toast.promise(userApi.importCSV(formData), {
                loading: 'Importing CSV...',
                success: (res) => {
                    const stats = res.data.stats;
                    // Refresh data
                    getTransactions();
                    getAccounts();
                    getCategories();
                    return `Imported ${stats.imported} transactions. Created ${stats.newAccounts} accounts.`;
                },
                error: 'Failed to import CSV'
            });
        } catch (err) {
            console.error(err);
        } finally {
            event.target.value = ''; // Reset input
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

    const handleDeleteAccount = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Account?',
            message: 'Are you sure you want to DELETE YOUR ACCOUNT? All your data will be permanently lost. This action CANNOT be undone.',
            type: 'danger',
            confirmText: 'Delete Forever',
            requireInput: true,
            expectedInput: 'DELETE',
            inputPlaceholder: 'Type DELETE to confirm',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    await userApi.deleteAccount();
                    toast.success('Account deleted permanently');
                    await logout();
                    navigate('/');
                } catch (err) {
                    toast.error('Failed to delete account');
                }
            }
        });
    };

    const Section = ({ title, children }) => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="neo-card p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 md:mb-5">
            <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-gray-400 mb-2.5 sm:mb-3 md:mb-4 px-0.5">{title}</h3>
            <div className="space-y-1 sm:space-y-2 md:space-y-3">{children}</div>
        </motion.div>
    );

    const SettingItem = ({ icon: Icon, title, desc, action, danger, isOpen, children }) => (
        <div>
            <div
                className="flex items-center justify-between p-2.5 sm:p-3 md:p-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors cursor-pointer gap-2 sm:gap-3 min-h-[44px]"
                onClick={typeof action === 'function' ? action : undefined}
            >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0 rounded-lg flex items-center justify-center ${danger ? 'bg-red-100 dark:bg-red-900/20 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className={`font-bold text-sm leading-tight ${danger ? 'text-red-500' : ''}`}>{title}</h4>
                        {desc && <p className="text-xs font-medium text-gray-500 truncate leading-tight mt-0.5">{desc}</p>}
                    </div>
                </div>
                <div className="text-gray-400 shrink-0 ml-1">
                    {action && typeof action !== 'function' ? action : (
                        <BsChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    )}
                </div>
            </div>
            <AnimatePresence>
                {isOpen && children && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto pb-24 sm:pb-20">
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
                <SettingItem
                    icon={BsPerson}
                    title="Profile"
                    desc="Manage your personal details"
                    action={() => setOpenSection(openSection === 'profile' ? null : 'profile')}
                    isOpen={openSection === 'profile'}
                >
                    <ProfileEdit onClose={() => setOpenSection(null)} />
                </SettingItem>

                <SettingItem
                    icon={BsShieldLock}
                    title="Security"
                    desc="Change password & 2FA"
                    action={() => setOpenSection(openSection === 'security' ? null : 'security')}
                    isOpen={openSection === 'security'}
                >
                    <SecurityEdit onClose={() => setOpenSection(null)} />
                </SettingItem>
            </Section>

            <Section title="Subscription">
                <SettingItem icon={BsCreditCard2Front} title="Billing & Plans" desc="Manage your subscription & invoices" action={() => navigate('/billing')} />
            </Section>

            <Section title="Preferences">
                <SettingItem
                    icon={BsGrid}
                    title="Categories"
                    desc="Manage expense & income categories"
                    action={() => setOpenSection(openSection === 'categories' ? null : 'categories')}
                    isOpen={openSection === 'categories'}
                >
                    <CategoryEdit onClose={() => setOpenSection(null)} />
                </SettingItem>

                <SettingItem
                    icon={isDark ? BsMoonStars : BsSun}
                    title="Appearance"
                    desc={isDark ? 'Dark Mode' : 'Light Mode'}
                    action={
                        <button onClick={(e) => { e.stopPropagation(); toggleTheme(); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 border-2 border-brand-black dark:border-gray-500 ${isDark ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-gray-600'}`}>
                            <span className={`${isDark ? 'translate-x-5' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 border border-gray-300 dark:border-gray-500 shadow-sm transition-transform`} />
                        </button>
                    }
                />
                <SettingItem icon={BsBell} title="Notifications" desc={notificationsEnabled ? 'On' : 'Off'}
                    action={
                        <button onClick={(e) => { e.stopPropagation(); toggleNotifications(); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 border-2 border-brand-black dark:border-gray-500 ${notificationsEnabled ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-gray-600'}`}>
                            <span className={`${notificationsEnabled ? 'translate-x-5' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 border border-gray-300 dark:border-gray-500 shadow-sm transition-transform`} />
                        </button>
                    }
                />
            </Section>

            <Section title="Data">
                <SettingItem icon={BsCloudDownload} title="Export JSON" desc={exporting ? 'Preparing...' : 'Full backup (JSON)'} action={handleExport} />
                <SettingItem icon={BsCloudDownload} title="Export CSV" desc={exporting ? 'Preparing...' : 'Spreadsheet compatible (CSV)'} action={handleExportCSV} />
                <SettingItem icon={BsCloudDownload} title="Import CSV" desc="Import transactions from CSV" action={() => document.getElementById('csvInput').click()} />
                <input
                    type="file"
                    id="csvInput"
                    accept=".csv"
                    className="hidden"
                    onChange={handleImportCSV}
                />
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

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
                requireInput={confirmModal.requireInput}
                expectedInput={confirmModal.expectedInput}
                inputPlaceholder={confirmModal.inputPlaceholder}
            />
        </div>
    );
};

export default Settings;
