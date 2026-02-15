import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BsPerson, BsEnvelope, BsTelephone } from 'react-icons/bs';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const ProfileEdit = ({ onClose }) => {
    const { user, refreshUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const isOAuthUser = !!(user?.googleId || user?.githubId);

    const { register, handleSubmit, formState: { errors } } = useForm({
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
            if (onClose) onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update profile';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=1a1a1a&color=facc15&bold=true&format=svg`;

    const inputClass = "w-full rounded-xl bg-light-bg dark:bg-dark-bg border-2 border-gray-200 dark:border-gray-700 py-3 pr-4 pl-12 sm:pl-14 text-sm font-bold focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all";
    const labelClass = "block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1";

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl border-2 border-brand-black dark:border-gray-700 p-4 mt-2">
            <div className="flex items-center gap-4 mb-4">
                <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover shrink-0"
                />
                <div>
                    <h3 className="text-sm font-black uppercase tracking-tight">Edit Profile</h3>
                    {isOAuthUser && (
                        <p className="text-[10px] text-brand-primary font-bold">
                            Photo synced from {user?.googleId ? 'Google' : 'GitHub'}
                        </p>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                    <label className={labelClass}>Full Name</label>
                    <div className="relative">
                        <BsPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            {...register('name', { required: 'Name is required' })}
                            className={inputClass}
                            placeholder="Your Name"
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Email Address</label>
                    <div className="relative">
                        <BsEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: 'Invalid email address'
                                }
                            })}
                            type="email"
                            className={inputClass}
                            placeholder="name@example.com"
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>}
                </div>
                <div>
                    <label className={labelClass}>Phone Number</label>
                    <div className="relative">
                        <BsTelephone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            {...register('phone', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Phone number must be exactly 10 digits'
                                }
                            })}
                            className={inputClass}
                            placeholder="9876543210"
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                            }}
                        />
                    </div>
                    {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.phone.message}</p>}
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
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-brand-black text-white dark:bg-white dark:text-brand-black font-black uppercase tracking-wider text-xs hover:translate-y-[-2px] active:translate-y-[0px] active:scale-[0.98] neo-shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileEdit;
