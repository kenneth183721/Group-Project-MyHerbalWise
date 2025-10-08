import React, { useState } from "react";
import faqData from '../../json/faq.json';
import '../../css/landing/faq.css';

function HomeFAQ() {
  const [activeAccordion, setActiveAccordion] = useState(null);
  
  // Filter FAQ data for IDs 1, 2, 3
  const displayFAQs = faqData.filter(faq => [1, 2, 3].includes(faq.faqid));
  
  const toggleAccordion = (faqid) => {
    setActiveAccordion(activeAccordion === faqid ? null : faqid);
  };

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h2 className="faq-title">
          常見問題
        </h2>
        <p className="faq-subtitle">
          以下是用戶最常詢問的問題
        </p>
      </div>
      
      <div className="faq-list">
        {displayFAQs.map((faq) => (
          <div 
            key={faq.faqid}
            className="faq-item"
          >
            {/* Question Header */}
            <button
              onClick={() => toggleAccordion(faq.faqid)}
              className={`faq-question-button ${activeAccordion === faq.faqid ? 'active' : ''}`}
            >
              <span className="faq-question-text">{faq.question}</span>
              <svg
                className={`faq-chevron ${activeAccordion === faq.faqid ? 'active' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Answer Content */}
            <div className={`faq-answer ${activeAccordion === faq.faqid ? 'active' : ''}`}>
              <div 
                className="faq-answer-content"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              >
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeFAQ;