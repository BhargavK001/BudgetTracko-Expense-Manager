import React from 'react';
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
        title: '1. Acceptance of Terms',
        content: 'By accessing and using BudgetTracko, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.',
    },
    {
        title: '2. Use License',
        content: 'Permission is granted to temporarily download one copy of the materials (information or software) on BudgetTracko\'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose, or for any public display (commercial or non-commercial); attempt to decompile or reverse engineer any software contained on BudgetTracko\'s website; remove any copyright or other proprietary notations from the materials; or transfer the materials to another person or "mirror" the materials on any other server.',
    },
    {
        title: '3. Disclaimer',
        content: 'The materials on BudgetTracko\'s website are provided on an \'as is\' basis. BudgetTracko makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
    },
    {
        title: '4. Limitations',
        content: 'In no event shall BudgetTracko or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BudgetTracko\'s website, even if BudgetTracko or a BudgetTracko authorized representative has been notified orally or in writing of the possibility of such damage.',
    },
    {
        title: '5. Accuracy of Materials',
        content: 'The materials appearing on BudgetTracko\'s website could include technical, typographical, or photographic errors. BudgetTracko does not warrant that any of the materials on its website are accurate, complete or current. BudgetTracko may make changes to the materials contained on its website at any time without notice. However BudgetTracko does not make any commitment to update the materials.',
    },
    {
        title: '6. Links',
        content: 'BudgetTracko has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by BudgetTracko of the site. Use of any such linked website is at the user\'s own risk.',
    },
    {
        title: '7. Modifications',
        content: 'BudgetTracko may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.',
    },
    {
        title: '8. Governing Law',
        content: 'These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.',
    },
    {
        title: '9. Contact Us',
        content: 'If you have any questions about these Terms of Service, please contact Bhargav Karande at bhargavk056@gmail.com.',
    },
];

const TermsOfService = () => {
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
            <div className="pt-20 sm:pt-32 pb-6 sm:pb-12 px-4 sm:px-6 text-center max-w-4xl mx-auto">
                <motion.h1
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-3 sm:mb-6"
                >
                    Terms of Service
                </motion.h1>
                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={0.2}
                    className="text-base sm:text-lg md:text-xl font-bold text-gray-700"
                >
                    Last updated: February 14, 2026 — Please read these terms carefully.
                </motion.p>
            </div>

            {/* Terms Content */}
            <section className="pb-16 sm:pb-32 px-4 sm:px-6">
                <motion.div
                    className="max-w-3xl mx-auto bg-white border-3 sm:border-4 border-black p-5 sm:p-10 md:p-14 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
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

export default TermsOfService;
