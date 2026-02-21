import { motion } from 'framer-motion';

const PageLoader = () => {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] w-full">
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    className="w-12 h-12 rounded-full border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        repeatType: "reverse"
                    }}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider uppercase"
                >
                    Loading...
                </motion.p>
            </div>
        </div>
    );
};

export default PageLoader;
