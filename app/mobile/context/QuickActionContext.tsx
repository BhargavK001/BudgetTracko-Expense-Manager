import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import * as QuickActions from 'expo-quick-actions';

type ModalType = 'expense' | 'income' | 'transfer' | undefined;

export interface ScanData {
    title: string;
    amount: string;
    notes: string;
    date: Date;
    category?: string; // OCR detected category
    attachments: string[];  // image URIs
}

interface QuickActionContextType {
    showModal: boolean;
    modalType: ModalType;
    scanData: ScanData | null;
    openModal: (type?: ModalType, scan?: ScanData) => void;
    closeModal: () => void;
}

const QuickActionContext = createContext<QuickActionContextType | undefined>(undefined);

export function QuickActionProvider({ children }: { children: ReactNode }) {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(undefined);
    const [scanData, setScanData] = useState<ScanData | null>(null);

    const openModal = useCallback((type?: ModalType, scan?: ScanData) => {
        setModalType(type);
        setScanData(scan || null);
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setModalType(undefined);
        setScanData(null);
    }, []);

    useEffect(() => {
        // Set static quick actions (fallback if app.json config isn't picked up immediately)
        try {
            if (typeof QuickActions.setItems === 'function') {
                QuickActions.setItems([
                    {
                        id: 'add_expense',
                        title: 'Add Expense',
                        subtitle: 'Record a new expense',
                        icon: 'add',
                        params: { type: 'expense' }
                    },
                    {
                        id: 'add_income',
                        title: 'Add Income',
                        subtitle: 'Record a new income',
                        icon: 'add',
                        params: { type: 'income' }
                    }
                ]);
            }
        } catch (e) {
            console.warn('QuickActions.setItems failed:', e);
        }

        let subscription: { remove: () => void } | undefined;
        try {
            if (typeof QuickActions.addListener === 'function') {
                subscription = QuickActions.addListener((action) => {
                    if (action.id === 'add_expense') {
                        openModal('expense');
                    } else if (action.id === 'add_income') {
                        openModal('income');
                    }
                });
            }
        } catch (e) {
            console.warn('QuickActions.addListener failed:', e);
        }

        // Handle initial action if app was opened via quick action
        try {
            const initialAction = QuickActions.initial;
            if (initialAction?.id === 'add_expense') {
                openModal('expense');
            } else if (initialAction?.id === 'add_income') {
                openModal('income');
            }
        } catch (e) {
            console.warn('Handling QuickActions.initial failed:', e);
        }

        return () => {
            if (subscription && typeof subscription.remove === 'function') {
                subscription.remove();
            }
        };
    }, [openModal]);

    return (
        <QuickActionContext.Provider value={{ showModal, modalType, scanData, openModal, closeModal }}>
            {children}
        </QuickActionContext.Provider>
    );
}

export function useQuickAction() {
    const ctx = useContext(QuickActionContext);
    if (!ctx) throw new Error('useQuickAction must be used within QuickActionProvider');
    return ctx;
}
