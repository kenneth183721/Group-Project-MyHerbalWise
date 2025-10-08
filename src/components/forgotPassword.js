import React, { useState } from 'react';
import AuthAPI from '../services/authAPI';

function ForgotPassword({ navigate }) {
    const [step, setStep] = useState(1); // 1: email, 2: verification & password reset
    const [formData, setFormData] = useState({
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    // Step 1: Generate verification code
    const handleGenerateCode = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!formData.email) {
                setError('請輸入電子信箱');
                return;
            }

            const result = await AuthAPI.generateVerificationCode(formData.email);
            setGeneratedCode(result.data.verificationCode);
            setShowModal(true);
            setStep(2);
            
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!formData.verificationCode || !formData.newPassword || !formData.confirmPassword) {
                setError('請填寫所有欄位');
                return;
            }

            if (formData.newPassword !== formData.confirmPassword) {
                setError('新密碼與確認密碼不一致');
                return;
            }

            if (formData.newPassword.length < 6) {
                setError('密碼長度至少需要6個字元');
                return;
            }

            await AuthAPI.resetPassword(formData.email, formData.verificationCode, formData.newPassword);
            
            setSuccess('密碼重設成功！請使用新密碼登入');
            setShowModal(false);
            setStep(1);
            
            // Reset form and redirect after delay
            setTimeout(() => {
                navigate && navigate('signin');
            }, 2000);
            
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setStep(1);
        setError('');
        setFormData(prev => ({ 
            ...prev, 
            verificationCode: '', 
            newPassword: '', 
            confirmPassword: '' 
        }));
    };

    const resetAll = () => {
        setStep(1);
        setFormData({
            email: '',
            verificationCode: '',
            newPassword: '',
            confirmPassword: ''
        });
        setError('');
        setSuccess('');
        setShowModal(false);
        setGeneratedCode('');
    };

    return (
        <div style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            padding: '40px 20px'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                padding: '40px',
                width: '100%',
                maxWidth: '400px'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ 
                        color: '#284E35', 
                        fontSize: '2rem', 
                        marginBottom: '10px',
                        fontWeight: '600' 
                    }}>
                        忘記密碼
                    </h2>
                    <p style={{ color: '#666', fontSize: '1rem' }}>
                        重設您的帳戶密碼
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div style={{
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        border: '1px solid #c3e6cb'
                    }}>
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div style={{
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        border: '1px solid #f5c6cb'
                    }}>
                        {error}
                    </div>
                )}

                {/* Email Input Form */}
                <form onSubmit={handleGenerateCode}>
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="forgot-email" style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#333',
                            fontWeight: '500'
                        }}>
                            電子信箱
                        </label>
                        <input
                            type="email"
                            id="forgot-email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="請輸入您的電子信箱"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#284E35'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            backgroundColor: isLoading ? '#ccc' : '#284E35',
                            color: 'white',
                            padding: '14px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s ease',
                            marginBottom: '20px'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) e.target.style.backgroundColor = '#1a2e21';
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) e.target.style.backgroundColor = '#284E35';
                        }}
                    >
                        {isLoading ? '處理中...' : '獲取驗證碼'}
                    </button>
                </form>

                {/* Back to signin button */}
                <div style={{ textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => navigate && navigate('signin')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        返回登入
                    </button>
                </div>
            </div>

            {/* Verification Code Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                        padding: '30px',
                        width: '100%',
                        maxWidth: '450px',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '25px'
                        }}>
                            <h3 style={{
                                color: '#284E35',
                                fontSize: '1.5rem',
                                margin: 0,
                                fontWeight: '600'
                            }}>
                                重設密碼
                            </h3>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#666',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                ×
                            </button>
                        </div>

                        {/* Verification Code Display */}
                        <div style={{
                            backgroundColor: '#e8f5e8',
                            border: '2px solid #284E35',
                            borderRadius: '8px',
                            padding: '20px',
                            textAlign: 'center',
                            marginBottom: '25px'
                        }}>
                            <h4 style={{
                                color: '#284E35',
                                fontSize: '1.2rem',
                                marginBottom: '10px',
                                fontWeight: '600'
                            }}>
                                您的驗證碼
                            </h4>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#284E35',
                                letterSpacing: '8px',
                                fontFamily: 'monospace',
                                marginBottom: '10px'
                            }}>
                                {generatedCode}
                            </div>
                            <p style={{
                                color: '#666',
                                fontSize: '0.9rem',
                                margin: 0
                            }}>
                                驗證碼將於 10 分鐘後失效
                            </p>
                        </div>

                        {/* Error Message in Modal */}
                        {error && (
                            <div style={{
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '20px',
                                fontSize: '0.9rem',
                                border: '1px solid #f5c6cb'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Password Reset Form */}
                        <form onSubmit={handleResetPassword}>
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="verification-code" style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#333',
                                    fontWeight: '500'
                                }}>
                                    驗證碼
                                </label>
                                <input
                                    type="text"
                                    id="verification-code"
                                    value={formData.verificationCode}
                                    onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                                    placeholder="請輸入6位數驗證碼"
                                    maxLength="6"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '8px',
                                        fontSize: '1.2rem',
                                        fontFamily: 'monospace',
                                        textAlign: 'center',
                                        letterSpacing: '4px',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#284E35'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="new-password" style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#333',
                                    fontWeight: '500'
                                }}>
                                    新密碼
                                </label>
                                <input
                                    type="password"
                                    id="new-password"
                                    value={formData.newPassword}
                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                    placeholder="請輸入新密碼 (至少6個字元)"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#284E35'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label htmlFor="confirm-new-password" style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#333',
                                    fontWeight: '500'
                                }}>
                                    確認新密碼
                                </label>
                                <input
                                    type="password"
                                    id="confirm-new-password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    placeholder="請再次輸入新密碼"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#284E35'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '15px'
                            }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#fff',
                                        color: '#666',
                                        padding: '12px',
                                        border: '2px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = '#999';
                                        e.target.style.color = '#333';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = '#ddd';
                                        e.target.style.color = '#666';
                                    }}
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        backgroundColor: isLoading ? '#ccc' : '#284E35',
                                        color: 'white',
                                        padding: '12px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoading) e.target.style.backgroundColor = '#1a2e21';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isLoading) e.target.style.backgroundColor = '#284E35';
                                    }}
                                >
                                    {isLoading ? '重設中...' : '重設密碼'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ForgotPassword;
