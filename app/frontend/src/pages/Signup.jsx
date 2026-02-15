import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineUser } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { BsBarChartLineFill, BsWalletFill, BsShieldLockFill, BsArrowLeftShort, BsLightningChargeFill, BsPeopleFill, BsStarFill, BsCheckCircleFill, BsArrowRight } from 'react-icons/bs';
import { authApi } from '../services/api';

// Animation variants
const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const slideFromLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const slideFromRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 } },
};

const floatAnimation = {
    animate: (delay = 0) => ({
        y: [0, -10, 0],
        rotate: [0, 4, -4, 0],
        transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay },
    }),
};

const benefits = [
    { icon: <BsBarChartLineFill size={20} />, title: 'Smart Analytics', desc: 'See where every rupee goes with visual charts and weekly reports' },
    { icon: <BsWalletFill size={20} />, title: 'Multi-Account', desc: 'Track cash, UPI, bank accounts and cards in one place' },
    { icon: <BsShieldLockFill size={20} />, title: 'Private & Secure', desc: 'Your data stays yours. Bank-grade encryption, always.' },
    { icon: <BsLightningChargeFill size={20} />, title: 'Quick Entry', desc: 'Log expenses in under 3 seconds with smart shortcuts' },
];

const steps = [
    { num: '01', text: 'Create your free account' },
    { num: '02', text: 'Set your monthly budget' },
    { num: '03', text: 'Track every transaction' },
];

