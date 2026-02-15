import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HiOutlineMail, HiOutlineArrowLeft } from 'react-icons/hi';
import { BsShieldLockFill, BsArrowLeftShort, BsEnvelopeFill, BsCheckCircleFill } from 'react-icons/bs';

// Animation variants
const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const floatAnimation = {
    animate: (delay = 0) => ({
        y: [0, -10, 0],
        rotate: [0, 4, -4, 0],
        transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay },
    }),
};

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState('');
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }
        setLoading(true);
        toast.loading('Sending reset link...', { id: 'forgot' });
        setTimeout(() => {
            setLoading(false);
            setEmailSent(true);
            toast.success('Reset link sent! Check your inbox.', { id: 'forgot' });
        }, 1500);
    };

    const handleResend = () => {
        toast.loading('Resending reset link...', { id: 'resend' });
        setTimeout(() => {
            toast.success('Reset link sent again!', { id: 'resend' });
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-brand-yellow font-sans text-brand-black selection:bg-black selection:text-brand-yellow dark:bg-brand-yellow dark:text-brand-black overflow-hidden flex flex-col">

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
                <Link to="/login">
                    <motion.span
                        whileHover={{ x: -4, boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-1 text-sm font-bold border-2 border-brand-black dark:border-white px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                        <BsArrowLeftShort size={20} /> Back to Login
                    </motion.span>
                </Link>
            </motion.nav>

            {/* Main content — centered card */}
            <div className="flex-grow flex items-center justify-center px-4 sm:px-6 pt-20 pb-10">
                <div className="w-full max-w-md relative">
                    {/* Floating icons */}
                    <motion.div custom={0} animate="animate" variants={floatAnimation} className="absolute -top-12 -left-8 opacity-10 pointer-events-none hidden sm:block">
                        <BsShieldLockFill size={48} />
                    </motion.div>
                    <motion.div custom={2} animate="animate" variants={floatAnimation} className="absolute -top-8 -right-6 opacity-10 pointer-events-none hidden sm:block">
                        <BsEnvelopeFill size={40} />
                    </motion.div>

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="bg-white border-3 sm:border-4 border-black rounded-2xl sm:rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                    >
                        {/* Accent stripe */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="h-1.5 sm:h-2 bg-black origin-left"
                        />

                        <AnimatePresence mode="wait">
                            {!emailSent ? (
                                /* ─── Request Form ─── */
                                <motion.div
                                    key="form"
                                    className="p-6 sm:p-8"
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                                >
                                    {/* Lock icon */}
                                    <motion.div
                                        variants={staggerItem}
                                        className="w-14 h-14 sm:w-16 sm:h-16 bg-black text-brand-yellow rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,215,0,1)]"
                                    >
                                        <BsShieldLockFill size={28} />
                                    </motion.div>

                                    {/* Heading */}
                                    <motion.h2
                                        variants={staggerItem}
                                        className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-center text-brand-black mb-2"
                                    >
                                        {'FORGOT PASSWORD?'.split('').map((char, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 + i * 0.025, duration: 0.3 }}
                                                className="inline-block"
                                            >
                                                {char === ' ' ? '\u00A0' : char}
                                            </motion.span>
                                        ))}
                                    </motion.h2>

                                    <motion.p variants={staggerItem} className="text-gray-500 font-medium text-sm text-center mb-6 sm:mb-7 max-w-xs mx-auto">
                                        No worries! Enter your email and we'll send you a link to reset your password.
                                    </motion.p>

                                    {/* Form */}
                                    <motion.form onSubmit={handleSubmit} className="space-y-4">
                                        <motion.div variants={staggerItem}>
                                            <label htmlFor="reset-email" className="block text-xs font-bold text-brand-black mb-1.5 uppercase tracking-wide">
                                                Email Address
                                            </label>
                                            <motion.div
                                                className="relative"
                                                animate={focusedField === 'email' ? { scale: 1.01 } : { scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-black/35 pointer-events-none" aria-hidden />
                                                <input
                                                    id="reset-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@college.edu"
                                                    required
                                                    onFocus={() => setFocusedField('email')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black/80 bg-gray-50 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 text-brand-black placeholder-gray-400 font-medium text-sm transition-all"
                                                />
                                            </motion.div>
                                        </motion.div>

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
                                                            <span>Sending...</span>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.span key="send" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                            Send Reset Link
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </motion.button>
                                        </motion.div>
                                    </motion.form>

                                    {/* Back to login */}
                                    <motion.p variants={staggerItem} className="mt-5 text-center text-xs sm:text-sm font-medium text-brand-black">
                                        Remember your password?{' '}
                                        <Link to="/login" className="font-black underline decoration-2 underline-offset-2 hover:no-underline">
                                            Sign in
                                        </Link>
                                    </motion.p>
                                </motion.div>
                            ) : (
                                /* ─── Success State ─── */
                                <motion.div
                                    key="success"
                                    className="p-6 sm:p-8 text-center"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                                >
                                    {/* Success icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                                        className="w-16 h-16 sm:w-20 sm:h-20 bg-black text-brand-yellow rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,215,0,1)]"
                                    >
                                        <BsCheckCircleFill size={32} />
                                    </motion.div>

                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-3"
                                    >
                                        Check Your Email
                                    </motion.h2>

                                    <motion.p
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-gray-500 font-medium text-sm mb-2 max-w-xs mx-auto"
                                    >
                                        We've sent a password reset link to:
                                    </motion.p>

                                    <motion.p
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.45 }}
                                        className="font-black text-brand-black mb-6 bg-gray-100 border-2 border-black/10 px-4 py-2 inline-block rounded-lg"
                                    >
                                        {email}
                                    </motion.p>

                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.55 }}
                                        className="bg-gray-50 border-2 border-black/10 rounded-xl p-4 mb-6 text-left"
                                    >
                                        <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">What's next?</p>
                                        <ul className="space-y-2 text-sm text-gray-600 font-medium">
                                            <li className="flex items-start gap-2">
                                                <span className="mt-0.5 text-black font-black">1.</span>
                                                Open the email we just sent
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-0.5 text-black font-black">2.</span>
                                                Click the reset password link
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-0.5 text-black font-black">3.</span>
                                                Create a new strong password
                                            </li>
                                        </ul>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.65 }}
                                        className="space-y-3"
                                    >
                                        <motion.button
                                            onClick={handleResend}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-3 font-black text-sm text-brand-black bg-brand-yellow border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
                                        >
                                            Resend Email
                                        </motion.button>

                                        <Link to="/login" className="block">
                                            <motion.span
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full py-3 font-black text-sm text-white bg-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,215,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(255,215,0,1)] transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                                            >
                                                <HiOutlineArrowLeft size={16} /> Back to Login
                                            </motion.span>
                                        </Link>
                                    </motion.div>

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.75 }}
                                        className="mt-5 text-[11px] text-gray-400 font-medium"
                                    >
                                        Didn't receive the email? Check your spam folder or try a different email.
                                    </motion.p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Trust text below card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mt-6 flex items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-brand-black/40 font-semibold"
                    >
                        <span className="flex items-center gap-1">
                            <BsShieldLockFill size={12} /> SSL Encrypted
                        </span>
                        <span className="flex items-center gap-1">
                            <BsCheckCircleFill size={12} /> Secure Reset
                        </span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
