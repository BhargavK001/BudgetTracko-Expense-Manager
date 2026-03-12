import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ModalType = 'expense' | 'income' | 'transfer' | undefined;

interface QuickActionContextType {
    showModal: boolean;
    modalType: ModalType;
    openModal: (type?: ModalType) => void;
    closeModal: () => void;
}

const QuickActionContext = createContext<QuickActionContextType | undefined>(undefined);

export function QuickActionProvider({ children }: { children: ReactNode }) {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(undefined);

    const openModal = useCallback((type?: ModalType) => {
        setModalType(type);
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setModalType(undefined);
    }, []);

    return (
        <QuickActionContext.Provider value={{ showModal, modalType, openModal, closeModal }}>
            {children}
        </QuickActionContext.Provider>
    );
}

export function useQuickAction() {
    const ctx = useContext(QuickActionContext);
    if (!ctx) throw new Error('useQuickAction must be used within QuickActionProvider');
    return ctx;
}
