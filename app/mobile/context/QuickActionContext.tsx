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
        QuickActions.setItems([
            {
                type: 'add_expense',
                title: 'Add Expense',
                subtitle: 'Record a new expense',
                icon: 'add',
                params: { type: 'expense' }
            },
            {
                type: 'add_income',
                title: 'Add Income',
                subtitle: 'Record a new income',
                icon: 'add',
                params: { type: 'income' }
            }
        ]);

        const subscription = QuickActions.addListener((action) => {
            if (action.type === 'add_expense') {
                openModal('expense');
            } else if (action.type === 'add_income') {
                openModal('income');
            }
        });

        // Handle initial action if app was opened via quick action
        QuickActions.getInitialAction().then((action) => {
            if (action?.type === 'add_expense') {
                openModal('expense');
            } else if (action?.type === 'add_income') {
                openModal('income');
            }
        });

        return () => subscription.remove();
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
