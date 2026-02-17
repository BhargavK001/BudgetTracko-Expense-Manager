import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsGearFill, BsTagFill, BsCheckCircleFill, BsExclamationTriangleFill, BsMegaphoneFill, BsWrenchAdjustableCircleFill, BsSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';

const AdminSettings = () => {
    const { theme, toggleTheme } = useTheme();
    const [version, setVersion] = useState('');
    const [savedVersion, setSavedVersion] = useState('');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [announcement, setAnnouncement] = useState('');
    const [announcementType, setAnnouncementType] = useState('info');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingMaintenance, setSavingMaintenance] = useState(false);
    const [savingAnnouncement, setSavingAnnouncement] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await adminApi.getConfig();
                const configMap = res.data.data;

                if (configMap.siteVersion) {
                    setVersion(configMap.siteVersion);
                    setSavedVersion(configMap.siteVersion);
                }
                if (configMap.maintenance_mode) setMaintenanceMode(configMap.maintenance_mode === 'true');
                if (configMap.maintenance_message) setMaintenanceMessage(configMap.maintenance_message);
                if (configMap.announcement) setAnnouncement(configMap.announcement);
                if (configMap.announcement_type) setAnnouncementType(configMap.announcement_type);
            } catch (error) {
                console.error('Failed to load config:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSaveVersion = async () => {
        if (!version.trim()) {
            toast.error('Version is required');
            return;
        }
        setSaving(true);
        try {
            await adminApi.updateConfig('siteVersion', version.trim());
            setSavedVersion(version.trim());
            toast.success('Version updated successfully');
        } catch (error) {
            toast.error('Failed to update version');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleMaintenance = async () => {
        setSavingMaintenance(true);
        try {
            const newValue = !maintenanceMode;
            await adminApi.updateConfig('maintenance_mode', String(newValue));
            if (maintenanceMessage.trim()) {
                await adminApi.updateConfig('maintenance_message', maintenanceMessage.trim());
            }
            setMaintenanceMode(newValue);
            toast.success(newValue ? '🔧 Maintenance mode ENABLED' : '✅ Maintenance mode DISABLED');
        } catch (error) {
            toast.error('Failed to update maintenance mode');
        } finally {
            setSavingMaintenance(false);
        }
    };

    const handleSaveMaintenanceMessage = async () => {
        setSavingMaintenance(true);
        try {
            await adminApi.updateConfig('maintenance_message', maintenanceMessage.trim());
            toast.success('Maintenance message updated');
        } catch (error) {
            toast.error('Failed to update maintenance message');
        } finally {
            setSavingMaintenance(false);
        }
    };

    const handleSaveAnnouncement = async () => {
        setSavingAnnouncement(true);
        try {
            await adminApi.updateConfig('announcement', announcement.trim());
            await adminApi.updateConfig('announcement_type', announcementType);
            toast.success(announcement.trim() ? 'Announcement published' : 'Announcement cleared');
        } catch (error) {
            toast.error('Failed to update announcement');
        } finally {
            setSavingAnnouncement(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-brand-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tighter flex items-center gap-2 sm:gap-3">
                    <BsGearFill className="text-lg sm:text-xl lg:text-2xl" /> Settings
                </h1>
                <p className="text-xs sm:text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary mt-0.5 sm:mt-1">
                    Application configuration
                </p>
            </motion.div>

            {/* Maintenance Mode */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={`neo-card p-4 sm:p-6 ${maintenanceMode ? 'border-l-4 border-l-red-500' : ''}`}
            >
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 border-brand-black flex items-center justify-center flex-shrink-0 ${maintenanceMode ? 'bg-red-500 text-white' : 'bg-orange-400 text-brand-black'}`}>
                        <BsWrenchAdjustableCircleFill className="text-base sm:text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tighter">Maintenance Mode</h3>
                        <p className="text-[10px] sm:text-xs text-light-text-secondary dark:text-dark-text-secondary font-semibold">
                            Block all user access during maintenance
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggleMaintenance}
                        disabled={savingMaintenance}
                        className={`relative w-12 h-7 sm:w-14 sm:h-8 rounded-full border-2 border-brand-black transition-colors duration-300 flex-shrink-0 ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <motion.div
                            animate={{ x: maintenanceMode ? 18 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-0.5 sm:top-1 w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-white border border-brand-black"
                            style={{ width: '18px', height: '18px' }}
                        />
                    </motion.button>
                </div>

                {maintenanceMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4"
                    >
                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                            <BsExclamationTriangleFill className="text-red-500" size={12} />
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">Maintenance is Active</p>
                        </div>
                        <p className="text-[10px] sm:text-xs text-red-700 dark:text-red-300">All non-admin API requests are currently blocked.</p>
                    </motion.div>
                )}

                <div className="mt-3 sm:mt-4 space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">
                        Maintenance Message
                    </label>
                    <textarea
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        placeholder="e.g. We are performing scheduled maintenance. Please try again in 30 minutes."
                        rows={2}
                        className="neo-input resize-none text-sm"
                    />
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSaveMaintenanceMessage}
                        disabled={savingMaintenance}
                        className="neo-btn text-[10px] sm:text-xs py-2 px-3 sm:px-4 border-gray-300 dark:border-gray-600"
                    >
                        {savingMaintenance ? 'Saving...' : 'Save Message'}
                    </motion.button>
                </div>
            </motion.div>

            {/* Global Announcement */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="neo-card p-4 sm:p-6"
            >
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-lg sm:rounded-xl border-2 border-brand-black flex items-center justify-center flex-shrink-0">
                        <BsMegaphoneFill className="text-base sm:text-xl" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tighter">Global Announcement</h3>
                        <p className="text-[10px] sm:text-xs text-light-text-secondary dark:text-dark-text-secondary font-semibold">
                            Display a banner to all logged-in users
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Banner Type */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">
                            Banner Type
                        </label>
                        <div className="grid grid-cols-2 sm:flex gap-1.5 sm:gap-2">
                            {[
                                { value: 'info', label: 'Info', color: 'bg-blue-500' },
                                { value: 'warning', label: 'Warning', color: 'bg-yellow-500' },
                                { value: 'success', label: 'Success', color: 'bg-green-500' },
                                { value: 'danger', label: 'Danger', color: 'bg-red-500' },
                            ].map((t) => (
                                <motion.button
                                    key={t.value}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setAnnouncementType(t.value)}
                                    className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-1.5 rounded-lg border-2 transition-colors flex items-center justify-center gap-1.5 ${announcementType === t.value
                                        ? 'border-brand-black dark:border-white'
                                        : 'border-gray-300 dark:border-gray-700'
                                        }`}
                                >
                                    <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${t.color}`}></span>
                                    {t.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-1">
                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">
                            Announcement Message
                        </label>
                        <textarea
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            placeholder="e.g. 🎉 New feature: Budget sharing is now live!"
                            rows={2}
                            className="neo-input resize-none text-sm"
                        />
                        <p className="text-[9px] sm:text-[10px] text-light-text-secondary dark:text-dark-text-secondary">Leave empty to remove the announcement.</p>
                    </div>

                    {/* Preview */}
                    {announcement.trim() && (
                        <div className="space-y-1">
                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">Preview</label>
                            <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 border-brand-black text-xs sm:text-sm font-bold ${announcementType === 'info' ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300' :
                                announcementType === 'warning' ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                    announcementType === 'success' ? 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300' :
                                        'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                {announcement}
                            </div>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSaveAnnouncement}
                        disabled={savingAnnouncement}
                        className="neo-btn neo-btn-primary flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-2.5"
                    >
                        {savingAnnouncement ? 'Publishing...' : (
                            <>
                                <BsMegaphoneFill size={14} />
                                {announcement.trim() ? 'Publish' : 'Clear'} Announcement
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Version Setting */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="neo-card p-4 sm:p-6"
            >
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-yellow text-brand-black rounded-lg sm:rounded-xl border-2 border-brand-black flex items-center justify-center flex-shrink-0">
                        <BsTagFill className="text-base sm:text-xl" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tighter">Site Version</h3>
                        <p className="text-[10px] sm:text-xs text-light-text-secondary dark:text-dark-text-secondary font-semibold">
                            Displayed in the footer across the website
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="e.g., 1.0.0"
                        className="neo-input flex-1 text-sm"
                    />
                    <motion.button
                        whileHover={(version !== savedVersion && version.trim()) ? { scale: 1.03, y: -2 } : {}}
                        whileTap={(version !== savedVersion && version.trim()) ? { scale: 0.97 } : {}}
                        onClick={handleSaveVersion}
                        disabled={saving || version === savedVersion || !version.trim()}
                        className="neo-btn neo-btn-primary disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap text-xs sm:text-sm py-2 sm:py-2.5"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin"></span>
                                Saving...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <BsCheckCircleFill size={14} /> Save Version
                            </span>
                        )}
                    </motion.button>
                </div>

                {savedVersion && (
                    <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary">
                        Current: <span className="text-light-text dark:text-dark-text font-black">{savedVersion}</span>
                    </p>
                )}
            </motion.div>

            {/* Theme Toggle */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="neo-card p-4 sm:p-6"
            >
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 border-brand-black flex items-center justify-center flex-shrink-0 transition-colors ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-amber-400 text-brand-black'
                        }`}>
                        {theme === 'dark' ? <BsMoonStarsFill className="text-base sm:text-xl" /> : <BsSunFill className="text-base sm:text-xl" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tighter">Appearance</h3>
                        <p className="text-[10px] sm:text-xs text-light-text-secondary dark:text-dark-text-secondary font-semibold">
                            Currently using <span className="font-black text-light-text dark:text-dark-text">{theme === 'dark' ? 'Dark' : 'Light'}</span> mode
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className={`relative w-14 h-8 rounded-full border-2 border-brand-black transition-colors duration-300 flex-shrink-0 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-amber-400'
                            }`}
                    >
                        <motion.div
                            animate={{ x: theme === 'dark' ? 22 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-5 h-5 rounded-full bg-white border border-brand-black flex items-center justify-center"
                        >
                            {theme === 'dark'
                                ? <BsMoonStarsFill size={10} className="text-indigo-600" />
                                : <BsSunFill size={10} className="text-amber-500" />
                            }
                        </motion.div>
                    </motion.button>
                </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="neo-card p-4 sm:p-6"
            >
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tighter mb-3 sm:mb-4">Quick Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <Link
                        to="/system-status"
                        className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-light-bg dark:bg-dark-bg rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-brand-black dark:hover:border-gray-500 transition-colors"
                    >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-400 text-brand-black rounded-lg flex items-center justify-center border border-brand-black flex-shrink-0">
                            <BsCheckCircleFill className="text-sm sm:text-base" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-black">System Status</p>
                            <p className="text-[9px] sm:text-[10px] text-light-text-secondary dark:text-dark-text-secondary font-semibold">Check service health</p>
                        </div>
                    </Link>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-light-bg dark:bg-dark-bg rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-brand-black dark:hover:border-gray-500 transition-colors"
                    >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-yellow text-brand-black rounded-lg flex items-center justify-center border border-brand-black flex-shrink-0">
                            <BsGearFill className="text-sm sm:text-base" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-black">Main Website</p>
                            <p className="text-[9px] sm:text-[10px] text-light-text-secondary dark:text-dark-text-secondary font-semibold">Visit public site</p>
                        </div>
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminSettings;
