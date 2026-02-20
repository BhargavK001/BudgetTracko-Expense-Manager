import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsSendFill, BsRobot, BsPersonFill, BsLightningChargeFill } from 'react-icons/bs';
import { trackoPulseSocket } from '../../services/trackoPulseSocket';
import { useAuth } from '../../context/AuthContext';

const loadingPhrases = [
    "Calculating how much you spent on Momo's...",
    "Judging your Swiggy orders...",
    "Crunching numbers faster than your GPA drops...",
    "Finding missing rupees in the couch cushions...",
    "Checking if you can actually afford that trip to Goa..."
];

const AskTracko = () => {
    const { user } = useAuth();
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
        // Auth is cookie-based (sent automatically via withCredentials: true)
        trackoPulseSocket.connect();

        return () => {
            // In React 18 StrictMode, this runs immediately in dev. 
            // We keep the singleton alive across route changes for better UX.
            // Component unmount does not need to brutally destroy the socket here.
        };
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Cycle through funny loading phrases
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

        // Grab history (last 5 messages, excluding the one we just added to state)
        // because setMessages is async, 'messages' here is the state BEFORE newUserMessage
        const chatHistory = messages.slice(-5).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text
        }));

        // Send via WebSocket
        trackoPulseSocket.askQuestion(
            newUserMessage.text,
            chatHistory,
            (statusUpdate) => {
                console.log(statusUpdate.message);
            },
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
        <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-40px)] w-full max-w-4xl mx-auto neo-shadow bg-light-card dark:bg-dark-card border-4 border-brand-black dark:border-white rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">

            {/* Header */}
            <div className="bg-brand-yellow px-6 py-4 border-b-4 border-brand-black dark:border-white flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl border-2 border-brand-black dark:border-white neo-shadow-sm">
                    <BsLightningChargeFill className="text-brand-black text-2xl animate-pulse" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-brand-black uppercase tracking-widest">Tracko Pulse</h1>
                    <p className="text-brand-black font-bold text-sm opacity-80">AI Financial Coach</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f4f4f0] dark:bg-[#1a1a1a] flex flex-col gap-6">
                {messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                        {/* Avatar */}
                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-brand-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${msg.sender === 'user' ? 'bg-blue-400 text-white' : 'bg-brand-yellow text-brand-black'}`}>
                            {msg.sender === 'user' ? <BsPersonFill size={20} /> : <BsRobot size={20} />}
                        </div>

                        {/* Message Bubble */}
                        <div className={`relative px-5 py-3 rounded-2xl border-2 border-brand-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] 
                            ${msg.sender === 'user'
                                ? 'bg-white dark:bg-gray-800 text-brand-black dark:text-white rounded-tr-none'
                                : msg.isError
                                    ? 'bg-red-400 text-brand-black rounded-tl-none font-bold'
                                    : 'bg-green-300 dark:bg-green-700 text-brand-black dark:text-white rounded-tl-none'
                            }`}
                        >
                            <p className="whitespace-pre-wrap font-medium">{msg.text}</p>

                            {/* Metadata */}
                            <div className={`text-[10px] mt-2 font-bold opacity-60 flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
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
            <div className="bg-white dark:bg-dark-card p-4 border-t-4 border-brand-black dark:border-white">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask Tracko if you can afford that..."
                        className="w-full bg-[#f4f4f0] dark:bg-gray-800 text-brand-black dark:text-white border-2 border-brand-black dark:border-white rounded-xl py-4 pl-4 pr-16 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:translate-y-[2px] focus:translate-x-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute right-2 bg-brand-yellow text-brand-black p-3 rounded-lg border-2 border-brand-black dark:border-white hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <BsSendFill size={18} />
                    </button>
                </form>
            </div>

        </div>
    );
};

export default AskTracko;
