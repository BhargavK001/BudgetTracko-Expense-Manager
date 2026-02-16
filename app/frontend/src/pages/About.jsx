
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BsHeartFill, BsLightningChargeFill, BsShieldLockFill, BsPeopleFill } from 'react-icons/bs';
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
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const About = () => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About BudgetTracko",
        "description": "BudgetTracko is a free expense manager designed for students in India.",
        "maintainer": {
            "@type": "Person",
            "name": "Bhargav Karande",
            "email": "bhargavk056@gmail.com"
        }
    };

    return (
        <div className="min-h-screen bg-brand-yellow font-sans text-brand-black selection:bg-black selection:text-brand-yellow overflow-hidden">
            <SEO
                title="About BudgetTracko - Our Story & Mission"
                description="Built by students, for students. Learn why BudgetTracko is the best free expense manager for Indian students."
                keywords="about budget tracko, student developer, expense manager india, bhargav karande, our story"
                canonical="https://www.budgettracko.app/about"
                schema={schema}
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
                    About Us
                </motion.h1>
                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={0.2}
                    className="text-base sm:text-xl md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed"
                >
                    We believe managing money should be simple, visual, and even enjoyable. That's why we built BudgetTracko.
                </motion.p>
            </div>

            {/* Story Section */}
            <section className="pb-16 sm:pb-24 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="bg-white border-3 sm:border-4 border-black p-5 sm:p-10 md:p-14 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-10 sm:mb-16"
                    >
                        <h2 className="text-xl sm:text-3xl font-black uppercase mb-3 sm:mb-6">Our Story</h2>
                        <div className="space-y-3 sm:space-y-4 text-sm sm:text-lg font-semibold text-gray-700 leading-relaxed">
                            <p>
                                BudgetTracko was born out of frustration. After trying dozens of expense tracking apps that were either
                                too complicated, too ugly, or too expensive, we decided to build something different.
                            </p>
                            <p>
                                We wanted an app that felt as satisfying to use as it is useful — with bold design, buttery-smooth
                                animations, and zero learning curve. An app where tracking your ₹50 chai is as easy as tapping twice.
                            </p>
                            <p>
                                Built by <strong>Bhargav Karande</strong>, BudgetTracko is designed for Indian users who want a
                                no-nonsense, Rupee-first expense tracker that respects their time and data.
                            </p>
                        </div>
                    </motion.div>

                    {/* Values */}
                    <motion.h2
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-center mb-8 sm:mb-14"
                    >
                        What We Believe
                    </motion.h2>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {[
                            { icon: <BsHeartFill size={24} />, title: 'Simplicity First', desc: 'No bloated features. Every screen, every button, every animation serves a purpose — making your life easier.' },
                            { icon: <BsLightningChargeFill size={24} />, title: 'Speed Matters', desc: 'Lightning-fast load times, instant interactions, and zero lag. Your finances should never keep you waiting.' },
                            { icon: <BsShieldLockFill size={24} />, title: 'Privacy by Default', desc: 'We never sell your data. Your financial information is encrypted, secured, and entirely yours.' },
                            { icon: <BsPeopleFill size={24} />, title: 'Built for Everyone', desc: 'Whether you\'re a student tracking pocket money or a professional managing salaries — BudgetTracko adapts to you.' },
                        ].map((val, idx) => (
                            <motion.div
                                key={idx}
                                variants={staggerItem}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                className="bg-white border-2 sm:border-4 border-black p-5 sm:p-8 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-brand-yellow flex items-center justify-center mb-3 sm:mb-4 rounded-full">
                                    {val.icon}
                                </div>
                                <h3 className="text-lg sm:text-2xl font-black uppercase mb-1.5 sm:mb-2">{val.title}</h3>
                                <p className="text-sm sm:text-base font-semibold text-gray-700 leading-relaxed">{val.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Creator Section */}
            <section className="py-12 sm:py-24 px-4 sm:px-6 bg-black text-white text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-brand-yellow text-black rounded-full flex items-center justify-center text-2xl sm:text-4xl font-black mx-auto mb-4 sm:mb-6">
                        BK
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-brand-yellow mb-2">Bhargav Karande</h3>
                    <p className="text-gray-400 font-semibold text-base sm:text-lg mb-4">Creator & Developer</p>
                    <a href="mailto:bhargavk056@gmail.com" className="text-brand-yellow font-bold hover:underline text-sm sm:text-base">
                        bhargavk056@gmail.com
                    </a>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="bg-black text-gray-400 text-center py-6 sm:py-8 text-xs sm:text-sm border-t border-gray-800">
                <p>&copy; 2026 BudgetTracko — Made with ❤️ by bhargavk001</p>
            </footer>
        </div>
    );
};

export default About;
