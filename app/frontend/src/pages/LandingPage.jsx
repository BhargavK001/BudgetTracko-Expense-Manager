
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-brand-yellow font-sans text-brand-black flex flex-col selection:bg-black selection:text-brand-yellow dark:bg-brand-yellow dark:text-brand-black">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-brand-yellow/90 dark:bg-black/70 backdrop-blur-md z-50 border-b-2 border-brand-black dark:border-white/20 text-brand-black dark:text-white transition-colors shadow-sm dark:shadow-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
                        <span className="text-[#1a1a1a] dark:text-white transition-colors">BUDGET</span><span className="text-white bg-black dark:bg-white dark:text-black px-1 transform -rotate-2 border-2 border-black dark:border-white transition-colors">TRACKO</span>
                    </div>
                    <div className="hidden md:flex gap-8 items-center font-bold text-sm tracking-wide uppercase text-brand-black dark:text-white">
                        <a href="#features" className="hover:underline decoration-2 underline-offset-4">Features</a>
                        <a href="#how-it-works" className="hover:underline decoration-2 underline-offset-4">How it Works</a>
                        <Link to="/contact" className="hover:underline decoration-2 underline-offset-4">Contact</Link>
                        <Link to="/login" className="bg-black dark:bg-white dark:text-black text-white px-6 py-3 rounded-none hover:bg-white hover:text-black dark:hover:bg-gray-200 dark:hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black dark:border-white">
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="pt-32 pb-20 px-6 flex flex-col justify-center items-center text-center max-w-7xl mx-auto w-full">
                <div className="inline-block bg-white border-2 border-black px-4 py-1 font-bold text-sm mb-6 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2 text-black">
                    ✨ V 1.0 is Live!
                </div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[0.9] tracking-tighter text-brand-black">
                    MASTER<br />
                    YOUR <span className="text-white text-shadow-black">MONEY.</span>
                </h1>
                <p className="text-xl md:text-2xl font-medium max-w-2xl mb-12 leading-relaxed text-brand-black">
                    Stop guessing where your money goes. Track, analyze, and optimize your spending with the world's simplest expense manager.
                </p>
                <div className="flex flex-col md:flex-row gap-6">
                    <Link to="/login" className="bg-black text-white text-xl font-bold px-12 py-5 rounded-none shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all border-2 border-black">
                        Start Tracking Free
                    </Link>
                    <a href="#demo" className="bg-white text-black text-xl font-bold px-12 py-5 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all border-2 border-black box-border">
                        View Demo
                    </a>
                </div>

                {/* Hero Visual - Mock Dashboard */}
                <div className="mt-20 w-full max-w-5xl relative group">
                    <div className="absolute inset-0 bg-black rounded-3xl transform translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform"></div>
                    <div className="relative bg-white border-4 border-black rounded-3xl overflow-hidden shadow-2xl">
                        {/* Mock Browser Header */}
                        <div className="bg-gray-100 border-b-4 border-black p-4 flex gap-2 items-center">
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                            <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-black"></div>
                            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-black"></div>
                            <span className="ml-4 text-xs font-bold text-gray-500 uppercase tracking-wider">dashboard — BudgetTracko</span>
                        </div>
                        {/* Mock UI Content */}
                        <div className="p-6 md:p-10 bg-gray-50 grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Sidebar Mock */}
                            <div className="hidden md:flex col-span-3 flex-col gap-3">
                                <div className="h-9 bg-black text-white rounded-lg flex items-center px-3 text-sm font-bold">Dashboard</div>
                                <div className="h-9 bg-gray-200 text-gray-700 rounded-lg flex items-center px-3 text-sm font-semibold">Transactions</div>
                                <div className="h-9 bg-gray-200 text-gray-700 rounded-lg flex items-center px-3 text-sm font-semibold">Categories</div>
                                <div className="h-9 bg-gray-200 text-gray-700 rounded-lg flex items-center px-3 text-sm font-semibold">Reports</div>
                            </div>
                            {/* Main Content Mock */}
                            <div className="col-span-12 md:col-span-9 space-y-5">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    <h3 className="text-lg font-black text-black uppercase tracking-tight">February 2025</h3>
                                    <div className="h-9 px-4 bg-brand-yellow border-2 border-black rounded-lg flex items-center text-sm font-black text-black">+ Add transaction</div>
                                </div>
                                {/* Summary cards with color */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Balance</p>
                                        <p className="text-xl font-black text-black">₹ 42,850</p>
                                    </div>
                                    <div className="bg-green-50 border-2 border-green-600 rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(22,163,74,0.4)]">
                                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Income</p>
                                        <p className="text-xl font-black text-green-700">₹ 65,000</p>
                                    </div>
                                    <div className="bg-red-50 border-2 border-red-600 rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(220,38,38,0.4)]">
                                        <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Expenses</p>
                                        <p className="text-xl font-black text-red-700">₹ 22,150</p>
                                    </div>
                                </div>
                                {/* Chart + recent list block */}
                                <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] min-h-[220px]">
                                    <p className="text-sm font-black text-black uppercase tracking-tight mb-3">Spending this month</p>
                                    <div className="flex items-end gap-2 h-24 mb-5">
                                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                <div className={`w-full rounded-t ${i % 3 === 0 ? 'bg-green-500' : 'bg-red-500'} opacity-90`} style={{ height: `${h}%` }}></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t-2 border-gray-200 pt-3 space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-green-600">● Food</span>
                                            <span className="text-black">₹ 4,200</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-red-600">● Transport</span>
                                            <span className="text-black">₹ 2,800</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-amber-600">● Bills</span>
                                            <span className="text-black">₹ 6,150</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Marquee Section */}
            <div className="bg-black text-brand-yellow py-6 overflow-hidden border-y-4 border-white transform rotate-1 scale-105">
                <div className="whitespace-nowrap animate-marquee font-black text-2xl tracking-widest uppercase">
                    Save Money • Track Expenses • Build Wealth • Freedom • Save Money • Track Expenses • Build Wealth • Freedom • Save Money • Track Expenses • Build Wealth • Freedom •
                </div>
            </div>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 px-6 bg-white border-b-4 border-black text-black">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 text-center uppercase tracking-tighter text-black">
                        How it works
                    </h2>
                    <p className="text-xl md:text-2xl font-bold text-center text-gray-700 mb-20 max-w-2xl mx-auto">
                        Get started in three easy steps — no setup, no hassle.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: '1', title: 'Sign up free', desc: 'Create your account in seconds with Google or email. No credit card required. Your data stays private and secure.' },
                            { step: '2', title: 'Track every rupee', desc: 'Add income and expenses in one tap. Use categories like Food, Transport, and Bills so you know exactly where your money goes.' },
                            { step: '3', title: 'See where you stand', desc: 'Check your dashboard for monthly totals, spending trends, and category breakdowns. Make better decisions with real numbers.' }
                        ].map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-lg group-hover:translate-x-5 group-hover:translate-y-5 transition-all z-0" aria-hidden="true"></div>
                                <div className="relative z-10 bg-white border-4 border-black p-8 h-full flex flex-col justify-between rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-black text-white text-2xl font-black mb-6">{item.step}</span>
                                    <div>
                                        <h3 className="text-2xl font-black mb-3 uppercase text-black">{item.title}</h3>
                                        <p className="text-base font-semibold leading-relaxed text-gray-800">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 bg-brand-yellow text-brand-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-12 items-start md:items-end mb-16">
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none flex-1 text-brand-black">
                            Everything<br />You Need.
                        </h2>
                        <p className="text-xl font-bold max-w-md leading-relaxed text-brand-black">
                            We stripped away the clutter to focus on what truly matters: your financial health.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white border-4 border-black p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-3xl mb-6 rounded-full">🌓</div>
                            <h3 className="text-3xl font-black mb-4 uppercase text-black">Dark & Light Mode</h3>
                            <p className="text-lg font-bold text-gray-800">Seamlessly switch between themes to suit your preference and environment.</p>
                        </div>
                        <div className="bg-white border-4 border-black p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-3xl mb-6 rounded-full">🏦</div>
                            <h3 className="text-3xl font-black mb-4 uppercase text-black">Multi-Account</h3>
                            <p className="text-lg font-bold text-gray-800">Manage Bank Accounts, Cash, Digital Wallets, and Credit Cards all in one place.</p>
                        </div>
                        <div className="bg-white border-4 border-black p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-3xl mb-6 rounded-full">📊</div>
                            <h3 className="text-3xl font-black mb-4 uppercase text-black">Advanced Analytics</h3>
                            <p className="text-lg font-bold text-gray-800">Visual charts for Spending and Income analysis, with category-wise breakdowns.</p>
                        </div>
                        <div className="bg-brand-black text-white border-4 border-black p-10 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)]">
                            <h3 className="text-3xl font-black mb-4 uppercase text-brand-yellow">More Features...</h3>
                            <ul className="space-y-3 font-bold text-lg">
                                <li className="flex items-center gap-3">✓ Secure Authentication (OAuth)</li>
                                <li className="flex items-center gap-3">✓ Cloud Backup & Restore</li>
                                <li className="flex items-center gap-3">✓ Budget Limits & Alerts</li>
                                <li className="flex items-center gap-3">✓ Recurring Transactions</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-32 px-6 bg-white border-t-4 border-black text-center text-black">
                <h2 className="text-6xl md:text-8xl font-black mb-12 uppercase tracking-tighter text-black">
                    Ready to<br />take control?
                </h2>
                <Link to="/login" className="inline-block bg-brand-yellow text-black text-2xl font-black px-16 py-6 rounded-full border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all transform hover:rotate-1">
                    Join BudgetTracko Now
                </Link>
            </section>

            {/* Footer */}
            <footer className="bg-black text-white py-16 px-6 border-t-8 border-brand-yellow">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2">
                        <div className="text-3xl font-black text-brand-yellow mb-6">BUDGETTRACKO.</div>
                        <p className="text-gray-400 max-w-sm text-lg">
                            The simplest way to track your expenses and manage your budget. Built for speed, privacy, and ease of use.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-xl mb-6 uppercase tracking-wider text-brand-yellow">Product</h4>
                        <ul className="space-y-4 text-gray-300">
                            <li><a href="#" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Features</a></li>
                            <li><a href="#" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Pricing</a></li>
                            <li><a href="#" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Download App</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-xl mb-6 uppercase tracking-wider text-brand-yellow">Company</h4>
                        <ul className="space-y-4 text-gray-300">
                            <li><a href="#" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">About Us</a></li>
                            <li><a href="#" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Contact</a></li>
                            <li><a href="#" className="hover:text-white hover:underline decoration-brand-yellow decoration-2">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                    <p>&copy; 2026 BudgetTracko Inc. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span>Made with 💛 code</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
