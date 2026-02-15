import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { BsDownload, BsCreditCard2Front, BsCheckCircleFill, BsExclamationTriangleFill } from 'react-icons/bs';
import { toast } from 'sonner';

const Billing = () => {
    const { user, refreshUser } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transactionCount, setTransactionCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [historyRes, statsRes] = await Promise.all([
                    api.get('/api/payments/history'),
                    api.get('/api/transactions?limit=1') // Just to get total count if API supports pagination metadata
                ]);

                if (historyRes.data.success) {
                    setHistory(historyRes.data.payments);
                }

                // If transaction API returns count in metadata, use it. 
                // Otherwise we might need a specific endpoint for stats.
                // Assuming standard pagination response structure: { transactions: [], total: 100 }
                if (statsRes.data.total !== undefined) {
                    setTransactionCount(statsRes.data.total);
                } else if (Array.isArray(statsRes.data)) {
                    // Fallback if no total count
                    setTransactionCount(statsRes.data.length);
                }

            } catch (error) {
                console.error("Error fetching billing data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh user data to ensure plan status is up to date
        refreshUser();
    }, [refreshUser]);

    const handleCancelSubscription = () => {
        toast.custom((t) => (
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm">
                <div className="flex items-start gap-3">
                    <BsExclamationTriangleFill className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-black uppercase text-lg mb-1">Cancel Subscription?</h3>
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-4">
                            You will be downgraded to the Free plan immediately. This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => toast.dismiss(t)}
                                className="px-3 py-1.5 text-xs font-black uppercase border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                            >
                                No, Keep It
                            </button>
                            <button
                                onClick={async () => {
                                    toast.dismiss(t);
                                    await confirmCancel();
                                }}
                                className="px-3 py-1.5 text-xs font-black uppercase bg-red-500 text-white border-2 border-black dark:border-white hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ), { duration: Infinity });
    };

    const confirmCancel = async () => {
        const loadingToast = toast.loading('Canceling subscription...');
        try {
            const { data } = await api.post('/api/payments/cancel');
            if (data.success) {
                toast.dismiss(loadingToast);
                toast.success("Subscription canceled successfully.");
                await refreshUser();
            } else {
                toast.dismiss(loadingToast);
                toast.error(data.message || "Failed to cancel subscription");
            }
        } catch (error) {
            console.error("Error canceling subscription:", error);
            toast.dismiss(loadingToast);
            toast.error("An error occurred while canceling. Please try again.");
        }
    };

    const handleDownloadInvoice = (payment) => {
        const date = new Date(payment.createdAt).toLocaleDateString();
        const invoiceContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Invoice - ${payment.orderId}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
                        
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        
                        body { 
                            font-family: 'Plus Jakarta Sans', sans-serif; 
                            background-color: #fff;
                            color: #000;
                            -webkit-print-color-adjust: exact;
                            width: 210mm;
                            height: 297mm;
                            margin: 0 auto;
                        }

                        .container {
                            width: 100%;
                            height: 100%;
                            box-sizing: border-box;
                            padding: 40px;
                            position: relative;
                            border: none; /* Remove border for print, or keep inside padding if desired */
                        }

                        /* Add a visual border inside the A4 page */
                        .print-border {
                            border: 3px solid #000;
                            height: 100%;
                            box-sizing: border-box;
                            padding: 40px;
                            display: flex;
                            flex-direction: column;
                        }

                        .header { 
                            display: flex; 
                            justify-content: space-between; 
                            align-items: center;
                            margin-bottom: 40px; 
                            border-bottom: 3px solid #000; 
                            padding-bottom: 20px; 
                        }
                        .logo-text {
                            font-size: 28px;
                            font-weight: 900;
                            letter-spacing: -1px;
                            display: flex;
                            align-items: center;
                            gap: 5px;
                        }
                        .logo-highlight {
                            background: #000;
                            color: #fff;
                            padding: 2px 6px;
                            transform: rotate(-2deg);
                            display: inline-block;
                        }
                        .invoice-badge {
                            font-size: 32px;
                            font-weight: 900;
                            text-transform: uppercase;
                            color: #000;
                        }
                        .meta-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 40px;
                            margin-bottom: 40px;
                        }
                        .meta-box h3 {
                            font-size: 14px;
                            text-transform: uppercase;
                            color: #666;
                            margin: 0 0 10px 0;
                            font-weight: 800;
                        }
                        .meta-box p {
                            margin: 0;
                            font-size: 16px;
                            font-weight: 700;
                            line-height: 1.5;
                        }
                        .table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 30px; 
                            border: 2px solid #000;
                        }
                        .table th { 
                            text-align: left; 
                            padding: 15px; 
                            background: #000;
                            color: #fff;
                            text-transform: uppercase;
                            font-weight: 800;
                            font-size: 14px;
                        }
                        .table td { 
                            text-align: left; 
                            padding: 15px; 
                            border-bottom: 1px solid #000;
                            font-weight: 600;
                        }
                        .total-section {
                            display: flex;
                            justify-content: flex-end;
                            margin-top: 20px;
                            margin-bottom: auto; /* Push footer to bottom */
                        }
                        .total-box {
                            background: #facc15;
                            border: 2px solid #000;
                            padding: 15px 30px;
                            box-shadow: 4px 4px 0px 0px #000;
                            text-align: right;
                        }
                        .total-label {
                            font-size: 14px;
                            text-transform: uppercase;
                            font-weight: 800;
                            margin-bottom: 5px;
                        }
                        .total-amount {
                            font-size: 24px;
                            font-weight: 900;
                        }
                        .footer {
                            margin-top: 20px;
                            border-top: 2px dashed #000;
                            padding-top: 20px;
                            font-size: 12px;
                            color: #666;
                            display: flex;
                            justify-content: space-between;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="print-border">
                            <div class="header">
                                <div class="logo-text">
                                    BUDGET <span class="logo-highlight">TRACKO</span>
                                </div>
                                <div class="invoice-badge">Invoice</div>
                            </div>
                            
                            <div class="meta-grid">
                                <div class="meta-box">
                                    <h3>Billed To</h3>
                                    <p>${user.displayName}</p>
                                    <p>${user.email}</p>
                                </div>
                                <div class="meta-box">
                                    <h3>Invoice Details</h3>
                                    <p>Date: ${date}</p>
                                    <p>Order ID: ${payment.orderId}</p>
                                    <p>Payment Method: Razorpay</p>
                                </div>
                            </div>

                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Plan Type</th>
                                        <th style="text-align: right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Pro Subscription</td>
                                        <td>${payment.plan.toUpperCase()}</td>
                                        <td style="text-align: right">₹${payment.amount}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="total-section">
                                <div class="total-box">
                                    <div class="total-label">Total Paid</div>
                                    <div class="total-amount">₹${payment.amount}</div>
                                </div>
                            </div>

                            <div class="footer">
                                <div>Transaction ID: ${payment.paymentId || 'N/A'}</div>
                                <div>Thank you for your business!</div>
                            </div>
                        </div>
                    </div>
                    <script>
                        window.print();
                    </script>
                </body>
            </html>
        `;

        const win = window.open('', '_blank');
        win.document.write(invoiceContent);
        win.document.close();
    };

    const planName = user?.subscription?.plan || 'free';
    const isPro = planName !== 'free';
    const limit = planName === 'free' ? 50 : Infinity;
    const usagePercent = limit === Infinity ? 0 : Math.min((transactionCount / limit) * 100, 100);

    // Plan styling helper
    const getPlanStyle = (plan) => {
        switch (plan) {
            case 'squad':
                return 'bg-[#FFD700] text-black border-black';
            case 'pro':
                return 'bg-indigo-600 text-white border-black';
            default:
                return 'bg-gray-200 text-gray-800 border-gray-400';
        }
    };

    const getPlanLabel = (plan) => {
        switch (plan) {
            case 'squad': return 'HOSTEL SQUAD';
            case 'pro': return 'CAMPUS PRO';
            default: return 'STARTER FREE';
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'captured':
            case 'paid':
                return 'bg-green-200 text-green-800 border-green-800';
            case 'created':
                return 'bg-yellow-200 text-yellow-800 border-yellow-800';
            case 'failed':
                return 'bg-red-200 text-red-800 border-red-800';
            case 'processing':
                return 'bg-blue-200 text-blue-800 border-blue-800';
            default:
                return 'bg-gray-200 text-gray-800 border-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'captured':
            case 'paid':
                return 'Success';
            case 'created':
                return 'Pending';
            case 'failed':
                return 'Failed';
            case 'processing':
                return 'Processing';
            default:
                return status;
        }
    };

    return (
        <div className="min-h-screen bg-brand-gray p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Billing & Subscription</h1>
                    <Link to="/settings" className="font-bold underline hover:text-brand-yellow">Back to Settings</Link>
                </div>

                {/* Current Plan Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white text-black border-3 border-black p-6 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Current Plan</h2>
                            <div className="flex items-center gap-3">
                                <span className={`text-4xl sm:text-5xl font-black uppercase px-4 py-2 border-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${getPlanStyle(planName)} transform -rotate-1`}>
                                    {getPlanLabel(planName)}
                                </span>
                                {isPro && (
                                    <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-black border-2 border-green-600 shadow-[2px_2px_0px_0px_#16a34a] uppercase tracking-wide">
                                        Active
                                    </span>
                                )}
                            </div>
                        </div>
                        {!isPro ? (
                            <Link to="/pricing" className="bg-black text-white px-6 py-3 font-bold hover:bg-brand-yellow hover:text-black transition-colors border-2 border-transparent hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none">
                                Upgrade Now 🚀
                            </Link>
                        ) : (
                            <button
                                onClick={handleCancelSubscription}
                                className="text-red-500 font-bold hover:text-red-700 text-sm hover:underline mt-2 sm:mt-0"
                            >
                                Cancel Subscription
                            </button>
                        )}
                    </div>

                    {/* Usage Stats for Free Plan */}
                    {!isPro && (
                        <div className="mb-6">
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span>Monthly Transaction Limit</span>
                                <span>{transactionCount} / {limit} Used</span>
                            </div>
                            <div className="w-full bg-gray-200 h-4 border-2 border-black rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${usagePercent > 90 ? 'bg-red-500' : 'bg-brand-yellow'}`}
                                    style={{ width: `${usagePercent}%` }}
                                ></div>
                            </div>
                            {usagePercent >= 90 && (
                                <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1">
                                    <BsExclamationTriangleFill /> You are reaching your limit! Upgrade to retain access.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t-2 border-dashed border-gray-300">
                        <div className="flex items-center gap-3">
                            <BsCreditCard2Front size={24} />
                            <div>
                                <p className="font-bold">Payment Method</p>
                                <p className="text-sm text-gray-500">Razorpay Secure Checkout</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <BsCheckCircleFill size={24} className="text-green-500" />
                            <div>
                                <p className="font-bold">Next Billing Date</p>
                                <p className="text-sm text-gray-500">
                                    {user?.subscription?.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Payment History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-2xl font-black uppercase mb-4">Payment History</h3>
                    <div className="bg-white text-black border-3 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {loading ? (
                            <div className="p-8 text-center font-bold text-gray-500">Loading history...</div>
                        ) : history.length === 0 ? (
                            <div className="p-8 text-center font-bold text-gray-500">No payment history found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-black">
                                            <th className="p-4 font-black uppercase text-sm">Date</th>
                                            <th className="p-4 font-black uppercase text-sm">Plan</th>
                                            <th className="p-4 font-black uppercase text-sm">Amount</th>
                                            <th className="p-4 font-black uppercase text-sm">Status</th>
                                            <th className="p-4 font-black uppercase text-sm">Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((payment) => (
                                            <tr key={payment._id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="p-4 font-bold text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 font-bold text-sm uppercase">{payment.plan}</td>
                                                <td className="p-4 font-bold text-sm">₹{payment.amount}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-xs font-black uppercase border-2 ${getStatusStyle(payment.status)}`}>
                                                        {getStatusLabel(payment.status)}
                                                    </span>
                                                </td>

                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleDownloadInvoice(payment)}
                                                        className="flex items-center gap-1 text-sm font-bold border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none bg-white"
                                                    >
                                                        <BsDownload size={12} /> Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Billing;
