
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { BsMoonStarsFill, BsBank2, BsBarChartLineFill, BsShieldLockFill, BsCloudArrowUpFill, BsBellFill, BsArrowRepeat } from 'react-icons/bs';

// ─── Animation Variants ───────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
    }),
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: (delay = 0) => ({
        opacity: 1,
        transition: { duration: 0.6, delay },
    }),
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
    visible: (delay = 0) => ({
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay },
    }),
};

const slideFromLeft = {
    hidden: { opacity: 0, x: -80 },
    visible: (delay = 0) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
    }),
};

const slideFromRight = {
    hidden: { opacity: 0, x: 80 },
    visible: (delay = 0) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
    }),
};

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const popIn = {
    hidden: { opacity: 0, scale: 0, rotate: -12 },
    visible: (delay = 0) => ({
        opacity: 1,
        scale: 1,
        rotate: -2,
        transition: {
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay,
        },
    }),
};

// ─── Floating Money Element Component ────────────────────
const FloatingMoney = ({ children, className, style }) => (
    <div
        className={`absolute pointer-events-none select-none ${className}`}
        style={style}
        aria-hidden="true"
    >
        {children}
    </div>
);

// Rupee coin SVG
const CoinSvg = ({ size = 48, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#FFD700" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="24" cy="24" r="18" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity="0.3" />
        <text x="24" y="30" textAnchor="middle" fontSize="20" fontWeight="900" fill="#1a1a1a" fontFamily="sans-serif">₹</text>
    </svg>
);

// Credit card SVG
const CardSvg = ({ size = 56, className = '' }) => (
    <svg width={size} height={size * 0.65} viewBox="0 0 56 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="54" height="34" rx="4" fill="#1a1a1a" stroke="#FFD700" strokeWidth="2" />
        <rect x="1" y="8" width="54" height="6" fill="#FFD700" opacity="0.6" />
        <rect x="6" y="20" width="16" height="3" rx="1.5" fill="#FFD700" opacity="0.4" />
        <rect x="6" y="26" width="10" height="3" rx="1.5" fill="#FFD700" opacity="0.3" />
        <circle cx="44" cy="24" r="5" fill="#FFD700" opacity="0.5" />
        <circle cx="48" cy="24" r="5" fill="#FFD700" opacity="0.3" />
    </svg>
);

// Piggy bank SVG
const PiggySvg = ({ size = 52, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 52 52" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="28" cy="30" rx="16" ry="13" fill="#FFD700" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="34" cy="26" r="2" fill="#1a1a1a" />
        <ellipse cx="40" cy="30" rx="3" ry="2" fill="#1a1a1a" opacity="0.3" />
        <rect x="18" y="38" width="4" height="6" rx="2" fill="#1a1a1a" opacity="0.6" />
        <rect x="30" y="38" width="4" height="6" rx="2" fill="#1a1a1a" opacity="0.6" />
        <path d="M22 20 Q26 12 30 20" stroke="#1a1a1a" strokeWidth="2" fill="none" />
        <rect x="24" y="10" width="4" height="4" rx="1" fill="#1a1a1a" opacity="0.5" />
    </svg>
);

// Wallet SVG  
const WalletSvg = ({ size = 48, className = '' }) => (
    <svg width={size} height={size * 0.8} viewBox="0 0 48 38" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="44" height="30" rx="4" fill="#1a1a1a" stroke="#FFD700" strokeWidth="2" />
        <rect x="2" y="2" width="36" height="8" rx="3" fill="#FFD700" stroke="#1a1a1a" strokeWidth="1.5" />
        <rect x="32" y="16" width="14" height="10" rx="3" fill="#FFD700" stroke="#1a1a1a" strokeWidth="1.5" />
        <circle cx="39" cy="21" r="2" fill="#1a1a1a" />
    </svg>
);

const LandingPage = () => {
    const { theme } = useTheme();
    const heroRef = useRef(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

    return (
        <div className="min-h-screen bg-brand-yellow font-sans text-brand-black flex flex-col selection:bg-black selection:text-brand-yellow dark:bg-brand-yellow dark:text-brand-black overflow-hidden">
            {/* Navigation */}
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="fixed top-0 w-full bg-brand-yellow/90 dark:bg-black/70 backdrop-blur-md z-50 border-b-2 border-brand-black dark:border-white/20 text-brand-black dark:text-white transition-colors shadow-sm dark:shadow-white/5"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: -1 }}
                        className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-1 sm:gap-2"
                    >
                        <span className="text-[#1a1a1a] dark:text-white transition-colors">BUDGET</span>
                        <motion.span
                            whileHover={{ rotate: 2 }}
                            className="text-white bg-black dark:bg-white dark:text-black px-1 transform -rotate-2 border-2 border-black dark:border-white transition-colors"
                        >
                            TRACKO
                        </motion.span>
                    </motion.div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex gap-8 items-center font-bold text-sm tracking-wide uppercase text-brand-black dark:text-white">
                        <Link to="/features">
                            <motion.span whileHover={{ y: -2 }} className="inline-block hover:underline decoration-2 underline-offset-4">Features</motion.span>
                        </Link>
                        <Link to="/pricing">
                            <motion.span whileHover={{ y: -2 }} className="inline-block hover:underline decoration-2 underline-offset-4">Pricing</motion.span>
                        </Link>
                        <Link to="/contact">
                            <motion.span whileHover={{ y: -2 }} className="inline-block hover:underline decoration-2 underline-offset-4">Contact</motion.span>
                        </Link>
                        <Link to="/login">
                            <motion.span
                                whileHover={{ y: -3, boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-block bg-black dark:bg-white dark:text-black text-white px-6 py-3 rounded-none hover:bg-white hover:text-black dark:hover:bg-gray-200 dark:hover:text-black transition-all border-2 border-black dark:border-white"
                            >
                                Login
                            </motion.span>
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden flex flex-col gap-1.5 p-2"
                        aria-label="Toggle menu"
                    >
                        <motion.span animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 8 : 0 }} className="block w-6 h-0.5 bg-black dark:bg-white transition-transform" />
                        <motion.span animate={{ opacity: mobileMenuOpen ? 0 : 1 }} className="block w-6 h-0.5 bg-black dark:bg-white" />
                        <motion.span animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -8 : 0 }} className="block w-6 h-0.5 bg-black dark:bg-white transition-transform" />
                    </motion.button>
                </div>

                {/* Mobile menu dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="md:hidden overflow-hidden border-t-2 border-black/10 dark:border-white/10"
                        >
                            <div className="flex flex-col gap-4 px-6 py-6 font-bold text-sm uppercase tracking-wide">
                                <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="hover:underline decoration-2">Features</Link>
                                <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="hover:underline decoration-2">Pricing</Link>
                                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:underline decoration-2">About Us</Link>
                                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:underline decoration-2">Contact</Link>
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <span className="inline-block bg-black text-white px-6 py-3 border-2 border-black w-full text-center mt-2">Login</span>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Hero Section */}
            <motion.header
                ref={heroRef}
                style={{ y: heroY, scale: heroScale }}
                className="pt-32 pb-20 px-6 flex flex-col justify-center items-center text-center max-w-7xl mx-auto w-full relative"
            >
                {/* Floating money-themed decorative elements */}
                <FloatingMoney
                    className="animate-float top-40 left-4 sm:left-10 opacity-15 sm:opacity-25"
                    style={{ animationDelay: '0s' }}
                >
                    <CoinSvg size={32} className="sm:hidden" />
                    <CoinSvg size={56} className="hidden sm:block" />
                </FloatingMoney>
                <FloatingMoney
                    className="animate-float-reverse top-60 right-4 sm:right-16 opacity-10 sm:opacity-20"
                    style={{ animationDelay: '1s' }}
                >
                    <CardSvg size={48} className="sm:hidden" />
                    <CardSvg size={72} className="hidden sm:block" />
                </FloatingMoney>
                <FloatingMoney
                    className="animate-float-slow top-80 left-1/4 hidden sm:block opacity-20"
                    style={{ animationDelay: '2s' }}
                >
                    <PiggySvg size={48} />
                </FloatingMoney>
                <FloatingMoney
                    className="animate-spin-slow top-48 right-1/4 hidden md:block opacity-15"
                    style={{}}
                >
                    <CoinSvg size={40} />
                </FloatingMoney>
                <FloatingMoney
                    className="animate-float top-[70%] right-4 sm:right-10 hidden sm:block opacity-20"
                    style={{ animationDelay: '3s' }}
                >
                    <WalletSvg size={52} />
                </FloatingMoney>

                {/* Badge */}
                <motion.div
                    variants={popIn}
                    initial="hidden"
                    animate="visible"
                    custom={0.2}
                    className="inline-block bg-white border-2 border-black px-4 py-1 font-bold text-sm mb-6 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2 text-black relative"
                >
                    <span className="absolute inset-0 rounded-full animate-ping-soft bg-brand-yellow/30" style={{ animation: 'ping-soft 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                    <span className="relative">✨ V 1.0 is Live!</span>
                </motion.div>

                {/* Hero Heading — staggered word reveal */}
                <motion.h1
                    className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-4 sm:mb-8 leading-[0.9] tracking-tighter text-brand-black"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.span variants={staggerItem} className="inline-block">MASTER</motion.span>
                    <br />
                    <motion.span variants={staggerItem} className="inline-block">YOUR </motion.span>
                    <motion.span variants={staggerItem} className="inline-block text-white text-shadow-black">MONEY.</motion.span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={0.6}
                    className="text-base sm:text-xl md:text-2xl font-medium max-w-2xl mb-8 sm:mb-12 leading-relaxed text-brand-black px-2"
                >
                    Stop guessing where your money goes. Track, analyze, and optimize your spending with the world's simplest expense manager.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-4 sm:px-0"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={staggerItem} custom={0.8}>
                        <Link to="/login" className="inline-block w-full sm:w-auto text-center bg-black text-white text-lg sm:text-xl font-bold px-8 sm:px-12 py-4 sm:py-5 rounded-none shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all border-2 border-black animate-pulse-glow">
                            Start Tracking Free
                        </Link>
                    </motion.div>
                    <motion.div variants={staggerItem} custom={1.0}>
                        <a href="#demo" className="inline-block w-full sm:w-auto text-center bg-white text-black text-lg sm:text-xl font-bold px-8 sm:px-12 py-4 sm:py-5 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all border-2 border-black box-border">
                            View Demo
                        </a>
                    </motion.div>
                </motion.div>

                {/* Hero Visual - Mock Dashboard with scale-in animation */}
                <motion.div
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    custom={0.8}
                    className="mt-12 sm:mt-20 w-full max-w-5xl relative group"
                >
                    <div className="absolute inset-0 bg-black rounded-3xl transform translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform"></div>
                    <div className="relative bg-white border-4 border-black rounded-3xl overflow-hidden shadow-2xl">
                        {/* Mock Browser Header */}
                        <div className="bg-gray-100 border-b-4 border-black p-4 flex gap-2 items-center">
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                            <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-black"></div>
                            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-black"></div>
                            <span className="ml-4 text-xs font-bold text-gray-500 uppercase tracking-wider">dashboard — BudgetTracko</span>
                        </div>
                        {/* Mock UI Content */}
                        <div className="p-4 sm:p-6 md:p-10 bg-gray-50 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                            {/* Sidebar Mock */}
                            <div className="hidden md:flex col-span-3 flex-col gap-3">
                                <div className="h-9 bg-black text-white rounded-lg flex items-center px-3 text-sm font-bold">Dashboard</div>
                                <div className="h-9 bg-gray-200 text-gray-700 rounded-lg flex items-center px-3 text-sm font-semibold">Transactions</div>
                                <div className="h-9 bg-gray-200 text-gray-700 rounded-lg flex items-center px-3 text-sm font-semibold">Categories</div>
                                <div className="h-9 bg-gray-200 text-gray-700 rounded-lg flex items-center px-3 text-sm font-semibold">Reports</div>
                            </div>
                            {/* Main Content Mock */}
                            <div className="col-span-12 md:col-span-9 space-y-5">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    <h3 className="text-lg font-black text-black uppercase tracking-tight">February 2025</h3>
                                    <div className="h-9 px-4 bg-brand-yellow border-2 border-black rounded-lg flex items-center text-sm font-black text-black">+ Add transaction</div>
                                </div>
                                {/* Summary cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Balance</p>
                                        <p className="text-lg sm:text-xl font-black text-black">₹ 42,850</p>
                                    </div>
                                    <div className="bg-green-50 border-2 border-green-600 rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(22,163,74,0.4)]">
                                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Income</p>
                                        <p className="text-lg sm:text-xl font-black text-green-700">₹ 65,000</p>
                                    </div>
                                    <div className="bg-red-50 border-2 border-red-600 rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(220,38,38,0.4)]">
                                        <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Expenses</p>
                                        <p className="text-lg sm:text-xl font-black text-red-700">₹ 22,150</p>
                                    </div>
                                </div>
                                {/* Chart block */}
                                <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] min-h-[220px]">
                                    <p className="text-sm font-black text-black uppercase tracking-tight mb-3">Spending this month</p>
                                    {/* Trend line chart - SVG */}
                                    <div className="h-20 w-full mb-4 relative">
                                        <svg viewBox="0 0 280 80" className="w-full h-full" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M 0 55 Q 35 50, 70 45 T 140 35 T 210 42 T 280 28" />
                                            <path fill="url(#trendGradient)" stroke="none" d="M 0 55 Q 35 50, 70 45 T 140 35 T 210 42 T 280 28 L 280 80 L 0 80 Z" />
                                        </svg>
                                        <p className="absolute bottom-0 left-0 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Week 1 — Week 4</p>
                                    </div>
                                    <div className="flex items-end gap-2 h-14 mb-4">
                                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                                <div className={`w-full rounded-t ${i % 3 === 0 ? 'bg-green-500' : 'bg-red-500'} opacity-90`} style={{ height: `${h}%` }}></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t-2 border-gray-200 pt-3 space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-green-600">● Food</span>
                                            <span className="text-black">₹ 4,200</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-red-600">● Transport</span>
                                            <span className="text-black">₹ 2,800</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-amber-600">● Bills</span>
                                            <span className="text-black">₹ 6,150</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.header>

            {/* ─── Marquee Section ─── */}
            <div className="bg-black text-brand-yellow py-4 sm:py-6 overflow-hidden border-y-4 border-white transform rotate-1 scale-105">
                <div className="whitespace-nowrap animate-marquee font-black text-lg sm:text-2xl tracking-widest uppercase flex">
                    <span className="flex-shrink-0">
                        SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM • SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM • SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM •&nbsp;
                    </span>
                    <span className="flex-shrink-0">
                        SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM • SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM • SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM •&nbsp;
                    </span>
                </div>
            </div>

            {/* ─── How it Works Section ─── */}
            <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-b-4 border-black text-black overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 text-center uppercase tracking-tighter text-black"
                    >
                        How it works
                    </motion.h2>
                    <motion.p
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        custom={0.2}
                        className="text-lg sm:text-xl md:text-2xl font-bold text-center text-gray-700 mb-12 sm:mb-20 max-w-2xl mx-auto"
                    >
                        Get started in three easy steps — no setup, no hassle.
                    </motion.p>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {[
                            { step: '1', title: 'Sign up free', desc: 'Create your account in seconds with Google or email. No credit card required. Your data stays private and secure.' },
                            { step: '2', title: 'Track every rupee', desc: 'Add income and expenses in one tap. Use categories like Food, Transport, and Bills so you know exactly where your money goes.' },
                            { step: '3', title: 'See where you stand', desc: 'Check your dashboard for monthly totals, spending trends, and category breakdowns. Make better decisions with real numbers.' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={staggerItem}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-lg group-hover:translate-x-5 group-hover:translate-y-5 transition-all z-0" aria-hidden="true"></div>
                                <motion.div
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    className="relative z-10 bg-white border-3 sm:border-4 border-black p-6 sm:p-8 h-full flex flex-col justify-between rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: idx * 0.2 }}
                                        className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-black text-white text-2xl font-black mb-6"
                                    >
                                        {item.step}
                                    </motion.span>
                                    <div>
                                        <h3 className="text-2xl font-black mb-3 uppercase text-black">{item.title}</h3>
                                        <p className="text-base font-semibold leading-relaxed text-gray-800">{item.desc}</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── Features Grid ─── */}
            <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-brand-yellow text-brand-black overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-6 sm:gap-12 items-start md:items-end mb-10 sm:mb-16">
                        <motion.h2
                            variants={slideFromLeft}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none flex-1 text-brand-black"
                        >
                            Everything<br />You Need.
                        </motion.h2>
                        <motion.p
                            variants={slideFromRight}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="text-lg sm:text-xl font-bold max-w-md leading-relaxed text-brand-black"
                        >
                            We stripped away the clutter to focus on what truly matters: your financial health.
                        </motion.p>
                    </div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {[
                            { icon: <BsMoonStarsFill size={28} />, title: 'Dark & Light Mode', desc: 'Seamlessly switch between themes to suit your preference and environment.' },
                            { icon: <BsBank2 size={28} />, title: 'Multi-Account', desc: 'Manage Bank Accounts, Cash, Digital Wallets, and Credit Cards all in one place.' },
                            { icon: <BsBarChartLineFill size={28} />, title: 'Advanced Analytics', desc: 'Visual charts for Spending and Income analysis, with category-wise breakdowns.' },
                        ].map((feat, idx) => (
                            <motion.div
                                key={idx}
                                variants={staggerItem}
                                whileHover={{ x: 4, y: 4, boxShadow: 'none', transition: { duration: 0.2 } }}
                                className="bg-white border-3 sm:border-4 border-black p-6 sm:p-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-default"
                            >
                                <motion.div
                                    whileHover={{ rotate: 360, scale: 1.2 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-12 h-12 sm:w-16 sm:h-16 bg-black text-brand-yellow flex items-center justify-center mb-4 sm:mb-6 rounded-full"
                                >
                                    {feat.icon}
                                </motion.div>
                                <h3 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4 uppercase text-black">{feat.title}</h3>
                                <p className="text-base sm:text-lg font-bold text-gray-800">{feat.desc}</p>
                            </motion.div>
                        ))}

                        {/* More features card */}
                        <motion.div
                            variants={staggerItem}
                            className="bg-brand-black text-white border-3 sm:border-4 border-black p-6 sm:p-10 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)]"
                        >
                            <h3 className="text-2xl sm:text-3xl font-black mb-4 uppercase text-brand-yellow">More Features...</h3>
                            <motion.ul
                                className="space-y-3 font-bold text-base sm:text-lg"
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {[
                                    { icon: <BsShieldLockFill size={18} className="text-brand-yellow" />, text: 'Secure Authentication (OAuth)' },
                                    { icon: <BsCloudArrowUpFill size={18} className="text-brand-yellow" />, text: 'Cloud Backup & Restore' },
                                    { icon: <BsBellFill size={18} className="text-brand-yellow" />, text: 'Budget Limits & Alerts' },
                                    { icon: <BsArrowRepeat size={18} className="text-brand-yellow" />, text: 'Recurring Transactions' },
                                ].map((feat, i) => (
                                    <motion.li
                                        key={i}
                                        variants={staggerItem}
                                        className="flex items-center gap-3"
                                    >
                                        {feat.icon} {feat.text}
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Call to Action ─── */}
            <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white border-t-4 border-black text-center text-black overflow-hidden relative">
                {/* Floating money elements */}
                <FloatingMoney
                    className="animate-float top-16 left-10 hidden md:block opacity-15"
                    style={{ animationDelay: '0.5s' }}
                >
                    <CoinSvg size={64} />
                </FloatingMoney>
                <FloatingMoney
                    className="animate-float-reverse bottom-16 right-16 hidden md:block opacity-15"
                    style={{ animationDelay: '1.5s' }}
                >
                    <WalletSvg size={56} />
                </FloatingMoney>
                <FloatingMoney
                    className="animate-float-slow top-1/3 right-1/4 hidden md:block opacity-10"
                    style={{ animationDelay: '2.5s' }}
                >
                    <PiggySvg size={44} />
                </FloatingMoney>

                <motion.h2
                    initial={{ opacity: 0, scale: 0.6, filter: 'blur(10px)' }}
                    whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-4xl sm:text-6xl md:text-8xl font-black mb-8 sm:mb-12 uppercase tracking-tighter text-black"
                >
                    Ready to<br />take control?
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Link to="/login">
                        <motion.span
                            whileHover={{ y: -6, rotate: 2, boxShadow: '16px 16px 0px 0px rgba(0,0,0,1)' }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block bg-brand-yellow text-black text-lg sm:text-2xl font-black px-8 sm:px-16 py-4 sm:py-6 rounded-full border-3 sm:border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all transform animate-pulse-glow"
                        >
                            Join BudgetTracko Now
                        </motion.span>
                    </Link>
                </motion.div>
            </section>

            {/* ─── Footer ─── */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-black text-white py-10 sm:py-16 px-4 sm:px-6 border-t-8 border-brand-yellow"
            >
                <motion.div
                    className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    <motion.div variants={staggerItem} className="col-span-2">
                        <div className="text-2xl sm:text-3xl font-black text-brand-yellow mb-4 sm:mb-6">BUDGETTRACKO.</div>
                        <p className="text-gray-400 max-w-sm text-base sm:text-lg">
                            The simplest way to track your expenses and manage your budget. Built for speed, privacy, and ease of use.
                        </p>
                        <div className="mt-4 text-gray-500 text-sm">
                            <p className="font-semibold text-gray-300">Bhargav Karande</p>
                            <a href="mailto:bhargavk056@gmail.com" className="hover:text-brand-yellow transition-colors">bhargavk056@gmail.com</a>
                        </div>
                    </motion.div>
                    <motion.div variants={staggerItem}>
                        <h4 className="font-bold text-xl mb-6 uppercase tracking-wider text-brand-yellow">Product</h4>
                        <ul className="space-y-4 text-gray-300">
                            <li><Link to="/features" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Pricing</Link></li>
                            <li><Link to="/about" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">About Us</Link></li>
                        </ul>
                    </motion.div>
                    <motion.div variants={staggerItem}>
                        <h4 className="font-bold text-xl mb-6 uppercase tracking-wider text-brand-yellow">Company</h4>
                        <ul className="space-y-4 text-gray-300">
                            <li><Link to="/contact" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Contact</Link></li>
                            <li><Link to="/privacy" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Privacy Policy</Link></li>
                            <li><a href="mailto:bhargavk056@gmail.com" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Email Us</a></li>
                        </ul>
                    </motion.div>
                </motion.div>
                <div className="max-w-7xl mx-auto mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-xs sm:text-sm">
                    <p>&copy; 2026 BudgetTracko. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span>Made with ❤️ by bhargavk001</span>
                    </div>
                </div>
            </motion.footer>
        </div>
    );
};

export default LandingPage;
