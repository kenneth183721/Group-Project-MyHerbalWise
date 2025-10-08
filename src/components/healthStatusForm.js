import React, { useState, useEffect } from 'react';
import { getApiUrl, logApiCall } from '../utils/apiUtils';
import '../css/components/healthStatus.css';

function HealthStatusTracking({ user, navigate }) {
    const [currentStage, setCurrentStage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [healthStatusData, setHealthStatusData] = useState([]);
    const [healthStatusCatData, setHealthStatusCatData] = useState([]);
    const [foodData, setFoodData] = useState([]);
    const [networkInfo, setNetworkInfo] = useState('');
    
    // Form data for all stages
    const [formData, setFormData] = useState({
        // Stage 1 data
        date: new Date().toISOString().split('T')[0],
        clinicName: '',
        doctorName: '',
        
        // Stage 2 data
        selectedHealthStatus: null,
        eligibleFoods: [],
        ineligibleFoods: [],
        customNotes: '',
        
        // Final data
        severity: '輕微'
    });

    // Load all required data
    useEffect(() => {
        const loadData = async () => {
            console.log('=== Health Status Form - Starting data load ===');
            const networkInfo = checkNetwork();
            console.log('Network diagnostics:', networkInfo);
            
            setLoading(true);
            await Promise.all([
                loadHealthStatusData(),
                loadHealthStatusCatData(),
                loadFoodData()
            ]);
            console.log('=== Health Status Form - Data load complete ===');
            setLoading(false);
        };
        loadData();
    }, []);

    const loadHealthStatusData = async () => {
        const urls = [
            `${process.env.PUBLIC_URL || ''}/healthStatus.json`,
            `${window.location.origin}/healthStatus.json`,
            `/healthStatus.json`,
            `./healthStatus.json`
        ];
        
        for (let i = 0; i < urls.length; i++) {
            try {
                console.log(`Attempt ${i + 1}: Loading health status data from:`, urls[i]);
                
                // Add timeout for mobile networks
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                
                const response = await fetch(urls[i], { 
                    signal: controller.signal,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                clearTimeout(timeoutId);
                
                console.log(`URL ${i + 1} Response status:`, response.status);
                console.log(`URL ${i + 1} Response ok:`, response.ok);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Health status data loaded successfully:', data?.length || 0, 'items');
                    setHealthStatusData(Array.isArray(data) ? data : []);
                    return; // Success, exit the loop
                }
                
            } catch (error) {
                console.error(`URL ${i + 1} failed:`, error.message);
                if (error.name === 'AbortError') {
                    console.error(`URL ${i + 1} timed out`);
                }
            }
        }
        
        // If all URLs failed
        console.error('All health status data URLs failed');
        setHealthStatusData([]);
    };

    const loadHealthStatusCatData = async () => {
        try {
            console.log('Loading health status category data...');
            const url = `${process.env.PUBLIC_URL || ''}/healthStatusCat.json`;
            console.log('Fetching from URL:', url);
            
            const response = await fetch(url);
            console.log('HealthStatusCat response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Health status category data loaded:', data?.length || 0, 'items');
            setHealthStatusCatData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading health status category data:', error);
            setHealthStatusCatData([]);
        }
    };

    const loadFoodData = async () => {
        try {
            console.log('Loading food data...');
            const url = `${process.env.PUBLIC_URL || ''}/foodDB.json`;
            console.log('Fetching from URL:', url);
            
            const response = await fetch(url);
            console.log('Food data response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Food data loaded:', data?.length || 0, 'items');
            setFoodData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading food data:', error);
            setFoodData([]);
        }
    };

    const handleStage1Next = (e) => {
        e.preventDefault();
        if (!formData.date) {
            alert('請選擇日期');
            return;
        }
        setCurrentStage(2);
    };

    const handleStage2Next = () => {
        if (!formData.selectedHealthStatus) {
            alert('請選擇健康狀態');
            return;
        }
        setCurrentStage(3);
    };

    const handleHealthStatusSelect = (healthStatus) => {
        // Load eligible and ineligible foods
        const eligibleFoods = healthStatus.EligibleFoodID ? 
            healthStatus.EligibleFoodID.map(foodId => 
                foodData.find(food => food.foodID === foodId)
            ).filter(Boolean) : [];
            
        const ineligibleFoods = healthStatus.IneligibleFoodID ? 
            healthStatus.IneligibleFoodID.map(foodId => 
                foodData.find(food => food.foodID === foodId)
            ).filter(Boolean) : [];

        setFormData(prev => ({
            ...prev,
            selectedHealthStatus: healthStatus,
            eligibleFoods,
            ineligibleFoods
        }));
    };

    const removeFoodFromList = (foodId, listType) => {
        setFormData(prev => ({
            ...prev,
            [listType]: prev[listType].filter(food => food.foodID !== foodId)
        }));
    };

    const handleFinalSubmit = async () => {
        try {
            console.log('=== TRACKING CLIENT DEBUG ===');
            console.log('User:', user);
            console.log('FormData:', formData);
            console.log('Selected Health Status:', formData.selectedHealthStatus);
            
            // Server expects: userId, healthStatusID, healthStatusName, date, symptoms, notes, severity
            const newRecord = {
                userId: user.userID,
                userName: user.userName,
                healthStatusID: formData.selectedHealthStatus?.healthStatusID,
                healthStatusName: formData.selectedHealthStatus?.healthStatusName,
                date: formData.date,
                symptoms: formData.selectedHealthStatus?.healthStatusDescription, // Map to symptoms field
                notes: formData.customNotes || '', // Map customNotes to notes
                severity: formData.severity || 'medium',
                // Additional fields for tracking context
                clinicName: formData.clinicName,
                doctorName: formData.doctorName,
                eligibleFoods: formData.eligibleFoods?.map(food => ({
                    foodID: food.foodID,
                    foodName: food.foodName
                })) || [],
                ineligibleFoods: formData.ineligibleFoods?.map(food => ({
                    foodID: food.foodID,
                    foodName: food.foodName
                })) || [],
                timestamp: new Date().toISOString()
            };
            
            console.log('Final record to send:', newRecord);
            console.log('Required fields check:');
            console.log('- userId:', newRecord.userId);
            console.log('- healthStatusID:', newRecord.healthStatusID);
            console.log('- healthStatusName:', newRecord.healthStatusName);
            console.log('- date:', newRecord.date);
            console.log('- symptoms:', newRecord.symptoms);
            console.log('==============================');

            const apiUrl = getApiUrl('/api/healthStatusRecord');
            logApiCall('POST', apiUrl, newRecord);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRecord)
            });

            if (response.ok) {
                alert('健康狀態記錄已保存！');
                if (navigate) {
                    navigate('health-status-tracking');
                } else {
                    // Reset form for another entry
                    setFormData({
                        date: new Date().toISOString().split('T')[0],
                        clinicName: '',
                        doctorName: '',
                        selectedHealthStatus: null,
                        eligibleFoods: [],
                        ineligibleFoods: [],
                        customNotes: '',
                        severity: '輕微'
                    });
                    setCurrentStage(1);
                }
            } else {
                alert('保存失敗，請稍後再試');
            }
        } catch (error) {
            console.error('Error saving record:', error);
            alert('保存失敗，請稍後再試');
        }
    };

    const groupedHealthStatus = Array.isArray(healthStatusData) 
        ? healthStatusData.reduce((groups, item) => {
            const category = item.healthStatusCatID;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {})
        : {};

    const getCategoryName = (catID) => {
        const category = healthStatusCatData.find(cat => cat.healthStatusCatID === catID);
        return category ? category.healthStatusCatName : '其他病證';
    };

    // Network diagnostics
    const checkNetwork = () => {
        const info = {
            online: navigator.onLine,
            userAgent: navigator.userAgent,
            connection: navigator.connection?.effectiveType || 'unknown',
            url: window.location.href,
            baseURL: window.location.origin,
            publicURL: process.env.PUBLIC_URL || 'undefined'
        };
        console.log('Network Info:', info);
        setNetworkInfo(JSON.stringify(info, null, 2));
        return info;
    };

    if (loading) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>載入健康狀態資料中...</h2>
                <p>正在連接伺服器並載入必要資料</p>
                <p style={{ fontSize: '14px', color: '#666' }}>
                    如果載入時間過長，請檢查網路連線
                </p>
                <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
                    當前網址: {window.location.href}
                </div>
                {/* Debug info for mobile */}
                <details style={{ marginTop: '20px', textAlign: 'left', fontSize: '12px' }}>
                    <summary>網路診斷資訊 (點擊查看)</summary>
                    <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                        {networkInfo}
                    </pre>
                </details>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>請先登錄以使用症狀追蹤功能</h2>
            </div>
        );
    }

    return (
        <div>
            {/* Stage Bar */}
            <div className="stagebar-full">
                <div className="stagebar-stagebox">
                    <div className={`stagebar-bar ${currentStage >= 1 ? 'active' : ''}`}></div>
                    <div className={`stagebar-label ${currentStage === 1 ? 'label-active' : ''}`}>
                        症狀資料
                    </div>
                </div>
                <div className="stagebar-stagebox">
                    <div className={`stagebar-bar ${currentStage >= 2 ? 'active' : ''}`}></div>
                    <div className={`stagebar-label ${currentStage === 2 ? 'label-active' : ''}`}>
                        症狀描述
                    </div>
                </div>
                <div className="stagebar-stagebox">
                    <div className={`stagebar-bar ${currentStage >= 3 ? 'active' : ''}`}></div>
                    <div className={`stagebar-label ${currentStage === 3 ? 'label-active' : ''}`}>
                        核對資料
                    </div>
                </div>
            </div>

            {/* Stage 1: 症狀資料 */}
            {currentStage === 1 && (
                <div className="symptom-form">
                    <div className="form-container">
                        <div className="section-title-row">
                            <span className="circle-dot"></span>
                            <h2 className="formTitle">症狀資料</h2>
                        </div>
                        
                        <form onSubmit={handleStage1Next}>
                            <div>
                                <label className="labelText">日期</label>
                                <input
                                    type="date"
                                    className="labelFields"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="labelText">診所名稱 (可選填)</label>
                                <input
                                    type="text"
                                    className="labelFields"
                                    value={formData.clinicName}
                                    onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                                    placeholder=""
                                />
                            </div>

                            <div>
                                <label className="labelText">醫師名稱 (可選填)</label>
                                <input
                                    type="text"
                                    className="labelFields"
                                    value={formData.doctorName}
                                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                                    placeholder=""
                                />
                            </div>

                            <div className="form-btn-group">
                                <button 
                                    type="button" 
                                    className="blackBtn"
                                    onClick={() => window.history.back()}
                                >
                                    返回
                                </button>
                                <button type="submit" className="primaryBtn">
                                    下一步
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stage 2: 症狀描述 */}
            {currentStage === 2 && (
                <div className="symptom-form">
                    <div className="confirm-form-container">
                        <div className="section-title-row">
                            <span className="circle-dot"></span>
                            <h2 className="formTitle">症狀描述</h2>
                        </div>

                        <div>
                            <label className="labelText">選擇健康狀態：*</label>
                            <select
                                className="labelFields"
                                value={formData.selectedHealthStatus ? formData.selectedHealthStatus.healthStatusID : ''}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const healthStatus = healthStatusData.find(hs => hs.healthStatusID === selectedId);
                                    if (healthStatus) {
                                        handleHealthStatusSelect(healthStatus);
                                    }
                                }}
                                style={{ maxWidth: '640px' }}
                            >
                                <option value="">請選擇健康狀態</option>
                                {Object.entries(groupedHealthStatus).map(([categoryId, statusList]) => (
                                    <optgroup key={categoryId} label={getCategoryName(categoryId)}>
                                        {statusList.map((status) => (
                                            <option key={status.healthStatusID} value={status.healthStatusID}>
                                                {status.healthStatusName}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {formData.selectedHealthStatus && (
                            <div style={{ marginTop: '20px' }}>
                                <div className="txt-card-content">
                                    <strong>症狀描述：</strong>
                                    {formData.selectedHealthStatus.healthStatusDescription}
                                </div>
                            </div>
                        )}

                        {/* 建議進食食物 */}
                        {formData.eligibleFoods.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <label className="labelText">建議進食：</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {formData.eligibleFoods.map((food) => (
                                        <div 
                                            key={food.foodID}
                                            style={{
                                                background: '#e9f0e9',
                                                border: '1px solid #559b5b',
                                                borderRadius: '16px',
                                                padding: '4px 12px',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            {food.foodName}
                                            <button
                                                type="button"
                                                onClick={() => removeFoodFromList(food.foodID, 'eligibleFoods')}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#559b5b',
                                                    cursor: 'pointer',
                                                    fontSize: '16px'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 忌口食物 */}
                        {formData.ineligibleFoods.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <label className="labelText">忌口食物：</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {formData.ineligibleFoods.map((food) => (
                                        <div 
                                            key={food.foodID}
                                            style={{
                                                background: '#ffe6e6',
                                                border: '1px solid #ff9999',
                                                borderRadius: '16px',
                                                padding: '4px 12px',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            {food.foodName}
                                            <button
                                                type="button"
                                                onClick={() => removeFoodFromList(food.foodID, 'ineligibleFoods')}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ff9999',
                                                    cursor: 'pointer',
                                                    fontSize: '16px'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="labelText">其他備註：</label>
                            <textarea
                                className="labelFields"
                                value={formData.customNotes}
                                onChange={(e) => setFormData({...formData, customNotes: e.target.value})}
                                placeholder="其他需要記錄的資訊..."
                                rows="3"
                                style={{ maxWidth: '640px' }}
                            />
                        </div>

                        <div className="form-btn-group" style={{ maxWidth: '640px' }}>
                            <button 
                                type="button" 
                                className="blackBtn"
                                onClick={() => setCurrentStage(1)}
                            >
                                上一步
                            </button>
                            <button 
                                type="button" 
                                className="primaryBtn"
                                onClick={handleStage2Next}
                            >
                                下一步
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stage 3: 核對資料 */}
            {currentStage === 3 && (
                <div className="symptom-form">
                    <div className="confirm-form-container">
                        <div className="section-title-row">
                            <span className="circle-dot"></span>
                            <h2 className="formTitle">核對資料</h2>
                        </div>

                        <div className="symptom-confirm-row">
                            <div className="confirmContent">
                                <h3 style={{ color: '#284e35', marginBottom: '16px' }}>基本資料</h3>
                                <p><strong>日期：</strong>{formData.date}</p>
                                {formData.clinicName && <p><strong>診所名稱：</strong>{formData.clinicName}</p>}
                                {formData.doctorName && <p><strong>醫師名稱：</strong>{formData.doctorName}</p>}
                            </div>

                            <div className="confirmContent">
                                <h3 style={{ color: '#284e35', marginBottom: '16px' }}>健康狀態</h3>
                                <p><strong>症狀名稱：</strong>{formData.selectedHealthStatus?.healthStatusName}</p>
                                <p><strong>症狀描述：</strong>{formData.selectedHealthStatus?.healthStatusDescription}</p>
                                {formData.customNotes && <p><strong>備註：</strong>{formData.customNotes}</p>}
                            </div>
                        </div>

                        {formData.eligibleFoods.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: '#284e35', marginBottom: '12px' }}>建議進食</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {formData.eligibleFoods.map((food) => (
                                        <span 
                                            key={food.foodID}
                                            style={{
                                                background: '#e9f0e9',
                                                border: '1px solid #559b5b',
                                                borderRadius: '16px',
                                                padding: '4px 12px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            {food.foodName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.ineligibleFoods.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: '#284e35', marginBottom: '12px' }}>忌口食物</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {formData.ineligibleFoods.map((food) => (
                                        <span 
                                            key={food.foodID}
                                            style={{
                                                background: '#ffe6e6',
                                                border: '1px solid #ff9999',
                                                borderRadius: '16px',
                                                padding: '4px 12px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            {food.foodName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="form-btn-group">
                            <button 
                                type="button" 
                                className="blackBtn"
                                onClick={() => setCurrentStage(1)}
                            >
                                返回第一步
                            </button>
                            <button 
                                type="button" 
                                className="blackBtn"
                                onClick={() => setCurrentStage(2)}
                            >
                                返回上一步
                            </button>
                            <button 
                                type="button" 
                                className="primaryBtn"
                                onClick={handleFinalSubmit}
                            >
                                確認
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HealthStatusTracking;