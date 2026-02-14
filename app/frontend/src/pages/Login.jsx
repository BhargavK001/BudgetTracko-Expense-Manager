
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate network request
        setTimeout(() => {
            setLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-brand-yellow font-sans flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-full h-2 bg-brand-black"></div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-2 text-brand-black">WELCOME BACK</h2>
                    <p className="text-gray-500 font-medium">Please enter your details.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-brand-black mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-black focus:ring-0 outline-none transition-colors bg-gray-50 font-medium"
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-brand-black mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-black focus:ring-0 outline-none transition-colors bg-gray-50 font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Log In'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm font-medium text-gray-500">
                    Don't have an account? <a href="#" className="text-brand-black hover:underline">Sign up</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
