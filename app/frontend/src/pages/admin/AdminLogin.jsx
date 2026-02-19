import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { BsShieldLockFill, BsKeyFill, BsLockFill, BsShieldFill, BsShieldCheck, BsArrowLeft } from 'react-icons/bs';
import { authApi } from '../../services/api';

// Floating background icons config
const FLOAT_ICONS = [BsShieldLockFill, BsKeyFill, BsLockFill, BsShieldFill, BsShieldCheck];

const FloatingIcon = ({ index }) => {
    const config = useMemo(() => ({
        Icon: FLOAT_ICONS[index % FLOAT_ICONS.length],
        left: `${5 + (index * 17) % 90}%`,
        top: `${8 + (index * 23) % 80}%`,
        size: 16 + (index % 3) * 8,
        duration: 6 + (index % 4) * 2,
        delay: index * 0.4,
        opacity: 0.03 + (index % 3) * 0.015,
    }), [index]);

    return (
        <motion.div
            className="absolute pointer-events-none text-white"
            style={{ left: config.left, top: config.top, opacity: config.opacity }}
            animate={{
                y: [0, -20, 0, 15, 0],
                rotate: [0, 5, -5, 3, 0],
            }}
            transition={{
                duration: config.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: config.delay,
            }}
        >
            <config.Icon size={config.size} />
        </motion.div>
    );
};

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        toast.loading('Authenticating...', { id: 'admin-login' });

        try {
            const response = await authApi.login({ ...formData, expectedRole: 'admin' });
            if (response.data.success) {
                await login();
                const meResponse = await authApi.getMe();
                if (meResponse.data?.user?.role === 'admin') {
                    toast.success('Welcome, Administrator', { id: 'admin-login' });
                    navigate('/admin/dashboard');
                } else {
                    toast.error('Access denied. Admin privileges required.', { id: 'admin-login' });
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid credentials';
            toast.error(message, { id: 'admin-login' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen font-sans text-white selection:bg-brand-yellow selection:text-brand-black flex items-center justify-center overflow-hidden relative"
            style={{ background: '#0a0a0a' }}
        >
            {/* Dot grid background */}
            <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
                backgroundSize: '32px 32px'
            }} />

            {/* Floating security icons */}
            {Array.from({ length: 12 }).map((_, i) => (
                <FloatingIcon key={i} index={i} />
            ))}

            {/* Center glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{
                width: 500,
                height: 500,
                background: 'radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)',
            }} />

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative z-10 mx-4"
                style={{ width: '100%', maxWidth: 380 }}
            >
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: '#111111',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(255,215,0,0.04)',
                    }}
                >
                    {/* Gradient accent top */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="origin-left"
                        style={{ height: 3, background: 'linear-gradient(90deg, #FFD700, #F59E0B, #FFD700)' }}
                    />

                    <div style={{ padding: '32px 28px 28px' }}>
                        {/* Shield icon with pulse */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="flex justify-center mb-5"
                        >
                            <motion.div
                                animate={{
                                    boxShadow: [
                                        '0 0 20px rgba(255,215,0,0.15)',
                                        '0 0 40px rgba(255,215,0,0.25)',
                                        '0 0 20px rgba(255,215,0,0.15)',
                                    ]
                                }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="flex items-center justify-center rounded-2xl"
                                style={{
                                    width: 56,
                                    height: 56,
                                    background: '#FFD700',
                                    color: '#1a1a1a',
                                    border: '2px solid #FFD700',
                                }}
                            >
                                <BsShieldLockFill size={26} />
                            </motion.div>
                        </motion.div>

                        {/* Heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center mb-7"
                        >
                            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                                Admin Access
                            </h2>
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#666', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 4 }}>
                                Restricted Area
                            </p>
                        </motion.div>

                        {/* Form */}
                        <form onSubmit={handleLogin}>
                            {/* Email */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 }}
                                style={{ marginBottom: 16 }}
                            >
                                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#555', marginBottom: 6, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <HiOutlineMail
                                        className="absolute pointer-events-none"
                                        style={{
                                            left: 14, top: '50%', transform: 'translateY(-50%)',
                                            width: 18, height: 18,
                                            color: focusedField === 'email' ? '#FFD700' : '#444',
                                            transition: 'color 0.2s',
                                        }}
                                    />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="admin@budgettracko.app"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        style={{
                                            width: '100%',
                                            paddingLeft: 42,
                                            paddingRight: 14,
                                            paddingTop: 12,
                                            paddingBottom: 12,
                                            borderRadius: 12,
                                            border: `2px solid ${focusedField === 'email' ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                            background: '#1a1a1a',
                                            color: '#fff',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            outline: 'none',
                                            transition: 'border-color 0.2s, box-shadow 0.2s',
                                            boxShadow: focusedField === 'email' ? '0 0 12px rgba(255,215,0,0.08)' : 'none',
                                        }}
                                    />
                                </div>
                            </motion.div>

                            {/* Password */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                style={{ marginBottom: 20 }}
                            >
                                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#555', marginBottom: 6, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <HiOutlineLockClosed
                                        className="absolute pointer-events-none"
                                        style={{
                                            left: 14, top: '50%', transform: 'translateY(-50%)',
                                            width: 18, height: 18,
                                            color: focusedField === 'password' ? '#FFD700' : '#444',
                                            transition: 'color 0.2s',
                                        }}
                                    />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter admin password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        style={{
                                            width: '100%',
                                            paddingLeft: 42,
                                            paddingRight: 44,
                                            paddingTop: 12,
                                            paddingBottom: 12,
                                            borderRadius: 12,
                                            border: `2px solid ${focusedField === 'password' ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                            background: '#1a1a1a',
                                            color: '#fff',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            outline: 'none',
                                            transition: 'border-color 0.2s, box-shadow 0.2s',
                                            boxShadow: focusedField === 'password' ? '0 0 12px rgba(255,215,0,0.08)' : 'none',
                                        }}
                                    />
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute"
                                        style={{
                                            right: 12, top: '50%', transform: 'translateY(-50%)',
                                            color: '#555', padding: 4, background: 'none', border: 'none', cursor: 'pointer',
                                        }}
                                    >
                                        {showPassword ? <HiOutlineEyeOff style={{ width: 18, height: 18 }} /> : <HiOutlineEye style={{ width: 18, height: 18 }} />}
                                    </motion.button>
                                </div>
                            </motion.div>

                            {/* Submit */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                            >
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={!loading ? { scale: 1.02, y: -2, boxShadow: '0 8px 30px rgba(255,215,0,0.3)' } : {}}
                                    whileTap={!loading ? { scale: 0.98 } : {}}
                                    style={{
                                        width: '100%',
                                        padding: '14px 0',
                                        fontWeight: 900,
                                        fontSize: 13,
                                        color: '#1a1a1a',
                                        background: '#FFD700',
                                        border: '2px solid #FFD700',
                                        borderRadius: 12,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1,
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        boxShadow: '0 4px 20px rgba(255,215,0,0.15)',
                                        transition: 'opacity 0.2s',
                                    }}
                                >
                                    <AnimatePresence mode="wait">
                                        {loading ? (
                                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <motion.span
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                                    style={{
                                                        width: 18, height: 18,
                                                        border: '2px solid rgba(26,26,26,0.3)',
                                                        borderTopColor: '#1a1a1a',
                                                        borderRadius: '50%',
                                                        display: 'inline-block',
                                                    }}
                                                />
                                                <span>Authenticating...</span>
                                            </motion.div>
                                        ) : (
                                            <motion.span key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <BsShieldLockFill size={15} />
                                                <span>Access Admin Panel</span>
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </motion.div>
                        </form>

                        {/* Footer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <p style={{ textAlign: 'center', fontSize: 10, color: '#444', fontWeight: 600, letterSpacing: '0.5px' }}>
                                This is a restricted area. Unauthorized access attempts are logged.
                            </p>
                            <div style={{ textAlign: 'center', marginTop: 12 }}>
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-1"
                                    style={{ fontSize: 11, fontWeight: 700, color: '#555', textDecoration: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#FFD700'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#555'}
                                >
                                    <BsArrowLeft size={12} /> Back to Home
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom branding */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    style={{ textAlign: 'center', marginTop: 20, fontSize: 9, color: '#333', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}
                >
                    BudgetTracko Admin Console
                </motion.p>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
