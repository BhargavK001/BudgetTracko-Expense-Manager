import { useGlobalContext } from '../context/GlobalContext';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsPencil, BsPlus, BsTrash, BsX, BsPalette } from 'react-icons/bs';
import { ICON_OPTIONS, getIconComponent } from '../utils/iconMap';

const COLOR_OPTIONS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1971', '#EF4444', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#14B8A6'];

const CategoryManager = ({ onClose }) => {
    const { categories, addCategory, updateCategory, deleteCategory } = useGlobalContext();

    const [showForm, setShowForm] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [formName, setFormName] = useState('');
    const [formIcon, setFormIcon] = useState('BsBox');
    const [formColor, setFormColor] = useState('#0088FE');
    const [formType, setFormType] = useState('expense');
    const [submitting, setSubmitting] = useState(false);

    const openAdd = () => {
        setEditingCat(null);
        setFormName('');
        setFormIcon('BsBox');
        setFormColor('#0088FE');
        setFormType('expense');
        setShowForm(true);
    };

    const openEdit = (cat) => {
        setEditingCat(cat);
        setFormName(cat.name);
        setFormIcon(cat.icon);
        setFormColor(cat.color);
        setFormType(cat.type);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formName.trim()) return;
        setSubmitting(true);
        try {
            const data = { name: formName.trim(), icon: formIcon, color: formColor, type: formType };
            if (editingCat) {
                await updateCategory(editingCat._id, data);
            } else {
                await addCategory(data);
            }
            setShowForm(false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category? Existing transactions with this category won\'t be affected.')) {
            await deleteCategory(id);
        }
    };

    // Render an icon from its name string
    const RenderIcon = ({ iconName, size = 16 }) => {
        const Icon = getIconComponent(iconName);
        return <Icon size={size} />;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="neo-card p-5 sm:p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black uppercase flex items-center gap-2">
                        <BsPalette /> Manage Categories
                    </h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <BsX size={20} />
                    </button>
                </div>

                {/* Category List */}
                <div className="space-y-2 mb-4">
                    {categories.map(cat => (
                        <div key={cat._id} className="flex items-center justify-between p-3 rounded-xl bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                                    <RenderIcon iconName={cat.icon} size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{cat.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{cat.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(cat)}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <BsPencil size={12} />
                                </button>
                                <button onClick={() => handleDelete(cat._id)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors">
                                    <BsTrash size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Button */}
                {!showForm && (
                    <button onClick={openAdd}
                        className="w-full neo-btn py-2.5 font-black uppercase text-sm flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 hover:text-brand-primary hover:border-brand-primary">
                        <BsPlus size={18} /> Add Category
                    </button>
                )}

                {/* Inline Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleSubmit}
                            className="overflow-hidden space-y-3 border-2 border-brand-yellow/40 rounded-xl p-4 mt-3"
                        >
                            <h4 className="text-sm font-black uppercase">{editingCat ? 'Edit' : 'New'} Category</h4>

                            {/* Name */}
                            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                                className="w-full neo-input py-2 px-3 text-sm" placeholder="Category name" required />

                            {/* Icon Picker */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Icon</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {ICON_OPTIONS.map(opt => {
                                        const OptIcon = opt.component;
                                        return (
                                            <button type="button" key={opt.key} onClick={() => setFormIcon(opt.key)}
                                                title={opt.label}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${formIcon === opt.key
                                                    ? 'bg-brand-yellow text-brand-black border-2 border-brand-black scale-110'
                                                    : 'bg-gray-100 dark:bg-gray-800 hover:scale-105 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                <OptIcon size={16} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Color</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {COLOR_OPTIONS.map(c => (
                                        <button type="button" key={c} onClick={() => setFormColor(c)}
                                            className={`w-7 h-7 rounded-full transition-all ${formColor === c ? 'ring-2 ring-offset-2 ring-brand-black scale-110' : 'hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Type */}
                            <div className="flex gap-2">
                                {['expense', 'income', 'both'].map(t => (
                                    <button type="button" key={t} onClick={() => setFormType(t)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${formType === t
                                            ? 'bg-brand-yellow text-brand-black border-2 border-brand-black'
                                            : 'border-2 border-gray-200 dark:border-gray-700 text-gray-500'
                                            }`}>
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 neo-btn py-2 text-xs font-bold">Cancel</button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 neo-btn neo-btn-primary py-2 text-xs font-bold">
                                    {submitting ? 'Saving...' : editingCat ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default CategoryManager;
