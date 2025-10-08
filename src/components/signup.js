import React, { useState } from 'react';
import { useToast } from './ToastProvider';
import '../css/components/signup.css';

function SignUp() {
    const toast = useToast();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        gender: '',
        age: ''
    });
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Required fields
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else {
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        
        if (!formData.gender) {
            newErrors.gender = 'Please select your gender';
        }
        
        if (!formData.age) {
            newErrors.age = 'Age is required';
        } else {
            const ageNum = parseInt(formData.age);
            if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
                newErrors.age = 'Please enter a valid age between 1 and 120';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please correct the errors in the form');
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    gender: formData.gender,
                    age: parseInt(formData.age)
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                toast.success('Account created successfully! Please login with your new account.');
                // Navigate to signin page after a short delay
                setTimeout(() => {
                    window.location.href = '/signin';
                }, 1500);
            } else {
                // Handle specific error messages from server
                if (data.error) {
                    toast.error(data.error);
                } else {
                    toast.error('Failed to create account. Please try again.');
                }
            }
        } catch (error) {
            console.error('Signup error:', error);
            toast.error('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignInClick = (e) => {
        e.preventDefault();
        window.location.href = '/signin';
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h2>創建新帳戶</h2>
                    <p>加入MyHerbalWise，開始您的養生之旅</p>
                </div>
                
                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">名字 *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={errors.firstName ? 'error' : ''}
                                placeholder="請輸入您的名字"
                            />
                            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="lastName">姓氏 *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={errors.lastName ? 'error' : ''}
                                placeholder="請輸入您的姓氏"
                            />
                            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="username">使用者名稱 *</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={errors.username ? 'error' : ''}
                            placeholder="請輸入使用者名稱"
                        />
                        {errors.username && <span className="error-message">{errors.username}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">電子郵件 *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            placeholder="請輸入您的電子郵件地址"
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">密碼 *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                                placeholder="至少6個字符"
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="confirmPassword">確認密碼 *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'error' : ''}
                                placeholder="請再次輸入密碼"
                            />
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="gender">性別 *</label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className={errors.gender ? 'error' : ''}
                            >
                                <option value="">請選擇性別</option>
                                <option value="male">男性</option>
                                <option value="female">女性</option>
                                <option value="other">其他</option>
                            </select>
                            {errors.gender && <span className="error-message">{errors.gender}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="age">年齡 *</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className={errors.age ? 'error' : ''}
                                placeholder="請輸入您的年齡"
                                min="1"
                                max="120"
                            />
                            {errors.age && <span className="error-message">{errors.age}</span>}
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="signup-button"
                        disabled={isLoading}
                    >
                        {isLoading ? '創建中...' : '創建帳戶'}
                    </button>
                    
                    <div className="signin-link">
                        <p>已經有帳戶了？ <a href="/signin" onClick={handleSignInClick}>立即登入</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
