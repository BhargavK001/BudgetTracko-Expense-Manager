import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCheckCircleFill, BsGraphUpArrow, BsWalletFill, BsTagsFill } from 'react-icons/bs';

const WelcomeModal = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasVisited = localStorage.getItem('budget_tracko_visited');
        if (!hasVisited) {
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('budget_tracko_visited', 'true');
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            handleClose();
        }
    };

    const steps = [
        {
            icon: BsWalletFill,
            title: "Welcome to BudgetTracko!",
            desc: "Your personal finance companion to track spending and save more.",
            color: "text-brand-primary"
        },
        {
            icon: BsCheckCircleFill,
            title: "Track Transactions",
            desc: "Log income and expenses in seconds. Just tap the '+' button on your dashboard.",
            color: "text-green-500"
        },
        {
            icon: BsTagsFill, // Make sure to import this! 
            title: "Create Categories",
            desc: "Organize your spending! Go to Settings > Categories to add custom icons and colors.",
            color: "text-brand-yellow"
        },
        {
            icon: BsGraphUpArrow,
            title: "Analyze Trends",
            desc: "See where your money goes with beautiful charts and monthly reports.",
            color: "text-purple-500"
        }
    ];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-dark-card w-full max-w-sm sm:max-w-md md:max-w-lg rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative border-4 border-brand-black dark:border-gray-700 mx-4"
                    >
                        {/* Progress Bar Top */}
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800">
                            <motion.div
                                className="h-full bg-brand-black dark:bg-brand-yellow"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        <div className="p-5 sm:p-8 md:p-10 text-center">
                            {/* Icon with Ring Animation */}
                            <div className="relative mb-4 sm:mb-6 mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
                                <motion.div
                                    className={`absolute inset-0 rounded-full opacity-20 ${steps[currentStep].color.replace('text-', 'bg-')}`}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                />
                                <div className={`relative z-10 text-3xl sm:text-4xl md:text-5xl ${steps[currentStep].color}`}>
                                    {/* Dynamic Icon Rendering */}
                                    {(() => {
                                        const Icon = steps[currentStep].icon;
                                        return <Icon />;
                                    })()}
                                </div>
                            </div>

                            {/* Text Content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h2 className="text-lg sm:text-2xl md:text-3xl font-black mb-2 uppercase tracking-tight leading-tight">
                                        {steps[currentStep].title}
                                    </h2>
                                    <p className="text-gray-500 font-medium text-xs sm:text-sm md:text-base leading-relaxed mb-6 sm:mb-8 md:mb-10 min-h-[40px] sm:min-h-[48px]">
                                        {steps[currentStep].desc}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Dots Indicator */}
                            <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${i === currentStep ? 'bg-brand-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    />
                                ))}
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col gap-2.5 sm:gap-3">
                                <button
                                    onClick={handleNext}
                                    className="w-full py-3 sm:py-3.5 md:py-4 rounded-xl bg-brand-black text-white dark:bg-white dark:text-brand-black font-black text-xs sm:text-sm md:text-base uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                                >
                                    {currentStep === steps.length - 1 ? "Get Started 🚀" : "Next Step"}
                                </button>

                                {currentStep < steps.length - 1 && (
                                    <button
                                        onClick={handleClose}
                                        className="text-[10px] sm:text-xs font-bold text-gray-400 hover:text-brand-black dark:hover:text-white uppercase tracking-wider transition-colors py-2"
                                    >
                                        Skip Tour
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default WelcomeModal;
