import React, { createContext, useContext, useState } from 'react';
import ToastNotification from './ToastNotification';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration };
        
        setToasts(prev => [...prev, newToast]);

        // Auto-remove after duration + animation time
        setTimeout(() => {
            removeToast(id);
        }, duration + 500);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Convenience methods for different toast types
    const success = (message, duration) => addToast(message, 'success', duration);
    const error = (message, duration) => addToast(message, 'error', duration);
    const warning = (message, duration) => addToast(message, 'warning', duration);
    const info = (message, duration) => addToast(message, 'info', duration);

    return (
        <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
            {children}
            <div 
                id="toast-container"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    zIndex: 10000,
                    pointerEvents: 'none'
                }}
            >
                {toasts.map((toast, index) => (
                    <div 
                        key={toast.id}
                        style={{
                            marginTop: index > 0 ? '10px' : '0',
                            pointerEvents: 'auto'
                        }}
                    >
                        <ToastNotification
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
