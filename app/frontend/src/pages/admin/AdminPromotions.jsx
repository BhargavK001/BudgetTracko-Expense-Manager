import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsTagFill, BsPlusCircleFill, BsTrashFill, BsCheckCircleFill, BsArrowLeft, BsArrowRight, BsChevronUp, BsInfoCircleFill } from 'react-icons/bs';
import { adminApi } from '../../services/adminApi';
import { toast } from 'sonner';

const couponTypes = [
    { value: 'percentage', label: 'Percentage Off', description: 'e.g. 50% off monthly price', emoji: '🏷️' },
    { value: 'fixed', label: 'Fixed Discount', description: 'e.g. ₹20 off per month', emoji: '💰' },
    { value: 'trial', label: 'Free Trial', description: 'e.g. 60 days free trial', emoji: '🎁' },
    { value: 'nominal', label: 'Nominal Price', description: 'e.g. ₹5 for 3 months', emoji: '⚡' },
];

const emptyForm = {
    code: '',
    type: 'percentage',
    value: 0,
    trialDays: 0,
    nominalPrice: 5,
    nominalDurationMonths: 1,
    applicablePlans: ['pro', 'squad'],
    expiryDate: '',
    usageLimit: 0,
    description: '',
};

const AdminPromotions = () => {
    const [coupons, setCoupons] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchCoupons = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            const res = await adminApi.getCoupons(params);
            setCoupons(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [statusFilter]);

    const handleCreate = async () => {
        if (!form.code.trim()) {
            toast.error('Coupon code is required');
            return;
        }
        setSaving(true);
        try {
            await adminApi.createCoupon(form);
            toast.success('Coupon created successfully');
            setShowCreateForm(false);
            setForm({ ...emptyForm });
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create coupon');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await adminApi.updateCoupon(id, { status: newStatus });
            toast.success(`Coupon ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
            fetchCoupons(pagination.page);
        } catch (error) {
            toast.error('Failed to update coupon');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await adminApi.deleteCoupon(id);
            toast.success('Coupon deleted');
            fetchCoupons(pagination.page);
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'percentage': return 'Percentage';
            case 'fixed': return 'Fixed';
            case 'trial': return 'Free Trial';
            case 'nominal': return 'Nominal';
            default: return type;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'percentage': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'fixed': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'trial': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            case 'nominal': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusColor = (status) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700';
    };

    const getDiscountDisplay = (coupon) => {
        switch (coupon.type) {
            case 'percentage': return `${coupon.value}% off`;
            case 'fixed': return `₹${coupon.value} off`;
            case 'trial': return `${coupon.trialDays} days free`;
            case 'nominal': return `₹${coupon.nominalPrice} × ${coupon.nominalDurationMonths}mo`;
            default: return '-';
        }
    };

    const filters = [
        { label: 'All', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tighter flex items-center gap-2 sm:gap-3">
                    <BsTagFill className="text-lg sm:text-xl lg:text-2xl" /> Promotions
                </h1>
                <p className="text-xs sm:text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                    Manage coupon codes & promotional offers
                </p>
            </motion.div>

            {/* Create Button — full width on mobile */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <motion.button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full neo-btn flex items-center justify-center gap-2 py-3 sm:py-3.5 text-sm sm:text-base ${showCreateForm
                        ? 'bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-600'
                        : 'neo-btn-primary'
                        }`}
                >
                    {showCreateForm ? (
                        <>
                            <BsChevronUp size={14} />
                            <span className="font-black">Close Form</span>
                        </>
                    ) : (
                        <>
                            <BsPlusCircleFill size={16} />
                            <span className="font-black">Create New Coupon</span>
                        </>
                    )}
                </motion.button>
            </motion.div>

            {/* Inline Create Form */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="neo-card p-4 sm:p-6 space-y-4 sm:space-y-5">
                            <h3 className="text-sm sm:text-base font-black uppercase tracking-tighter flex items-center gap-2">
                                <BsPlusCircleFill className="text-brand-yellow" size={16} />
                                New Coupon Details
                            </h3>

                            {/* Code & Description */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">
                                        Coupon Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. WELCOME50"
                                        className="neo-input uppercase text-sm"
                                    />
                                    <p className="text-[9px] text-light-text-secondary dark:text-dark-text-secondary">
                                        Users will enter this code at checkout
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">Description</label>
                                    <input
                                        type="text"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="e.g. Welcome offer for new users"
                                        className="neo-input text-sm"
                                    />
                                    <p className="text-[9px] text-light-text-secondary dark:text-dark-text-secondary">
                                        Internal note (not shown to users)
                                    </p>
                                </div>
                            </div>

                            {/* Discount Type */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">
                                    Discount Type
                                </label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                    {couponTypes.map((t) => (
                                        <motion.button
                                            key={t.value}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setForm({ ...form, type: t.value })}
                                            className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all ${form.type === t.value
                                                ? 'border-brand-black dark:border-brand-yellow bg-brand-yellow/10 dark:bg-brand-yellow/5'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                                }`}
                                        >
                                            <p className="text-[11px] sm:text-xs font-black leading-tight">
                                                {t.emoji} {t.label}
                                            </p>
                                            <p className="text-[9px] sm:text-[10px] text-light-text-secondary dark:text-dark-text-secondary leading-tight mt-0.5">{t.description}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Value Fields — dynamic based on type */}
                            <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <BsInfoCircleFill className="text-blue-500 flex-shrink-0" size={14} />
                                    <p className="text-[10px] sm:text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary">
                                        {form.type === 'percentage' && 'Set the percentage discount applied to the plan price each billing cycle.'}
                                        {form.type === 'fixed' && 'Set a flat rupee discount applied to each billing cycle.'}
                                        {form.type === 'trial' && 'User gets full plan access free for the trial period, then auto-charges at full price.'}
                                        {form.type === 'nominal' && 'User pays a small intro price for a set number of months, then auto-charges at the full plan price.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {form.type === 'percentage' && (
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">Discount Percentage</label>
                                            <div className="flex border-2 rounded-xl border-gray-200 dark:border-gray-700 overflow-hidden focus-within:border-brand-yellow transition-colors">
                                                <input
                                                    type="number"
                                                    value={form.value || ''}
                                                    onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) || 0 })}
                                                    placeholder="50"
                                                    min="1" max="100"
                                                    className="flex-1 px-3 py-2.5 bg-transparent text-sm font-bold outline-none"
                                                />
                                                <span className="flex items-center px-3 bg-gray-100 dark:bg-gray-800 text-sm font-black text-light-text-secondary dark:text-dark-text-secondary border-l-2 border-gray-200 dark:border-gray-700">%</span>
                                            </div>
                                            <p className="text-[9px] text-light-text-secondary dark:text-dark-text-secondary">Enter a value between 1 and 100</p>
                                        </div>
                                    )}

                                    {form.type === 'fixed' && (
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">Discount Amount</label>
                                            <div className="flex border-2 rounded-xl border-gray-200 dark:border-gray-700 overflow-hidden focus-within:border-brand-yellow transition-colors">
                                                <span className="flex items-center px-3 bg-gray-100 dark:bg-gray-800 text-sm font-black text-light-text-secondary dark:text-dark-text-secondary border-r-2 border-gray-200 dark:border-gray-700">₹</span>
                                                <input
                                                    type="number"
                                                    value={form.value || ''}
                                                    onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) || 0 })}
                                                    placeholder="20"
                                                    min="1"
                                                    className="flex-1 px-3 py-2.5 bg-transparent text-sm font-bold outline-none"
                                                />
                                            </div>
                                            <p className="text-[9px] text-light-text-secondary dark:text-dark-text-secondary">Flat amount deducted per billing cycle</p>
                                        </div>
                                    )}

                                    {form.type === 'trial' && (
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">Free Trial Duration</label>
                                            <div className="flex border-2 rounded-xl border-gray-200 dark:border-gray-700 overflow-hidden focus-within:border-brand-yellow transition-colors">
                                                <input
                                                    type="number"
                                                    value={form.trialDays || ''}
                                                    onChange={(e) => setForm({ ...form, trialDays: parseInt(e.target.value) || 0 })}
                                                    placeholder="60"
                                                    min="1"
                                                    className="flex-1 px-3 py-2.5 bg-transparent text-sm font-bold outline-none"
                                                />
                                                <span className="flex items-center px-3 bg-gray-100 dark:bg-gray-800 text-[10px] sm:text-xs font-black text-light-text-secondary dark:text-dark-text-secondary border-l-2 border-gray-200 dark:border-gray-700">DAYS</span>
                                            </div>
                                            <p className="text-[9px] text-light-text-secondary dark:text-dark-text-secondary">Full access during trial, then auto-charged at full price</p>
                                        </div>
                                    )}

                                    {form.type === 'nominal' && (
                                        <>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">Intro Price</label>
                                                <div className="flex border-2 rounded-xl border-gray-200 dark:border-gray-700 overflow-hidden focus-within:border-brand-yellow transition-colors">
                                                    <span className="flex items-center px-3 bg-gray-100 dark:bg-gray-800 text-sm font-black text-light-text-secondary dark:text-dark-text-secondary border-r-2 border-gray-200 dark:border-gray-700">₹</span>
                                                    <input
                                                        type="number"
                                                        value={form.nominalPrice || ''}
                                                        onChange={(e) => setForm({ ...form, nominalPrice: Math.max(5, parseInt(e.target.value) || 5) })}
                                                        placeholder="5"
                                                        min="5"
                                                        className="flex-1 px-3 py-2.5 bg-transparent text-sm font-bold outline-none"
                                                    />
                                                    <span className="flex items-center px-3 bg-gray-100 dark:bg-gray-800 text-[10px] sm:text-xs font-black text-light-text-secondary dark:text-dark-text-secondary border-l-2 border-gray-200 dark:border-gray-700">/ MONTH</span>
                                                </div>
                                                <p className="text-[9px] text-light-text-secondary dark:text-dark-text-secondary">Min ₹5 (Razorpay minimum). The reduced price users pay during the intro period.</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">Intro Duration</label>
                                                <div className="flex border-2 rounded-xl border-gray-200 dark:border-gray-700 overflow-hidden focus-within:border-brand-yellow transition-colors">
                                                    <input
                                                        type="number"
                                                        value={form.nominalDurationMonths || ''}
                                                        onChange={(e) => setForm({ ...form, nominalDurationMonths: parseInt(e.target.value) || 0 })}
                                                        placeholder="3"
                                                        min="1"
                                                        className="flex-1 px-3 py-2.5 bg-transparent text-sm font-bold outline-none"
                                                    />
                                                    <span className="flex items-center px-3 bg-gray-100 dark:bg-gray-800 text-[10px] sm:text-xs font-black text-light-text-secondary dark:text-dark-text-secondary border-l-2 border-gray-200 dark:border-gray-700">{(form.nominalDurationMonths || 0) === 1 ? 'MONTH' : 'MONTHS'}</span>
                                                </div>
                                                <p className="text-[9px] text-light-text-secondary dark:text-dark-text-secondary">How many months the intro price lasts</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Summary Preview */}
                                {form.code && (
                                    <div className="mt-3 sm:mt-4 p-3 bg-brand-yellow/10 dark:bg-brand-yellow/5 border-2 border-brand-yellow/30 rounded-xl">
                                        <p className="text-[10px] sm:text-xs font-bold text-light-text dark:text-dark-text">
                                            📋 <span className="font-black">Preview:</span> Coupon <span className="font-black text-brand-yellow bg-brand-black px-1.5 py-0.5 rounded text-[10px]">{form.code}</span>
                                        </p>
                                        <p className="text-xs sm:text-sm font-black text-light-text dark:text-dark-text mt-1.5">
                                            {form.type === 'percentage' && `→ ${form.value || 0}% off every billing cycle`}
                                            {form.type === 'fixed' && `→ ₹${form.value || 0} off every billing cycle`}
                                            {form.type === 'trial' && `→ ${form.trialDays || 0} days free trial, then full price`}
                                            {form.type === 'nominal' && `→ ₹${form.nominalPrice || 0}/month for ${form.nominalDurationMonths || 0} ${(form.nominalDurationMonths || 0) === 1 ? 'month' : 'months'}, then full price`}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Plans, Expiry & Limits */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">Applicable Plans</label>
                                    <div className="flex gap-4 py-2">
                                        {['pro', 'squad'].map((p) => (
                                            <label key={p} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.applicablePlans.includes(p)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setForm({ ...form, applicablePlans: [...form.applicablePlans, p] });
                                                        } else {
                                                            setForm({ ...form, applicablePlans: form.applicablePlans.filter(x => x !== p) });
                                                        }
                                                    }}
                                                    className="w-4 h-4 accent-brand-yellow"
                                                />
                                                <span className="text-xs sm:text-sm font-bold uppercase">{p === 'pro' ? 'Campus Pro' : 'Hostel Squad'}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={form.expiryDate}
                                        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                                        className="neo-input text-sm"
                                    />
                                    <p className="text-[9px] text-light-text-secondary dark:text-dark-text-secondary">Optional. Leave empty for no expiry.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={form.usageLimit || ''}
                                        onChange={(e) => setForm({ ...form, usageLimit: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                        placeholder="0 = unlimited"
                                        min="0"
                                        className="neo-input text-sm"
                                    />
                                    <p className="text-[9px] text-light-text-secondary dark:text-dark-text-secondary">Leave empty or 0 for unlimited redemptions</p>
                                </div>
                            </div>

                            {/* Actions — full width on mobile */}
                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => { setShowCreateForm(false); setForm({ ...emptyForm }); }}
                                    className="neo-btn border-gray-300 dark:border-gray-600 text-xs sm:text-sm py-2.5 w-full sm:w-auto"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleCreate}
                                    disabled={saving || !form.code.trim()}
                                    className="neo-btn neo-btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 w-full sm:w-auto"
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin"></span>
                                            Creating...
                                        </span>
                                    ) : (
                                        <>
                                            <BsCheckCircleFill size={14} />
                                            Create Coupon
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-1.5 sm:gap-2"
            >
                {filters.map((f) => (
                    <motion.button
                        key={f.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStatusFilter(f.value)}
                        className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 transition-colors ${statusFilter === f.value
                            ? 'bg-brand-black text-brand-yellow border-brand-black dark:bg-brand-yellow dark:text-brand-black dark:border-brand-yellow'
                            : 'bg-white text-brand-black border-gray-300 dark:bg-dark-card dark:text-dark-text dark:border-gray-700 hover:border-brand-black'
                            }`}
                    >
                        {f.label}
                    </motion.button>
                ))}
                <span className="text-[9px] sm:text-[10px] font-bold text-light-text-secondary dark:text-dark-text-secondary flex items-center ml-2">
                    {pagination.total} coupon{pagination.total !== 1 ? 's' : ''}
                </span>
            </motion.div>

            {/* Coupons List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-2 sm:space-y-3"
            >
                {loading ? (
                    <div className="flex items-center justify-center py-16 sm:py-20">
                        <div className="w-8 h-8 border-4 border-brand-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="neo-card p-8 sm:p-12 text-center">
                        <div className="text-4xl sm:text-5xl mb-3">🎟️</div>
                        <p className="text-sm sm:text-base font-black text-light-text-secondary dark:text-dark-text-secondary">No coupons found</p>
                        <p className="text-[10px] sm:text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 max-w-xs mx-auto">
                            Create your first coupon above to start offering promotions to users
                        </p>
                        {!showCreateForm && (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setShowCreateForm(true)}
                                className="neo-btn neo-btn-primary mt-4 text-xs sm:text-sm py-2.5 px-6"
                            >
                                <BsPlusCircleFill size={14} className="inline mr-2" />
                                Create First Coupon
                            </motion.button>
                        )}
                    </div>
                ) : (
                    coupons.map((coupon) => (
                        <motion.div
                            key={coupon._id}
                            whileHover={{ x: 3 }}
                            className="neo-card p-3 sm:p-4"
                        >
                            <div className="flex flex-col gap-2.5 sm:gap-3">
                                {/* Top Row: Icon + Code + Status + Type */}
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 border-brand-black bg-brand-yellow text-brand-black flex items-center justify-center font-black flex-shrink-0">
                                        <BsTagFill className="text-sm sm:text-lg" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                            <p className="text-xs sm:text-sm font-black tracking-wider">{coupon.code}</p>
                                            <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md border ${getStatusColor(coupon.status)}`}>
                                                {coupon.status}
                                            </span>
                                            <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md border ${getTypeColor(coupon.type)}`}>
                                                {getTypeLabel(coupon.type)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] sm:text-[11px] text-light-text-secondary dark:text-dark-text-secondary truncate mt-0.5">
                                            {coupon.description || getDiscountDisplay(coupon)}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Row: Details + Actions */}
                                <div className="flex items-center justify-between pl-10 sm:pl-13">
                                    {/* Meta info */}
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-[9px] sm:text-[10px] font-bold text-light-text-secondary dark:text-dark-text-secondary">
                                        <span className="px-1.5 sm:px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black">
                                            {getDiscountDisplay(coupon)}
                                        </span>
                                        <span>
                                            {coupon.usageLimit > 0 ? `${coupon.usedCount}/${coupon.usageLimit}` : `${coupon.usedCount}`} used
                                        </span>
                                        <span>
                                            {coupon.applicablePlans.map(p => p.toUpperCase()).join(', ')}
                                        </span>
                                        {coupon.expiryDate && (
                                            <span>
                                                Exp: {new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleToggleStatus(coupon._id, coupon.status)}
                                            className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border-2 transition-colors ${coupon.status === 'active'
                                                ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                                                : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                                                }`}
                                        >
                                            {coupon.status === 'active' ? 'Off' : 'On'}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDelete(coupon._id)}
                                            className="p-1.5 sm:p-2 rounded-md sm:rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <BsTrashFill className="text-[10px] sm:text-xs" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchCoupons(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="neo-btn neo-btn-dark disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm py-2 px-3"
                    >
                        <BsArrowLeft size={12} /> Prev
                    </motion.button>
                    <span className="text-xs sm:text-sm font-black">
                        {pagination.page} / {pagination.pages}
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchCoupons(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="neo-btn neo-btn-dark disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm py-2 px-3"
                    >
                        Next <BsArrowRight size={12} />
                    </motion.button>
                </div>
            )}

            {/* Where Coupons Are Used — Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="neo-card p-4 sm:p-5 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50"
            >
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-tighter flex items-center gap-2 mb-2">
                    <BsInfoCircleFill className="text-blue-500" size={14} />
                    Where Coupons Are Used
                </h4>
                <div className="space-y-1.5 text-[10px] sm:text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                    <p>• Users enter coupon codes on the <span className="font-black text-light-text dark:text-dark-text">Pricing Page</span> before subscribing</p>
                    <p>• The code is validated and the discount is applied during <span className="font-black text-light-text dark:text-dark-text">Razorpay checkout</span></p>
                    <p>• <span className="font-black text-light-text dark:text-dark-text">Trial</span> & <span className="font-black text-light-text dark:text-dark-text">Nominal</span> types delay or reduce the first charge via Razorpay's subscription API</p>
                    <p>• Usage count auto-increments when a coupon is successfully redeemed</p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminPromotions;
