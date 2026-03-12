import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ModalType = 'expense' | 'income' | 'transfer' | undefined;

export interface ScanData {
    title: string;
    amount: string;
    notes: string;
    date: Date;
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
