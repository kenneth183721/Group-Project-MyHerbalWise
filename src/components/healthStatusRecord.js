import React, { useState, useEffect } from 'react';
import '../css/components/healthStatus.css';

function HealthStatusRecord({ user, navigate }) {
    const [currentStage, setCurrentStage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [healthStatusData, setHealthStatusData] = useState([]);
    const [healthStatusCatData, setHealthStatusCatData] = useState([]);
    const [foodData, setFoodData] = useState([]);
    
    // Add mode and recordID state for edit functionality
    const [mode, setMode] = useState('create'); // 'create' or 'edit'
    const [recordID, setRecordID] = useState(null);
    
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

    // Load all required data and check for edit mode
    useEffect(() => {
        // Parse URL parameters from hash for edit mode
        const hash = window.location.hash;
        const hashParts = hash.split('?');
        const searchPart = hashParts[1] || '';
        const urlParams = new URLSearchParams(searchPart);
        const modeParam = urlParams.get('mode') || 'create';
        const idParam = urlParams.get('id');
        
        setMode(modeParam);
        setRecordID(idParam);
        
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                loadHealthStatusData(),
                loadHealthStatusCatData(),
                loadFoodData()
            ]);
            setLoading(false);
        };
        loadData();
    }, []);
    
    // Separate useEffect to load record after data is loaded
    useEffect(() => {
        if (!loading && mode === 'edit' && recordID && healthStatusData.length > 0) {
            loadRecord(recordID);
        }
    }, [loading, mode, recordID, healthStatusData]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadHealthStatusData = async () => {
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/healthStatus.json`);
            const data = await response.json();
            setHealthStatusData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading health status data:', error);
            setHealthStatusData([]);
        }
    };

    const loadHealthStatusCatData = async () => {
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/healthStatusCat.json`);
            const data = await response.json();
            setHealthStatusCatData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading health status category data:', error);
            setHealthStatusCatData([]);
        }
    };

    const loadFoodData = async () => {
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/foodDB.json`);
            const data = await response.json();
            setFoodData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading food data:', error);
            setFoodData([]);
        }
    };

    // Load existing record for edit mode
    const loadRecord = async (id) => {
        try {
            setLoading(true);
            
            // Make direct API call to get the existing record
            const response = await fetch(`http://localhost:3001/api/healthStatusRecord/record/${id}`);
            const data = await response.json();
            
            if (data.success && data.data) {
                const record = data.data;
                
                // Find the health status object from the loaded data
                const healthStatus = healthStatusData.find(
                    hs => hs.healthStatusID === record.healthStatusID
                );
                
                // Set form data with the existing record values
                const newFormData = {
                    date: record.date || new Date().toISOString().split('T')[0],
                    clinicName: record.clinicName || '',
                    doctorName: record.doctorName || '',
                    selectedHealthStatus: healthStatus || null,
                    eligibleFoods: record.eligibleFoods || [],
                    ineligibleFoods: record.ineligibleFoods || [],
                    customNotes: record.notes || record.customNotes || '',
                    severity: record.severity || '輕微'
                };
                
                setFormData(newFormData);
                
                // If health status is selected, advance to stage 2 
                if (healthStatus) {
                    setCurrentStage(2);
                }
                
            } else {
                alert('無法載入健康狀態記錄，請稍後再試');
            }
        } catch (error) {
            console.error('Error loading health status record:', error);
            alert('載入健康狀態記錄時發生錯誤');
        } finally {
            setLoading(false);
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
        // Prevent multiple submissions
        if (loading) {
            return;
        }

        // Validate required fields
        if (!user || !user.userID) {
            alert('用戶信息缺失，請重新登錄');
            return;
        }

        if (!formData.date) {
            alert('請選擇日期');
            return;
        }

        if (!formData.selectedHealthStatus || !formData.selectedHealthStatus.healthStatusDescription) {
            alert('請選擇健康狀態並確保包含症狀描述');
            return;
        }

        setLoading(true);

        try {
            const newRecord = {
                userId: user.userID,
                userName: user.userName,
                date: formData.date,
                healthStatusID: formData.selectedHealthStatus.healthStatusID,
                healthStatusName: formData.selectedHealthStatus.healthStatusName,
                symptoms: formData.selectedHealthStatus.healthStatusDescription,
                notes: formData.customNotes || '',
                severity: formData.severity || '輕微'
            };

            // Different API calls for create vs edit
            let response;
            if (mode === 'edit' && recordID) {
                // PUT request for editing existing record
                response = await fetch(`http://localhost:3001/api/healthStatusRecord/${recordID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newRecord)
                });
            } else {
                // POST request for creating new record
                response = await fetch('http://localhost:3001/api/healthStatusRecord', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newRecord)
                });
            }

            if (response.ok) {
                await response.json(); // Process response but don't store unused data
                const successMessage = mode === 'edit' ? '健康狀態記錄已更新！' : '健康狀態記錄已保存！';
                alert(successMessage);
                navigate('health-status-tracking');
            } else {
                // Get detailed error information
                const errorText = await response.text();
                alert(`保存失敗：${response.status} - ${errorText || '請稍後再試'}`);
            }
        } catch (error) {
            console.error('Error saving record:', error);
            alert(`保存失敗：${error.message || '網絡錯誤，請檢查連接並稍後再試'}`);
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>載入中...</h2>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>請先登錄以使用健康狀態記錄功能</h2>
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
                            <h2 className="formTitle">
                                {mode === 'edit' ? '編輯健康狀態記錄' : '新增健康狀態記錄'}
                            </h2>
                        </div>
                        
                        <form onSubmit={handleStage1Next}>
                            <div>
                                <label className="labelText" htmlFor="health-status-date">日期：*</label>
                                <input
                                    id="health-status-date"
                                    name="date"
                                    type="date"
                                    className="labelFields"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="labelText" htmlFor="clinic-name">診所名稱：</label>
                                <input
                                    id="clinic-name"
                                    name="clinicName"
                                    type="text"
                                    className="labelFields"
                                    value={formData.clinicName}
                                    onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                                    placeholder="請輸入診所名稱 (可選填)"
                                />
                            </div>

                            <div>
                                <label className="labelText" htmlFor="doctor-name">醫師名稱：</label>
                                <input
                                    id="doctor-name"
                                    name="doctorName"
                                    type="text"
                                    className="labelFields"
                                    value={formData.doctorName}
                                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                                    placeholder="請輸入醫師名稱 (可選填)"
                                />
                            </div>

                            <div className="form-btn-group">
                                <button 
                                    type="button" 
                                    className="blackBtn"
                                    onClick={() => navigate('health-status-tracking')}
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
                      
                            <h2 className="formTitle">症狀描述</h2>
                        </div>

                        <div>
                            <label className="labelText" htmlFor="health-status-select">選擇健康狀態：*</label>
                            <select
                                id="health-status-select"
                                name="healthStatus"
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
                            <label className="labelText" htmlFor="custom-notes">其他備註：</label>
                            <textarea
                                id="custom-notes"
                                name="customNotes"
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
                                disabled={loading}
                            >
                                {loading ? '保存中...' : '確認'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HealthStatusRecord;
