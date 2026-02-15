import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { BsShieldLock, BsKey, BsInfoCircle } from 'react-icons/bs';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const SecurityEdit = ({ onClose }) => {
    const { user } = useAuth();
    const { register, handleSubmit } = useForm();
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
            if (onClose) onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update password';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full rounded-xl bg-light-bg dark:bg-dark-bg border-2 border-gray-200 dark:border-gray-700 py-3 pr-4 pl-12 sm:pl-14 text-sm font-bold focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all";
    const labelClass = "block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1";

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl border-2 border-brand-black dark:border-gray-700 p-4 mt-2">
            <h3 className="text-sm font-black uppercase tracking-tight mb-3">Security Settings</h3>

            {!loadingProfile && isOAuthOnly && !hasPassword && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-3">
                    <BsInfoCircle className="text-blue-500 mt-0.5 shrink-0" size={14} />
                    <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                        You are signed in with <span className="font-bold">{user?.googleId ? 'Google' : 'GitHub'}</span>. Set a password to also log in with email.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {hasPassword && (
                    <div>
                        <label className={labelClass}>Current Password</label>
                        <div className="relative">
                            <BsKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="password" {...register('currentPassword', { required: hasPassword })} className={inputClass} placeholder="••••••••" />
                        </div>
                    </div>
                )}
                <div>
                    <label className={labelClass}>New Password</label>
                    <div className="relative">
                        <BsKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="password" {...register('newPassword', { required: true })} className={inputClass} placeholder="••••••••" />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Confirm Password</label>
                    <div className="relative">
                        <BsKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="password" {...register('confirmPassword', { required: true })} className={inputClass} placeholder="••••••••" />
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border-2 border-brand-black dark:border-gray-600 font-black uppercase tracking-wider text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving || loadingProfile}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-black uppercase tracking-wider text-xs hover:translate-y-[-2px] active:translate-y-[0px] active:scale-[0.98] neo-shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Updating...' : hasPassword ? 'Update' : 'Set Pwd'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SecurityEdit;
