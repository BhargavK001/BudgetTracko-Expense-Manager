import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { BsX, BsShieldLock, BsKey } from 'react-icons/bs';
import { toast } from 'sonner';

const SecurityModal = ({ onClose }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        // Mock API Call
        setTimeout(() => {
            toast.success('Password updated successfully!');
            onClose();
        }, 800);
    };

    const inputClass = "w-full rounded-xl bg-light-bg dark:bg-dark-bg border-2 border-gray-200 dark:border-gray-700 p-3 text-sm font-bold focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all";
    const labelClass = "block text-xs font-black uppercase tracking-wider text-gray-400 mb-1.5";

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl p-6 shadow-2xl border-2 border-brand-black dark:border-gray-700 relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <BsX size={24} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl text-brand-primary mb-3">
                        <BsShieldLock />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Security</h3>
                    <p className="text-sm text-gray-500 font-medium">Update your password</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className={labelClass}>Current Password</label>
                        <div className="relative">
                            <BsKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="password" {...register('currentPassword', { required: true })} className={`${inputClass} pl-10`} placeholder="••••••••" />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>New Password</label>
                        <div className="relative">
                            <BsKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="password" {...register('newPassword', { required: true })} className={`${inputClass} pl-10`} placeholder="••••••••" />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Confirm Password</label>
                        <div className="relative">
                            <BsKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="password" {...register('confirmPassword', { required: true })} className={`${inputClass} pl-10`} placeholder="••••••••" />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-3.5 rounded-xl bg-red-500 text-white font-black uppercase tracking-wider hover:bg-red-600 neo-shadow-sm transition-all mt-4">
                        Update Password
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default SecurityModal;
