import React, { useState, useEffect } from 'react';
import './ReportReasonModal.css'; // 새로 생성할 CSS 파일

const ReportReasonModal = ({ isOpen, onClose, onSubmit, reviewId, reviewContent }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [details, setDetails] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // 모달이 열릴 때마다 상태 초기화
        if (isOpen) {
            setSelectedReason('');
            setDetails('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const reasons = [
        { value: 'ABUSE', label: '욕설/비방' },
        { value: 'PORNOGRAPHY', label: '음란성/선정성' },
        { value: 'ADVERTISING', label: '광고/홍보' },
        { value: 'PERSONAL_INFO', label: '개인 정보 침해' },
        { value: 'IRRELEVANT', label: '리뷰와 무관한 내용' },
        { value: 'OTHER', label: '기타' },
    ];

    const handleSubmit = () => {
        if (!selectedReason) {
            setError('신고 사유를 선택해주세요.');
            return;
        }

        if (selectedReason === 'OTHER' && !details.trim()) {
            setError('기타 사유를 선택한 경우, 상세 내용을 입력해주세요.');
            return;
        }

        setError(''); // 에러 초기화
        onSubmit(reviewId, selectedReason, details.trim());
        onClose(); // 제출 후 모달 닫기
    };

    return (
        <div className="report-modal-backdrop" onClick={onClose}>
            <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="report-modal-close-button" onClick={onClose}>&times;</span>
                <h2 className="report-modal-title">리뷰 신고하기</h2>

                {reviewContent && (
                    <div className="reported-review-preview">
                        <strong>신고할 리뷰:</strong>
                        <p className="reported-review-text">"{reviewContent.length > 50 ? reviewContent.substring(0, 50) + '...' : reviewContent}"</p>
                    </div>
                )}

                <div className="report-reason-options">
                    {reasons.map((reason) => (
                        <label key={reason.value} className="report-reason-label">
                            <input
                                type="radio"
                                name="reportReason"
                                value={reason.value}
                                checked={selectedReason === reason.value}
                                onChange={() => setSelectedReason(reason.value)}
                                className="report-reason-radio"
                            />
                            {reason.label}
                        </label>
                    ))}
                </div>

                {selectedReason === 'OTHER' && (
                    <textarea
                        className="report-details-textarea"
                        placeholder="상세 신고 사유를 입력해주세요 (필수)"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        rows="4"
                    ></textarea>
                )}
                {error && <p className="report-error-message">{error}</p>}
                <button className="report-submit-button" onClick={handleSubmit}>
                    신고 제출
                </button>
            </div>
        </div>
    );
};

export default ReportReasonModal;