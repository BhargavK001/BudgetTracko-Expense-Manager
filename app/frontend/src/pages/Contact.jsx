
import { Link } from 'react-router-dom';

const Contact = () => {
    return (
        <div className="min-h-screen bg-brand-yellow font-sans text-brand-black flex flex-col selection:bg-black selection:text-brand-yellow">
            <nav className="fixed top-0 w-full bg-brand-yellow/90 dark:bg-black/70 backdrop-blur-md z-50 border-b-2 border-brand-black dark:border-white/20 transition-colors shadow-sm dark:shadow-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2 text-brand-black dark:text-white">
                        <span className="text-[#1a1a1a] dark:text-white transition-colors">BUDGET</span><span className="text-white bg-black dark:bg-white dark:text-black px-1 transform -rotate-2 border-2 border-black dark:border-white transition-colors">TRACKO</span>
                    </Link>
                    <Link to="/" className="font-bold border-2 border-black dark:border-white px-4 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                        ← Back Home
                    </Link>
                </div>
            </nav>

            <div className="flex-grow flex items-center justify-center pt-24 px-6">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                    {/* Contact Info */}
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black mb-8 uppercase leading-none tracking-tighter">
                            Let's<br />Talk.
                        </h1>
                        <p className="text-xl font-bold mb-12 max-w-md">
                            Have a question, suggestion, or just want to say hi? We'd love to hear from you.
                        </p>

                        <div className="space-y-8">
                            <div className="border-l-4 border-black pl-6">
                                <h3 className="font-black text-xl mb-1 uppercase">Email Us</h3>
                                <p className="font-medium text-lg">hello@budgettracko.com</p>
                            </div>
                            <div className="border-l-4 border-black pl-6">
                                <h3 className="font-black text-xl mb-1 uppercase">Visit Us</h3>
                                <p className="font-medium text-lg">123 Finance Street,<br />Money City, NY 10001</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
                        <div className="absolute top-0 right-0 bg-black text-brand-yellow font-bold px-4 py-1 transform translate-x-2 -translate-y-2 rotate-2 border-2 border-white">
                            We reply fast! ⚡
                        </div>

                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-black uppercase tracking-wide mb-2">Your Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] outline-none transition-all font-bold placeholder-gray-400"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black uppercase tracking-wide mb-2">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] outline-none transition-all font-bold placeholder-gray-400"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black uppercase tracking-wide mb-2">Message</label>
                                <textarea
                                    rows="4"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] outline-none transition-all font-bold placeholder-gray-400 resize-none"
                                    placeholder="How can we help you today?"
                                ></textarea>
                            </div>
                            <button className="w-full bg-black text-white font-black text-lg py-4 border-2 border-black hover:bg-brand-yellow hover:text-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-widest">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <footer className="py-8 text-center font-bold text-sm opacity-60">
                &copy; 2026 BudgetTracko.
            </footer>
        </div>
    );
};

export default Contact;
