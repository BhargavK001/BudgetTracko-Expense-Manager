import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { BsShieldLockFill, BsArrowLeftShort } from 'react-icons/bs';
import { authApi } from '../../services/api';

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        toast.loading('Authenticating...', { id: 'admin-login' });

        try {
            const response = await authApi.login(formData);
            if (response.data.success) {
                await login();
                const meResponse = await authApi.getMe();
                if (meResponse.data?.user?.role === 'admin') {
                    toast.success('Welcome, Administrator', { id: 'admin-login' });
                    navigate('/admin/dashboard');
                } else {
                    toast.error('Access denied. Admin privileges required.', { id: 'admin-login' });
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid credentials';
            toast.error(message, { id: 'admin-login' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] font-sans text-white selection:bg-brand-yellow selection:text-brand-black flex flex-col overflow-hidden">
            {/* Subtle background pattern */}
            <div className="fixed inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }} />

            {/* Glow effect behind card */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Navigation */}
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative z-50 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10"
            >
                <Link to="/" className="flex items-center gap-1 sm:gap-2">
                    <motion.span
                        whileHover={{ scale: 1.05, rotate: -1 }}
                        className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-0.5 sm:gap-1"
                    >
                        <span className="text-white">BUDGET</span>
                        <span className="text-brand-black bg-brand-yellow px-1 transform -rotate-2 border-2 border-brand-yellow">TRACKO</span>
                    </motion.span>
                </Link>
                <Link to="/">
                    <motion.span
                        whileHover={{ x: -4, backgroundColor: 'rgba(250, 204, 21, 1)', color: '#1a1a1a', borderColor: 'rgba(250, 204, 21, 1)' }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold border-2 border-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all text-gray-400 hover:text-brand-black"
                    >
                        <BsArrowLeftShort size={20} /> Home
                    </motion.span>
                </Link>
            </motion.nav>

            {/* Main content */}
            <div className="relative flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
                <div className="w-full max-w-sm">
                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="relative bg-[#111111] border-2 border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden"
                    >
                        {/* Top accent bar */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="h-1 bg-gradient-to-r from-brand-yellow via-yellow-500 to-amber-500 origin-left"
                        />

                        <motion.div
                            className="p-6 sm:p-8"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Icon and heading */}
                            <motion.div variants={staggerItem} className="text-center mb-8">
                                <motion.div
                                    whileHover={{ rotate: [0, -5, 5, 0] }}
                                    transition={{ duration: 0.5 }}
                                    className="w-14 h-14 mx-auto mb-4 bg-brand-yellow text-brand-black rounded-2xl border-2 border-brand-yellow flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.2)]"
                                >
                                    <BsShieldLockFill size={26} />
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-white">
                                    Admin Access
                                </h2>
                                <p className="text-gray-500 font-semibold text-xs uppercase tracking-widest mt-1.5">
                                    Restricted Area
                                </p>
                            </motion.div>

                            {/* Form */}
                            <motion.form onSubmit={handleLogin} className="space-y-5">
                                {/* Email */}
                                <motion.div variants={staggerItem}>
                                    <label htmlFor="email" className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">
                                        Email Address
                                    </label>
                                    <motion.div
                                        className="relative"
                                        animate={focusedField === 'email' ? { scale: 1.01 } : { scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <HiOutlineMail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-200 ${focusedField === 'email' ? 'text-brand-yellow' : 'text-gray-600'}`} />
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="admin@budgettracko.app"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 focus:bg-white/[0.07] focus:border-brand-yellow/60 focus:outline-none focus:ring-2 focus:ring-brand-yellow/10 text-white placeholder-gray-600 font-semibold text-sm transition-all duration-200"
                                        />
                                    </motion.div>
                                </motion.div>

                                {/* Password */}
                                <motion.div variants={staggerItem}>
                                    <label htmlFor="password" className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">
                                        Password
                                    </label>
                                    <motion.div
                                        className="relative"
                                        animate={focusedField === 'password' ? { scale: 1.01 } : { scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <HiOutlineLockClosed className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-200 ${focusedField === 'password' ? 'text-brand-yellow' : 'text-gray-600'}`} />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter admin password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 focus:bg-white/[0.07] focus:border-brand-yellow/60 focus:outline-none focus:ring-2 focus:ring-brand-yellow/10 text-white placeholder-gray-600 font-semibold text-sm transition-all duration-200"
                                        />
                                        <motion.button
                                            type="button"
                                            whileTap={{ scale: 0.85 }}
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 p-1 transition-colors"
                                        >
                                            {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                        </motion.button>
                                    </motion.div>
                                </motion.div>

                                {/* Submit */}
                                <motion.div variants={staggerItem} className="pt-1">
                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={!loading ? { scale: 1.02, y: -2, boxShadow: '0 8px 30px rgba(250, 204, 21, 0.3)' } : {}}
                                        whileTap={!loading ? { scale: 0.98 } : {}}
                                        className="w-full py-3.5 sm:py-4 font-black text-sm sm:text-base text-brand-black bg-brand-yellow border-2 border-brand-yellow rounded-xl shadow-[0_4px_20px_rgba(250,204,21,0.15)] hover:shadow-[0_8px_30px_rgba(250,204,21,0.3)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
                                    >
                                        <AnimatePresence mode="wait">
                                            {loading ? (
                                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                                    <motion.span
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                                        className="w-5 h-5 border-2 border-brand-black/30 border-t-brand-black rounded-full inline-block"
                                                    />
                                                    <span>Authenticating...</span>
                                                </motion.div>
                                            ) : (
                                                <motion.span key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                                    <BsShieldLockFill size={16} />
                                                    <span>Access Admin Panel</span>
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </motion.div>
                            </motion.form>

                            {/* Footer note */}
                            <motion.div variants={staggerItem} className="mt-6 pt-5 border-t border-white/5">
                                <p className="text-center text-[11px] text-gray-600 font-semibold tracking-wide">
                                    This is a restricted area. Unauthorized access attempts are logged.
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Bottom branding */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-6 text-[10px] text-gray-700 font-bold uppercase tracking-widest"
                    >
                        BudgetTracko Admin Console
                    </motion.p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
