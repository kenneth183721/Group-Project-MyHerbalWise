import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { getApiUrl, logApiCall } from '../utils/apiUtils';
import '../css/components/HealthStatusTracking.css';

function HealthStatusTracking({ navigate, user }) {
    const [healthStatusRecords, setHealthStatusRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();

    useEffect(() => {
        if (user && user.userID) {
            loadHealthStatusRecords();
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadHealthStatusRecords = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const apiUrl = getApiUrl(`/api/healthStatusRecord/${user.userID}`);
            logApiCall('GET', apiUrl);
            
            const response = await fetch(apiUrl, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000 // 10 second timeout
            });
            
            console.log('Health status records response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Health status records loaded:', data.data?.length || 0, 'records');
                setHealthStatusRecords(data.data || []);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (err) {
            console.error('Error loading health status records:', err);
            console.error('API URL attempted:', getApiUrl(`/api/healthStatusRecord/${user.userID}`));
            setError('無法載入健康狀態記錄');
            toast.error('載入健康狀態記錄失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        if (navigate) {
            navigate('health-status-record?mode=create');
        }
    };

    const handleEdit = (recordID) => {
        if (navigate) {
            navigate(`health-status-record?mode=edit&id=${recordID}`);
        }
    };

    const handleDelete = async (recordID) => {
        if (!window.confirm('確定要刪除這筆健康狀態記錄嗎？')) {
            return;
        }

        try {
            const apiUrl = getApiUrl(`/api/healthStatusRecord/${recordID}`);
            logApiCall('DELETE', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setHealthStatusRecords(prev => prev.filter(record => record.id !== recordID));
                toast.success('健康狀態記錄已刪除');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            console.error('Error deleting health status record:', err);
            console.error('API URL attempted:', getApiUrl(`/api/healthStatusRecord/${recordID}`));
            toast.error('刪除健康狀態記錄失敗');
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
            <div className="health-status-tracking-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>載入健康狀態記錄中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="health-status-tracking-container">
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={loadHealthStatusRecords} className="retry-button">
                        重新載入
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="health-status-tracking-container">
            <div className="page-header">
                <h2>健康狀態記錄</h2>
            </div>

            <div className="health-status-table-container">
                <div className="table-wrapper">
                    <table className="health-status-table">
                        <thead>
                            <tr>
                                <th>日期</th>
                                <th>健康狀態</th>
                                <th>症狀描述</th>
                                <th>備註</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {healthStatusRecords.length === 0 ? (
                                <tr className="empty-row">
                                    <td colSpan="5" className="empty-message">
                                        尚無健康狀態記錄，點擊下方按鈕開始記錄您的健康狀態
                                    </td>
                                </tr>
                            ) : (
                                healthStatusRecords.map((record) => (
                                    <tr key={record.id} className="data-row">
                                        <td className="date-cell" data-label="日期">
                                            {formatDate(record.date)}
                                        </td>
                                        <td className="health-status-cell" data-label="健康狀態">
                                            <div className="health-status-name">
                                                {record.healthStatusName}
                                            </div>
                                        </td>
                                        <td className="symptoms-cell" data-label="症狀描述">
                                            <div className="symptoms-text">
                                                {record.symptoms ? 
                                                    (record.symptoms.length > 50 ? 
                                                        `${record.symptoms.substring(0, 50)}...` : 
                                                        record.symptoms) 
                                                    : '無'
                                                }
                                            </div>
                                        </td>
                                        <td className="notes-cell" data-label="備註">
                                            <div className="notes-text">
                                                {record.notes ? 
                                                    (record.notes.length > 30 ? 
                                                        `${record.notes.substring(0, 30)}...` : 
                                                        record.notes) 
                                                    : '無'
                                                }
                                            </div>
                                        </td>
                                        <td className="actions-cell">
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleEdit(record.id)}
                                                    title="編輯記錄"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDelete(record.id)}
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
                        添加健康狀態記錄
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HealthStatusTracking;
