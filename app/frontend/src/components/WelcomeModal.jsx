import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCheckCircleFill, BsGraphUpArrow, BsWalletFill } from 'react-icons/bs';

const WelcomeModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasVisited = localStorage.getItem('budget_tracko_visited');
        if (!hasVisited) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('budget_tracko_visited', 'true');
    };

    const features = [
        { icon: BsWalletFill, title: "Track Expenses", desc: "Log your daily spending easily." },
        { icon: BsCheckCircleFill, title: "Set Budgets", desc: "Stay within your limits." },
        { icon: BsGraphUpArrow, title: "Analyze Trends", desc: "Visualize your financial health." },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-dark-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 border-t-4 sm:border-4 border-brand-black dark:border-gray-700 shadow-2xl relative overflow-hidden max-h-[92vh] sm:max-h-[85vh] overflow-y-auto"
                    >
                        {/* Background Deco */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary" />
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-yellow/20 rounded-full blur-2xl" />

                        <div className="text-center mb-5 sm:mb-8">
                            <h2 className="text-2xl sm:text-3xl font-black mb-2">Welcome to BudgetTracko! 🚀</h2>
                            <p className="text-gray-500 font-medium text-sm">Your personal finance companion.</p>
                        </div>

                        <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-8">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-lg sm:text-xl text-brand-primary">
                                        <f.icon />
                                    </div>
                                    <div className="text-left min-w-0">
                                        <h3 className="font-bold text-base sm:text-lg">{f.title}</h3>
                                        <p className="text-xs sm:text-sm text-gray-500">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleClose}
                            className="w-full py-3.5 sm:py-4 rounded-xl bg-brand-black text-white dark:bg-white dark:text-brand-black font-black text-base sm:text-lg uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Get Started
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WelcomeModal;
