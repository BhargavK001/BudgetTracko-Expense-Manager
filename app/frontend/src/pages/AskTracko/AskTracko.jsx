import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsSendFill, BsRobot, BsPersonFill, BsLightningChargeFill, BsArrowLeftCircleFill } from 'react-icons/bs';
import { trackoPulseSocket } from '../../services/trackoPulseSocket';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const loadingPhrases = [
    "Calculating how much you spent on Momo's...",
    "Judging your Swiggy orders...",
    "Crunching numbers faster than your GPA drops...",
    "Finding missing rupees in the couch cushions...",
    "Checking if you can actually afford that trip to Goa..."
];

const AskTracko = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- Chat State ---
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            sender: 'tracko',
            text: "Hey! I'm Tracko, your brutally honest financial coach. Ask me anything about your remaining budget, recent spending, or if you can afford that new pair of sneakers.",
            timestamp: new Date().toISOString()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loadingPhrase, setLoadingPhrase] = useState(loadingPhrases[0]);
    const messagesEndRef = useRef(null);

    // Initialize Socket Connection
    useEffect(() => {
        trackoPulseSocket.connect();
        return () => { };
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Cycle through funny loading phrases for chat
    useEffect(() => {
        if (isTyping) {
            const interval = setInterval(() => {
                setLoadingPhrase(loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isTyping]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const newUserMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputValue.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);
        setLoadingPhrase(loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]);

        const chatHistory = messages.slice(-5).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text
        }));

        trackoPulseSocket.askQuestion(
            newUserMessage.text,
            chatHistory,
            (statusUpdate) => console.log(statusUpdate.message),
            (response) => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString() + 'ai',
                    sender: 'tracko',
                    text: response.answer,
                    provider: response.provider,
                    timestamp: response.timestamp
                }]);
                setIsTyping(false);
            },
            (error) => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString() + 'err',
                    sender: 'tracko',
                    isError: true,
                    text: `Oops! My brain short-circuited. ${error.message}`,
                    timestamp: new Date().toISOString()
                }]);
                setIsTyping(false);
            }
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-100px)] lg:h-[calc(100vh-80px)] w-full max-w-5xl mx-auto neo-shadow bg-light-card dark:bg-dark-card border-3 md:border-4 border-brand-black dark:border-white rounded-xl md:rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] md:dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">

            {/* Header & Tabs */}
            <div className="bg-brand-yellow px-4 md:px-6 py-3 md:py-4 border-b-3 md:border-b-4 border-brand-black dark:border-white shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-white p-1.5 md:p-2 rounded-lg md:rounded-xl border-2 border-brand-black dark:border-white neo-shadow-sm">
                        <BsLightningChargeFill className="text-brand-black text-xl md:text-2xl animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-2xl font-black text-brand-black uppercase tracking-widest leading-tight">Chat with Tracko</h1>
                        <p className="text-brand-black font-bold text-[10px] md:text-sm opacity-80 leading-tight">AI Financial Coach</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/tracko-pulse')}
                    className="flex items-center gap-2 bg-white text-brand-black font-bold px-3 md:px-4 py-2 rounded-lg border-2 border-brand-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform text-xs md:text-sm"
                >
                    <BsArrowLeftCircleFill /> Back
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f4f4f0] dark:bg-[#1a1a1a] flex flex-col gap-6">
                {messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        key={msg.id}
                        className={`flex gap-2 md:gap-3 max-w-[90%] md:max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                        {/* Avatar */}
                        <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 border-brand-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${msg.sender === 'user' ? 'bg-blue-400 text-white' : 'bg-brand-yellow text-brand-black'}`}>
                            {msg.sender === 'user' ? <BsPersonFill className="text-base md:text-xl" /> : <BsRobot className="text-base md:text-xl" />}
                        </div>

                        {/* Message Bubble */}
                        <div className={`relative px-4 py-2.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl border-2 border-brand-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] md:dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] 
                                    ${msg.sender === 'user'
                                ? 'bg-white dark:bg-gray-800 text-brand-black dark:text-white rounded-tr-none'
                                : msg.isError
                                    ? 'bg-red-400 text-brand-black rounded-tl-none font-bold'
                                    : 'bg-green-300 dark:bg-green-700 text-brand-black dark:text-white rounded-tl-none'
                            }`}
                        >
                            <p className="whitespace-pre-wrap font-medium text-sm md:text-base leading-relaxed">{msg.text}</p>

                            {/* Metadata */}
                            <div className={`text-[9px] md:text-[10px] mt-1.5 md:mt-2 font-bold opacity-60 flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {msg.provider && <span className="uppercase px-1 border border-current rounded">Powered by {msg.provider}</span>}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* College-Themed Typing Indicator */}
                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex gap-3 max-w-[85%] self-start"
                        >
                            <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-brand-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] bg-brand-yellow text-brand-black">
                                <BsRobot size={20} />
                            </div>
                            <div className="px-5 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-brand-black dark:text-gray-200 rounded-tl-none border-2 border-brand-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-brand-black dark:bg-white rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-brand-black dark:bg-white rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-brand-black dark:bg-white rounded-full" />
                                    </div>
                                    <span className="text-xs font-bold font-mono ml-2 animate-pulse">{loadingPhrase}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-dark-card p-3 md:p-4 border-t-3 md:border-t-4 border-brand-black dark:border-white shrink-0">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask Tracko if you can afford that..."
                        className="w-full bg-[#f4f4f0] dark:bg-gray-800 text-brand-black dark:text-white border-2 border-brand-black dark:border-white rounded-xl py-3 md:py-4 pl-3 md:pl-4 pr-12 md:pr-16 text-sm md:text-base font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] md:dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:translate-y-[2px] focus:translate-x-[2px] focus:shadow-none transition-all"
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute right-1.5 md:right-2 bg-brand-yellow text-brand-black p-2 md:p-3 rounded-lg border-2 border-brand-black dark:border-white hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <BsSendFill size={18} className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </form>
            </div>

        </div>
    );
};

export default AskTracko;
