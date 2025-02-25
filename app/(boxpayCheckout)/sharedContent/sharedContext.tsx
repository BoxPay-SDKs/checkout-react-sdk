// SharedContext.tsx
import React, { createContext, useState, useContext } from 'react';

interface SharedContextProps {
    status: string;
    setStatus: (value: string) => void;
    transactionId: string;
    setTransactionId: (value: string) => void;
}

const SharedContext = createContext<SharedContextProps | undefined>(undefined);

export const useSharedContext = () => {
    const context = useContext(SharedContext);
    if (!context) {
        throw new Error("useSharedContext must be used within a SharedContextProvider");
    }
    return context;
};

export const SharedContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<string>(""); // Initialize with empty string
    const [transactionId, setTransactionId] = useState<string>(""); // Initialize with empty string

    const clearStatusAndTransactionId = () => {
        setStatus("");
        setTransactionId("");
    };


    const value: SharedContextProps = {
        status,
        setStatus,
        transactionId,
        setTransactionId,
    };

    return (
        <SharedContext.Provider value={value}>
            {children}
        </SharedContext.Provider>
    );
};