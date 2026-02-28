import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BsFire, BsStarFill, BsLightningChargeFill, BsGraphUpArrow, BsArrowLeftCircleFill } from 'react-icons/bs';

const PulseAnalysisDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pulseData = location.state?.pulseData;

    // If a user navigates directly to /tracko-pulse/analysis without data, send them back to the hub
    if (!pulseData) {
        navigate('/tracko-pulse', { replace: true });
        return null;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-100px)] lg:h-[calc(100vh-80px)] w-full max-w-5xl mx-auto neo-shadow bg-light-card dark:bg-dark-card border-3 md:border-4 border-brand-black dark:border-white rounded-xl md:rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] md:dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">

            {/* Header */}
            <div className="bg-brand-yellow px-4 md:px-6 py-3 md:py-4 border-b-3 md:border-b-4 border-brand-black dark:border-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-white p-1.5 md:p-2 rounded-lg md:rounded-xl border-2 border-brand-black dark:border-white neo-shadow-sm">
                        <BsLightningChargeFill className="text-brand-black text-xl md:text-2xl animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-2xl font-black text-brand-black uppercase tracking-widest leading-tight">Monthly Deep-Dive</h1>
                        <p className="text-brand-black font-bold text-[10px] md:text-sm opacity-80 leading-tight">AI Financial Coach</p>
                    </div>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => navigate('/tracko-pulse')}
                    className="flex items-center gap-2 bg-white text-brand-black font-bold px-3 md:px-4 py-2 rounded-lg border-2 border-brand-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform text-xs md:text-sm"
                >
                    <BsArrowLeftCircleFill /> Back
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f4f4f0] dark:bg-[#1a1a1a]">
                <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 md:gap-8 pb-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-4">

                        {/* The Roast */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-red-400 p-5 md:p-6 rounded-2xl border-4 border-brand-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-3 border-b-2 border-brand-black/20 pb-2">
                                <BsFire className="text-2xl md:text-3xl text-brand-black" />
                                <h3 className="font-black text-lg md:text-xl text-brand-black uppercase tracking-widest">The Roast</h3>
                            </div>
                            <p className="font-medium text-brand-black text-base md:text-lg leading-relaxed">{pulseData.roast}</p>
                        </motion.div>

                        {/* The Praise */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-green-300 p-5 md:p-6 rounded-2xl border-4 border-brand-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-3 border-b-2 border-brand-black/20 pb-2">
                                <BsStarFill className="text-2xl md:text-3xl text-brand-black" />
                                <h3 className="font-black text-lg md:text-xl text-brand-black uppercase tracking-widest">The Praise</h3>
                            </div>
                            <p className="font-medium text-brand-black text-base md:text-lg leading-relaxed">{pulseData.praise}</p>
                        </motion.div>

                        {/* The Hustle Tip */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-purple-300 p-5 md:p-6 rounded-2xl border-4 border-brand-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-3 border-b-2 border-brand-black/20 pb-2">
                                <BsLightningChargeFill className="text-2xl md:text-3xl text-brand-black" />
                                <h3 className="font-black text-lg md:text-xl text-brand-black uppercase tracking-widest">Hustle Tip</h3>
                            </div>
                            <p className="font-medium text-brand-black text-base md:text-lg leading-relaxed">{pulseData.hustleTip}</p>
                        </motion.div>

                        {/* The Investment Tip */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="bg-blue-300 p-5 md:p-6 rounded-2xl border-4 border-brand-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-3 border-b-2 border-brand-black/20 pb-2">
                                <BsGraphUpArrow className="text-2xl md:text-3xl text-brand-black" />
                                <h3 className="font-black text-lg md:text-xl text-brand-black uppercase tracking-widest">Money Moves</h3>
                            </div>
                            <p className="font-medium text-brand-black text-base md:text-lg leading-relaxed">{pulseData.investmentTip}</p>
                        </motion.div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default PulseAnalysisDashboard;
