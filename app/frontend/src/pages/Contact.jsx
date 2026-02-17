
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import SEO from '../components/common/SEO';
import { contactApi } from '../services/api';

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const slideFromLeft = {
    hidden: { opacity: 0, x: -80 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const slideFromRight = {
    hidden: { opacity: 0, x: 80 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 },
    },
};

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all fields');
            return;
        }

        setSending(true);
        const toastId = toast.loading('Sending your message...');

        try {
            const response = await contactApi.send(formData);

            if (response.data.success) {
                toast.success(response.data.message || 'Message sent! We\'ll get back to you soon.', { id: toastId });
                setFormData({ name: '', email: '', message: '' });
            } else {
                toast.error(response.data.message || 'Something went wrong.', { id: toastId });
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again later.';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-yellow font-sans text-brand-black flex flex-col selection:bg-black selection:text-brand-yellow overflow-hidden">
            <SEO
                title="Contact BudgetTracko - Support & Feedback"
                description="Need help? Have a suggestion? Contact the BudgetTracko team. We value your feedback to make the best student expense manager."
                keywords="contact budget tracko, support, feedback, customer service, bhargav karande"
                canonical="https://www.budgettracko.app/contact"
            />
            {/* Nav */}
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="fixed top-0 w-full bg-brand-yellow/90 dark:bg-black/70 backdrop-blur-md z-50 border-b-2 border-brand-black dark:border-white/20 transition-colors shadow-sm dark:shadow-white/5"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <Link to="/" className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-1 sm:gap-2 text-brand-black dark:text-white">
                        <span className="text-[#1a1a1a] dark:text-white transition-colors">BUDGET</span>
                        <span className="text-white bg-black dark:bg-white dark:text-black px-1 transform -rotate-2 border-2 border-black dark:border-white transition-colors">TRACKO</span>
                    </Link>
                    <Link to="/">
                        <motion.span
                            whileHover={{ x: -4, boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block font-bold border-2 border-black dark:border-white px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-sm sm:text-base"
                        >
                            ← Back Home
                        </motion.span>
                    </Link>
                </div>
            </motion.nav>

            <div className="flex-grow flex items-start sm:items-center justify-center pt-20 sm:pt-24 pb-4 px-4 sm:px-6">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 items-start">

                    {/* Contact Info — slides from left */}
                    <motion.div
                        variants={slideFromLeft}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.h1
                            className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-8 uppercase leading-none tracking-tighter"
                        >
                            {'Let\'s'.split('').map((char, i) => (
                                <motion.span
                                    key={`l-${i}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                                    className="inline-block"
                                >
                                    {char}
                                </motion.span>
                            ))}
                            <br />
                            {'Talk.'.split('').map((char, i) => (
                                <motion.span
                                    key={`t-${i}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.6 + i * 0.06 }}
                                    className="inline-block"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className="text-base sm:text-xl font-bold mb-6 sm:mb-12 max-w-md"
                        >
                            Have a question, suggestion, or just want to say hi? We'd love to hear from you.
                        </motion.p>

                        <motion.div
                            className="space-y-4 sm:space-y-8"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div
                                variants={staggerItem}
                                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                                className="border-l-4 border-black pl-4 sm:pl-6"
                            >
                                <h3 className="font-black text-base sm:text-xl mb-0.5 sm:mb-1 uppercase">Email Us</h3>
                                <p className="font-medium text-sm sm:text-lg">bhargavk056@gmail.com</p>
                            </motion.div>
                            <motion.div
                                variants={staggerItem}
                                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                                className="border-l-4 border-black pl-4 sm:pl-6"
                            >
                                <h3 className="font-black text-base sm:text-xl mb-0.5 sm:mb-1 uppercase">Visit Us</h3>
                                <p className="font-medium text-sm sm:text-lg">Kothrud, Pune,<br />Maharashtra 411038</p>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Contact Form — slides from right */}
                    <motion.div
                        variants={slideFromRight}
                        initial="hidden"
                        animate="visible"
                        className="bg-white border-3 sm:border-4 border-black p-5 sm:p-8 md:p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative"
                    >
                        {/* Badge bounces in */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0, rotate: 10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 2 }}
                            transition={{
                                type: 'spring',
                                stiffness: 260,
                                damping: 20,
                                delay: 0.8,
                            }}
                            className="absolute top-0 right-0 bg-black text-brand-yellow font-bold px-3 py-1 sm:px-4 text-xs sm:text-sm transform translate-x-1 sm:translate-x-2 -translate-y-1 sm:-translate-y-2 border-2 border-white"
                        >
                            We reply fast! ⚡
                        </motion.div>

                        <motion.form
                            className="space-y-4 sm:space-y-6"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            onSubmit={handleSubmit}
                        >
                            <motion.div variants={staggerItem}>
                                <label className="block text-sm font-black uppercase tracking-wide mb-2">Your Name</label>
                                <motion.input
                                    whileFocus={{ scale: 1.02, x: -2, y: -2 }}
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all font-bold placeholder-gray-400"
                                    placeholder="John Doe"
                                    required
                                />
                            </motion.div>
                            <motion.div variants={staggerItem}>
                                <label className="block text-sm font-black uppercase tracking-wide mb-2">Email Address</label>
                                <motion.input
                                    whileFocus={{ scale: 1.02, x: -2, y: -2 }}
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all font-bold placeholder-gray-400"
                                    placeholder="john@example.com"
                                    required
                                />
                            </motion.div>
                            <motion.div variants={staggerItem}>
                                <label className="block text-sm font-black uppercase tracking-wide mb-2">Message</label>
                                <motion.textarea
                                    whileFocus={{ scale: 1.02, x: -2, y: -2 }}
                                    rows="4"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all font-bold placeholder-gray-400 resize-none"
                                    placeholder="How can we help you today?"
                                    required
                                ></motion.textarea>
                            </motion.div>
                            <motion.button
                                variants={staggerItem}
                                type="submit"
                                disabled={sending}
                                whileHover={!sending ? { y: -3, boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)', backgroundColor: '#FFD700', color: '#000' } : {}}
                                whileTap={!sending ? { scale: 0.97 } : {}}
                                className="w-full bg-black text-white font-black text-lg py-4 border-2 border-black transition-all uppercase tracking-widest disabled:opacity-70"
                            >
                                {sending ? 'Sending...' : 'Send Message'}
                            </motion.button>
                        </motion.form>
                    </motion.div>
                </div>
            </div>

            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="py-8 text-center font-bold text-sm opacity-60"
            >
                &copy; 2026 BudgetTracko.
            </motion.footer>
        </div>
    );
};

export default Contact;
