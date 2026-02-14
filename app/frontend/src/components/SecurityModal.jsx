import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsX, BsShieldLock, BsKey, BsInfoCircle } from 'react-icons/bs';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const SecurityModal = ({ onClose }) => {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [saving, setSaving] = useState(false);
    const [hasPassword, setHasPassword] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const isOAuthOnly = !!(user?.googleId || user?.githubId);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const res = await userApi.getProfile();
                setHasPassword(res.data.data.hasPassword);
            } catch (err) {
                // Fallback: assume no password if OAuth user
                setHasPassword(false);
            } finally {
                setLoadingProfile(false);
            }
        };
        checkProfile();
    }, []);

    const onSubmit = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (data.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        try {
            setSaving(true);
            await userApi.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            toast.success('Password updated successfully!');
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update password';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full rounded-xl bg-light-bg dark:bg-dark-bg border-2 border-gray-200 dark:border-gray-700 p-2.5 sm:p-3 text-sm font-bold focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all";
    const labelClass = "block text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 mb-1 sm:mb-1.5";

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full sm:max-w-md md:max-w-lg bg-white dark:bg-dark-card rounded-t-2xl sm:rounded-2xl shadow-2xl border-2 border-brand-black dark:border-gray-700 relative max-h-[85vh] sm:max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag indicator for mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 p-4 sm:p-6 pb-safe">
                    <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors z-10">
                        <BsX size={22} className="sm:w-6 sm:h-6" />
                    </button>

                    <div className="text-center mb-4 sm:mb-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-lg sm:text-2xl text-brand-primary mb-2 sm:mb-3">
                            <BsShieldLock />
                        </div>
                        <h3 className="text-base sm:text-xl font-black uppercase tracking-tight">Security</h3>
                        <p className="text-[11px] sm:text-sm text-gray-500 font-medium">
                            {hasPassword ? 'Update your password' : 'Set a password for your account'}
                        </p>
                    </div>

                    {!loadingProfile && isOAuthOnly && !hasPassword && (
                        <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-3 sm:mb-4">
                            <BsInfoCircle className="text-blue-500 mt-0.5 shrink-0" size={14} />
                            <p className="text-[11px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">
                                You signed in with {user?.googleId ? 'Google' : 'GitHub'}. You can set a password here to also log in with email & password.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                        {hasPassword && (
                            <div>
                                <label className={labelClass}>Current Password</label>
                                <div className="relative">
                                    <BsKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input type="password" {...register('currentPassword', { required: hasPassword })} className={`${inputClass} pl-9 sm:pl-10`} placeholder="••••••••" />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className={labelClass}>New Password</label>
                            <div className="relative">
                                <BsKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input type="password" {...register('newPassword', { required: true })} className={`${inputClass} pl-9 sm:pl-10`} placeholder="••••••••" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Confirm Password</label>
                            <div className="relative">
                                <BsKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input type="password" {...register('confirmPassword', { required: true })} className={`${inputClass} pl-9 sm:pl-10`} placeholder="••••••••" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving || loadingProfile}
                            className="w-full py-3 sm:py-3.5 rounded-xl bg-red-500 text-white font-black uppercase tracking-wider text-sm hover:bg-red-600 active:scale-[0.98] neo-shadow-sm transition-all mt-3 sm:mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Updating...' : hasPassword ? 'Update Password' : 'Set Password'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SecurityModal;
