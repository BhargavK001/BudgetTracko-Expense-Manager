
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BsCheckCircleFill } from 'react-icons/bs';

const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: (delay = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay },
    }),
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const plans = [
    {
        name: 'Starter 🎒',
        price: '₹0',
        period: 'forever',
        highlight: false,
        features: [
            'Track up to 50 transactions/month',
            'Basic dashboard & spending charts',
            'Dark & Light mode',
            'Single account (cash / UPI)',
            'Mobile friendly design',
            'Perfect for pocket money tracking',
        ],
    },
    {
        name: 'Campus Pro 🎓',
        price: '₹49',
        period: '/month',
        highlight: true,
        features: [
            'Unlimited transactions',
            'Advanced analytics & monthly reports',
            'Multi-account (Cash, UPI, Bank, Cards)',
            'Cloud backup & sync across devices',
            'Budget alerts before you overspend',
            'Recurring entries (rent, subscriptions)',
            'Custom categories (food, travel, books)',
            'Priority support via email',
        ],
    },
    {
        name: 'Hostel Squad 🏠',
        price: '₹99',
        period: '/month',
        highlight: false,
        features: [
            'Everything in Campus Pro',
            'Up to 5 roommates / friends',
            'Split expenses & shared budgets',
            'Group analytics & reports',
            'Export to CSV / PDF',
            'Dedicated support',
            'Great for flatmates & hostel groups',
        ],
    },
];

const Pricing = () => {
    return (
        <div className="min-h-screen bg-brand-yellow font-sans text-brand-black selection:bg-black selection:text-brand-yellow overflow-hidden">
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
                    Student Pricing
                </motion.h1>
                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={0.2}
                    className="text-sm sm:text-xl md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed"
                >
                    Built for students & college life. Affordable plans that won't burn a hole in your pocket. 🔥
                </motion.p>
            </div>

            {/* Pricing Cards */}
            <section className="pb-16 sm:pb-32 px-4 sm:px-6">
                <motion.div
                    className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8 items-stretch"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            variants={staggerItem}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className={`relative p-5 sm:p-8 border-3 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col ${plan.highlight
                                ? 'bg-black text-white scale-100 sm:scale-105 z-10'
                                : 'bg-white'
                                }`}
                        >
                            {plan.highlight && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0, rotate: 10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 2 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.6 }}
                                    className="absolute -top-3 right-4 bg-brand-yellow text-black font-black text-xs sm:text-sm px-3 py-1 border-2 border-black"
                                >
                                    MOST POPULAR ⭐
                                </motion.div>
                            )}
                            <h3 className={`text-lg sm:text-2xl font-black uppercase mb-1.5 sm:mb-2 ${plan.highlight ? 'text-brand-yellow' : ''}`}>{plan.name}</h3>
                            <div className="mb-4 sm:mb-6">
                                <span className="text-3xl sm:text-5xl font-black">{plan.price}</span>
                                <span className={`text-base sm:text-lg font-bold ml-1 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</span>
                            </div>
                            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs sm:text-base font-semibold">
                                        <BsCheckCircleFill className={`mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-brand-yellow' : 'text-green-600'}`} size={16} />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/login" className="block">
                                <motion.span
                                    whileHover={{ y: -3, boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`block text-center font-black text-base sm:text-lg py-3 sm:py-4 border-3 sm:border-4 border-black transition-all ${plan.highlight
                                        ? 'bg-brand-yellow text-black'
                                        : 'bg-black text-white hover:bg-brand-yellow hover:text-black'
                                        }`}
                                >
                                    Get Started
                                </motion.span>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-t-4 border-black">
                <div className="max-w-3xl mx-auto">
                    <motion.h2
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-center mb-10 sm:mb-16"
                    >
                        Common Questions
                    </motion.h2>
                    <motion.div
                        className="space-y-6 sm:space-y-8"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {[
                            { q: 'Can I switch plans later?', a: 'Yes! Upgrade or downgrade at any time. Changes take effect immediately and billing is prorated.' },
                            { q: 'Is my data safe?', a: 'Absolutely. We use industry-standard encryption and never sell your data. Your finances are private.' },
                            { q: 'Do you offer refunds?', a: 'Yes — we offer a full refund within 14 days of your first payment, no questions asked.' },
                            { q: 'Is the Free plan really free?', a: 'Yes, forever. No credit card required. You can use the Free plan indefinitely with no time limits.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={staggerItem}
                                className="border-l-4 border-black pl-4 sm:pl-6"
                            >
                                <h4 className="font-black text-lg sm:text-xl mb-1">{item.q}</h4>
                                <p className="font-semibold text-sm sm:text-base text-gray-600">{item.a}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black text-gray-400 text-center py-6 sm:py-8 text-xs sm:text-sm border-t border-gray-800">
                <p>&copy; 2026 BudgetTracko — Bhargav Karande</p>
            </footer>
        </div>
    );
};

export default Pricing;
