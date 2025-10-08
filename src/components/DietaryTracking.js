import React, { useState, useEffect } from 'react';
import DietaryRecordAPI from '../services/dietaryRecordAPI';
import { useToast } from './ToastProvider';
import '../css/components/DietaryTracking.css';

function DietaryTracking({ navigate, user }) {
    const [dietaryRecords, setDietaryRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();

    useEffect(() => {
        if (user && user.userID) {
            loadDietaryRecords();
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadDietaryRecords = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use the API endpoint to load dietary records
            const response = await DietaryRecordAPI.getDietaryRecords(user.userID);
            setDietaryRecords(response.data || []);
            
        } catch (err) {
            console.error('Error loading dietary records:', err);
            setError('無法載入飲食記錄');
            toast.error('載入飲食記錄失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        if (navigate) {
            navigate('dietary-record?mode=create');
        }
    };

    const handleEdit = (recordID) => {
        if (navigate) {
            navigate(`dietary-record?mode=edit&id=${recordID}`);
        }
    };

    const handleDelete = async (recordID) => {
        if (!window.confirm('確定要刪除這筆飲食記錄嗎？')) {
            return;
        }

        try {
            await DietaryRecordAPI.deleteDietaryRecord(recordID);
            setDietaryRecords(prev => prev.filter(record => record.recordID !== recordID));
            toast.success('飲食記錄已刪除');
        } catch (err) {
            console.error('Error deleting dietary record:', err);
            toast.error('刪除飲食記錄失敗');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '/');
    };

    if (loading) {
        return (
            <div className="dietary-tracking-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>載入飲食記錄中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dietary-tracking-container">
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={loadDietaryRecords} className="retry-button">
                        重新載入
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dietary-tracking-container">
            <div className="page-header">
                <h2>飲食記錄</h2>
            </div>

            <div className="dietary-table-container">
                <div className="table-wrapper">
                    <table className="dietary-table">
                        <thead>
                            <tr>
                                <th>日期</th>
                                <th>時間</th>
                                <th>進食項目</th>
                                <th>份量/數量</th>
                                <th>修改</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dietaryRecords.length === 0 ? (
                                <tr className="empty-row">
                                    <td colSpan="5" className="empty-message">
                                        尚無飲食記錄，點擊下方按鈕開始記錄您的飲食
                                    </td>
                                </tr>
                            ) : (
                                dietaryRecords.map((record) => (
                                    <tr key={record.recordID} className="data-row">
                                        <td className="date-cell" data-label="日期">
                                            {formatDate(record.date)}
                                        </td>
                                        <td className="time-cell" data-label="時間">
                                            {record.time}
                                        </td>
                                        <td className="food-items-cell" data-label="進食項目">
                                            {record.foodItems}
                                        </td>
                                        <td className="portions-cell" data-label="份量/數量">
                                            {record.portions}
                                        </td>
                                        <td className="actions-cell">
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleEdit(record.recordID)}
                                                    title="編輯記錄"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDelete(record.recordID)}
                                                    title="刪除記錄"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="add-record-section">
                    <button 
                        className="add-record-button"
                        onClick={handleCreateNew}
                    >
                        添加進食記錄
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DietaryTracking;
