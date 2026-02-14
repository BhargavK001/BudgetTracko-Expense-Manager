import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { BsX, BsPerson, BsEnvelope, BsTelephone } from 'react-icons/bs';
import { toast } from 'sonner';

const ProfileModal = ({ onClose }) => {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            name: 'Student User',
            email: 'student@example.com',
            phone: '+91 98765 43210'
        }
    });

    const onSubmit = (data) => {
        // Mock API Call
        setTimeout(() => {
            toast.success('Profile updated successfully!');
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
                    <div className="w-20 h-20 mx-auto bg-brand-yellow rounded-full flex items-center justify-center text-3xl border-4 border-white dark:border-dark-card shadow-lg mb-3">
                        👨‍🎓
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Edit Profile</h3>
                    <p className="text-sm text-gray-500 font-medium">Update your personal details</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className={labelClass}>Full Name</label>
                        <div className="relative">
                            <BsPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input {...register('name')} className={`${inputClass} pl-10`} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Email Address</label>
                        <div className="relative">
                            <BsEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input {...register('email')} className={`${inputClass} pl-10`} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Phone Number</label>
                        <div className="relative">
                            <BsTelephone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input {...register('phone')} className={`${inputClass} pl-10`} />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-3.5 rounded-xl bg-brand-black text-white dark:bg-white dark:text-brand-black font-black uppercase tracking-wider hover:translate-y-[-2px] active:translate-y-[0px] neo-shadow-sm transition-all mt-4">
                        Save Changes
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ProfileModal;
