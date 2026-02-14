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
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-dark-card w-full max-w-lg rounded-3xl p-8 border-4 border-brand-black dark:border-gray-700 shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Deco */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary" />
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-yellow/20 rounded-full blur-2xl" />

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black mb-2">Welcome to BudgetTracko! 🚀</h2>
                            <p className="text-gray-500 font-medium">Your personal finance companion.</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-xl text-brand-primary">
                                        <f.icon />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-lg">{f.title}</h3>
                                        <p className="text-sm text-gray-500">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleClose}
                            className="w-full py-4 rounded-xl bg-brand-black text-white dark:bg-white dark:text-brand-black font-black text-lg uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all"
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
