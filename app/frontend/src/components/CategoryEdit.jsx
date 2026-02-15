import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalContext } from '../context/GlobalContext';
import { toast } from 'sonner';
import {
    BsCart, BsHouse, BsCashCoin, BsPiggyBank, BsController, BsHeartPulse, BsBook,
    BsBriefcase, BsCreditCard, BsGift, BsGlobe, BsMusicNote, BsPhone, BsTools,
    BsTruck, BsWallet2, BsX, BsPlusLg, BsPencil, BsTrash, BsCheckLg
} from 'react-icons/bs';

// Icon Map for rendering and selection
const iconMap = {
    'BsCart': BsCart,
    'BsHouse': BsHouse,
    'BsCashCoin': BsCashCoin,
    'BsPiggyBank': BsPiggyBank,
    'BsController': BsController,
    'BsHeartPulse': BsHeartPulse,
    'BsBook': BsBook,
    'BsBriefcase': BsBriefcase,
    'BsCreditCard': BsCreditCard,
    'BsGift': BsGift,
    'BsGlobe': BsGlobe,
    'BsMusicNote': BsMusicNote,
    'BsPhone': BsPhone,
    'BsTools': BsTools,
    'BsTruck': BsTruck,
    'BsWallet2': BsWallet2,
};

const CategoryEdit = ({ onClose }) => {
    const { categories, addCategory, updateCategory, deleteCategory } = useGlobalContext();
    const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form Setup
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            type: 'expense',
            icon: 'BsCart',
            color: '#3b82f6'
        }
    });

    const selectedIcon = watch('icon');
    const selectedColor = watch('color');

    // Filter categories by tabs
    const [activeTab, setActiveTab] = useState('expense');
    const filteredCategories = categories.filter(c => c.type === activeTab || c.type === 'both');

    const handleEdit = (cat) => {
        setEditingId(cat._id);
        reset({
            name: cat.name,
            type: cat.type,
            icon: cat.icon || 'BsCart',
            color: cat.color || '#3b82f6'
        });
        setView('edit');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will not delete transactions but will remove the category from future use.')) {
            await deleteCategory(id);
        }
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            if (view === 'add') {
                await addCategory(data);
                toast.success('Category added');
            } else {
                await updateCategory(editingId, data);
            }
            reset();
            setView('list');
        } catch (error) {
            // Error handled in context
        } finally {
            setSaving(false);
        }
    };

    // Styling
    const inputClass = "w-full rounded-xl bg-light-bg dark:bg-dark-bg border-2 border-gray-200 dark:border-gray-700 py-3 px-4 text-sm font-bold focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all";
    const labelClass = "block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1";

    // Sub-components
    const IconPicker = () => (
        <div className="grid grid-cols-6 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl max-h-40 overflow-y-auto">
            {Object.keys(iconMap).map(iconKey => {
                const Icon = iconMap[iconKey];
                return (
                    <button
                        key={iconKey}
                        type="button"
                        onClick={() => setValue('icon', iconKey)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${selectedIcon === iconKey
                                ? 'bg-brand-primary text-white shadow-md scale-110'
                                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Icon size={18} />
                    </button>
                )
            })}
        </div>
    );

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl border-2 border-brand-black dark:border-gray-700 p-4 mt-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black uppercase tracking-tight">
                    {view === 'list' ? 'Manage Categories' : view === 'add' ? 'Add Category' : 'Edit Category'}
                </h3>
                {view === 'list' && (
                    <button
                        onClick={() => { reset(); setView('add'); }}
                        className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    >
                        <BsPlusLg size={16} />
                    </button>
                )}
                {view !== 'list' && (
                    <button
                        onClick={() => setView('list')}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        <BsX size={20} />
                    </button>
                )}
            </div>

            {/* LIST VIEW */}
            {view === 'list' && (
                <div className="space-y-4">
                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <button
                            onClick={() => setActiveTab('expense')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'expense' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-black dark:text-white' : 'text-gray-500'}`}
                        >
                            Expense
                        </button>
                        <button
                            onClick={() => setActiveTab('income')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'income' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-black dark:text-white' : 'text-gray-500'}`}
                        >
                            Income
                        </button>
                    </div>

                    {/* Category List */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {filteredCategories.length === 0 && (
                            <p className="text-center text-xs text-gray-400 py-4">No categories found.</p>
                        )}
                        {filteredCategories.map(cat => {
                            const Icon = iconMap[cat.icon] || BsCart;
                            return (
                                <div key={cat._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                                            style={{ backgroundColor: cat.color || '#3b82f6' }}
                                        >
                                            <Icon size={14} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{cat.name}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                                            <BsPencil size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                                            <BsTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ADD/EDIT FORM */}
            {view !== 'list' && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    {/* Name */}
                    <div>
                        <label className={labelClass}>Category Name</label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            className={inputClass}
                            placeholder="e.g. Groceries"
                        />
                        {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name.message}</p>}
                    </div>

                    {/* Type */}
                    <div>
                        <label className={labelClass}>Type</label>
                        <select {...register('type')} className={inputClass}>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                            <option value="both">Both</option>
                        </select>
                    </div>

                    {/* Icon Picker */}
                    <div>
                        <label className={labelClass}>Select Icon</label>
                        <IconPicker />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className={labelClass}>Color</label>
                        <div className="flex gap-2 overflow-x-auto py-1">
                            {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setValue('color', color)}
                                    className={`w-6 h-6 rounded-full shrink-0 transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => { reset(); setView('list'); }}
                            className="flex-1 py-2.5 rounded-xl border-2 border-brand-black dark:border-gray-600 font-black uppercase tracking-wider text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white font-black uppercase tracking-wider text-xs hover:translate-y-[-2px] active:translate-y-[0px] active:scale-[0.98] neo-shadow-sm transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : view === 'add' ? 'Add Category' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CategoryEdit;
