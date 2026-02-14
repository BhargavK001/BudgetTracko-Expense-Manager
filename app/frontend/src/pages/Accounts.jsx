import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BsBank2, BsCashStack, BsPencilSquare, BsPlus, BsWallet2, BsCreditCard2Front } from 'react-icons/bs';
import SEO from '../components/common/SEO';

const Accounts = () => {
    const { theme } = useTheme();

    // Mock Accounts Data
    const [accounts, setAccounts] = useState([
        { id: 1, name: 'HDFC Bank', type: 'Bank', balance: 25400, icon: BsBank2, color: 'bg-blue-600' },
        { id: 2, name: 'Cash in Hand', type: 'Cash', balance: 4500, icon: BsCashStack, color: 'bg-green-600' },
        { id: 3, name: 'PhonePe Wallet', type: 'Wallet', balance: 1250, icon: BsWallet2, color: 'bg-purple-600' },
        { id: 4, name: 'SBI Credit Card', type: 'Credit', balance: -15000, icon: BsCreditCard2Front, color: 'bg-brand-black' }
    ]);

    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    return (
        <div className="space-y-4 sm:space-y-6 pb-20">
            <SEO
                title="Accounts | BudgetTracko"
                description="Manage your bank accounts, wallets, and cards."
            />
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center gap-2"
            >
                <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Accounts</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary font-semibold text-xs sm:text-sm">Manage your money sources</p>
                </div>
                <button className="neo-btn neo-btn-primary flex items-center gap-1.5 sm:gap-2 shrink-0 text-[10px] sm:text-xs px-2.5 sm:px-4">
                    <BsPlus size={18} /> <span className="hidden sm:inline">Add Account</span>
                </button>
            </motion.div>

            {/* Total Net Worth */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="neo-card p-4 sm:p-6 bg-gradient-to-r from-brand-black to-gray-900 text-white relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10">
                    <BsBank2 size={140} className="sm:w-[200px] sm:h-[200px]" />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Net Worth</p>
                    <h3 className="text-2xl sm:text-4xl font-black break-all sm:break-normal">₹{totalBalance.toLocaleString()}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1.5 sm:mt-2 font-medium">Across {accounts.length} accounts</p>
                </div>
            </motion.div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                {accounts.map((acc, index) => (
                    <motion.div
                        key={acc.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="neo-card p-4 sm:p-5 group hover:border-brand-primary transition-colors cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 ${acc.color} rounded-xl flex items-center justify-center text-white text-lg sm:text-xl shadow-lg`}>
                                    <acc.icon />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm sm:text-lg truncate">{acc.name}</h4>
                                    <span className="text-[10px] sm:text-xs font-bold uppercase px-1.5 sm:px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">{acc.type}</span>
                                </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-brand-primary shrink-0">
                                <BsPencilSquare size={16} />
                            </button>
                        </div>

                        <div className="flex justify-between items-end gap-2">
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-xs font-bold text-gray-400 mb-0.5">Current Balance</p>
                                <h3 className={`text-lg sm:text-2xl font-black truncate ${acc.balance < 0 ? 'text-red-500' : 'text-light-text dark:text-dark-text'}`}>
                                    ₹{acc.balance.toLocaleString()}
                                </h3>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400">Last updated</p>
                                <p className="text-[10px] sm:text-xs font-bold">Today, 10:30 AM</p>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Add New Mock Card */}
                <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all gap-2 min-h-[120px] sm:min-h-[160px]"
                >
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <BsPlus size={30} />
                    </div>
                    <span className="font-black text-sm uppercase">Link New Account</span>
                </motion.button>
            </div>
        </div>
    );
};

export default Accounts;
