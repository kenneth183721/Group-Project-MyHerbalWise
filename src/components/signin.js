import React, { useState } from 'react';
import AuthAPI from '../services/authAPI';
import { useToast } from './ToastProvider';

function SignIn({ onLogin, navigate }) {
    const toast = useToast();
    const [currentView, setCurrentView] = useState('login'); // 'login' or 'forgot'
    
    // Login form state
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });
    
    // Forgot password form state
    const [forgotForm, setForgotForm] = useState({
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // Loading and error states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Modal and flow state
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    // Handle login form submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!loginForm.email || !loginForm.password) {
                toast.error('請填寫電子信箱和密碼');
                return;
            }

            const result = await AuthAPI.login(loginForm.email, loginForm.password);
            
            // Call the onLogin callback with user data
            onLogin(result.data);
            toast.success('登入成功！');
            
        } catch (error) {
            toast.error('登入失敗：' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle verification code generation
    const handleGenerateVerificationCode = async () => {
        setError('');
        setIsLoading(true);

        try {
            if (!forgotForm.email) {
                toast.error('請填寫電子信箱');
                return;
            }

            const result = await AuthAPI.generateVerificationCode(forgotForm.email);
            setGeneratedCode(result.data.verificationCode);
            setShowVerificationModal(true);
            setSuccessMessage('');
            toast.success('驗證碼已生成！');
            
        } catch (error) {
            toast.error('處理失敗：' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle password reset
    const handleResetPassword = async () => {
        setError('');
        setIsLoading(true);

        try {
            if (!forgotForm.verificationCode || !forgotForm.newPassword || !forgotForm.confirmPassword) {
                toast.error('請填寫所有欄位');
                return;
            }

            if (forgotForm.newPassword !== forgotForm.confirmPassword) {
                toast.error('新密碼與確認密碼不一致');
                return;
            }

            if (forgotForm.newPassword.length < 6) {
                toast.error('密碼長度至少需要6個字元');
                return;
            }

            await AuthAPI.resetPassword(
                forgotForm.email, 
                forgotForm.verificationCode, 
                forgotForm.newPassword
            );
            
            toast.success('密碼重設成功！請使用新密碼登入');
            setShowVerificationModal(false);
            setCurrentView('login');
            resetForm();
            
        } catch (error) {
            toast.error('重設失敗：' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setLoginForm({ email: '', password: '' });
        setForgotForm({ email: '', verificationCode: '', newPassword: '', confirmPassword: '' });
        setError('');
        setSuccessMessage('');
        setGeneratedCode('');
    };

    const switchView = (view) => {
        setCurrentView(view);
        setShowVerificationModal(false);
        resetForm();
    };

    const closeModal = () => {
        setShowVerificationModal(false);
        setError('');
        setForgotForm(prev => ({ ...prev, verificationCode: '', newPassword: '', confirmPassword: '' }));
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
                        {currentView === 'login' ? '會員登入' : '忘記密碼'}
                    </h2>
                    <p style={{ color: '#666', fontSize: '1rem' }}>
                        {currentView === 'login' ? '歡迎回到本草智膳' : '重設您的帳戶密碼'}
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div style={{
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        border: '1px solid #c3e6cb'
                    }}>
                        {successMessage}
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

                {/* Login Form */}
                {currentView === 'login' && (
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="login-email" style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#333',
                                fontWeight: '500'
                            }}>
                                電子信箱
                            </label>
                            <input
                                type="email"
                                id="login-email"
                                value={loginForm.email}
                                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
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

                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="login-password" style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#333',
                                fontWeight: '500'
                            }}>
                                密碼
                            </label>
                            <input
                                type="password"
                                id="login-password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="請輸入您的密碼"
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
                            {isLoading ? '登入中...' : '登入'}
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={() => switchView('forgot')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#284E35',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem'
                                }}
                            >
                                忘記密碼？
                            </button>
                        </div>
                    </form>
                )}

                {/* Forgot Password Form */}
                {currentView === 'forgot' && (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="forgot-email-signin" style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#333',
                                fontWeight: '500'
                            }}>
                                電子信箱
                            </label>
                            <input
                                type="email"
                                id="forgot-email-signin"
                                value={forgotForm.email}
                                onChange={(e) => setForgotForm(prev => ({ ...prev, email: e.target.value }))}
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
                            type="button"
                            onClick={handleGenerateVerificationCode}
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
                            {isLoading ? '產生中...' : '獲取驗證碼'}
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={() => switchView('login')}
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
                )}

                {/* Navigation */}
                <div style={{ 
                    textAlign: 'center', 
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop: '1px solid #eee' 
                }}>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        還沒有帳號？
                        <button
                            type="button"
                            onClick={() => navigate('signup')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#284E35',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                marginLeft: '5px'
                            }}
                        >
                            立即註冊
                        </button>
                    </p>
                </div>
            </div>

            {/* Verification Code Modal */}
            {showVerificationModal && (
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
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="signin-verification-code" style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#333',
                                    fontWeight: '500'
                                }}>
                                    驗證碼
                                </label>
                                <input
                                    type="text"
                                    id="signin-verification-code"
                                    value={forgotForm.verificationCode}
                                    onChange={(e) => setForgotForm(prev => ({ ...prev, verificationCode: e.target.value }))}
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
                                <label htmlFor="signin-new-password" style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#333',
                                    fontWeight: '500'
                                }}>
                                    新密碼
                                </label>
                                <input
                                    type="password"
                                    id="signin-new-password"
                                    value={forgotForm.newPassword}
                                    onChange={(e) => setForgotForm(prev => ({ ...prev, newPassword: e.target.value }))}
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
                                <label htmlFor="signin-confirm-password" style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#333',
                                    fontWeight: '500'
                                }}>
                                    確認新密碼
                                </label>
                                <input
                                    type="password"
                                    id="signin-confirm-password"
                                    value={forgotForm.confirmPassword}
                                    onChange={(e) => setForgotForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                                    onClick={handleResetPassword}
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignIn;
