import { motion, AnimatePresence } from 'framer-motion';
import { BsExclamationTriangle, BsInfoCircle, BsX } from 'react-icons/bs';
import { useState } from 'react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info', // 'danger' | 'warning' | 'info'
    requireInput = false,
    inputPlaceholder = '',
    expectedInput = '' // The string user must type to confirm
}) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (requireInput && inputValue !== expectedInput) {
            setError(true);
            return;
        }
        onConfirm();
    };

    const getIcon = () => {
        switch (type) {
            case 'danger':
            case 'warning':
                return <BsExclamationTriangle className="w-6 h-6 text-red-500" />;
            default:
                return <BsInfoCircle className="w-6 h-6 text-blue-500" />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-500 hover:bg-red-600 text-white';
            case 'warning':
                return 'bg-yellow-500 hover:bg-yellow-600 text-white';
            default:
                return 'bg-brand-primary hover:bg-brand-primary/90 text-brand-black';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border-2 border-brand-black dark:border-gray-700"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${type === 'danger' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                                    {getIcon()}
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                                <BsX className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                                {message}
                            </p>

                            {requireInput && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">
                                        Type <span className="text-red-500 font-mono select-all">{expectedInput}</span> to confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => {
                                            setInputValue(e.target.value);
                                            setError(false);
                                        }}
                                        placeholder={inputPlaceholder}
                                        className={`w-full p-2.5 rounded-lg border-2 bg-transparent text-sm font-medium transition-colors outline-none
                                            ${error
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:border-brand-primary'
                                            }`}
                                    />
                                    {error && (
                                        <p className="text-xs text-red-500 font-medium">
                                            Input does not match. Please try again.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={requireInput && inputValue !== expectedInput}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
