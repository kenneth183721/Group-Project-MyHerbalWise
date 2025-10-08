import React, { useState, useEffect, useCallback } from 'react';

const ToastNotification = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClose = useCallback(() => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsVisible(false);
            onClose && onClose();
        }, 300); // Wait for animation to complete
    }, [onClose]);

    useEffect(() => {
        // Start animation after component mounts
        setTimeout(() => setIsAnimating(true), 10);

        // Auto-hide after duration
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, handleClose]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: '#d4edda',
                    borderColor: '#c3e6cb',
                    color: '#155724',
                    icon: '✅'
                };
            case 'error':
                return {
                    backgroundColor: '#f8d7da',
                    borderColor: '#f5c6cb',
                    color: '#721c24',
                    icon: '❌'
                };
            case 'warning':
                return {
                    backgroundColor: '#fff3cd',
                    borderColor: '#ffeaa7',
                    color: '#856404',
                    icon: '⚠️'
                };
            default: // info
                return {
                    backgroundColor: '#d1ecf1',
                    borderColor: '#bee5eb',
                    color: '#0c5460',
                    icon: 'ℹ️'
                };
        }
    };

    if (!isVisible) return null;

    const typeStyles = getTypeStyles();

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: isAnimating ? '20px' : '-400px',
                zIndex: 9999,
                minWidth: '300px',
                maxWidth: '400px',
                padding: '16px 20px',
                backgroundColor: typeStyles.backgroundColor,
                border: `1px solid ${typeStyles.borderColor}`,
                borderRadius: '8px',
                color: typeStyles.color,
                fontSize: '0.95rem',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease-in-out',
                transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
                opacity: isAnimating ? 1 : 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
            }}
            onClick={handleClose}
        >
            <span style={{ fontSize: '1.2rem' }}>{typeStyles.icon}</span>
            <div style={{ flex: 1 }}>
                {message}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
                style={{
                    background: 'none',
                    border: 'none',
                    color: typeStyles.color,
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    padding: '0',
                    opacity: 0.7,
                    transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0.7}
            >
                ×
            </button>
        </div>
    );
};

export default ToastNotification;
