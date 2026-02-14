import { useForm } from 'react-hook-form';
import { useGlobalContext } from '../context/GlobalContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

const TransactionForm = ({ onClose, initialData }) => {
    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
        defaultValues: {
            type: 'expense',
            date: new Date().toISOString().split('T')[0],
            paymentMode: 'Cash',
            tags: '',
            notes: ''
        }
    });

    const { addTransaction, updateTransaction } = useGlobalContext();
    const type = watch('type');

    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                amount: Math.abs(initialData.amount),
                tags: initialData.tags ? initialData.tags.join(', ') : ''
            });
        }
    }, [initialData, reset]);

    const categories = {
        income: ['Salary', 'Business', 'Investment', 'Gift', 'Other'],
        expense: ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other']
    };

    const paymentModes = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'];

    const onSubmit = (data) => {
        const transactionData = {
            id: initialData ? initialData.id : Date.now(),
            text: data.text,
            amount: data.type === 'expense' ? -Math.abs(Number(data.amount)) : Math.abs(Number(data.amount)),
            date: data.date,
            type: data.type,
            category: data.category,
            paymentMode: data.paymentMode,
            notes: data.notes,
            tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : []
        };

        if (initialData) {
            updateTransaction(transactionData);
        } else {
            addTransaction(transactionData);
        }

        reset();
        if (onClose) onClose();
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
                    💰 Income
                </label>
                <label className={`flex-1 cursor-pointer p-2.5 sm:p-3 text-center rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${type === 'expense'
                    ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400 neo-shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-light-text-secondary dark:text-dark-text-secondary hover:border-gray-400'
                    }`}>
                    <input type="radio" value="expense" {...register('type', { required: 'Type is required' })} className="hidden" />
                    💸 Expense
                </label>
            </div>

            {/* Description */}
            <div>
                <label className={labelClass}>Description</label>
                <input
                    type="text"
                    {...register('text', { required: 'Description is required' })}
                    className={inputClass}
                    placeholder="e.g. Coffee at Starbucks"
                />
                {errors.text && <p className="text-red-500 text-xs font-bold mt-1">{errors.text.message}</p>}
            </div>

            {/* Category & Amount Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Category</label>
                    <select
                        {...register('category', { required: 'Category is required' })}
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
                    <label className={labelClass}>Amount (₹)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('amount', { required: 'Amount is required', min: 0.01 })}
                        className={inputClass}
                        placeholder="0.00"
                    />
                    {errors.amount && <p className="text-red-500 text-xs font-bold mt-1">{errors.amount.message}</p>}
                </div>
            </div>

            {/* Date & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Date</label>
                    <input
                        type="date"
                        {...register('date', { required: 'Date is required' })}
                        className={inputClass}
                    />
                    {errors.date && <p className="text-red-500 text-xs font-bold mt-1">{errors.date.message}</p>}
                </div>
                <div>
                    <label className={labelClass}>Payment Mode</label>
                    <select
                        {...register('paymentMode')}
                        className={inputClass}
                    >
                        {paymentModes.map(mode => (
                            <option key={mode} value={mode}>{mode}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tags (Optional) */}
            <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input
                    type="text"
                    {...register('tags')}
                    className={inputClass}
                    placeholder="e.g. work, coffee, date"
                />
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
                className={`w-full p-2.5 sm:p-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-brand-black transition-all ${type === 'income'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                style={{ boxShadow: '3px 3px 0px 0px #1a1a1a' }}
            >
                {initialData ? (type === 'income' ? 'Update Income' : 'Update Expense') : (type === 'income' ? '+ Add Income' : '+ Add Expense')}
            </button>
        </form>
    );
};

export default TransactionForm;
