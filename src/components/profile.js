import React, { useState, useEffect, useCallback } from 'react';
import UserSavedFoodAPI from '../services/userSavedFoodAPI';
import UserAPI from '../services/userAPI';
import foodDB from '../json/foodDB.json';
import foodCat from '../json/foodCat.json';
import { useToast } from './ToastProvider';

function Profile({ user, navigate }) {
    const toast = useToast();
    
    const [activeTab, setActiveTab] = useState('basic'); // 'account', 'basic', 'saved'
    const [completeUser, setCompleteUser] = useState(user);
    
    // Account form state
    const [accountForm, setAccountForm] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Basic info form state
    const [basicForm, setBasicForm] = useState({
        firstName: '',
        lastName: '',
        gender: 'male'
    });

    // Load user data and update forms when user prop changes
    useEffect(() => {
        const loadCompleteUserData = async () => {
            try {
                const userIdToUse = user?.userID || 'uid01';
                
                const userData = await UserAPI.getUser(userIdToUse);
                setCompleteUser(userData.data);
                
            } catch (error) {
                console.error('Error loading complete user data:', error);
                // Fallback to the user prop if API call fails
                setCompleteUser(user || { userID: 'uid01' });
            }
        };

        loadCompleteUserData();
    }, [user]);

    useEffect(() => {
        if (completeUser) {
            // Update account form with user data
            setAccountForm(prev => ({
                ...prev,
                email: completeUser.email || 'joechan@gmail.com'
            }));
            
            // Update basic info form with user data
            const newBasicForm = {
                firstName: completeUser.firstName || '',
                lastName: completeUser.lastName || '',
                gender: completeUser.gender?.toLowerCase() || 'male'
            };
            setBasicForm(newBasicForm);
        }
    }, [completeUser]);

    // Saved foods state
    const [savedFoods, setSavedFoods] = useState([]);
    const [isLoadingSavedFoods, setIsLoadingSavedFoods] = useState(false);

    // Form state tracking
    const [isEditing, setIsEditing] = useState({
        account: false,
        basic: false
    });

    // Category color mapping
    const getCategoryColor = (foodCatID) => {
        const colorMap = {
            'FC01': 'rgb(238, 245, 238)', // 溫性 - Light Green
            'FC02': 'rgb(255, 223, 223)', // 熱性 - Light Red
            'FC03': 'rgb(223, 255, 252)', // 涼性 - Light Blue
            'FC04': 'rgb(223, 236, 255)', // 寒性 - Light Dark Blue
            'FC05': 'rgb(228, 239, 236)', // 平性 - Light Gray
        };
        return colorMap[foodCatID] || '#666';
    };

    const loadSavedFoods = useCallback(async () => {
        setIsLoadingSavedFoods(true);
        try {
            const savedFoodData = await UserSavedFoodAPI.getUserSavedFoods(completeUser?.userID || 'uid01');
            
            // Map saved food IDs to actual food data
            const savedFoodDetails = savedFoodData.data.map(savedItem => {
                const foodDetail = foodDB.find(food => food.foodID === savedItem.savedFoodID);
                const category = foodCat.find(cat => cat.foodCatID === foodDetail?.foodCatID);
                
                return {
                    ...foodDetail,
                    categoryName: category?.foodCatName || '其他',
                    categoryColor: getCategoryColor(foodDetail?.foodCatID),
                    savedAt: savedItem.savedAt
                };
            }).filter(food => food.foodID); // Remove any null entries
            
            setSavedFoods(savedFoodDetails);
        } catch (error) {
            console.error('Error loading saved foods:', error);
            setSavedFoods([]);
        } finally {
            setIsLoadingSavedFoods(false);
        }
    }, [completeUser]);

    // Load saved foods when tab is active
    useEffect(() => {
        if (activeTab === 'saved') {
            loadSavedFoods();
        }
    }, [activeTab, loadSavedFoods]);

    const handleAccountSave = async () => {
        console.log('💾 Saving account settings:', accountForm);
        try {
            // Validate password fields if user is trying to change password
            if (accountForm.newPassword || accountForm.confirmPassword || accountForm.currentPassword) {
                // Check if all password fields are filled
                if (!accountForm.currentPassword) {
                    toast.error('請輸入目前密碼');
                    return;
                }
                if (!accountForm.newPassword) {
                    toast.error('請輸入新密碼');
                    return;
                }
                if (!accountForm.confirmPassword) {
                    toast.error('請確認新密碼');
                    return;
                }
                
                // Check if new password and confirm password match
                if (accountForm.newPassword !== accountForm.confirmPassword) {
                    toast.error('新密碼與確認密碼不一致');
                    return;
                }
                
                // Check if new password is different from current password
                if (accountForm.currentPassword === accountForm.newPassword) {
                    toast.error('新密碼不能與目前密碼相同');
                    return;
                }
                
                // Verify current password
                const isCurrentPasswordValid = await UserAPI.verifyPassword(
                    completeUser?.userID || 'uid01', 
                    accountForm.currentPassword
                );
                
                if (!isCurrentPasswordValid) {
                    toast.error('目前密碼不正確');
                    return;
                }
            }
            
            setIsEditing(prev => ({ ...prev, account: false }));
            
            await UserAPI.updateAccountSettings(completeUser?.userID || 'uid01', accountForm);
            console.log('✅ Account settings saved successfully');
            
            // Clear password fields after successful update
            setAccountForm(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            
            toast.success('帳戶設定已更新！');
        } catch (error) {
            console.error('Error saving account data:', error);
            toast.error('更新失敗，請稍後再試');
            setIsEditing(prev => ({ ...prev, account: true }));
        }
    };

    const handleBasicSave = async () => {
        try {
            setIsEditing(prev => ({ ...prev, basic: false }));
            
            await UserAPI.updateBasicInfo(completeUser?.userID || 'uid01', basicForm);
            
            toast.success('基本資料已更新！');
        } catch (error) {
            console.error('Error saving basic info:', error);
            toast.error('更新失敗，請稍後再試');
            setIsEditing(prev => ({ ...prev, basic: true }));
        }
    };

    const handleReset = () => {
        if (activeTab === 'account') {
            setAccountForm({
                email: completeUser?.email || 'joechan@gmail.com',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setIsEditing(prev => ({ ...prev, account: false }));
        } else if (activeTab === 'basic') {
            setBasicForm({
                firstName: completeUser?.firstName || '',
                lastName: completeUser?.lastName || '',
                gender: completeUser?.gender?.toLowerCase() || 'male'
            });
            setIsEditing(prev => ({ ...prev, basic: false }));
        }
    };

    const handleUnsaveFood = async (foodId) => {
        try {
            await UserSavedFoodAPI.unsaveFood(completeUser?.userID || 'uid01', foodId);
            // Reload saved foods
            loadSavedFoods();
        } catch (error) {
            console.error('Error unsaving food:', error);
            toast.error('移除收藏失敗，請稍後再試');
        }
    };

    return (
        <div className='container' style={{ 
            margin: '0 auto', 
            minHeight: '70vh',
            marginBottom: '40px'
        }}>
            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '40px',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <button
                    onClick={() => setActiveTab('account')}
                    style={{
                        padding: '15px 30px',
                        border: 'none',
                        background: 'none',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'account' ? '3px solid #284E35' : '3px solid transparent',
                        color: activeTab === 'account' ? '#284E35' : '#666',
                        fontWeight: activeTab === 'account' ? '600' : '400',
                        transition: 'all 0.2s ease',
                        marginRight: '20px'
                    }}
                >
                    帳戶
                </button>

                <button
                    onClick={() => setActiveTab('basic')}
                    style={{
                        padding: '15px 30px',
                        border: 'none',
                        background: 'none',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'basic' ? '3px solid #284E35' : '3px solid transparent',
                        color: activeTab === 'basic' ? '#284E35' : '#666',
                        fontWeight: activeTab === 'basic' ? '600' : '400',
                        transition: 'all 0.2s ease',
                        marginRight: '20px'
                    }}
                >
                    基本個人資料
                </button>

                <button
                    onClick={() => setActiveTab('saved')}
                    style={{
                        padding: '15px 30px',
                        border: 'none',
                        background: 'none',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'saved' ? '3px solid #284E35' : '3px solid transparent',
                        color: activeTab === 'saved' ? '#284E35' : '#666',
                        fontWeight: activeTab === 'saved' ? '600' : '400',
                        transition: 'all 0.2s ease'
                    }}
                >
                    收藏項目
                </button>
            </div>

            {/* Tab Content */}
            <div style={{ 
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '40px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div>
                        <h2 style={{ 
                            color: '#284E35', 
                            fontSize: '1.8rem', 
                            marginBottom: '30px',
                            textAlign: 'center'
                        }}>
                            帳戶設定
                        </h2>
                        
                        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                            {/* Email Section */}
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#333',
                                    fontWeight: '500'
                                }}>
                                    電子信箱
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="email"
                                        value={accountForm.email}
                                        onChange={(e) => {
                                            setAccountForm(prev => ({ ...prev, email: e.target.value }));
                                            setIsEditing(prev => ({ ...prev, account: true }));
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '1rem',
                                            boxSizing: 'border-box',
                                            backgroundColor: isEditing.account ? '#fff' : '#f9f9f9'
                                        }}
                                    />
                                    {isEditing.account && (
                                        <span style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#284E35',
                                            fontSize: '0.9rem'
                                        }}>
                                            已修改
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Password Section */}
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ 
                                    color: '#333', 
                                    fontSize: '1.2rem', 
                                    marginBottom: '15px'
                                }}>
                                    更改密碼
                                </h3>
                                
                                {/* Current Password */}
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontWeight: '500'
                                    }}>
                                        目前密碼
                                    </label>
                                    <input
                                        type="password"
                                        value={accountForm.currentPassword}
                                        placeholder="輸入目前密碼"
                                        onChange={(e) => {
                                            setAccountForm(prev => ({ ...prev, currentPassword: e.target.value }));
                                            setIsEditing(prev => ({ ...prev, account: true }));
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '1rem',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {/* New Password */}
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontWeight: '500'
                                    }}>
                                        新密碼
                                    </label>
                                    <input
                                        type="password"
                                        value={accountForm.newPassword}
                                        placeholder="輸入新密碼"
                                        onChange={(e) => {
                                            setAccountForm(prev => ({ ...prev, newPassword: e.target.value }));
                                            setIsEditing(prev => ({ ...prev, account: true }));
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '1rem',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontWeight: '500'
                                    }}>
                                        確認新密碼
                                    </label>
                                    <input
                                        type="password"
                                        value={accountForm.confirmPassword}
                                        placeholder="再次輸入新密碼"
                                        onChange={(e) => {
                                            setAccountForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                                            setIsEditing(prev => ({ ...prev, account: true }));
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '1rem',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <small style={{ color: '#666', fontSize: '0.9rem' }}>
                                    如不需要更改密碼，請保持所有密碼欄位空白
                                </small>
                            </div>

                            {/* Notification Settings */}
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ 
                                    color: '#333', 
                                    fontSize: '1.2rem', 
                                    marginBottom: '15px'
                                }}>
                                    通知設定
                                </h3>
                                
                                {/* Simple notification toggle */}
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    marginBottom: '12px',
                                    cursor: 'pointer'
                                }}>
                                    <input 
                                        type="checkbox" 
                                        checked={accountForm.foodNotificationsEnabled}
                                        onChange={(e) => {
                                            setAccountForm(prev => ({ ...prev, foodNotificationsEnabled: e.target.checked }));
                                            setIsEditing(prev => ({ ...prev, account: true }));
                                        }}
                                        style={{ 
                                            marginRight: '12px',
                                            transform: 'scale(1.2)',
                                            accentColor: '#284E35'
                                        }} 
                                    />
                                    � 啟用食物推薦通知
                                </label>
                                
                                <small style={{ 
                                    color: '#666', 
                                    fontSize: '0.9rem',
                                    marginLeft: '24px',
                                    display: 'block'
                                }}>
                                    啟用後，當有新的食物推薦時會顯示通知訊息
                                </small>
                            </div>
                        </div>
                    </div>
                )}

                {/* Basic Information Tab */}
                {activeTab === 'basic' && (
                    <div>
                        <h2 style={{ 
                            color: '#284E35', 
                            fontSize: '1.8rem', 
                            marginBottom: '30px',
                            textAlign: 'center'
                        }}>
                            基本個人資料
                        </h2>

                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            {/* Name Fields */}
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px',
                                marginBottom: '30px'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontWeight: '500'
                                    }}>
                                        姓氏 (可選填)
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={basicForm.lastName}
                                            placeholder="請輸入姓氏"
                                            onChange={(e) => {
                                                setBasicForm(prev => ({ ...prev, lastName: e.target.value }));
                                                setIsEditing(prev => ({ ...prev, basic: true }));
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px 40px 12px 12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '6px',
                                                fontSize: '1rem',
                                                boxSizing: 'border-box',
                                                backgroundColor: isEditing.basic ? '#fff' : '#f9f9f9'
                                            }}
                                        />
                                        <span style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#666',
                                            cursor: 'pointer'
                                        }}>
                                            ✏️
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontWeight: '500'
                                    }}>
                                        名字 (可選填)
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={basicForm.firstName}
                                            placeholder="請輸入名字"
                                            onChange={(e) => {
                                                setBasicForm(prev => ({ ...prev, firstName: e.target.value }));
                                                setIsEditing(prev => ({ ...prev, basic: true }));
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px 40px 12px 12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '6px',
                                                fontSize: '1rem',
                                                boxSizing: 'border-box',
                                                backgroundColor: isEditing.basic ? '#fff' : '#f9f9f9'
                                            }}
                                        />
                                        <span style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#666',
                                            cursor: 'pointer'
                                        }}>
                                            ✏️
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Gender Selection */}
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '15px',
                                    color: '#333',
                                    fontWeight: '500'
                                }}>
                                    性別
                                </label>
                                <div style={{ 
                                    display: 'flex',
                                    gap: '20px'
                                }}>
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}>
                                        <input 
                                            type="radio" 
                                            name="gender" 
                                            value="male"
                                            checked={basicForm.gender === 'male'}
                                            onChange={(e) => {
                                                setBasicForm(prev => ({ ...prev, gender: e.target.value }));
                                                setIsEditing(prev => ({ ...prev, basic: true }));
                                            }}
                                            style={{ 
                                                marginRight: '8px',
                                                transform: 'scale(1.2)',
                                                accentColor: '#284E35'
                                            }} 
                                        />
                                        男
                                    </label>
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}>
                                        <input 
                                            type="radio" 
                                            name="gender" 
                                            value="female"
                                            checked={basicForm.gender === 'female'}
                                            onChange={(e) => {
                                                setBasicForm(prev => ({ ...prev, gender: e.target.value }));
                                                setIsEditing(prev => ({ ...prev, basic: true }));
                                            }}
                                            style={{ 
                                                marginRight: '8px',
                                                transform: 'scale(1.2)',
                                                accentColor: '#284E35'
                                            }} 
                                        />
                                        女
                                    </label>
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}>
                                        <input 
                                            type="radio" 
                                            name="gender" 
                                            value="other"
                                            checked={basicForm.gender === 'other'}
                                            onChange={(e) => {
                                                setBasicForm(prev => ({ ...prev, gender: e.target.value }));
                                                setIsEditing(prev => ({ ...prev, basic: true }));
                                            }}
                                            style={{ 
                                                marginRight: '8px',
                                                transform: 'scale(1.2)',
                                                accentColor: '#284E35'
                                            }} 
                                        />
                                        不便透露
                                    </label>
                                </div>
                            </div>

                            {isEditing.basic && (
                                <div style={{
                                    backgroundColor: '#f0f8f0',
                                    border: '1px solid #284E35',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    textAlign: 'center',
                                    color: '#284E35',
                                    fontSize: '0.95rem'
                                }}>
                                    📝 您已修改個人資料，請記得儲存變更
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Saved Foods Tab */}
                {activeTab === 'saved' && (
                    <div>
                        <h2 style={{ 
                            color: '#284E35', 
                            fontSize: '1.8rem', 
                            marginBottom: '30px',
                            textAlign: 'center'
                        }}>
                            收藏項目
                        </h2>

                        {isLoadingSavedFoods ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#666'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '15px' }}>⏳</div>
                                <p>載入收藏項目中...</p>
                            </div>
                        ) : savedFoods.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                color: '#666',
                                padding: '60px 20px'
                            }}>
                                <div style={{
                                    fontSize: '3rem',
                                    marginBottom: '20px'
                                }}>
                                    📚
                                </div>
                                <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
                                    您的收藏食物將顯示在這裡
                                </p>
                                <p style={{ color: '#999' }}>
                                    開始探索食物資料庫，收藏您感興趣的食材
                                </p>
                                <button
                                    onClick={() => navigate('foodDB')}
                                    style={{
                                        backgroundColor: '#284E35',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '25px',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        marginTop: '20px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1a2e21'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#284E35'}
                                >
                                    探索食物資料庫
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p style={{ 
                                    textAlign: 'center', 
                                    color: '#666', 
                                    marginBottom: '30px' 
                                }}>
                                    您已收藏 {savedFoods.length} 種食材
                                </p>
                                
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '20px',
                                    padding: '10px'
                                }}>
                                    {savedFoods.map((food, index) => (
                                        <div
                                            key={food.foodID}
                                            style={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                                transition: 'all 0.2s ease',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                                            }}
                                        >
                                            {/* Remove button */}
                                            <button
                                                onClick={() => handleUnsaveFood(food.foodID)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    background: '#ff4757',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '28px',
                                                    height: '28px',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#ff3742'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#ff4757'}
                                                title="移除收藏"
                                            >
                                                ×
                                            </button>

                                            {/* Category badge */}
                                            <div style={{
                                                display: 'inline-block',
                                                backgroundColor: food.categoryColor || '#666',
                                                color: '#545454',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                fontWeight: '500',
                                                marginBottom: '12px'
                                            }}>
                                                {food.categoryName}
                                            </div>

                                            {/* Food name */}
                                            <h3 style={{
                                                color: '#284E35',
                                                fontSize: '1.3rem',
                                                fontWeight: '600',
                                                marginBottom: '12px',
                                                lineHeight: '1.3'
                                            }}>
                                                {food.foodName}
                                            </h3>

                                            {/* Description */}
                                            <p style={{
                                                color: '#666',
                                                fontSize: '0.95rem',
                                                lineHeight: '1.5',
                                                marginBottom: '12px',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {food.foodDescription}
                                            </p>

                                            {/* Effect */}
                                            <div style={{
                                                backgroundColor: '#f8f9fa',
                                                padding: '10px',
                                                borderRadius: '6px',
                                                marginBottom: '12px'
                                            }}>
                                                <strong style={{ 
                                                    color: '#284E35', 
                                                    fontSize: '0.9rem' 
                                                }}>
                                                    功效：
                                                </strong>
                                                <span style={{ 
                                                    color: '#555', 
                                                    fontSize: '0.9rem',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {food.foodEffect}
                                                </span>
                                            </div>

                                            {/* Saved date */}
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: '#999',
                                                textAlign: 'right'
                                            }}>
                                                收藏於 {new Date(food.savedAt).toLocaleDateString('zh-TW')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                {(activeTab === 'account' || activeTab === 'basic') && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '15px',
                        marginTop: '40px',
                        paddingTop: '30px',
                        borderTop: '1px solid #eee'
                    }}>
                        <button
                            onClick={handleReset}
                            style={{
                                backgroundColor: '#fff',
                                color: '#666',
                                border: '2px solid #ddd',
                                padding: '12px 30px',
                                borderRadius: '25px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minWidth: '120px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = '#284E35';
                                e.target.style.color = '#284E35';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = '#ddd';
                                e.target.style.color = '#666';
                            }}
                        >
                            重設
                        </button>

                        <button
                            onClick={activeTab === 'account' ? handleAccountSave : handleBasicSave}
                            disabled={!isEditing[activeTab]}
                            style={{
                                backgroundColor: isEditing[activeTab] ? '#284E35' : '#ccc',
                                color: 'white',
                                border: `2px solid ${isEditing[activeTab] ? '#284E35' : '#ccc'}`,
                                padding: '12px 30px',
                                borderRadius: '25px',
                                fontSize: '1rem',
                                cursor: isEditing[activeTab] ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s ease',
                                minWidth: '120px'
                            }}
                            onMouseEnter={(e) => {
                                if (isEditing[activeTab]) {
                                    e.target.style.backgroundColor = '#1a2e21';
                                    e.target.style.borderColor = '#1a2e21';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (isEditing[activeTab]) {
                                    e.target.style.backgroundColor = '#284E35';
                                    e.target.style.borderColor = '#284E35';
                                }
                            }}
                        >
                            {isEditing[activeTab] ? '儲存變更' : '無變更'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
