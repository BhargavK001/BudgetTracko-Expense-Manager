import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { BsMoonStarsFill, BsBank2, BsBarChartLineFill, BsShieldLockFill, BsCloudArrowUpFill, BsBellFill, BsArrowRepeat, BsAndroid, BsQuestionCircle, BsChevronDown, BsChevronUp, BsCheckCircleFill, BsXCircleFill, BsShieldCheck, BsDownload, BsEnvelope, BsArrowRightShort, BsPersonFill } from 'react-icons/bs';
import { FaChartLine, FaShieldAlt, FaMobileAlt, FaWallet, FaPiggyBank, FaExchangeAlt, FaArrowRight, FaCheck, FaStar, FaQuoteLeft, FaQuestionCircle, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { SiMongodb, SiExpress, SiReact, SiNodedotjs, SiTailwindcss, SiFramer } from 'react-icons/si';
import SEO from '../components/common/SEO';

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
    const [savingsAmount, setSavingsAmount] = useState(500);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "BudgetTracko",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web, Android, iOS",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
        },
        "description": "BudgetTracko is a free expense manager for students. Track expenses, set budgets, and achieve financial goals.",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "10450"
        }
    };

    return (
        <div className="min-h-screen bg-brand-yellow font-sans text-brand-black flex flex-col selection:bg-black selection:text-brand-yellow dark:bg-brand-yellow dark:text-brand-black overflow-hidden">
            <SEO
                title="BudgetTracko - Free Expense Manager for Students & Everyone"
                description="Take control of your finances with BudgetTracko. The best free expense manager for students. Track expenses, set budgets, and achieve your financial goals."
                keywords="expense manager for free, expense manager for students, budget tracko, free budget app, student finance app, expense tracker, money manager"
                canonical="https://www.budgettracko.app/"
                schema={schema}
            />
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
                className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 flex flex-col justify-center items-center text-center max-w-7xl mx-auto w-full relative"
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
                    className="text-3xl xs:text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-4 sm:mb-8 leading-[0.9] tracking-tighter text-brand-black"
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
                    className="text-sm sm:text-xl md:text-2xl font-medium max-w-2xl mb-6 sm:mb-12 leading-relaxed text-brand-black px-2 sm:px-4"
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
                        <Link to="/login" className="inline-block w-full sm:w-auto text-center bg-black text-white text-base sm:text-xl font-bold px-6 sm:px-12 py-3.5 sm:py-5 rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all border-2 border-black animate-pulse-glow">
                            Start Tracking Free
                        </Link>
                    </motion.div>
                    <motion.div variants={staggerItem} custom={1.0}>
                        <a href="#demo" className="inline-block w-full sm:w-auto text-center bg-white text-black text-base sm:text-xl font-bold px-6 sm:px-12 py-3.5 sm:py-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all border-2 border-black box-border">
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
                    className="mt-8 sm:mt-20 w-full max-w-5xl relative group"
                >
                    <div className="absolute inset-0 bg-black rounded-3xl transform translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform"></div>
                    <div className="relative bg-white border-4 border-black rounded-3xl overflow-hidden shadow-2xl">
                        {/* Mock Browser Header */}
                        <div className="bg-gray-100 border-b-2 sm:border-b-4 border-black p-2.5 sm:p-4 flex gap-1.5 sm:gap-2 items-center">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-400 border-2 border-black"></div>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 border-2 border-black"></div>
                            <span className="ml-2 sm:ml-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">dashboard — BudgetTracko</span>
                        </div>
                        {/* Mock UI Content */}
                        <div className="p-3 sm:p-6 md:p-10 bg-gray-50 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6">
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
                                    <h3 className="text-sm sm:text-lg font-black text-black uppercase tracking-tight">February 2025</h3>
                                    <div className="h-7 sm:h-9 px-2.5 sm:px-4 bg-brand-yellow border-2 border-black rounded-lg flex items-center text-xs sm:text-sm font-black text-black">+ Add</div>
                                </div>
                                {/* Summary cards */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    <div className="bg-white border-2 border-black rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
                                        <p className="text-[9px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">Balance</p>
                                        <p className="text-xs sm:text-xl font-black text-black">₹42,850</p>
                                    </div>
                                    <div className="bg-green-50 border-2 border-green-600 rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-[2px_2px_0px_0px_rgba(22,163,74,0.4)] sm:shadow-[4px_4px_0px_0px_rgba(22,163,74,0.4)]">
                                        <p className="text-[9px] sm:text-xs font-bold text-green-700 uppercase tracking-wider mb-0.5 sm:mb-1">Income</p>
                                        <p className="text-xs sm:text-xl font-black text-green-700">₹65,000</p>
                                    </div>
                                    <div className="bg-red-50 border-2 border-red-600 rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-[2px_2px_0px_0px_rgba(220,38,38,0.4)] sm:shadow-[4px_4px_0px_0px_rgba(220,38,38,0.4)]">
                                        <p className="text-[9px] sm:text-xs font-bold text-red-700 uppercase tracking-wider mb-0.5 sm:mb-1">Expenses</p>
                                        <p className="text-xs sm:text-xl font-black text-red-700">₹22,150</p>
                                    </div>
                                </div>
                                {/* Chart block */}
                                <div className="bg-white border-2 border-black rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] min-h-[160px] sm:min-h-[220px]">
                                    <p className="text-xs sm:text-sm font-black text-black uppercase tracking-tight mb-2 sm:mb-3">Spending this month</p>
                                    {/* Trend line chart - SVG */}
                                    <div className="h-14 sm:h-20 w-full mb-3 sm:mb-4 relative">
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
            <div className="bg-black text-brand-yellow py-3 sm:py-6 overflow-hidden border-y-2 sm:border-y-4 border-white transform rotate-1 scale-105">
                <div className="whitespace-nowrap animate-marquee font-black text-sm sm:text-2xl tracking-widest uppercase flex">
                    <span className="flex-shrink-0">
                        SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM • SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM • SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM •&nbsp;
                    </span>
                    <span className="flex-shrink-0">
                        SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM • SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM • SAVE MONEY • TRACK EXPENSES • BUILD WEALTH • FREEDOM •&nbsp;
                    </span>
                </div>
            </div>

            {/* ─── Security Trust Bar ─── */}
            <div className="bg-black text-white py-2.5 sm:py-4 border-b-2 sm:border-b-4 border-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 flex flex-wrap justify-center gap-3 sm:gap-12 text-[10px] sm:text-sm font-bold uppercase tracking-wider sm:tracking-widest text-center">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                        <BsShieldCheck size={14} className="text-brand-yellow sm:text-[18px]" />
                        Bank-Grade Encryption
                    </span>
                    <span className="flex items-center gap-1.5 sm:gap-2">
                        <BsShieldLockFill size={14} className="text-brand-yellow sm:text-[18px]" />
                        100% Private Data
                    </span>
                    <span className="flex items-center gap-1.5 sm:gap-2">
                        <BsCloudArrowUpFill size={14} className="text-brand-yellow sm:text-[18px]" />
                        Automatic Backups
                    </span>
                </div>
            </div>

            {/* ─── How it Works Section ─── */}
            <section id="how-it-works" className="py-12 sm:py-24 px-4 sm:px-6 bg-white border-b-4 border-black text-black overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="text-2xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-4 text-center uppercase tracking-tighter text-black"
                    >
                        How it works
                    </motion.h2>
                    <motion.p
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        custom={0.2}
                        className="text-sm sm:text-xl md:text-2xl font-bold text-center text-gray-700 mb-8 sm:mb-20 max-w-2xl mx-auto"
                    >
                        Get started in three easy steps — no setup, no hassle.
                    </motion.p>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-12"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {[
                            {
                                step: '1',
                                title: 'Sign up free',
                                desc: 'Create your account in seconds. No credit card required.',
                                visual: (
                                    <div className="w-full h-32 bg-brand-yellow/20 rounded-lg border-2 border-black flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-x-4 top-4 bottom-0 bg-white border-x-2 border-t-2 border-black rounded-t-lg p-3">
                                            <div className="h-2 w-1/3 bg-black/10 rounded mb-2"></div>
                                            <div className="space-y-2">
                                                <div className="h-8 w-full border-2 border-black rounded bg-white"></div>
                                                <div className="h-8 w-full border-2 border-black rounded bg-black/5"></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                step: '2',
                                title: 'Track Money',
                                desc: 'Add income and expenses in one tap. Categorize everything.',
                                visual: (
                                    <div className="w-full h-32 bg-blue-100 rounded-lg border-2 border-black flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-x-6 top-6 bottom-0 bg-white border-x-2 border-t-2 border-black rounded-t-lg p-2 flex flex-col gap-2">
                                            <div className="flex justify-between items-center bg-red-50 p-1 rounded border border-red-200">
                                                <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center text-xs">🍔</div>
                                                <div className="h-2 w-12 bg-red-200 rounded"></div>
                                                <div className="h-2 w-8 bg-red-200 rounded"></div>
                                            </div>
                                            <div className="flex justify-between items-center bg-green-50 p-1 rounded border border-green-200">
                                                <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center text-xs">💰</div>
                                                <div className="h-2 w-12 bg-green-200 rounded"></div>
                                                <div className="h-2 w-8 bg-green-200 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full text-white flex items-center justify-center font-bold">+</div>
                                    </div>
                                )
                            },
                            {
                                step: '3',
                                title: 'See Trends',
                                desc: 'Check your dashboard for monthly totals. Spot bad habits fast.',
                                visual: (
                                    <div className="w-full h-32 bg-white rounded-lg border-2 border-black flex items-center justify-center relative overflow-hidden">
                                        {/* Trend Line Visual */}
                                        <div className="absolute inset-x-0 bottom-0 top-0 p-4 flex items-end">
                                            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="trendGradientSmall" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                                                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                {/* Grid lines */}
                                                <line x1="0" y1="10" x2="100" y2="10" stroke="#f0f0f0" strokeWidth="0.5" />
                                                <line x1="0" y1="20" x2="100" y2="20" stroke="#f0f0f0" strokeWidth="0.5" />
                                                <line x1="0" y1="30" x2="100" y2="30" stroke="#f0f0f0" strokeWidth="0.5" />

                                                {/* The Trend Line */}
                                                <path
                                                    d="M 0 35 Q 20 30, 40 25 T 70 15 T 100 5"
                                                    fill="none"
                                                    stroke="#16a34a"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M 0 35 Q 20 30, 40 25 T 70 15 T 100 5 L 100 40 L 0 40 Z"
                                                    fill="url(#trendGradientSmall)"
                                                    stroke="none"
                                                />

                                                {/* Data Points */}
                                                <circle cx="0" cy="35" r="2" fill="#16a34a" />
                                                <circle cx="40" cy="25" r="2" fill="#16a34a" />
                                                <circle cx="70" cy="15" r="2" fill="#16a34a" />
                                                <circle cx="100" cy="5" r="2" fill="#16a34a" />
                                            </svg>
                                        </div>
                                    </div>
                                )
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={staggerItem}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-lg group-hover:translate-x-5 group-hover:translate-y-5 transition-all z-0" aria-hidden="true"></div>
                                <motion.div
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    className="relative z-10 bg-white border-3 sm:border-4 border-black p-6 h-full flex flex-col rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: idx * 0.2 }}
                                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black text-white text-lg font-black"
                                        >
                                            {item.step}
                                        </motion.span>
                                        <div className="w-16 h-1 bg-black/10 rounded-full"></div>
                                    </div>

                                    <div className="mb-6">
                                        {item.visual}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black mb-2 uppercase text-black">{item.title}</h3>
                                        <p className="text-sm font-semibold leading-relaxed text-gray-600">{item.desc}</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── Comparison Section ─── */}
            <section className="py-12 sm:py-24 px-4 sm:px-6 bg-gray-50 border-b-4 border-black text-black">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tighter mb-3 sm:mb-4">Why Switch?</h2>
                        <p className="text-sm sm:text-lg font-bold text-gray-600">See how BudgetTracko stacks up against the old ways.</p>
                    </div>

                    <div className="overflow-x-auto -mx-4 px-4 pb-2">
                        <div className="bg-white border-3 sm:border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-w-[480px] sm:min-w-[600px]">
                            <div className="grid grid-cols-3 border-b-3 sm:border-b-4 border-black bg-gray-100">
                                <div className="p-3 sm:p-6 font-black uppercase text-xs sm:text-base text-gray-500 flex items-center">Feature</div>
                                <div className="p-3 sm:p-6 font-black uppercase text-xs sm:text-base text-gray-400 border-l-3 sm:border-l-4 border-black">Excel / Notebook</div>
                                <div className="p-3 sm:p-6 font-black uppercase text-xs sm:text-xl text-brand-black bg-brand-yellow border-l-3 sm:border-l-4 border-black flex items-center gap-1 sm:gap-2">
                                    BudgetTracko <span className="text-[8px] sm:text-[10px] bg-black text-white px-1.5 sm:px-2 py-0.5 rounded-full">PRO</span>
                                </div>
                            </div>
                            {[
                                { feat: 'Automated Charts', old: false, new: true },
                                { feat: 'Cloud Backup', old: false, new: true },
                                { feat: 'Mobile Access', old: false, new: true },
                                { feat: 'Recurring Expenses', old: false, new: true },
                                { feat: 'Bank-grade Security', old: false, new: true },
                                { feat: 'Fun to use', old: false, new: true },
                            ].map((row, i) => (
                                <div key={i} className={`grid grid-cols-3 ${i !== 5 ? 'border-b-2 border-gray-200' : ''}`}>
                                    <div className="p-3 sm:p-5 font-bold text-xs sm:text-base text-gray-700 flex items-center">{row.feat}</div>
                                    <div className="p-3 sm:p-5 border-l-3 sm:border-l-4 border-black flex items-center justify-center bg-gray-50 text-gray-400">
                                        <BsXCircleFill size={18} className="sm:text-[24px]" />
                                    </div>
                                    <div className="p-3 sm:p-5 border-l-3 sm:border-l-4 border-black flex items-center justify-center bg-yellow-50/50 text-green-600">
                                        <BsCheckCircleFill size={20} className="sm:text-[28px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Mobile App Teaser (Android) ─── */}
            <section className="py-12 sm:py-24 px-4 sm:px-6 bg-black text-white relative overflow-hidden border-b-4 border-black">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 sm:gap-20 relative z-10">
                    <div className="w-full md:w-1/2 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-brand-yellow text-black font-black px-4 py-1 rounded-full text-xs uppercase tracking-widest mb-6 border-2 border-white">
                            <BsAndroid size={16} /> Android Exclusive
                        </div>
                        <h2 className="text-3xl sm:text-6xl font-black mb-4 sm:mb-6 uppercase tracking-tighter leading-none">
                            Pocket-Sized<br />Powerhouse.
                        </h2>
                        <p className="text-base sm:text-xl text-gray-400 mb-6 sm:mb-8 font-medium max-w-md mx-auto md:mx-0">
                            Track expenses on the go with our native Android app. Offline mode, fingerprint lock, and instant sync.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <button className="bg-brand-yellow text-black px-8 py-4 rounded-xl font-black flex items-center gap-3 border-2 border-white hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_#ffffff]">
                                <BsAndroid size={24} />
                                <div className="text-left leading-tight">
                                    <div className="text-[10px] uppercase font-bold">Get it on</div>
                                    <div className="text-lg font-black">Google Play</div>
                                </div>
                            </button>
                            <button className="bg-transparent text-white px-8 py-4 rounded-xl font-bold border-2 border-white/30 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                <BsDownload size={20} /> Download APK
                            </button>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center">
                        <div className="relative w-56 h-[460px] sm:w-72 sm:h-[580px] bg-black border-[6px] sm:border-8 border-gray-800 rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                            {/* Screen */}
                            <div className="absolute inset-1.5 sm:inset-2 bg-brand-yellow rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col border-3 sm:border-4 border-black">
                                <div className="bg-black/10 h-6 w-full flex justify-center items-center">
                                    <div className="w-20 h-4 bg-black rounded-b-xl"></div>
                                </div>
                                <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center text-black">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-xl sm:rounded-2xl mb-3 sm:mb-4 flex items-center justify-center">
                                        <span className="text-brand-yellow font-black text-lg sm:text-2xl">BT</span>
                                    </div>
                                    <h3 className="font-black text-xl sm:text-2xl uppercase text-center mb-1 sm:mb-2">Budget<br />Tracko</h3>
                                    <p className="text-[10px] sm:text-xs font-bold text-center mb-4 sm:mb-8 opacity-70">Mobile Edition</p>
                                    <div className="w-full space-y-2 sm:space-y-3">
                                        <div className="h-10 sm:h-12 bg-white border-2 border-black rounded-lg sm:rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center px-3">
                                            <span className="text-gray-400 text-[10px] sm:text-xs font-bold">Email</span>
                                        </div>
                                        <div className="h-10 sm:h-12 bg-white border-2 border-black rounded-lg sm:rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center px-3">
                                            <span className="text-gray-400 text-[10px] sm:text-xs font-bold">Password</span>
                                        </div>
                                        <div className="h-10 sm:h-12 bg-black text-white flex items-center justify-center font-bold text-sm sm:text-base border-2 border-black rounded-lg sm:rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Login</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Testimonials ─── */}
            <section className="py-12 sm:py-24 px-4 sm:px-6 bg-white border-b-4 border-black">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-16">
                        <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tighter mb-3 sm:mb-4 text-black">Student Love</h2>
                        <p className="text-sm sm:text-lg font-bold text-gray-600">Join 10,000+ students taking control of their finances.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                        {[
                            { name: 'Priya S.', college: 'MIT Pune', quote: "I used to be broke by the 20th of every month. BudgetTracko helped me find where my money was leaking in canteen bills! 🍔" },
                            { name: 'Rohit M.', college: 'VIT Vellore', quote: "Simple, fast, and no ads. Perfect for splitting hostel expenses and tracking lending to friends. Highly recommend! 💯" }
                        ].map((t, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -4, rotate: i % 2 === 0 ? -1 : 1 }}
                                className="bg-brand-yellow p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl relative"
                            >
                                <div className="w-8 h-8 bg-black absolute -top-4 -left-4 flex items-center justify-center text-white font-serif text-2xl">"</div>
                                <p className="text-lg sm:text-xl font-bold leading-tight mb-6 text-black">{t.quote}</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-black text-xl">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-black uppercase">{t.name}</div>
                                        <div className="text-xs font-bold text-black/60 uppercase tracking-wider">{t.college}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ Section ─── */}
            <section className="py-12 sm:py-24 px-4 sm:px-6 bg-gray-50 border-b-4 border-black">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tighter mb-6 sm:mb-10 text-center text-black">FAQ</h2>
                    <div className="space-y-3 sm:space-y-4">
                        {[
                            { q: "Is BudgetTracko really free?", a: "Yes! Our core features are 100% free for students forever. No hidden charges." },
                            { q: "Is my data safe?", a: "Absolutely. We use bank-grade encryption and never sell your data to advertisers. Your financial privacy is our priority." },
                            { q: "Can I use it offline?", a: "Yes, the Android app works perfectly offline. Data syncs automatically when you're back online." },
                        ].map((item, i) => (
                            <details key={i} className="group bg-white border-2 sm:border-3 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] open:bg-brand-yellow/10 transition-all">
                                <summary className="flex justify-between items-center p-4 sm:p-6 font-black text-sm sm:text-lg cursor-pointer list-none">
                                    <span className="uppercase text-black">{item.q}</span>
                                    <span className="transition-transform group-open:rotate-180">
                                        <BsChevronDown size={20} />
                                    </span>
                                </summary>
                                <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 font-medium text-sm sm:text-base text-gray-700 leading-relaxed">
                                    {item.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features Grid ─── */}
            <section id="features" className="py-12 sm:py-24 px-4 sm:px-6 bg-brand-yellow text-brand-black overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-4 sm:gap-12 items-start md:items-end mb-8 sm:mb-16">
                        <motion.h2
                            variants={slideFromLeft}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none flex-1 text-brand-black"
                        >
                            Everything<br />You Need.
                        </motion.h2>
                        <motion.p
                            variants={slideFromRight}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="text-sm sm:text-xl font-bold max-w-md leading-relaxed text-brand-black"
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
                            <h3 className="text-xl sm:text-3xl font-black mb-3 sm:mb-4 uppercase text-brand-yellow">More Features...</h3>
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

            {/* ─── Budget Widget ─── */}
            <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white border-b-4 border-black">
                <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-xl sm:text-2xl font-black uppercase mb-4 sm:mb-6">Savings Calculator</h3>
                    <div className="bg-gray-100 p-4 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-400">
                        <p className="text-gray-500 font-bold uppercase text-[10px] sm:text-xs tracking-widest mb-3 sm:mb-4">If you save just</p>

                        <div className="relative mb-6 sm:mb-8">
                            <div className="text-4xl sm:text-7xl font-black text-black mb-3 sm:mb-4">
                                ₹ <span className="tabular-nums">{savingsAmount}</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="5000"
                                step="100"
                                value={savingsAmount}
                                onChange={(e) => setSavingsAmount(Number(e.target.value))}
                                className="w-full max-w-sm h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-black hover:accent-brand-yellow transition-all"
                            />
                        </div>

                        <p className="text-gray-500 font-bold uppercase text-[10px] sm:text-xs tracking-widest mb-5 sm:mb-8">per week...</p>

                        <div className="bg-white p-4 sm:p-6 rounded-xl border-3 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1 transition-transform hover:rotate-0">
                            <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1.5 sm:mb-2 uppercase tracking-wide">In one year, you'll have:</p>
                            <motion.p
                                key={savingsAmount}
                                initial={{ scale: 1.2, color: '#16a34a' }}
                                animate={{ scale: 1, color: '#000000' }}
                                className="text-3xl sm:text-5xl font-black text-black tabular-nums"
                            >
                                ₹ {(savingsAmount * 52).toLocaleString('en-IN')}
                            </motion.p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Call to Action ─── */}
            <section className="py-14 sm:py-32 px-4 sm:px-6 bg-white text-center text-black overflow-hidden relative">
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
                    className="text-3xl sm:text-6xl md:text-8xl font-black mb-6 sm:mb-12 uppercase tracking-tighter text-black"
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
                            className="inline-block bg-brand-yellow text-black text-base sm:text-2xl font-black px-6 sm:px-16 py-3.5 sm:py-6 rounded-full border-3 sm:border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all transform animate-pulse-glow"
                        >
                            Join BudgetTracko Now
                        </motion.span>
                    </Link>
                </motion.div>
            </section>

            {/* ─── Footer with Newsletter ─── */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-black text-white py-10 sm:py-16 px-4 sm:px-6 border-t-8 border-brand-yellow"
            >
                <motion.div
                    className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12"
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
                            <li><Link to="/terms" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Terms of Service</Link></li>
                            <li><a href="mailto:bhargavk056@gmail.com" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Email Us</a></li>
                        </ul>
                    </motion.div>
                    <motion.div variants={staggerItem} className="sm:col-span-2 md:col-span-1">
                        <h4 className="font-bold text-xl mb-4 sm:mb-6 uppercase tracking-wider text-brand-yellow">Stay Updated</h4>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Enter email..."
                                className="w-full bg-white/10 border-2 border-white/20 p-3 rounded text-sm text-white focus:outline-none focus:border-brand-yellow"
                            />
                            <button className="absolute right-2 top-2 p-1 bg-brand-yellow text-black rounded hover:bg-white transition-colors">
                                <BsArrowRightShort size={20} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Get tips on saving money. No spam.</p>
                    </motion.div>
                </motion.div>
                <div className="max-w-7xl mx-auto mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-gray-500 text-xs sm:text-sm">
                    <p>&copy; 2026 BudgetTracko. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>Made with ❤️ by bhargavk001</span>
                    </div>
                </div>
            </motion.footer>
        </div>
    );
};

export default LandingPage;
