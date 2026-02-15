import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaServer, FaDatabase, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const StatusPage = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            // Direct call to avoid interceptors if they require auth for everything (though api.js handles 401, best to be safe)
            // Actually, assuming existing axios instance is fine if it doesn't block non-auth.
            // Let's use the env var directly or relative path.
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.get(`${API_URL}/api/status`);
            setStatus(response.data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error("Failed to fetch status", err);
            setError("Failed to connect to the server.");
            setStatus(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    const getStatusColor = (statusStr) => {
        if (statusStr === 'online' || statusStr === 'connected' || statusStr === 'ok') return 'bg-green-400';
        if (statusStr === 'issues_found') return 'bg-yellow-400';
        return 'bg-red-400';
    };

    return (
        <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8 font-mono text-gray-900">
            <Helmet>
                <title>System Status | BudgetTracko</title>
            </Helmet>

            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black pb-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">System Status</h1>
                        <p className="text-lg font-bold mt-2 text-gray-600">Real-time operational metrics</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${loading ? 'bg-blue-400 animate-pulse' : 'bg-green-500'}`}></div>
                            <span className="font-bold text-sm">
                                {loading ? 'REFRESHING...' : `UPDATED: ${lastUpdated?.toLocaleTimeString()}`}
                            </span>
                        </div>
                        <button
                            onClick={fetchStatus}
                            className="mt-2 text-xs font-bold underline hover:text-blue-600"
                        >
                            FORCE REFRESH
                        </button>
                    </div>
                </header>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-100 border-4 border-red-500 p-4 mb-8 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]"
                    >
                        <FaTimesCircle className="text-3xl text-red-500" />
                        <div>
                            <h3 className="font-black text-xl">SYSTEM CRITICAL</h3>
                            <p className="font-bold">{error}</p>
                        </div>
                    </motion.div>
                )}

                {status && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Server Status Code */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-black text-white px-3 py-1 font-bold text-sm uppercase">Server</div>
                                <FaServer className="text-2xl" />
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-4 h-4 rounded-full border-2 border-black ${getStatusColor(status.server?.status)}`}></div>
                                <span className="text-2xl font-black uppercase">{status.server?.status || 'UNKNOWN'}</span>
                            </div>
                            <div className="border-t-2 border-dashed border-gray-300 pt-3 mt-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                    <FaClock />
                                    <span>UPTIME: {status.server?.uptimeFormatted}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Database Status Card */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.1 }}
                            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-black text-white px-3 py-1 font-bold text-sm uppercase">Database</div>
                                <FaDatabase className="text-2xl" />
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-4 h-4 rounded-full border-2 border-black ${getStatusColor(status.database?.status)}`}></div>
                                <span className="text-2xl font-black uppercase">{status.database?.status || 'UNKNOWN'}</span>
                            </div>
                            <div className="border-t-2 border-dashed border-gray-300 pt-3 mt-3">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                                    <span>LATENCY:</span>
                                    <span className={`px-2 py-0.5 border border-black ${status.database?.latency < 100 ? 'bg-green-200' : 'bg-yellow-200'}`}>
                                        {status.database?.latency ? `${status.database.latency}ms` : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Environment Status Card - Full Width */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                            className="col-span-1 md:col-span-2 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-black text-white px-3 py-1 font-bold text-sm uppercase">Environment Health</div>
                                {status.environment?.status === 'ok' ? (
                                    <FaCheckCircle className="text-3xl text-green-500" />
                                ) : (
                                    <FaExclamationTriangle className="text-3xl text-yellow-500" />
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border-2 border-black bg-gray-50">
                                    <span className="font-bold">GLOBAL STATUS</span>
                                    <span className={`px-3 py-1 border-2 border-black font-black uppercase ${getStatusColor(status.environment?.status)}`}>
                                        {status.environment?.status === 'ok' ? 'HEALTHY' : 'ISSUES DETECTED'}
                                    </span>
                                </div>

                                {status.environment?.missing && status.environment.missing.length > 0 ? (
                                    <div className="mt-4">
                                        <h4 className="font-bold text-red-600 mb-2 border-b-2 border-red-200 pb-1">MISSING VARIABLES:</h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {status.environment.missing.map((envVar) => (
                                                <li key={envVar} className="flex items-center gap-2 text-red-600 font-bold bg-red-50 p-2 border border-red-200">
                                                    <FaTimesCircle />
                                                    {envVar}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-600 font-bold mt-2">
                                        <FaCheckCircle />
                                        <span>All critical environment variables are present.</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* System & Memory Card */}
                        {status.system && (
                            <motion.div
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.3 }}
                                className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-black text-white px-3 py-1 font-bold text-sm uppercase">System Resources</div>
                                    <FaServer className="text-2xl" />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm font-bold mb-1">
                                            <span>MEMORY (RSS)</span>
                                            <span>{(status.system.memory.rss / 1024 / 1024).toFixed(0)} MB</span>
                                        </div>
                                        <div className="h-4 border-2 border-black bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500"
                                                style={{ width: `${Math.min((status.system.memory.rss / status.system.os.totalMem) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="bg-gray-100 p-2 border-2 border-black">
                                            <div className="text-xs font-bold text-gray-500">PLATFORM</div>
                                            <div className="font-bold uppercase truncate">{status.system.os.platform}</div>
                                        </div>
                                        <div className="bg-gray-100 p-2 border-2 border-black">
                                            <div className="text-xs font-bold text-gray-500">FREE MEM</div>
                                            <div className="font-bold">{(status.system.os.freeMem / 1024 / 1024).toFixed(0)} MB</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* External Services Card */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.3 }}
                            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-black text-white px-3 py-1 font-bold text-sm uppercase">Connectivity</div>
                                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                            </div>

                            <div className="space-y-3">
                                {status.external && Object.entries(status.external).map(([service, state]) => (
                                    <div key={service} className="flex items-center justify-between p-2 border-b-2 border-dashed border-gray-300 last:border-0">
                                        <span className="font-bold uppercase">{service}</span>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${state === 'online' || state === '200' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-sm font-bold">{state === 'online' ? 'OK' : state}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}

                <footer className="mt-12 text-center text-gray-500 font-bold text-sm">
                    <p>BUDGETTRACKO // SYSTEM DIAGNOSTICS</p>
                    <p className="text-xs mt-1 opacity-75">v1.0.0</p>
                </footer>
            </div>
        </div>
    );
};

export default StatusPage;
