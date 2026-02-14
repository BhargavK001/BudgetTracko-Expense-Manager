
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: (delay = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay },
    }),
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const sections = [
    {
        title: '1. Information We Collect',
        content: 'We collect only the information necessary to provide our service. This includes your email address for authentication, transaction data you enter (amounts, categories, dates), and basic device information for optimizing your experience. We do NOT collect contacts, location data, or any sensitive personal information.',
    },
    {
        title: '2. How We Use Your Data',
        content: 'Your data is used exclusively to power your BudgetTracko experience — displaying your dashboard, generating analytics, and enabling cloud sync. We never sell, rent, or share your financial data with third parties for advertising or marketing purposes.',
    },
    {
        title: '3. Data Storage & Security',
        content: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use industry-standard security practices including regular penetration testing, vulnerability scanning, and access controls. Your financial data is stored in secure, SOC 2 compliant data centers.',
    },
    {
        title: '4. Your Rights',
        content: 'You have the right to access, update, or delete all your personal data at any time. You can export your data in CSV format or request complete account deletion through Settings. We will erase all associated data within 30 days of a deletion request.',
    },
    {
        title: '5. Cookies & Tracking',
        content: 'We use essential cookies only — for authentication and session management. We do not use tracking cookies, analytics cookies, or any advertising pixels. Your browsing activity within BudgetTracko is not tracked or monitored.',
    },
    {
        title: '6. Third-Party Services',
        content: 'We use Google OAuth for secure authentication. No financial data is shared with Google. We may use anonymized, aggregated data for improving our service, but individual financial records are never shared with any third party.',
    },
    {
        title: '7. Data Retention',
        content: 'We retain your data for as long as your account is active. If you delete your account, all personal data is permanently removed within 30 days. Anonymized usage statistics may be retained for service improvement.',
    },
    {
        title: '8. Changes to This Policy',
        content: 'We will notify you of any material changes via email and in-app notification at least 14 days before they take effect. Continued use of BudgetTracko after changes constitutes acceptance of the updated policy.',
    },
    {
        title: '9. Contact Us',
        content: 'If you have any questions about this Privacy Policy or your data, please contact Bhargav Karande at bhargavk056@gmail.com. We will respond to all inquiries within 48 hours.',
    },
];

const Privacy = () => {
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
            <div className="pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 text-center max-w-4xl mx-auto">
                <motion.h1
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 sm:mb-6"
                >
                    Privacy Policy
                </motion.h1>
                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={0.2}
                    className="text-base sm:text-lg md:text-xl font-bold text-gray-700"
                >
                    Last updated: February 14, 2026 — We take your privacy seriously.
                </motion.p>
            </div>

            {/* Policy Content */}
            <section className="pb-20 sm:pb-32 px-4 sm:px-6">
                <motion.div
                    className="max-w-3xl mx-auto bg-white border-4 border-black p-6 sm:p-10 md:p-14 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            variants={staggerItem}
                            className={`${idx > 0 ? 'mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-gray-200' : ''}`}
                        >
                            <h3 className="text-lg sm:text-xl font-black uppercase mb-2 sm:mb-3">{section.title}</h3>
                            <p className="text-sm sm:text-base font-semibold text-gray-700 leading-relaxed">{section.content}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="bg-black text-gray-400 text-center py-6 sm:py-8 text-xs sm:text-sm border-t border-gray-800">
                <p>&copy; 2026 BudgetTracko — Bhargav Karande | bhargavk056@gmail.com</p>
            </footer>
        </div>
    );
};

export default Privacy;