const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const validatePassword = (password) => {
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasMinLen = password.length >= 8;
        return { hasUpper, hasNumber, hasSymbol, hasMinLen, isValid: hasUpper && hasNumber && hasSymbol && hasMinLen };
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const dummyKeywords = ['demo', 'test', 'example', 'dummy', 'guest'];
        const isDummy = dummyKeywords.some(keyword => formData.email.toLowerCase().includes(keyword));

        if (isDummy) {
            toast.error('Dummy or demo email addresses are not allowed. Please use a real email address.');
            return;
        }

        const validation = validatePassword(formData.password);
        if (!validation.isValid) {
            toast.error('Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one symbol.');
            return;
        }

        setLoading(true);
        toast.loading('Creating your account...', { id: 'signup' });

        try {
            const response = await authApi.signup(formData);
            if (response.data.success) {
                await login(); // Refresh user state in AuthContext
                toast.success('Account created! Welcome to BudgetTracko!', { id: 'signup' });
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Signup error:', error);
            const message = error.response?.data?.message || 'Failed to create account. Please try again.';
            toast.error(message, { id: 'signup' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-yellow font-sans text-brand-black selection:bg-black selection:text-brand-yellow dark:bg-brand-yellow dark:text-brand-black overflow-hidden">

            {/* Navigation */}
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-brand-black bg-brand-yellow/90 dark:bg-black/70 backdrop-blur-md dark:border-white/20 shadow-sm"
            >
                <Link to="/" className="flex items-center gap-1 sm:gap-2">
                    <motion.span
                        whileHover={{ scale: 1.05, rotate: -1 }}
                        className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-0.5 sm:gap-1"
                    >
                        <span className="text-[#1a1a1a] dark:text-white">BUDGET</span>
                        <span className="text-white bg-black dark:bg-white dark:text-black px-1 transform -rotate-2 border-2 border-black dark:border-white">TRACKO</span>
                    </motion.span>
                </Link>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link to="/login">
                        <motion.span
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center text-xs sm:text-sm font-bold hover:underline decoration-2 underline-offset-2"
                        >
                            Sign In
                        </motion.span>
                    </Link>
                    <Link to="/">
                        <motion.span
                            whileHover={{ x: -4, boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-1 text-sm font-bold border-2 border-brand-black dark:border-white px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                        >
                            <BsArrowLeftShort size={20} /> Home
                        </motion.span>
                    </Link>
                </div>
            </motion.nav>

            {/* Main content — two-panel layout */}
            <div className="min-h-screen flex flex-col lg:flex-row pt-16 sm:pt-20">

                {/* ─── Left Panel: Why Join ─── */}
                <motion.div
                    variants={slideFromLeft}
                    initial="hidden"
                    animate="visible"
                    className="lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-10 sm:py-14 lg:py-0 relative"
                >
                    {/* Floating decorative icons */}
                    <motion.div custom={0} animate="animate" variants={floatAnimation} className="absolute top-28 right-10 opacity-10 pointer-events-none hidden lg:block">
                        <BsBarChartLineFill size={56} />
                    </motion.div>
                    <motion.div custom={2.5} animate="animate" variants={floatAnimation} className="absolute bottom-32 left-10 opacity-10 pointer-events-none hidden lg:block">
                        <BsWalletFill size={44} />
                    </motion.div>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-black text-brand-yellow font-bold text-xs sm:text-sm px-4 py-2 border-2 border-black w-fit mb-6 sm:mb-8"
                    >
                        <BsStarFill size={14} />
                        <span>FREE FOREVER FOR STUDENTS</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tighter leading-[0.95] mb-4 sm:mb-6"
                    >
                        Start your<br />
                        <span className="text-white bg-black px-2 py-1 inline-block transform -rotate-1 border-2 border-black mt-1">
                            journey.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.5 }}
                        className="text-base sm:text-lg lg:text-xl font-bold text-gray-700 max-w-lg mb-8 sm:mb-10 leading-relaxed"
                    >
                        Join thousands of students already crushing their finances. It takes less than 30 seconds to sign up.
                    </motion.p>

                    {/* How it works steps */}
                    <motion.div
                        className="flex gap-3 sm:gap-4 mb-8 sm:mb-10"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                variants={staggerItem}
                                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                className="bg-white border-2 sm:border-3 border-black px-3 sm:px-5 py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1"
                            >
                                <div className="text-xl sm:text-2xl font-black text-brand-yellow">{step.num}</div>
                                <p className="text-xs sm:text-sm font-bold mt-1">{step.text}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Benefits grid */}
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {benefits.map((b, i) => (
                            <motion.div
                                key={i}
                                variants={staggerItem}
                                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                                className="flex gap-3 items-start"
                            >
                                <span className="flex-shrink-0 w-9 h-9 bg-black text-brand-yellow rounded-full flex items-center justify-center mt-0.5">
                                    {b.icon}
                                </span>
                                <div>
                                    <h4 className="font-black text-sm">{b.title}</h4>
                                    <p className="text-xs text-gray-600 font-medium leading-snug">{b.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Social proof bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="flex items-center gap-3 sm:gap-4 hidden sm:flex"
                    >
                        <div className="flex -space-x-2">
                            {['P', 'R', 'A', 'S'].map((letter, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.9 + i * 0.1, type: 'spring', stiffness: 300 }}
                                    className="w-8 h-8 bg-black text-brand-yellow border-2 border-brand-yellow rounded-full flex items-center justify-center text-xs font-black"
                                >
                                    {letter}
                                </motion.div>
                            ))}
                        </div>
                        <div>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(s => <BsStarFill key={s} size={12} className="text-black" />)}
                            </div>
                            <p className="text-xs font-bold text-gray-600">10,000+ students already budgeting</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ─── Right Panel: Signup Form ─── */}
                <motion.div
                    variants={slideFromRight}
                    initial="hidden"
                    animate="visible"
                    className="lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-0"
                >
                    <div className="w-full max-w-md relative z-10">
                        {/* Floating icons */}
                        <motion.div custom={1} animate="animate" variants={floatAnimation} className="absolute -top-8 -right-4 opacity-15 pointer-events-none hidden sm:block">
                            <BsPeopleFill size={36} />
                        </motion.div>
                        <motion.div custom={3} animate="animate" variants={floatAnimation} className="absolute -bottom-6 -left-6 opacity-15 pointer-events-none hidden sm:block">
                            <BsShieldLockFill size={32} />
                        </motion.div>

                        {/* Card */}
                        <div className="bg-white border-3 sm:border-4 border-black rounded-2xl sm:rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            {/* Accent stripe */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="h-1.5 sm:h-2 bg-black origin-left"
                            />

                            <motion.div
                                className="p-6 sm:p-8"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                {/* Heading */}
                                <motion.h2
                                    variants={staggerItem}
                                    className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-brand-black mb-1"
                                >
                                    {'CREATE ACCOUNT'.split('').map((char, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + i * 0.03, duration: 0.3 }}
                                            className="inline-block"
                                        >
                                            {char === ' ' ? '\u00A0' : char}
                                        </motion.span>
                                    ))}
                                </motion.h2>
                                <motion.p variants={staggerItem} className="text-gray-500 font-medium text-sm mb-5 sm:mb-6">
                                    Sign up for free and start tracking today.
                                </motion.p>

                                {/* Social signup buttons */}
                                <motion.div variants={staggerItem} className="flex gap-3 mb-5 sm:mb-6">
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.03, y: -2, boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-sm transition-all"
                                    >
                                        <FcGoogle className="w-5 h-5" aria-hidden />
                                        <span>Google</span>
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.03, y: -2, boxShadow: '6px 6px 0px 0px rgba(255,215,0,1)' }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-black text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,215,0,1)] font-bold text-sm transition-all"
                                    >
                                        <FaGithub className="w-5 h-5" aria-hidden />
                                        <span>GitHub</span>
                                    </motion.button>
                                </motion.div>

                                {/* Divider */}
                                <motion.div variants={staggerItem} className="relative mb-5 sm:mb-6">
                                    <span className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t-2 border-black/15" />
                                    </span>
                                    <span className="relative flex justify-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-black/50 bg-white px-3">
                                        or with email
                                    </span>
                                </motion.div>

                                {/* Form */}
                                <motion.form onSubmit={handleSignup} className="space-y-4">
                                    {/* Full Name */}
                                    <motion.div variants={staggerItem}>
                                        <label htmlFor="fullname" className="block text-xs font-bold text-brand-black mb-1.5 uppercase tracking-wide">
                                            Full Name
                                        </label>
                                        <motion.div
                                            className="relative"
                                            animate={focusedField === 'fullname' ? { scale: 1.01 } : { scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-black/35 pointer-events-none" aria-hidden />
                                            <input
                                                id="displayName"
                                                type="text"
                                                placeholder="Bhargav Karande"
                                                required
                                                value={formData.displayName}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('displayName')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black/80 bg-gray-50 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 text-brand-black placeholder-gray-400 font-medium text-sm transition-all"
                                            />
                                        </motion.div>
                                    </motion.div>

                                    {/* Email */}
                                    <motion.div variants={staggerItem}>
                                        <label htmlFor="email" className="block text-xs font-bold text-brand-black mb-1.5 uppercase tracking-wide">
                                            Email Address
                                        </label>
                                        <motion.div
                                            className="relative"
                                            animate={focusedField === 'email' ? { scale: 1.01 } : { scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-black/35 pointer-events-none" aria-hidden />
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="you@college.edu"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black/80 bg-gray-50 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 text-brand-black placeholder-gray-400 font-medium text-sm transition-all"
                                            />
                                        </motion.div>
                                    </motion.div>

                                    {/* Password */}
                                    <motion.div variants={staggerItem}>
                                        <label htmlFor="password" className="block text-xs font-bold text-brand-black mb-1.5 uppercase tracking-wide">
                                            Password
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
                                                placeholder="Min. 8 characters"
                                                required
                                                minLength={8}
                                                value={formData.password}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('password')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-black/80 bg-gray-50 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 text-brand-black placeholder-gray-400 font-medium text-sm transition-all"
                                            />
                                            <motion.button
                                                type="button"
                                                whileTap={{ scale: 0.85 }}
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-black/40 hover:text-brand-black p-1 transition-colors"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                            </motion.button>
                                        </motion.div>
                                    </motion.div>

                                    {/* Terms */}
                                    <motion.p variants={staggerItem} className="text-[11px] text-gray-500 font-medium leading-snug">
                                        By signing up, you agree to our{' '}
                                        <Link to="/privacy" className="font-bold underline underline-offset-2 hover:text-black">Privacy Policy</Link>
                                        {' '}and Terms of Service.
                                    </motion.p>

                                    {/* Submit */}
                                    <motion.div variants={staggerItem} className="pt-1">
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
                                                        <span>Creating account...</span>
                                                    </motion.div>
                                                ) : (
                                                    <motion.span key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                                        Create Account <BsArrowRight size={18} />
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>
                                    </motion.div>
                                </motion.form>

                                {/* Login link */}
                                <motion.p variants={staggerItem} className="mt-5 text-center text-xs sm:text-sm font-medium text-brand-black">
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-black underline decoration-2 underline-offset-2 hover:no-underline">
                                        Sign in
                                    </Link>
                                </motion.p>

                                {/* Trust badges */}
                                <motion.div
                                    variants={staggerItem}
                                    className="mt-5 sm:mt-6 flex items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-gray-400 font-semibold"
                                >
                                    <span className="flex items-center gap-1">
                                        <BsShieldLockFill size={12} /> SSL Encrypted
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <BsCheckCircleFill size={12} /> No Spam
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <BsStarFill size={12} /> 100% Free
                                    </span>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
