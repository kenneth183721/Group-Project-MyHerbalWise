import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import DietaryRecordAPI from '../services/dietaryRecordAPI';
import '../css/components/DietaryRecord.css';

function DietaryRecord({ navigate, user }) {
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        foodItems: '',
        portions: '',
        portionQuantity: '',
        portionUnit: '',
        mealType: '',
        notes: ''
    });
    
    const [mode, setMode] = useState('create'); // 'create' or 'edit'
    const [recordID, setRecordID] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [foodDatabase, setFoodDatabase] = useState([]);
    const [loadingFoodDB, setLoadingFoodDB] = useState(true);
    const toast = useToast();

    useEffect(() => {
        // Load food database
        loadFoodDatabase();
        
        // Parse URL parameters from hash (not search) since the app uses hash routing
        const hash = window.location.hash;
        const hashParts = hash.split('?');
        const searchPart = hashParts[1] || '';
        const urlParams = new URLSearchParams(searchPart);
        const modeParam = urlParams.get('mode') || 'create';
        const idParam = urlParams.get('id');
        
        setMode(modeParam);
        setRecordID(idParam);

        // Set default date and time for new records
        if (modeParam === 'create') {
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0];
            const currentTime = now.toTimeString().slice(0, 5);
            
            setFormData(prev => ({
                ...prev,
                date: currentDate,
                time: currentTime
            }));
        } else if (modeParam === 'edit' && idParam) {
            // Load the record for editing
            setTimeout(() => loadRecord(idParam), 500);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Additional useEffect to handle URL changes or delayed loading
    useEffect(() => {
        // Check if we're in edit mode but haven't loaded data yet
        if (mode === 'edit' && recordID && !formData.foodItems) {
            loadRecord(recordID);
        }
    }, [mode, recordID]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadFoodDatabase = async () => {
        try {
            console.log('Loading food database...');
            setLoadingFoodDB(true);
            const url = `${process.env.PUBLIC_URL || ''}/foodDB.json`;
            console.log('Fetching food database from URL:', url);
            
            const response = await fetch(url);
            console.log('Food database response status:', response.status);
            console.log('Food database response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`Failed to load food database - HTTP ${response.status}: ${response.statusText}`);
            }
            const foodData = await response.json();
            console.log('Food database loaded successfully:', foodData?.length || 0, 'items');
            setFoodDatabase(foodData);
        } catch (error) {
            console.error('Error loading food database:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            toast.error('載入食物資料庫失敗: ' + error.message);
        } finally {
            setLoadingFoodDB(false);
        }
    };

    const loadRecord = async (id) => {
        try {
            setLoading(true);
            
            // Make direct API call
            const response = await fetch(`http://localhost:3001/api/dietary-records/record/${id}`);
            const data = await response.json();
            
            if (data.success && data.data) {
                const record = data.data;
                
                // Parse portions for the quantity/unit fields
                let portionQuantity = '1';
                let portionUnit = '碗';
                
                if (record.portions) {
                    const firstPortion = record.portions.split(',')[0].trim();
                    const match = firstPortion.match(/^(\d+(?:\.\d+)?)(.*)$/);
                    if (match) {
                        portionQuantity = match[1];
                        portionUnit = match[2] || '碗';
                    }
                }
                
                // Set form data with explicit values
                const newFormData = {
                    date: record.date || '',
                    time: record.time || '',
                    foodItems: record.foodItems || '',
                    portions: record.portions || '',
                    portionQuantity: portionQuantity,
                    portionUnit: portionUnit,
                    mealType: record.mealType || '',
                    notes: record.notes || ''
                };
                
                setFormData(newFormData);
                toast.success('記錄已載入');
            } else {
                toast.error('找不到指定的飲食記錄');
            }
        } catch (error) {
            console.error('Error loading record:', error);
            toast.error('載入記錄失敗: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

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
        
        if (!formData.date) {
            newErrors.date = '請選擇日期';
        }
        
        if (!formData.time) {
            newErrors.time = '請輸入時間';
        }
        
        if (!formData.foodItems.trim()) {
            newErrors.foodItems = '請輸入進食項目';
        }
        
        if (!formData.portions.trim() && (!formData.portionQuantity || !formData.portionUnit)) {
            newErrors.portions = '請輸入份量/數量';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('請填寫所有必填欄位');
            return;
        }
        
        setLoading(true);
        
        try {
            // Combine quantity and unit for backward compatibility
            const combinedPortions = formData.portionQuantity && formData.portionUnit 
                ? `${formData.portionQuantity}${formData.portionUnit}` 
                : formData.portions;
                
            const recordData = {
                ...formData,
                portions: combinedPortions,
                userID: user.userID
            };

            if (mode === 'create') {
                const response = await DietaryRecordAPI.createDietaryRecord(recordData);
                console.log('Creating new dietary record:', response.data);
                toast.success('飲食記錄已成功新增');
            } else {
                const response = await DietaryRecordAPI.updateDietaryRecord(recordID, recordData);
                console.log('Updating dietary record:', response.data);
                toast.success('飲食記錄已成功更新');
            }
            
            // Navigate back to dietary tracking
            setTimeout(() => {
                if (navigate) {
                    navigate('dietary-tracking');
                }
            }, 1500);
            
        } catch (error) {
            console.error('Error saving dietary record:', error);
            toast.error('儲存飲食記錄失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (navigate) {
            navigate('dietary-tracking');
        }
    };

    const handleAddFoodItem = () => {
        // Add functionality to add multiple food items
        const currentItems = formData.foodItems.trim();
        const currentPortions = formData.portions.trim();
        
        if (currentItems && !currentItems.endsWith(',')) {
            setFormData(prev => ({
                ...prev,
                foodItems: currentItems + ', ',
                portions: currentPortions ? currentPortions + ', ' : ''
            }));
        } else if (!currentItems) {
            // Focus on the input to help user start typing
            document.getElementById('foodItems').focus();
        }
    };

    // Handle datalist selection and auto-completion
    const handleFoodItemKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddFoodItem();
        } else if (e.key === 'Tab' || e.key === ',') {
            // Auto-add comma separator when tab or comma is pressed
            const currentItems = formData.foodItems.trim();
            if (currentItems && !currentItems.endsWith(',')) {
                e.preventDefault();
                handleAddFoodItem();
            }
        }
    };

    // Get filtered food suggestions based on current input
    const getFilteredFoodOptions = () => {
        if (!formData.foodItems || loadingFoodDB) return foodDatabase;
        
        const currentInput = formData.foodItems.split(',').pop().trim().toLowerCase();
        if (!currentInput) return foodDatabase;
        
        return foodDatabase.filter(food => 
            food.foodName.toLowerCase().includes(currentInput)
        ).slice(0, 20); // Limit to 20 suggestions for performance
    };

    if (loading) {
        return (
            <div className="dietary-record-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>載入中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dietary-record-container">
            <div className="page-header">
                <h2>{mode === 'create' ? '新增飲食記錄' : '編輯飲食記錄'}</h2>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="dietary-record-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="date">日期 *</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date || ''}
                                onChange={handleChange}
                                className={errors.date ? 'error' : ''}
                                required
                            />
                            {errors.date && <span className="error-message">{errors.date}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="time">時間 *</label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                value={formData.time || ''}
                                onChange={handleChange}
                                className={errors.time ? 'error' : ''}
                                required
                            />
                            {errors.time && <span className="error-message">{errors.time}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="mealType">餐別</label>
                        <select
                            id="mealType"
                            name="mealType"
                            value={formData.mealType || ''}
                            onChange={handleChange}
                        >
                            <option value="">請選擇餐別</option>
                            <option value="早餐">早餐</option>
                            <option value="午餐">午餐</option>
                            <option value="晚餐">晚餐</option>
                            <option value="點心">點心</option>
                            <option value="宵夜">宵夜</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="foodItems">進食項目 *</label>
                        <input
                            type="text"
                            id="foodItems"
                            name="foodItems"
                            list="foodOptions"
                            value={formData.foodItems || ''}
                            onChange={handleChange}
                            onKeyDown={handleFoodItemKeyDown}
                            className={errors.foodItems ? 'error' : ''}
                            placeholder="輸入或選擇食物，多項目請用逗號分隔"
                            required
                        />
                        <datalist id="foodOptions">
                            {getFilteredFoodOptions().map((food) => (
                                <option key={food.foodID} value={food.foodName}>
                                    {food.foodName}
                                </option>
                            ))}
                        </datalist>
                        {loadingFoodDB && (
                            <div className="food-loading">載入食物資料庫中...</div>
                        )}
                        <button 
                            type="button" 
                            className="add-item-button"
                            onClick={handleAddFoodItem}
                            title="點擊添加更多項目"
                        >
                            + 添加項目
                        </button>
                        {errors.foodItems && <span className="error-message">{errors.foodItems}</span>}
                    </div>

                    <div className="form-group">
                        <fieldset className={`portion-fieldset ${errors.portions ? 'error' : ''}`}>
                            <legend>份量/數量 *</legend>
                            <div className="portion-input-group">
                                <input
                                    type="number"
                                    id="portionQuantity"
                                    name="portionQuantity"
                                    value={formData.portionQuantity || ''}
                                    onChange={handleChange}
                                    className={errors.portions ? 'error' : ''}
                                    placeholder="數量"
                                    min="0.1"
                                    step="0.1"
                                    required
                                    aria-label="數量"
                                />
                                <select
                                    id="portionUnit"
                                    name="portionUnit"
                                    value={formData.portionUnit || ''}
                                    onChange={handleChange}
                                    className={errors.portions ? 'error' : ''}
                                    required
                                    aria-label="單位"
                                >
                                    <option value="">請選擇單位</option>
                                    <option value="克(g)">克(g)</option>
                                    <option value="碟">碟</option>
                                    <option value="碗">碗</option>
                                </select>
                            </div>
                        </fieldset>
                        {errors.portions && <span className="error-message">{errors.portions}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">備註</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes || ''}
                            onChange={handleChange}
                            placeholder="其他備註（選填）"
                            rows="2"
                        />
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            取消
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? '儲存中...' : mode === 'create' ? '新增記錄' : '更新記錄'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DietaryRecord;
