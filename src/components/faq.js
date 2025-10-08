import React, { useState } from "react";
import faqData from '../json/faq.json';

function FAQ() {
    const [activeAccordion, setActiveAccordion] = useState(null);

    // Show all FAQ records
    const displayFAQs = faqData;

    const toggleAccordion = (faqid) => {
        setActiveAccordion(activeAccordion === faqid ? null : faqid);
    };

    return (
        <div className="container">
            <div style={{
                width: '100%',
                maxWidth: '1440px',
                margin: '0 auto',
                padding: '20px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{
                        color: '#284E35',
                        fontSize: '2.5rem',
                        marginBottom: '10px'
                    }}>
                        常見問題
                    </h2>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {displayFAQs.map((faq) => (
                        <div
                            key={faq.faqid}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '12px',
                                backgroundColor: '#fff',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                overflow: 'hidden',
                                transition: 'box-shadow 0.2s ease, transform 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Question Header */}
                            <button
                                onClick={() => toggleAccordion(faq.faqid)}
                                style={{
                                    width: '100%',
                                    padding: '24px',
                                    border: 'none',
                                    backgroundColor: activeAccordion === faq.faqid ? '#EEF5EE' : '#fff',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '1.15rem',
                                    fontWeight: '600',
                                    color: '#284E35',
                                    transition: 'background-color 0.2s ease',
                                    lineHeight: '1.4'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeAccordion !== faq.faqid) {
                                        e.target.style.backgroundColor = '#f8f9fa';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeAccordion !== faq.faqid) {
                                        e.target.style.backgroundColor = '#fff';
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{
                                        backgroundColor: '#284E35',
                                        color: '#fff',
                                        padding: '0',
                                        borderRadius: '50%',
                                        fontSize: '0.8rem',
                                        fontWeight: '500',
                                        marginRight: '12px',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {faq.faqid}
                                    </span>
                                    <span>{faq.question}</span>
                                </div>
                                <svg
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        transform: activeAccordion === faq.faqid ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s ease',
                                        flexShrink: 0,
                                        marginLeft: '15px'
                                    }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Answer Content */}
                            <div
                                style={{
                                    maxHeight: activeAccordion === faq.faqid ? '400px' : '0',
                                    overflow: 'hidden',
                                    transition: 'max-height 0.3s ease, padding 0.3s ease',
                                    padding: activeAccordion === faq.faqid ? '0 24px 24px 24px' : '0 24px',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <div style={{
                                    paddingTop: '12px',
                                    borderTop: '1px solid #eee',
                                    color: '#555',
                                    lineHeight: '1.7',
                                    fontSize: '1rem'
                                }} dangerouslySetInnerHTML={{ __html: faq.answer }}>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '40px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #eee'
                }}>
                    <p style={{
                        color: '#666',
                        fontSize: '0.95rem',
                        margin: '0 0 10px 0'
                    }}>
                        找不到您想要的答案？
                    </p>
                    <p style={{
                        color: '#284E35',
                        fontSize: '1rem',
                        fontWeight: '500',
                        margin: '0'
                    }}>
                        請聯繫我們的客服團隊獲取更多幫助
                    </p>
                </div>
            </div>
        </div>
    );
}

export default FAQ;
