import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { authApi } from '../services/api';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { BsShieldLockFill, BsCheckCircleFill, BsArrowLeftShort } from 'react-icons/bs';

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const ResetPassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [loading, setLoading] = useState(false);
    const [isReset, setIsReset] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    // Password validation regex
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!passwordRegex.test(formData.password)) {
            toast.error('Password must be at least 8 characters with 1 uppercase, 1 number, and 1 symbol');
            return;
        }

        setLoading(true);
        toast.loading('Resetting password...', { id: 'reset' });

        try {
            const response = await authApi.resetPassword(token, { password: formData.password });
            if (response.data.success) {
                setIsReset(true);
                toast.success('Password reset successfully!', { id: 'reset' });
                // Redirect after a delay
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error) {
            console.error('Reset password error:', error);
            const message = error.response?.data?.message || 'Failed to reset password. Link may be expired.';
            toast.error(message, { id: 'reset' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-yellow font-sans text-brand-black selection:bg-black selection:text-brand-yellow dark:bg-brand-yellow dark:text-brand-black overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 py-10">

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full max-w-md bg-white border-3 sm:border-4 border-black rounded-2xl sm:rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative z-10"
            >
                {/* Accent stripe */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="h-1.5 sm:h-2 bg-black origin-left"
                />

                <AnimatePresence mode="wait">
                    {!isReset ? (
                        <motion.div
                            key="form"
                            className="p-6 sm:p-8"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, x: -50 }}
                        >
                            {/* Icon */}
                            <motion.div
                                variants={staggerItem}
                                className="w-14 h-14 sm:w-16 sm:h-16 bg-black text-brand-yellow rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,215,0,1)]"
                            >
                                <BsShieldLockFill size={28} />
                            </motion.div>

                            <motion.h2
                                variants={staggerItem}
                                className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-center text-brand-black mb-2"
                            >
                                NEW PASSWORD
                            </motion.h2>

                            <motion.p variants={staggerItem} className="text-gray-500 font-medium text-sm text-center mb-6 sm:mb-7 max-w-xs mx-auto">
                                Secure your account with a strong new password.
                            </motion.p>

                            <motion.form onSubmit={handleSubmit} className="space-y-4">
                                {/* New Password */}
                                <motion.div variants={staggerItem}>
                                    <label htmlFor="password" className="block text-xs font-bold text-brand-black mb-1.5 uppercase tracking-wide">
                                        New Password
                                    </label>
                                    <motion.div
                                        className="relative"
                                        animate={focusedField === 'password' ? { scale: 1.01 } : { scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-black/35 pointer-events-none" aria-hidden />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min 8 chars, 1 upper, 1 number"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-black/80 bg-gray-50 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 text-brand-black placeholder-gray-400 font-medium text-sm transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-black/40 hover:text-brand-black p-1 transition-colors"
                                        >
                                            {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                        </button>
                                    </motion.div>
                                </motion.div>

                                {/* Confirm Password */}
                                <motion.div variants={staggerItem}>
                                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-brand-black mb-1.5 uppercase tracking-wide">
                                        Confirm Password
                                    </label>
                                    <motion.div
                                        className="relative"
                                        animate={focusedField === 'confirmPassword' ? { scale: 1.01 } : { scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-black/35 pointer-events-none" aria-hidden />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Re-enter password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('confirmPassword')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-black/80 bg-gray-50 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 text-brand-black placeholder-gray-400 font-medium text-sm transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-black/40 hover:text-brand-black p-1 transition-colors"
                                        >
                                            {showConfirmPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                        </button>
                                    </motion.div>
                                </motion.div>

                                <motion.div variants={staggerItem} className="pt-2">
                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                                        whileTap={!loading ? { scale: 0.98 } : {}}
                                        className="w-full py-3.5 font-black text-base text-white bg-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,215,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,215,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
                                    >
                                        <AnimatePresence mode="wait">
                                            {loading ? (
                                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                                    <motion.span
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                                                    />
                                                    <span>Updating...</span>
                                                </motion.div>
                                            ) : (
                                                <motion.span key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                    Reset Password
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </motion.div>
                            </motion.form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            className="p-8 text-center"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                                className="w-20 h-20 bg-black text-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,215,0,1)]"
                            >
                                <BsCheckCircleFill size={32} />
                            </motion.div>

                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-3">All Set!</h2>
                            <p className="text-gray-500 font-medium mb-8">
                                Your password has been successfully reset. You can now login with your new credentials.
                            </p>

                            <Link to="/login">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3.5 font-black text-white bg-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,215,0,1)] uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    <BsArrowLeftShort size={20} /> Back to Login
                                </motion.button>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
