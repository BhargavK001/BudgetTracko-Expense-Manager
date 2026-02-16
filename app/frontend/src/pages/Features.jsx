
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BsMoonStarsFill, BsBank2, BsBarChartLineFill, BsShieldLockFill, BsCloudArrowUpFill, BsBellFill, BsArrowRepeat, BsPhoneFill, BsGearFill, BsPeopleFill, BsLightningChargeFill, BsTagsFill } from 'react-icons/bs';
import SEO from '../components/common/SEO';

const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: (delay = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay },
    }),
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const features = [
    { icon: <BsMoonStarsFill size={28} />, title: 'Dark & Light Mode', desc: 'Switch between themes seamlessly. Comfortable viewing day or night — your eyes will thank you.' },
    { icon: <BsBank2 size={28} />, title: 'Multi-Account Support', desc: 'Track Bank Accounts, Cash, UPI, Digital Wallets, and Credit Cards all from one unified dashboard.' },
    { icon: <BsBarChartLineFill size={28} />, title: 'Advanced Analytics', desc: 'Beautiful charts and graphs show your spending trends, income patterns, and category-wise breakdowns at a glance.' },
    { icon: <BsShieldLockFill size={28} />, title: 'Secure Authentication', desc: 'Enterprise-grade OAuth 2.0 authentication keeps your financial data safe and encrypted at all times.' },
    { icon: <BsCloudArrowUpFill size={28} />, title: 'Cloud Backup & Sync', desc: 'Your data is automatically backed up to the cloud. Access your finances from any device, anywhere.' },
    { icon: <BsBellFill size={28} />, title: 'Budget Alerts', desc: 'Set monthly or category-wise budget limits. Get notified before you overspend — stay on track effortlessly.' },
    { icon: <BsArrowRepeat size={28} />, title: 'Recurring Transactions', desc: 'Automate your rent, subscriptions, and salary entries. Set it once and forget — we handle the rest.' },
    { icon: <BsPhoneFill size={28} />, title: 'Mobile Friendly', desc: 'Fully responsive design works beautifully on phones, tablets, and desktops. Manage money on the go.' },
    { icon: <BsTagsFill size={28} />, title: 'Custom Categories', desc: 'Create your own expense and income categories. Organize your finances the way that makes sense to you.' },
    { icon: <BsLightningChargeFill size={28} />, title: 'Instant Entry', desc: 'Add transactions in under 3 seconds with our streamlined quick-entry form. No clutter, no friction.' },
    { icon: <BsGearFill size={28} />, title: 'Smart Settings', desc: 'Customize currency, date formats, default categories, and notification preferences to match your lifestyle.' },
    { icon: <BsPeopleFill size={28} />, title: 'Multi-User Ready', desc: 'Share budgets with family or roommates. Everyone stays in sync with collaborative expense tracking.' },
];

const Features = () => {
    return (
        <div className="min-h-screen bg-brand-yellow font-sans text-brand-black selection:bg-black selection:text-brand-yellow overflow-hidden">
            <SEO
                title="Features - BudgetTracko Expense Manager"
                description="Explore powerful features like multi-account tracking, budget alerts, dark mode, and cloud sync. Designed for students."
                keywords="expense tracker features, multi-account budget app, recurring payments tracker, budget alerts app"
                canonical="https://www.budgettracko.app/features"
            />
            {/* Nav */}
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="fixed top-0 w-full bg-brand-yellow/90 backdrop-blur-md z-50 border-b-2 border-brand-black shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <Link to="/" className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-1 sm:gap-2">
                        <span>BUDGET</span>
                        <span className="text-white bg-black px-1 transform -rotate-2 border-2 border-black">TRACKO</span>
                    </Link>
                    <Link to="/">
                        <motion.span
                            whileHover={{ x: -4, boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block font-bold border-2 border-black px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-black hover:text-white transition-colors text-sm sm:text-base"
                        >
                            ← Back Home
                        </motion.span>
                    </Link>
                </div>
            </motion.nav>

            {/* Hero */}
            <div className="pt-20 sm:pt-32 pb-8 sm:pb-16 px-4 sm:px-6 text-center max-w-4xl mx-auto">
                <motion.h1
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-3 sm:mb-6"
                >
                    All Features
                </motion.h1>
                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={0.2}
                    className="text-sm sm:text-xl md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed"
                >
                    Everything you need to take full control of your finances — built with simplicity and power in mind.
                </motion.p>
            </div>

            {/* Features Grid */}
            <section className="pb-16 sm:pb-32 px-4 sm:px-6">
                <motion.div
                    className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {features.map((feat, idx) => (
                        <motion.div
                            key={idx}
                            variants={staggerItem}
                            whileHover={{ y: -6, boxShadow: '10px 10px 0px 0px rgba(0,0,0,1)', transition: { duration: 0.2 } }}
                            className="bg-white border-2 sm:border-4 border-black p-5 sm:p-8 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-default"
                        >
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.2 }}
                                transition={{ duration: 0.5 }}
                                className="w-12 h-12 sm:w-14 sm:h-14 bg-black text-brand-yellow flex items-center justify-center mb-4 sm:mb-5 rounded-full"
                            >
                                {feat.icon}
                            </motion.div>
                            <h3 className="text-lg sm:text-2xl font-black mb-1.5 sm:mb-3 uppercase">{feat.title}</h3>
                            <p className="text-sm sm:text-base font-semibold text-gray-700 leading-relaxed">{feat.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* CTA */}
            <section className="py-12 sm:py-24 px-4 sm:px-6 bg-black text-center">
                <motion.h2
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-2xl sm:text-5xl md:text-6xl font-black text-brand-yellow mb-6 sm:mb-8 uppercase tracking-tighter"
                >
                    Ready to try it?
                </motion.h2>
                <Link to="/login">
                    <motion.span
                        whileHover={{ y: -4, boxShadow: '12px 12px 0px 0px rgba(255,215,0,0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block bg-brand-yellow text-black text-base sm:text-xl font-black px-8 sm:px-14 py-3.5 sm:py-5 border-4 border-brand-yellow rounded-full transition-all"
                    >
                        Start Free Today
                    </motion.span>
                </Link>
            </section>

            {/* Footer */}
            <footer className="bg-black text-gray-400 text-center py-6 sm:py-8 text-xs sm:text-sm border-t border-gray-800">
                <p>&copy; 2026 BudgetTracko — Bhargav Karande</p>
            </footer>
        </div>
    );
};

export default Features;
