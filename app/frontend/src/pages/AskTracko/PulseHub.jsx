import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BsChatDotsFill, BsBarChartFill, BsLightningChargeFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { toast } from 'sonner';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PulseHub = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleChatNavigation = () => {
        navigate('/tracko-pulse/chat');
    };

    const generateMonthlyPulse = async () => {
        setIsGenerating(true);
        try {
            const response = await api.get('/api/tracko-pulse/monthly-analysis');
            const data = response.data;
            if (data.success) {
                return data.data.analysis;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGeneratePulse = () => {
        toast.promise(generateMonthlyPulse(), {
            loading: 'Tracko is analyzing your month...',
            success: (pulseData) => {
                // Navigate to the dashboard with the generated data
                navigate('/tracko-pulse/analysis', { state: { pulseData } });
                return 'Pulse Analysis Generated!';
            },
            error: (err) => `Failed to generate: ${err.message}`
        });
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-160px)] md:min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-80px)] w-full max-w-5xl mx-auto pb-20">

            {/* Header */}
            <div className="px-4 md:px-0 py-3 md:py-4 flex items-center gap-3 md:gap-4 shrink-0">
                <div className="p-2 rounded-xl bg-brand-yellow neo-shadow-sm border-2 border-brand-black dark:border-gray-700">
                    <BsLightningChargeFill className="text-brand-black text-xl md:text-2xl animate-pulse" />
                </div>
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-brand-black dark:text-white uppercase tracking-widest leading-tight">Tracko Pulse</h1>
                    <p className="text-gray-500 font-bold text-xs md:text-sm leading-tight">AI Financial Coach</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 md:p-0 mt-6 flex flex-col items-center justify-center gap-8 md:gap-12">

                <div className="text-center max-w-lg">
                    <h2 className="text-2xl md:text-4xl font-black text-brand-black dark:text-white uppercase tracking-wider mb-4">Choose Your Vibe</h2>
                    <p className="font-bold text-gray-600 dark:text-gray-400 text-sm md:text-base">
                        Do you want to chat directly with Tracko about a specific purchase, or get a brutally honest breakdown of your entire month?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">

                    {/* Chat Card */}
                    <button
                        onClick={handleChatNavigation}
                        className="group flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-800 p-8 rounded-2xl border-4 border-brand-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-2 hover:translate-x-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer text-left w-full relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-400"></div>
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-2 border-2 border-blue-400">
                            <BsChatDotsFill className="text-3xl text-blue-500" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-brand-black dark:text-white uppercase tracking-wider w-full text-center">Chat with Bot</h3>
                        <p className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 text-center">
                            Ask if you can afford that Zomato order or stream advice on your remaining budget.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-sm group-hover:scale-110 transition-transform">
                            Enter Chat <BsArrowRightCircleFill className="text-lg" />
                        </div>
                    </button>

                    {/* Pulse Card */}
                    <button
                        onClick={handleGeneratePulse}
                        disabled={isGenerating}
                        className="group flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-800 p-8 rounded-2xl border-4 border-brand-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-2 hover:translate-x-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer text-left w-full relative overflow-hidden disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-brand-yellow"></div>
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2 border-2 border-brand-yellow">
                            <BsBarChartFill className="text-3xl text-brand-yellow" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-brand-black dark:text-white uppercase tracking-wider w-full text-center">Monthly Deep-Dive</h3>
                        <p className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 text-center">
                            Get roasted, praised, and find a side-hustle. A full breakdown of this month's finances.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-brand-black dark:text-brand-yellow font-black uppercase tracking-widest text-sm group-hover:scale-110 transition-transform">
                            {isGenerating ? 'Analyzing...' : 'Generate AI Pulse'} <BsArrowRightCircleFill className="text-lg" />
                        </div>
                    </button>

                </div>

            </div>

        </div>
    );
};

export default PulseHub;
