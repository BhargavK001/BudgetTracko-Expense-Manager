import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsGearFill, BsTagFill, BsCheckCircleFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { toast } from 'sonner';

const AdminSettings = () => {
    const [version, setVersion] = useState('');
    const [savedVersion, setSavedVersion] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await adminApi.getConfig();
                const configs = res.data.data;
                const versionConfig = configs.find(c => c.key === 'siteVersion');
                if (versionConfig) {
                    setVersion(versionConfig.value);
                    setSavedVersion(versionConfig.value);
                }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-brand-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <BsGearFill size={24} /> Settings
                </h1>
                <p className="text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Application configuration
                </p>
            </motion.div>

            {/* Version Setting */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="neo-card p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-brand-yellow text-brand-black rounded-xl border-2 border-brand-black flex items-center justify-center">
                        <BsTagFill size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-black uppercase tracking-tighter">Site Version</h3>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-semibold">
                            Displayed in the footer across the website
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="e.g., 1.0.0"
                        className="neo-input flex-1"
                    />
                    <motion.button
                        whileHover={(version !== savedVersion && version.trim()) ? { scale: 1.03, y: -2 } : {}}
                        whileTap={(version !== savedVersion && version.trim()) ? { scale: 0.97 } : {}}
                        onClick={handleSaveVersion}
                        disabled={saving || version === savedVersion || !version.trim()}
                        className="neo-btn neo-btn-primary disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
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
                    <p className="mt-3 text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary">
                        Current: <span className="text-light-text dark:text-dark-text font-black">{savedVersion}</span>
                    </p>
                )}
            </motion.div>

            {/* Quick Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="neo-card p-6"
            >
                <h3 className="text-base font-black uppercase tracking-tighter mb-4">Quick Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        to="/system-status"
                        className="flex items-center gap-3 p-4 bg-light-bg dark:bg-dark-bg rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-brand-black dark:hover:border-gray-500 transition-colors group"
                    >
                        <div className="w-8 h-8 bg-green-400 text-brand-black rounded-lg flex items-center justify-center border border-brand-black">
                            <BsCheckCircleFill size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-black">System Status</p>
                            <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary font-semibold">Check service health</p>
                        </div>
                    </Link>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-light-bg dark:bg-dark-bg rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-brand-black dark:hover:border-gray-500 transition-colors group"
                    >
                        <div className="w-8 h-8 bg-brand-yellow text-brand-black rounded-lg flex items-center justify-center border border-brand-black">
                            <BsGearFill size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-black">Main Website</p>
                            <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary font-semibold">Visit public site</p>
                        </div>
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminSettings;
