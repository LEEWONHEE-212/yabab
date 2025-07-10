import React, { useState } from 'react';
import './RestaurantPage.css';

const RestaurantPage = ({ isOpen, onClose, restaurant }) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info' 또는 'review'
  const [reviewText, setReviewText] = useState('');

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleReviewSubmit = () => {
    if (reviewText.trim()) {
      // 리뷰 제출 로직 (실제로는 API 호출)
      console.log('리뷰 제출:', reviewText);
      setReviewText('');
      alert('리뷰가 성공적으로 제출되었습니다!');
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {/* 닫기 버튼 */}
        <button className="modal-close-btn" onClick={onClose}>
          <div className="close-icon"></div>
        </button>

        {/* 이미지 섹션 */}
        <div className="modal-image-section">
          <div className="modal-image-placeholder">
            <span>이미지</span>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            정보
          </button>
          <button 
            className={`modal-tab ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            후기
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="modal-content">
          {activeTab === 'info' ? (
            <div className="info-content">
              <div className="restaurant-info">
                <h2 className="restaurant-name">{restaurant?.name || '달식당'}</h2>
                <p className="restaurant-address">천안시 동남구 대흥로 215</p>
              </div>
              
              <div className="restaurant-details">
                <div className="detail-item">
                  <span className="detail-label">영업시간</span>
                  <span className="detail-value">11:00 - 22:00</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">전화번호</span>
                  <span className="detail-value">041-123-4567</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">카테고리</span>
                  <span className="detail-value">한식</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">평점</span>
                  <span className="detail-value">★★★★☆ (4.2)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="review-content">
              <div className="review-input-section">
                <textarea
                  className="review-textarea"
                  placeholder="후기를 작성해주세요"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <button 
                  className="review-submit-btn"
                  onClick={handleReviewSubmit}
                >
                  작성 완료
                </button>
              </div>
              
              <div className="existing-reviews">
                <h3>다른 고객 리뷰</h3>
                <div className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">김**</span>
                    <span className="review-rating">★★★★★</span>
                  </div>
                  <p className="review-text">음식이 정말 맛있어요! 특히 김치찌개가 일품입니다.</p>
                  <span className="review-date">2024.01.15</span>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">이**</span>
                    <span className="review-rating">★★★★☆</span>
                  </div>
                  <p className="review-text">분위기도 좋고 서비스도 친절합니다.</p>
                  <span className="review-date">2024.01.10</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 예약하기 버튼 */}
        <div className="modal-footer">
          <button className="reservation-btn">
            예약하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage; 