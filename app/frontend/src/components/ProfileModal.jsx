import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { BsX, BsPerson, BsEnvelope, BsTelephone } from 'react-icons/bs';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const ProfileModal = ({ onClose }) => {
    const { user, refreshUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const isOAuthUser = !!(user?.googleId || user?.githubId);

    const { register, handleSubmit } = useForm({
        defaultValues: {
            name: user?.displayName || '',
            email: user?.email || '',
            phone: user?.phone || ''
        }
    });

    const onSubmit = async (data) => {
        try {
            setSaving(true);
            await userApi.updateProfile({
                displayName: data.name,
                email: data.email,
                phone: data.phone
            });
            await refreshUser();
            toast.success('Profile updated successfully!');
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update profile';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=1a1a1a&color=facc15&bold=true&format=svg`;

    const inputClass = "w-full rounded-xl bg-light-bg dark:bg-dark-bg border-2 border-gray-200 dark:border-gray-700 p-2.5 sm:p-3 text-sm font-bold focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all";
    const labelClass = "block text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 mb-1 sm:mb-1.5";

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-[90%] max-w-xs bg-white dark:bg-dark-card rounded-2xl shadow-2xl border-2 border-brand-black dark:border-gray-700 relative max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 p-4 sm:p-6 pb-safe">
                    <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors z-10">
                        <BsX size={22} className="sm:w-6 sm:h-6" />
                    </button>

                    <div className="text-center mb-4 sm:mb-6">
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-full border-4 border-white dark:border-dark-card shadow-lg mb-2 sm:mb-3 object-cover"
                        />
                        <h3 className="text-base sm:text-xl font-black uppercase tracking-tight">Edit Profile</h3>
                        <p className="text-[11px] sm:text-sm text-gray-500 font-medium">Update your personal details</p>
                        {isOAuthUser && (
                            <p className="text-[10px] sm:text-xs text-brand-primary font-bold mt-1">
                                Profile photo synced from {user?.googleId ? 'Google' : 'GitHub'}
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                        <div>
                            <label className={labelClass}>Full Name</label>
                            <div className="relative">
                                <BsPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input {...register('name')} className={`${inputClass} pl-9 sm:pl-10`} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Email Address</label>
                            <div className="relative">
                                <BsEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input {...register('email')} type="email" className={`${inputClass} pl-9 sm:pl-10`} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Phone Number</label>
                            <div className="relative">
                                <BsTelephone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input {...register('phone')} className={`${inputClass} pl-9 sm:pl-10`} placeholder="+91 98765 43210" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-3 sm:py-3.5 rounded-xl bg-brand-black text-white dark:bg-white dark:text-brand-black font-black uppercase tracking-wider text-sm hover:translate-y-[-2px] active:translate-y-[0px] active:scale-[0.98] neo-shadow-sm transition-all mt-3 sm:mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </motion.div>,
        document.body
    );
};

export default ProfileModal;
