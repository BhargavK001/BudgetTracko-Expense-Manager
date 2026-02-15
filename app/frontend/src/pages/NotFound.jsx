import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BsArrowLeft, BsEmojiDizzy } from 'react-icons/bs';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-brand-yellow flex flex-col items-center justify-center p-6 text-center font-sans">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white border-4 border-black p-8 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl"
            >
                <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="w-24 h-24 bg-black text-brand-yellow rounded-full flex items-center justify-center text-5xl mx-auto mb-6 border-4 border-black"
                >
                    <BsEmojiDizzy />
                </motion.div>

                <h1 className="text-6xl font-black mb-2 uppercase tracking-tighter text-black">404</h1>
                <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight text-black">Page Not Found</h2>
                <p className="text-gray-600 font-medium mb-8">
                    Oops! The page you're looking for seems to have wandered off into the void.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-brand-black text-white px-6 py-3 rounded-lg font-black uppercase tracking-wider hover:bg-black/90 hover:-translate-y-1 transition-all border-2 border-black"
                >
                    <BsArrowLeft size={20} /> Go Back Home
                </Link>
            </motion.div>

            <p className="mt-8 text-xs font-bold uppercase tracking-widest text-black/50">Error Code: 404 • BudgetTracko</p>
        </div>
    );
};

export default NotFound;
