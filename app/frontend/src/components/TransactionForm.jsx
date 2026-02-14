import { useForm } from 'react-hook-form';
import { useGlobalContext } from '../context/GlobalContext';
import { toast } from 'sonner';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsX, BsPaperclip, BsClock, BsImage, BsCashCoin, BsWallet2, BsArrowLeftRight } from 'react-icons/bs';

const TransactionForm = ({ onClose, initialData }) => {
    const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            type: 'expense',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            paymentMode: 'Cash',
            notes: ''
        }
    });

    const { addTransaction, updateTransaction, accounts, categories: userCategories } = useGlobalContext();
    const type = watch('type');
    const fileInputRef = useRef(null);

    // Tags state
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    // Attachments state
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                amount: Math.abs(initialData.amount),
                date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                time: initialData.time || '',
                accountId: initialData.accountId?._id || initialData.accountId || '',
                fromAccountId: initialData.fromAccountId?._id || initialData.fromAccountId || '',
                toAccountId: initialData.toAccountId?._id || initialData.toAccountId || '',
                notes: initialData.note || initialData.notes || ''
            });
            setTags(initialData.tags || []);
            setExistingAttachments(initialData.attachments || []);
        }
    }, [initialData, reset]);

    // Dynamic categories from API, with fallback defaults
    const defaultCats = {
        income: ['Salary', 'Business', 'Investment', 'Gift', 'Other'],
        expense: ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'],
        transfer: []
    };

    const categories = {
        income: userCategories.length > 0
            ? [...new Set(userCategories.filter(c => c.type === 'income' || c.type === 'both').map(c => c.name))]
            : defaultCats.income,
        expense: userCategories.length > 0
            ? [...new Set(userCategories.filter(c => c.type === 'expense' || c.type === 'both').map(c => c.name))]
            : defaultCats.expense,
        transfer: []
    };

    const paymentModes = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'];

    // Tag handlers
    const addTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
        if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    // File handlers
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalFiles = selectedFiles.length + existingAttachments.length + files.length;
        if (totalFiles > 3) {
            toast.error('Maximum 3 attachments allowed');
            return;
        }
        // Validate file sizes (2MB each for Cloudinary free plan)
        for (const file of files) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error(`"${file.name}" exceeds 2MB limit`);
                return;
            }
        }
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('type', data.type);
            formData.append('text', data.text);
            formData.append('amount', data.amount);
            formData.append('date', data.date);
            formData.append('time', data.time || '');
            formData.append('paymentMode', data.paymentMode);
            formData.append('note', data.notes || '');
            formData.append('tags', tags.join(','));

            if (data.type === 'transfer') {
                formData.append('fromAccountId', data.fromAccountId);
                formData.append('toAccountId', data.toAccountId);
            } else {
                formData.append('category', data.category);
                if (data.accountId) formData.append('accountId', data.accountId);
            }

            // Append files
            selectedFiles.forEach(file => {
                formData.append('attachments', file);
            });

            if (initialData) {
                await updateTransaction(initialData._id, formData);
            } else {
                await addTransaction(formData);
            }

            reset();
            setTags([]);
            setSelectedFiles([]);
            if (onClose) onClose();
        } catch (err) {
            // Error already handled in context
        } finally {
            setUploading(false);
        }
    };

    const inputClass = "mt-1 block w-full rounded-xl bg-light-bg dark:bg-dark-bg border-2 border-brand-black dark:border-gray-600 text-light-text dark:text-dark-text p-2.5 text-sm font-semibold focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 transition-all placeholder:text-light-text-secondary/50 dark:placeholder:text-dark-text-secondary/50";
    const labelClass = "block text-[11px] font-black uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            {/* Type Toggle */}
            <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
                <label className={`flex-1 cursor-pointer p-2.5 sm:p-3 text-center rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${type === 'income'
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400 neo-shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-light-text-secondary dark:text-dark-text-secondary hover:border-gray-400'
                    }`}>
                    <input type="radio" value="income" {...register('type', { required: 'Type is required' })} className="hidden" />
                    <BsCashCoin className="inline mr-1" size={14} /> Income
                </label>
                <label className={`flex-1 cursor-pointer p-2.5 sm:p-3 text-center rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${type === 'expense'
                    ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400 neo-shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-light-text-secondary dark:text-dark-text-secondary hover:border-gray-400'
                    }`}>
                    <input type="radio" value="expense" {...register('type', { required: 'Type is required' })} className="hidden" />
                    <BsWallet2 className="inline mr-1" size={14} /> Expense
                </label>
                <label className={`flex-1 cursor-pointer p-2.5 sm:p-3 text-center rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${type === 'transfer'
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400 neo-shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-light-text-secondary dark:text-dark-text-secondary hover:border-gray-400'
                    }`}>
                    <input type="radio" value="transfer" {...register('type', { required: 'Type is required' })} className="hidden" />
                    <BsArrowLeftRight className="inline mr-1" size={14} /> Transfer
                </label>
            </div>

            {/* Description */}
            <div>
                <label className={labelClass}>Description</label>
                <input
                    type="text"
                    {...register('text', { required: 'Description is required' })}
                    className={inputClass}
                    placeholder={type === 'transfer' ? 'e.g. Transfer to savings' : 'e.g. Coffee at Starbucks'}
                />
                {errors.text && <p className="text-red-500 text-xs font-bold mt-1">{errors.text.message}</p>}
            </div>

            {/* Transfer: From & To Account */}
            {type === 'transfer' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>From Account</label>
                        <select {...register('fromAccountId', { required: type === 'transfer' ? 'From account is required' : false })} className={inputClass}>
                            <option value="">Select</option>
                            {accounts.map(acc => (
                                <option key={acc._id} value={acc._id}>{acc.name} (₹{acc.balance?.toLocaleString()})</option>
                            ))}
                        </select>
                        {errors.fromAccountId && <p className="text-red-500 text-xs font-bold mt-1">{errors.fromAccountId.message}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>To Account</label>
                        <select {...register('toAccountId', { required: type === 'transfer' ? 'To account is required' : false })} className={inputClass}>
                            <option value="">Select</option>
                            {accounts.map(acc => (
                                <option key={acc._id} value={acc._id}>{acc.name} (₹{acc.balance?.toLocaleString()})</option>
                            ))}
                        </select>
                        {errors.toAccountId && <p className="text-red-500 text-xs font-bold mt-1">{errors.toAccountId.message}</p>}
                    </div>
                </div>
            ) : (
                /* Category & Amount Row */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Category</label>
                        <select
                            {...register('category', { required: type !== 'transfer' ? 'Category is required' : false })}
                            className={inputClass}
                        >
                            <option value="">Select</option>
                            {categories[type]?.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <p className="text-red-500 text-xs font-bold mt-1">{errors.category.message}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Account (Optional)</label>
                        <select {...register('accountId')} className={inputClass}>
                            <option value="">None</option>
                            {accounts.map(acc => (
                                <option key={acc._id} value={acc._id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Amount */}
            <div>
                <label className={labelClass}>Amount (₹)</label>
                <input
                    type="number"
                    step="0.01"
                    {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be positive' } })}
                    className={inputClass}
                    placeholder="0.00"
                />
                {errors.amount && <p className="text-red-500 text-xs font-bold mt-1">{errors.amount.message}</p>}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Date</label>
                    <input type="date" {...register('date', { required: 'Date is required' })} className={inputClass} />
                    {errors.date && <p className="text-red-500 text-xs font-bold mt-1">{errors.date.message}</p>}
                </div>
                <div>
                    <label className={labelClass}>
                        <BsClock className="inline mr-1" /> Time
                    </label>
                    <input type="time" {...register('time')} className={inputClass} />
                </div>
            </div>

            {/* Payment Mode (only for income/expense) */}
            {type !== 'transfer' && (
                <div>
                    <label className={labelClass}>Payment Mode</label>
                    <select {...register('paymentMode')} className={inputClass}>
                        {paymentModes.map(mode => (
                            <option key={mode} value={mode}>{mode}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Tags (Chip Input) */}
            <div>
                <label className={labelClass}>Tags</label>
                <div className={`flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-light-bg dark:bg-dark-bg border-2 border-brand-black dark:border-gray-600 min-h-[42px] focus-within:border-brand-yellow focus-within:ring-2 focus-within:ring-brand-yellow/30 transition-all`}>
                    <AnimatePresence>
                        {tags.map(tag => (
                            <motion.span
                                key={tag}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-yellow/20 text-brand-black dark:text-brand-yellow border border-brand-yellow/40 rounded-lg text-xs font-bold"
                            >
                                #{tag}
                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                                    <BsX size={14} />
                                </button>
                            </motion.span>
                        ))}
                    </AnimatePresence>
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        onBlur={addTag}
                        className="flex-1 min-w-[80px] bg-transparent outline-none text-sm font-semibold text-light-text dark:text-dark-text placeholder:text-light-text-secondary/50"
                        placeholder={tags.length === 0 ? 'Type and press Enter...' : ''}
                    />
                </div>
            </div>

            {/* Attachments */}
            <div>
                <label className={labelClass}>
                    <BsPaperclip className="inline mr-1" /> Attachments (max 2MB each, max 3)
                </label>
                <div className="space-y-2">
                    {/* Existing attachments */}
                    {existingAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {existingAttachments.map((att, i) => (
                                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg text-xs font-bold text-green-700 dark:text-green-400 hover:bg-green-100 transition-colors">
                                    <BsImage size={12} /> {att.name || 'Receipt'}
                                </a>
                            ))}
                        </div>
                    )}
                    {/* New file selections */}
                    {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedFiles.map((file, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-400">
                                    <BsImage size={12} /> {file.name}
                                    <button type="button" onClick={() => removeFile(i)} className="hover:text-red-500">
                                        <BsX size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={selectedFiles.length + existingAttachments.length >= 3}
                        className="w-full p-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <BsPaperclip /> Upload Receipt / Image
                    </button>
                </div>
            </div>

            {/* Notes (Optional) */}
            <div>
                <label className={labelClass}>Notes</label>
                <textarea
                    {...register('notes')}
                    className={inputClass}
                    rows="2"
                    placeholder="Add details..."
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={uploading}
                className={`w-full p-2.5 sm:p-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-brand-black transition-all disabled:opacity-50 ${type === 'income'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : type === 'transfer'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                style={{ boxShadow: '3px 3px 0px 0px #1a1a1a' }}
            >
                {uploading ? '⏳ Saving...' : (
                    initialData
                        ? `Update ${type === 'income' ? 'Income' : type === 'transfer' ? 'Transfer' : 'Expense'}`
                        : `+ Add ${type === 'income' ? 'Income' : type === 'transfer' ? 'Transfer' : 'Expense'}`
                )}
            </button>
        </form>
    );
};

export default TransactionForm;
