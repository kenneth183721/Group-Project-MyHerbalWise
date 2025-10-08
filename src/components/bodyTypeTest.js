import React, { useState, useEffect, useMemo, useCallback } from 'react';
import bodyTypes from '../json/bodyType.json';
import questionsData from '../json/question.json';
import { useToast } from './ToastProvider';
import '../css/components/bodyTypeTest.css';

function BodyTypeTest({ onTestComplete, onNavigateToFoodDb, user, onUpdateUserConstitution }) {
    const [bodyType, setBodyType] = useState('');
    const [desc, setDesc] = useState('');
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [showBodyTypeSelection, setShowBodyTypeSelection] = useState(false);
    const [isRetesting, setIsRetesting] = useState(false); // Track if user is actively retesting
    const { success, error } = useToast();
    // Load previous body type data using useMemo to prevent infinite loops
    const previousBodyTypeData = useMemo(() => {
        if (user?.bodyTypeRecordID) {
            const previousBodyType = bodyTypes.find(bt => bt.bodyTypeID === user.bodyTypeRecordID);
            if (previousBodyType) {
                return {
                    bodyTypeID: user.bodyTypeRecordID,
                    bodyTypeName: previousBodyType.bodyTypeName,
                    bodyTypeDescription: previousBodyType.bodyTypeDescription,
                    recordDate: user.bodyTypeRecordDate
                };
            }
        }
        return null;
    }, [user?.bodyTypeRecordID, user?.bodyTypeRecordDate]);

    // Memoize optionLabels to prevent recreation on every render
    const optionLabels = useMemo(() => [
        { value: 1, label: '沒有' },
        { value: 2, label: '很少' },
        { value: 3, label: '有時' },
        { value: 4, label: '經常' },
        { value: 5, label: '總是' }
    ], []);

    // Event handlers memoized with useCallback
    const handleStart = useCallback(() => setShowQuiz(true), []);

    const handleAnswer = useCallback((val) => {
        const newAnswers = [...answers];
        newAnswers[currentIdx] = val;
        setAnswers(newAnswers);
    }, [answers, currentIdx]);

    const handleNext = useCallback(() => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
        } else {
            setShowQuiz(false);
            setShowResult(true);
        }
    }, [currentIdx, questions.length]);

    // 🌟 體質類型映射（更詳細） - memoized to prevent recreation
    const getConstitutionType = useMemo(() => {
        const mapping = {
            'BT01': 'cold',      // 陽虛體質 → 寒性體質
            'BT02': 'hot',       // 陰虛體質 → 熱性體質  
            'BT03': 'neutral',   // 平和體質 → 平性體質
            'BT04': 'hot',       // 濕熱體質 → 熱性體質
            'BT05': 'cold',      // 痰濕體質 → 寒性體質
            'BT06': 'neutral',   // 氣鬱體質 → 平性體質
            'BT07': 'hot',       // 血瘀體質 → 熱性體質
            'BT08': 'neutral',   // 特稟體質 → 平性體質
            'BT09': 'cold'       // 氣虛體質 → 寒性體質
        };
        return (bodyTypeID) => mapping[bodyTypeID] || null;
    }, []);

    // 🌟 保存測試結果到用戶資料 - memoized with useCallback
    const handleSaveResult = useCallback(async (resultData) => {
        try {
            // Always save the test result regardless of constitutionType
            const constitutionData = {
                constitution: resultData.constitutionType, // Can be null for weak results
                bodyType: resultData.bodyTypeID,
                bodyTypeName: resultData.bodyTypeName,
                testResult: {
                    ...resultData,
                    timestamp: new Date().toISOString()
                }
            };

            // Call the update function
            if (onUpdateUserConstitution) {
                await onUpdateUserConstitution(constitutionData);
                
                // Reset retesting flag since test is complete
                setIsRetesting(false);
                
                // Show success toast based on result type
                if (resultData.constitutionType) {
                    success(`✅ 測試結果已保存！您的體質類型為：${resultData.bodyTypeName}`, 4000);
                } else {
                    success(`📝 測試結果已保存！建議嘗試測試其他體質類型`, 4000);
                }
            }

            // 調用原有的回調
            if (onTestComplete) {
                onTestComplete(resultData.constitutionType);
            }
        } catch (err) {
            console.error('Error saving test result:', err);
            error('保存測試結果時發生錯誤，請稍後重試', 4000);
        }
    }, [onUpdateUserConstitution, onTestComplete, success, error]);

    // Memoized reset functions to prevent recreation on every render
    const handleResetForRetest = useCallback(() => {
        setQuestions([]);
        setAnswers([]);
        setCurrentIdx(0);
        setShowQuiz(false);
        setShowResult(false);
        setIsRetesting(true); // Mark that user is retesting
        setShowBodyTypeSelection(true);
    }, []);

    const handleResetForNewBodyType = useCallback(() => {
        setShowResult(false);
        setBodyType('');
        setQuestions([]);
        setAnswers([]);
        setCurrentIdx(0);
        setShowQuiz(false);
        setDesc('');
        setIsRetesting(true); // Mark that user is retesting
        setShowBodyTypeSelection(true);
    }, []);

    const handleRetestFromPrevious = useCallback(() => {
        // Reset all states for a fresh start
        setBodyType('');
        setDesc('');
        setQuestions([]);
        setAnswers([]);
        setCurrentIdx(0);
        setShowQuiz(false);
        setShowResult(false);
        setIsRetesting(true); // Mark that user is retesting
        setShowBodyTypeSelection(true);
    }, []);
    const resultData = useMemo(() => {
        if (!showResult) return null;
        
        const totalScore = answers.reduce((a, b) => a + b, 0);
        const maxScore = answers.length * 5;
        const minScore = answers.length * 1;
        const scorePercentage = ((totalScore - minScore) / (maxScore - minScore)) * 100;

        const bt = bodyTypes.find(b => b.bodyTypeID === bodyType);
        const bodyTypeDescription = bt ? bt.bodyTypeDescription : '';
        const bodyTypeName = bt?.bodyTypeName || '';

        let result;
        let constitutionType = null;
        let recommendation = '';

        // 根據百分比來判定
        if (scorePercentage >= 70) {
            result = { emoji: '✅', text: '該體質成立', level: 'strong' };
            constitutionType = getConstitutionType(bodyType);
            recommendation = `您明顯具有${bodyTypeName}特徵，建議按照此體質進行飲食調理。`;
        } else if (scorePercentage >= 55) {
            result = { emoji: '⚠️', text: '有該體質的傾向', level: 'moderate' };
            constitutionType = getConstitutionType(bodyType);
            recommendation = `您有${bodyTypeName}的傾向，可以適度參考相關飲食建議。`;
        } else if (scorePercentage >= 40) {
            result = { emoji: '🤔', text: '體質特徵不明顯', level: 'weak' };
            constitutionType = null;
            recommendation = `您的${bodyTypeName}特徵不明顯，建議測試其他體質類型或諮詢專業中醫師。`;
        } else {
            result = { emoji: '❌', text: '該體質不成立', level: 'none' };
            constitutionType = null;
            recommendation = `測試結果顯示您不是${bodyTypeName}，建議嘗試測試其他體質類型。`;
        }

        return {
            ...result,
            description: bodyTypeDescription,
            constitutionType,
            bodyTypeName,
            bodyTypeID: bodyType,
            totalScore,
            maxScore,
            scorePercentage: Math.round(scorePercentage),
            recommendation
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showResult, answers, bodyType, bodyTypes]);

    useEffect(() => {
        if (bodyType) {
            const bt = bodyTypes.find(b => b.bodyTypeID === bodyType);
            const filtered = questionsData.filter(q => q.bodyTypeID === bodyType);
            setQuestions(filtered);
            setAnswers(Array(filtered.length).fill(null));
            setCurrentIdx(0);
            setShowQuiz(false);
            setShowResult(false);
            setDesc(bt ? bt.bodyTypeDescription : '');
        }
    }, [bodyType]);

    // Control when to show body type selection - use useEffect with proper dependencies
    useEffect(() => {
        // If user is retesting, don't override their choice
        if (isRetesting) {
            return;
        }
        
        // Set initial state based on whether there's previous data
        const shouldShowSelection = !previousBodyTypeData;
        setShowBodyTypeSelection(shouldShowSelection);
    }, [previousBodyTypeData, isRetesting]);

    return (
        <div className='body-type-test-container'>
            <div className='body-type-test-inner'>
                {/* Title always shows at top */}
                <h1 className="body-type-test-title">體質測評</h1>

                {/* 🌟 Display previous body type data if available */}
                {previousBodyTypeData && !showBodyTypeSelection && (
                    <div className="previous-body-type-card">
                        <div className="previous-body-type-header">
                            <h4 className="previous-body-type-title">
                                <span style={{ fontSize: '24px' }}>📋</span>
                                您的體質測評記錄
                            </h4>
                            <span className="previous-body-type-date">
                                {previousBodyTypeData.recordDate ? 
                                    new Date(previousBodyTypeData.recordDate).toLocaleDateString('zh-TW') : 
                                    '記錄日期未知'}
                            </span>
                        </div>
                        
                        <div className="previous-body-type-content">
                            <h5 className="previous-body-type-name">
                                {previousBodyTypeData.bodyTypeName}
                            </h5>
                            <p className="previous-body-type-description">
                                {previousBodyTypeData.bodyTypeDescription}
                            </p>
                        </div>
                        
                        <div className="previous-body-type-action">
                            <p className="previous-body-type-hint">
                                💡 如果您想重新測評體質，請點擊右側的「重新測試」按鈕
                            </p>
                            <button
                                onClick={handleRetestFromPrevious}
                                className="retest-button"
                            >
                                🔄 重新測試
                            </button>
                        </div>
                    </div>
                )}

                {/* 🌟 顯示當前體質狀態 */}
                {user?.constitution && (
                    <div style={{
                        background: '#e8f5e8',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #c3e6cb'
                    }}>
                        <h4 style={{ color: '#155724', margin: '0 0 10px 0' }}>
                            🌿 您的當前體質：{user.bodyTypeName || '已設定'}
                        </h4>
                        <p style={{ color: '#155724', margin: 0, fontSize: '14px' }}>
                            體質類型: {user.constitution === 'cold' ? '寒性體質' :
                                user.constitution === 'hot' ? '熱性體質' :
                                    user.constitution === 'neutral' ? '平性體質' : '未知'}
                            {user.testResult?.timestamp &&
                                ` | 測試時間: ${new Date(user.testResult.timestamp).toLocaleString()}`
                            }
                        </p>
                    </div>
                )}

                {/* 原有的測試界面代碼保持不變 */}
                {!showQuiz && !showResult && showBodyTypeSelection && (
                    <div className='body-type-selection-container'>
                        <div className="body-type-selection-header">
                            <h3>請選擇體質類型：</h3>
                        </div>
                        <div className="body-type-grid">
                            {bodyTypes.map((bt, index) => (
                                <button
                                    key={bt.bodyTypeID}
                                    onClick={() => setBodyType(bt.bodyTypeID)}
                                    className={`body-type-button ${bodyType === bt.bodyTypeID ? 'selected' : ''} animate-fadeInUp-delayed`}
                                    style={{ 
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                >
                                    {bt.bodyTypeName}
                                </button>
                            ))}
                        </div>
                        {desc && (
                            <div className="body-type-description">
                                <h4 className="body-type-description-title">
                                    <span style={{ fontSize: '20px' }}>📋</span>
                                    體質描述
                                </h4>
                                <p className="body-type-description-text">
                                    {desc}
                                </p>
                            </div>
                        )}
                        {bodyType && (
                            <button
                                onClick={handleStart}
                                className="start-test-button"
                            >
                                開始測試
                            </button>
                        )}
                    </div>
                )}

                {/* 測試問卷部分保持不變 */}
                {showQuiz && questions.length > 0 && (
                    <form onSubmit={e => e.preventDefault()} className="quiz-form">
                        <div className="quiz-question-container">
                            {/* 🌟 添加進度條 */}
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{
                                    width: `${((currentIdx + 1) / questions.length) * 100}%`
                                }}></div>
                            </div>

                            <h2 style={{ marginBottom: '10px', color: '#333' }}>
                                問題 {currentIdx + 1} / {questions.length}
                            </h2>
                            <label style={{ fontSize: 18, fontWeight: 'bold', display: 'block', marginBottom: '20px' }}>
                                {questions[currentIdx].question}
                            </label>
                            <div className="question-options">
                                {optionLabels.map((opt, index) => (
                                    <div key={opt.value} className="option-container animate-fadeInUp-delayed" style={{
                                        animationDelay: `${index * 0.1}s`
                                    }}>
                                        <span className="option-label">{opt.label}</span>
                                        <button
                                            className={`option-button ${answers[currentIdx] === opt.value ? 'selected' : ''}`}
                                            type="button"
                                            onClick={() => handleAnswer(opt.value)}
                                        >
                                            {opt.value}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {answers[currentIdx] !== null && (
                                <div className="next-button-container">
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="next-button"
                                    >
                                        {currentIdx < questions.length - 1 ? '下一題' : '提交'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                )}

                {/* 🌟 結果顯示部分 */}
                {showResult && resultData && (
                    <div className='results-container'>
                        <h2>測試結果</h2>

                        {/* 分數顯示區域 */}
                        <div style={{
                            background: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '8px',
                            margin: '15px 0',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>
                                <strong>總分：</strong>{resultData.totalScore} / {resultData.maxScore} 分
                            </p>
                            <p style={{ fontSize: '16px', color: '#666', margin: '5px 0' }}>
                                符合度：{resultData.scorePercentage}%
                            </p>
                        </div>

                        {/* 結果判定區域 */}
                        <div style={{
                            fontSize: '18px',
                            margin: '15px 0',
                            padding: '15px',
                            borderRadius: '8px',
                            background: resultData.level === 'strong' ? '#d4edda' :
                                resultData.level === 'moderate' ? '#fff3cd' :
                                    resultData.level === 'weak' ? '#ffeaa7' : '#f8d7da',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '24px', marginBottom: '10px' }}>{resultData.emoji}</div>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{resultData.text}</div>
                            <div style={{ fontSize: '14px', color: '#666' }}>{resultData.bodyTypeName}</div>
                        </div>

                        {/* 🌟 飲食建議預覽 */}
                        {resultData.constitutionType && (
                            <div style={{
                                marginTop: 15,
                                padding: 15,
                                backgroundColor: 'rgba(85, 155, 91, 1)',
                                borderRadius: 5,
                                border: '1px solid #ffeaa7'
                            }}>
                                <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>🍽️ 飲食建議預覽</h4>
                                <div style={{ color: '#856404', fontSize: '14px' }}>
                                    {resultData.constitutionType === 'cold' && (
                                        <div>
                                            <p><strong>✅ 建議多食用：</strong>溫性、熱性食物（如生薑、桂圓、羊肉等）</p>
                                            <p><strong>⚠️ 應該避免：</strong>寒性、涼性食物（如西瓜、螃蟹、綠豆等）</p>
                                        </div>
                                    )}
                                    {resultData.constitutionType === 'hot' && (
                                        <div>
                                            <p><strong>✅ 建議多食用：</strong>涼性、寒性食物（如綠豆、西瓜、苦瓜等）</p>
                                            <p><strong>⚠️ 應該避免：</strong>溫性、熱性食物（如辣椒、羊肉、荔枝等）</p>
                                        </div>
                                    )}
                                    {resultData.constitutionType === 'neutral' && (
                                        <div>
                                            <p><strong>✅ 建議多食用：</strong>平性食物（如大米、蘋果、胡蘿蔔等）</p>
                                            <p><strong>⚠️ 適量食用：</strong>極端性質的食物，保持飲食平衡</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 體質描述 */}
                        {resultData.description && (
                            <div style={{ marginTop: 15, padding: 15, background: '#f0f8ff', borderRadius: 5, border: '1px solid #b3d9ff' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>體質描述：</h3>
                                <p style={{ margin: 0, lineHeight: '1.6' }}>{resultData.description}</p>
                            </div>
                        )}

                        {/* 個性化建議 */}
                        <div style={{
                            marginTop: 15,
                            padding: 15,
                            backgroundColor: '#e8f5e8',
                            borderRadius: 5,
                            border: '1px solid #c3e6cb'
                        }}>
                            <h4 style={{ color: '#155724', margin: '0 0 10px 0' }}>💡 建議</h4>
                            <p style={{ color: '#155724', margin: 0, lineHeight: '1.6' }}>
                                {resultData.recommendation}
                            </p>
                        </div>

                        {/* 🌟 操作按鈕區域 */}
                        <div style={{ marginTop: 20, display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            {/* 保存結果並查看適合食物的按鈕 */}
                            {resultData.constitutionType && (
                                <button
                                    onClick={async () => {
                                        await handleSaveResult(resultData);
                                        if (onNavigateToFoodDb) {
                                            onNavigateToFoodDb();
                                        }
                                    }}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    💾 保存結果並查看適合食物
                                </button>
                            )}

                            {/* 僅保存結果按鈕 */}
                            <button
                                onClick={() => handleSaveResult(resultData)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                💾 保存測試結果
                            </button>

                            {/* 其他按鈕保持不變 */}
                            <button
                                onClick={handleResetForRetest}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                🔄 重新測試
                            </button>

                            <button
                                onClick={handleResetForNewBodyType}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: 'rgba(85, 155, 91, 1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                🧪 測試其他體質
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}

export default BodyTypeTest;
