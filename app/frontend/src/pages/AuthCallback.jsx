import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            login(token);
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } else {
            navigate('/login');
        }
    }, [location, login, navigate]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-brand-yellow font-sans">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">Authenticating...</h2>
                <p className="text-black/60 font-medium mt-2">Just a moment while we sign you in.</p>
            </motion.div>
        </div>
    );
};

export default AuthCallback;
