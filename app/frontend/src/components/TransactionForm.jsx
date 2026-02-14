
import { useForm } from 'react-hook-form';
import { useGlobalContext } from '../context/GlobalContext';
import { toast } from 'sonner';

const TransactionForm = ({ onClose }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { addTransaction } = useGlobalContext();

    const onSubmit = (data) => {
        const newTransaction = {
            id: Date.now(),
            text: data.text,
            amount: data.type === 'expense' ? -Math.abs(Number(data.amount)) : Math.abs(Number(data.amount)),
            date: data.date,
            type: data.type
        };

        addTransaction(newTransaction);
        toast.success(`${data.type === 'income' ? 'Income' : 'Expense'} of ₹${Math.abs(Number(data.amount))} added`);
        reset();
        if (onClose) onClose();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input
                    type="text"
                    {...register('text', { required: 'Description is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-dark-bg dark:border-gray-600 dark:text-white p-2 border"
                    placeholder="Enter description..."
                />
                {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input
                    type="number"
                    step="0.01"
                    {...register('amount', { required: 'Amount is required', min: 0.01 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-dark-bg dark:border-gray-600 dark:text-white p-2 border"
                    placeholder="Enter amount..."
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-dark-bg dark:border-gray-600 dark:text-white p-2 border"
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>

            <div className="flex gap-4">
                <label className="flex items-center">
                    <input
                        type="radio"
                        value="income"
                        {...register('type', { required: 'Type is required' })}
                        className="text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Income</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="radio"
                        value="expense"
                        {...register('type', { required: 'Type is required' })}
                        className="text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Expense</span>
                </label>
            </div>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}

            <button
                type="submit"
                className="w-full bg-primary text-white p-2 rounded-md hover:bg-opacity-90 transition-colors"
                style={{ backgroundColor: '#3b82f6' }} // Tailwind blue-500 fallback if primary not defined
            >
                Add Transaction
            </button>
        </form>
    );
};

export default TransactionForm;
